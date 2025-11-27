import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import * as cheerio from "https://esm.sh/cheerio@1.0.0-rc.12";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Prefer HTTPS where available to avoid mixed-content/network blocks
const MIRRORS = [
    "https://libgen.li",
    "https://libgen.rs",
    "https://libgen.is",
    "https://libgen.st",
    "https://libgen.gs"
];

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const { query, count = 25 } = await req.json();

        if (!query) {
            throw new Error("Query is required");
        }

        console.log(`Searching for: ${query}`);

        let html = "";
        let usedMirror = "";

        // Try mirrors until one works
        for (const mirror of MIRRORS) {
            try {
                const url = `${mirror}/search.php?req=${encodeURIComponent(query)}&res=${count}&column=def`;
                console.log(`Trying mirror: ${url}`);

                // Add a timeout to the fetch (10s per mirror)
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 10000);

                const response = await fetch(url, {
                    signal: controller.signal,
                    headers: {
                        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
                        "Accept-Language": "en-US,en;q=0.9",
                        "Referer": "https://www.google.com/"
                    }
                });
                clearTimeout(timeoutId);

                if (response.ok) {
                    html = await response.text();
                    usedMirror = mirror;
                    console.log(`Success with mirror: ${mirror}`);
                    break;
                }
            } catch (e) {
                console.warn(`Mirror ${mirror} failed:`, e);
            }
        }

        if (!html) {
            throw new Error("All mirrors failed or timed out");
        }

        const $ = cheerio.load(html);
        const results = [];

        $("table").each((_, table) => {
            const rows = $(table).find("tr");
            if (rows.length > 5 && results.length === 0) {
                rows.each((i, row) => {
                    if (i === 0) return;

                    const cols = $(row).find("td");
                    if (cols.length < 9) return;

                    const id = $(cols[0]).text().trim();
                    const author = $(cols[1]).text().trim();

                    let title = $(cols[2]).find("a").first().text().trim();
                    if (!title) title = $(cols[2]).text().trim();
                    title = title.replace(/\[.*?\]/g, "").trim();

                    const publisher = $(cols[3]).text().trim();
                    const year = $(cols[4]).text().trim();
                    const pages = $(cols[5]).text().trim();
                    const language = $(cols[6]).text().trim();
                    const size = $(cols[7]).text().trim();
                    const extension = $(cols[8]).text().trim();

                    let md5 = "";
                    $(cols).find("a").each((_, a) => {
                        const href = $(a).attr("href");
                        if (href && href.match(/[a-fA-F0-9]{32}/)) {
                            md5 = href.match(/[a-fA-F0-9]{32}/)[0];
                        }
                    });

                    if (title && md5) {
                        results.push({
                            id,
                            title,
                            author,
                            publisher,
                            year,
                            pages,
                            language,
                            filesize: size,
                            extension,
                            md5,
                            coverUrl: "",
                            mirrors: [
                                `http://library.lol/main/${md5}`,
                                `http://libgen.li/ads.php?md5=${md5}`
                            ]
                        });
                    }
                });
            }
        });

        return new Response(JSON.stringify({ results }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });

    } catch (error) {
        console.error(error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
});
