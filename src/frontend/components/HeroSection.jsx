import React, { useEffect, useState } from 'react';
import { Search, Sparkles } from 'lucide-react';
import { fallbackQuotes, pickRandomQuote } from '../utils/quotes';

export function HeroSection({ onSearch }) {
    const [query, setQuery] = useState("");
    const [quote, setQuote] = useState(() => pickRandomQuote());

    useEffect(() => {
        let active = true;

        const setIfActive = (text) => {
            if (active && text) {
                setQuote(text);
            }
        };

        (async () => {
            // Primary: Quotable (short quotes, English)
            try {
                const res = await fetch("https://api.quotable.io/random?maxLength=200");
                if (!res.ok) throw new Error(`quotable status ${res.status}`);
                const data = await res.json();
                if (data?.content) {
                    const author = data.author ? ` — ${data.author}` : "";
                    setIfActive(`${data.content}${author}`);
                    return;
                }
            } catch (err) {
                console.warn("[quote] quotable fetch failed; trying secondary", err);
            }

            // Secondary: GitHub-hosted quotes JSON (programming-quotes-api)
            try {
                const res = await fetch(
                    "https://raw.githubusercontent.com/skolakoda/programming-quotes-api/master/quotes.json"
                );
                if (!res.ok) throw new Error(`github quotes status ${res.status}`);
                const list = await res.json();
                if (Array.isArray(list) && list.length > 0) {
                    const pick = list[Math.floor(Math.random() * list.length)];
                    const line = pick?.en || pick?.quote;
                    const author = pick?.author ? ` — ${pick.author}` : "";
                    if (line) {
                        setIfActive(`${line}${author}`);
                    }
                }
            } catch (err) {
                console.warn("[quote] secondary fetch failed; using fallback", err);
            }
        })();

        return () => {
            active = false;
        };
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (query.trim()) {
            onSearch(query);
        }
    };

    return (
        <div className="relative overflow-hidden bg-cream-50 pt-16 pb-24 sm:pt-24 sm:pb-32">
            {/* Decorative background elements */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full z-0 pointer-events-none">
                <div className="absolute top-20 left-10 w-72 h-72 bg-rose-100/50 rounded-full blur-3xl mix-blend-multiply animate-float" />
                <div className="absolute top-40 right-10 w-96 h-96 bg-lavender-100/50 rounded-full blur-3xl mix-blend-multiply animate-float" style={{ animationDelay: '1s' }} />
                <div className="absolute -bottom-20 left-1/3 w-80 h-80 bg-sage-100/50 rounded-full blur-3xl mix-blend-multiply animate-float" style={{ animationDelay: '2s' }} />
            </div>

            <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8 text-center">
                <div className="mx-auto max-w-2xl">
                    <div className="mb-8 flex justify-center">
                        <div className="relative rounded-full px-4 py-1.5 text-sm leading-6 text-sage-600 ring-1 ring-sage-900/10 hover:ring-sage-900/20 bg-white/50 backdrop-blur-sm shadow-sm transition-all">
                            <span className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-rose-400" />
                        Follow the ink, find the wonder
                            </span>
                        </div>
                    </div>

                    <h1 className="text-4xl font-serif font-bold tracking-tight text-sage-900 sm:text-6xl mb-6 drop-shadow-sm">
                        Your Personal <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-rose-400">Literary Haven</span>
                    </h1>

                    <p className="mt-6 text-lg leading-8 text-sage-600 max-w-xl mx-auto font-light">
                        Rummage the ink-black stacks and grow a library that reflects you.
                    </p>

                    <p className="mt-4 text-sm text-sage-500 max-w-md mx-auto italic">
                        {quote}
                    </p>

                    <div className="mt-10 flex items-center justify-center gap-x-6">
                        <form onSubmit={handleSubmit} className="relative w-full max-w-md group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-sage-400 group-focus-within:text-rose-500 transition-colors" />
                            </div>
                            <input
                                type="text"
                                id="search-input"
                                className="block w-full rounded-full border-0 py-4 pl-11 pr-4 text-sage-900 shadow-soft ring-1 ring-inset ring-sage-200 placeholder:text-sage-400 focus:ring-2 focus:ring-inset focus:ring-rose-300 sm:text-sm sm:leading-6 transition-all duration-300 bg-white/80 backdrop-blur-sm hover:bg-white"
                                placeholder="Search for a book, author, or ISBN..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                            />
                            <button
                                type="submit"
                                className="absolute right-2 top-2 bottom-2 bg-rose-500 text-white px-6 rounded-full font-medium text-sm shadow-md hover:bg-rose-600 transition-all duration-200 hover:shadow-lg active:scale-95"
                            >
                                Search
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
