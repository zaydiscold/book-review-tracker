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
        <section className="relative py-20 px-4 text-center bg-dark">
            <div className="relative z-10 max-w-2xl mx-auto">
                <span className="inline-block mb-4 px-4 py-1.5 rounded-brutal border-3 border-cyber bg-dark-surface text-cyber text-sm font-bold uppercase tracking-wider shadow-brutal">
                    Your Reading Database
                </span>
                <h2 className="text-5xl md:text-6xl font-bold text-light mb-6 leading-tight uppercase">
                    What are you <span className="text-magenta">reading</span> today?
                </h2>
                <p className="text-lg text-light-muted mb-10 max-w-lg mx-auto leading-relaxed font-mono">
                    Track your journey through pages, discover new favorites, and keep your thoughts organized.
                </p>

                <form onSubmit={handleSubmit} className="relative max-w-xl mx-auto group">
                    <div className="relative flex items-center bg-dark-surface rounded-brutal border-4 border-light p-2 shadow-brutal-lg hover:shadow-brutal-cyber transition-all duration-200">
                        <div className="pl-4 text-cyber">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                                <path fillRule="evenodd" d="M10.5 3.75a6.75 6.75 0 100 13.5 6.75 6.75 0 000-13.5zM2.25 10.5a8.25 8.25 0 1114.59 5.28l4.69 4.69a.75.75 0 11-1.06 1.06l-4.69-4.69A8.25 8.25 0 012.25 10.5z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search by title, author, or ISBN..."
                            className="flex-1 bg-transparent border-none focus:ring-0 text-light placeholder:text-light-muted/50 px-4 py-3 text-lg font-mono outline-none"
                        />
                        <button
                            type="submit"
                            className="bg-cyber text-dark px-6 py-3 rounded-brutal border-3 border-black font-bold uppercase tracking-wider shadow-brutal hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all duration-100"
                        >
                            Search
                        </button>
                    </div>
                </form>
            </div>
        </section>
    );
}
