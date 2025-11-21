import React from 'react';

export function Navbar() {
    return (
        <nav className="sticky top-0 z-50 bg-cream-50/80 backdrop-blur-md border-b border-stone-200 shadow-soft">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                {/* Logo Area */}
                <div className="flex items-center gap-3 group cursor-pointer">
                    <div className="w-10 h-10 bg-rose-100 rounded-2xl flex items-center justify-center text-rose-500 shadow-inner-soft group-hover:scale-105 transition-transform duration-300">
                        <span>📖</span>
                    </div>
                    <h1 className="text-2xl font-serif font-bold text-sage-600 tracking-tight group-hover:text-rose-500 transition-colors">
                        Reading Journal
                    </h1>
                </div>

                {/* Navigation Links */}
                <div className="hidden md:flex items-center gap-8">
                    <a href="#" className="text-sage-500 hover:text-rose-500 font-medium text-sm tracking-wide transition-colors">Library</a>
                    <a href="#" className="text-sage-500 hover:text-rose-500 font-medium text-sm tracking-wide transition-colors">Wishlist</a>
                    <a href="#" className="text-sage-500 hover:text-rose-500 font-medium text-sm tracking-wide transition-colors">Stats</a>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4">
                    <button className="p-2 text-sage-400 hover:text-rose-500 transition-colors rounded-full hover:bg-rose-50">
                        <span className="sr-only">Search</span>
                        <span>🔍</span>
                    </button>
                    <button className="bg-rose-400 text-white px-5 py-2.5 rounded-full font-medium shadow-soft hover:shadow-soft-lg hover:-translate-y-0.5 transition-all duration-300">
                        + Add Book
                    </button>
                </div>
            </div>
        </nav>
    );
}
