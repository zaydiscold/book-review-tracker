import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import libgen from "npm:libgen";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

        // Use a reliable mirror
        const mirror = "http://libgen.is";

        const options = {
            mirror,
            query,
            count: Number(count),
            search_in: 'def'
        };

        console.log("Calling libgen.search with options:", options);

        try {
            const results = await libgen.search(options);

            // Ensure results is an array
            const safeResults = Array.isArray(results) ? results : [];
            console.log(`Found ${safeResults.length} results`);

            return new Response(JSON.stringify({ results: safeResults }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        } catch (searchError) {
            console.error("LibGen search error:", searchError);
            throw new Error(`LibGen search failed: ${searchError.message}`);
        }

    } catch (error) {
        console.error("Edge Function error:", error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
});
