import React from 'react';
import { Navbar } from './Navbar';

export function Layout({ children, currentView, onNavigate, cloudStatus }) {
    return (
        <div className="min-h-screen bg-cream-50 text-sage-600 font-sans selection:bg-rose-200 selection:text-rose-900">
            <Navbar
                currentView={currentView}
                onNavigate={onNavigate}
                cloudStatus={cloudStatus}
            />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
                {children}
            </main>

            <footer className="bg-white border-t border-stone-200 mt-auto">
                <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 text-center">
                    <p className="text-sage-400 text-sm font-medium">
                        &copy; {new Date().getFullYear()} The Reading Journal. Built with ❤️ for book lovers.
                    </p>
                </div>
            </footer>
        </div>
    );
}
