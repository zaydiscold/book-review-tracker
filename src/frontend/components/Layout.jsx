import React from 'react';

export function Layout({ children }) {
    return (
        <div className="min-h-screen bg-dark text-light font-sans selection:bg-magenta selection:text-light">
            <header className="sticky top-0 z-50 bg-dark-elevated border-b-4 border-cyber shadow-brutal-cyber">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3 group cursor-pointer">
                        <div className="w-10 h-10 bg-cyber rounded-brutal border-3 border-black flex items-center justify-center text-dark shadow-brutal group-hover:shadow-brutal-lg transition-all">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                                <path d="M11.25 4.533A9.707 9.707 0 006 3.75a9.706 9.706 0 01-6 3.75V16.5a9.706 9.706 0 006-3.75h.75a9.706 9.706 0 016 3.75V4.533zM12.75 4.533V16.5a9.706 9.706 0 006-3.75h.75a9.706 9.706 0 016 3.75V3.75a9.707 9.707 0 00-5.25.783 9.707 9.707 0 00-5.25-.783h-.75z" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight text-light group-hover:text-cyber transition-colors uppercase">
                            The Reading Vault
                        </h1>
                    </div>

                    <nav className="hidden md:flex items-center gap-8">
                        <a href="#" className="text-light-muted hover:text-cyber font-bold uppercase text-sm tracking-wider transition-colors">Library</a>
                        <a href="#" className="text-light-muted hover:text-magenta font-bold uppercase text-sm tracking-wider transition-colors">Wishlist</a>
                        <a href="#" className="text-light-muted hover:text-neon font-bold uppercase text-sm tracking-wider transition-colors">Stats</a>
                    </nav>

                    <div className="flex items-center gap-4">
                        <button className="p-2 text-light-muted hover:text-cyber transition-colors rounded-brutal border-2 border-transparent hover:border-cyber">
                            <span className="sr-only">Search</span>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                            </svg>
                        </button>
                        <button className="bg-cyber text-dark px-5 py-2.5 rounded-brutal border-3 border-black font-bold uppercase tracking-wider shadow-brutal hover:shadow-brutal-lg hover:translate-x-[2px] hover:translate-y-[2px] transition-all">
                            + New Entry
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {children}
            </main>

            <footer className="bg-dark-elevated border-t-4 border-cyber mt-auto">
                <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 text-center text-light-muted text-sm font-mono">
                    <p>&copy; {new Date().getFullYear()} The Reading Vault. Built for book collectors.</p>
                </div>
            </footer>
        </div>
    );
}
