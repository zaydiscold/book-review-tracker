import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Book, Library, Settings, Plus } from 'lucide-react';

export function Navbar({ onOpenSettings }) {
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="mb-8 pt-6 pb-4">
            <div className="container mx-auto px-4 flex items-center justify-between">
                {/* Logo / Brand */}
                <Link to="/" className="flex items-center gap-3 group">
                    <div className="w-10 h-10 bg-ink-800 rounded-lg flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-300">
                        <Book className="w-5 h-5 text-paper-100" />
                    </div>
                    <span className="font-serif font-bold text-xl text-ink-900 tracking-tight">
                        My Reading Journal
                    </span>
                </Link>

                {/* Navigation Links */}
                <div className="hidden md:flex items-center gap-1 bg-white/50 backdrop-blur-sm px-2 py-1.5 rounded-full border border-taupe-200 shadow-sm">
                    <Link
                        to="/"
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${isActive('/')
                                ? 'bg-ink-800 text-paper-50 shadow-sm'
                                : 'text-ink-600 hover:bg-paper-200 hover:text-ink-900'
                            }`}
                    >
                        Browse
                    </Link>
                    <Link
                        to="/library"
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2 ${isActive('/library')
                                ? 'bg-ink-800 text-paper-50 shadow-sm'
                                : 'text-ink-600 hover:bg-paper-200 hover:text-ink-900'
                            }`}
                    >
                        <Library className="w-4 h-4" />
                        Library
                    </Link>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => document.getElementById('search-input')?.focus()}
                        className="hidden md:flex items-center gap-2 px-4 py-2 bg-paper-200 text-ink-800 rounded-full font-medium hover:bg-paper-300 transition-colors text-sm"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Add Book</span>
                    </button>

                    <button
                        onClick={onOpenSettings}
                        className="p-2.5 text-ink-500 hover:text-ink-800 hover:bg-paper-200 rounded-full transition-all duration-300"
                        aria-label="Settings"
                    >
                        <Settings className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </nav>
    );
}
