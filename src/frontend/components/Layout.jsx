import React from 'react';

export function Layout({ children }) {
    return (
        <div className="min-h-screen bg-cream-50">
            <main className="pb-20">
                {children}
            </main>

            <footer className="bg-white border-t border-stone-200 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sage-400 text-sm">
                    <p>© {new Date().getFullYear()} Reading Journal. Crafted with care.</p>
                </div>
            </footer>
        </div>
    );
}
