import React, { useState } from 'react';

export function HeroSection({ onSearch }) {
    const [query, setQuery] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (query.trim()) {
            onSearch(query);
        }
    };

    return (
        <section className="relative py-24 px-4 text-center overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0 -z-10 bg-gradient-to-b from-rose-50/50 to-cream-50/50" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
                <div className="absolute top-20 left-10 w-64 h-64 bg-lavender-200/20 rounded-full blur-3xl animate-float" />
                <div className="absolute bottom-20 right-10 w-80 h-80 bg-peach-200/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }} />
            </div>

            <div className="relative z-10 max-w-3xl mx-auto animate-fade-in">
                <span className="inline-block mb-6 px-4 py-1.5 rounded-full bg-white/80 backdrop-blur-sm border border-rose-100 text-rose-500 text-sm font-medium tracking-wide shadow-sm">
                    ✨ Your Personal Reading Sanctuary
                </span>

                <h2 className="text-5xl md:text-7xl font-serif font-bold text-sage-600 mb-8 leading-tight">
                    What are you <span className="text-rose-400 italic font-hand">reading</span> today?
                </h2>

                <p className="text-xl text-sage-400 mb-12 max-w-2xl mx-auto leading-relaxed font-light">
                    Track your journey through pages, discover new favorites, and keep your thoughts organized in a beautiful space.
                </p>

                <form onSubmit={handleSubmit} className="relative max-w-2xl mx-auto group">
                    <div className="relative flex items-center bg-white rounded-full p-2 shadow-soft-lg hover:shadow-soft-xl transition-all duration-300 ring-1 ring-black/5 focus-within:ring-rose-200 focus-within:ring-4">
                        <div className="pl-6 text-sage-300">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                                <path fillRule="evenodd" d="M10.5 3.75a6.75 6.75 0 100 13.5 6.75 6.75 0 000-13.5zM2.25 10.5a8.25 8.25 0 1114.59 5.28l4.69 4.69a.75.75 0 11-1.06 1.06l-4.69-4.69A8.25 8.25 0 012.25 10.5z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search by title, author, or ISBN..."
                            className="flex-1 bg-transparent border-none focus:ring-0 text-sage-600 placeholder:text-sage-300 px-4 py-4 text-lg outline-none"
                        />
                        <button
                            type="submit"
                            className="bg-rose-400 text-white px-8 py-3 rounded-full font-medium shadow-md hover:bg-rose-500 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
                        >
                            Search
                        </button>
                    </div>
                </form>
            </div>
        </section>
    );
}
