import React from 'react';
import { BookOpen, Search, Plus, BarChart3, Library, Database } from 'lucide-react';

export function Navbar({ currentView = 'library', onNavigate, cloudStatus, onAddBook }) {
    return (
        <nav className="sticky top-0 z-50 bg-cream-50/80 backdrop-blur-md border-b border-stone-200/50 shadow-soft transition-all duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                {/* Logo Area */}
                <div
                    className="flex items-center gap-3 group cursor-pointer"
                    onClick={() => onNavigate && onNavigate('home')}
                >
                    <div className="w-10 h-10 bg-gradient-to-br from-rose-100 to-rose-200 rounded-2xl flex items-center justify-center text-rose-600 shadow-inner-soft group-hover:scale-105 group-hover:shadow-soft transition-all duration-300">
                        <BookOpen className="w-6 h-6" strokeWidth={2} />
                    </div>
                    <h1 className="text-2xl font-serif font-bold text-sage-800 tracking-tight group-hover:text-rose-600 transition-colors">
                        Reading Journal
                    </h1>
                </div>

                {/* Navigation Links */}
                <div className="hidden md:flex items-center gap-1">
                    <NavLink
                        icon={<Library className="w-4 h-4" />}
                        text="Home"
                        active={currentView === 'home'}
                        onClick={() => onNavigate && onNavigate('home')}
                    />
                    <NavLink
                        icon={<BookOpen className="w-4 h-4" />}
                        text="Read List"
                        active={currentView === 'readlist'}
                        onClick={() => onNavigate && onNavigate('readlist')}
                    />
                    <NavLink
                        icon={<BarChart3 className="w-4 h-4" />}
                        text="Stats"
                        active={currentView === 'stats'}
                        onClick={() => onNavigate && onNavigate('stats')}
                    />
                    <NavLink
                        icon={<Database className="w-4 h-4" />}
                        text="LibGen"
                        active={currentView === 'libgen'}
                        onClick={() => onNavigate && onNavigate('libgen')}
                    />
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                    <CloudBadge cloudStatus={cloudStatus} />
                    <button className="p-2.5 text-sage-500 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-all duration-300 group">
                        <Search className="w-5 h-5 group-hover:scale-110 transition-transform" strokeWidth={2} />
                    </button>
                    <button
                        onClick={() => onAddBook && onAddBook()}
                        className="flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white px-5 py-2.5 rounded-full font-medium shadow-soft hover:shadow-soft-lg hover:-translate-y-0.5 transition-all duration-300 active:scale-95"
                    >
                        <Plus className="w-5 h-5" strokeWidth={2.5} />
                        <span>Add Book</span>
                    </button>
                </div>
            </div>
        </nav>
    );
}

function NavLink({ icon, text, active, onClick }) {
    return (
        <button
            onClick={onClick}
            className={`
                flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300
                ${active
                    ? 'bg-white text-rose-600 shadow-sm ring-1 ring-stone-100'
                    : 'text-sage-500 hover:text-rose-600 hover:bg-rose-50/50'
                }
            `}
        >
            {icon}
            <span>{text}</span>
        </button>
    );
}

function CloudBadge({ cloudStatus }) {
    const status = cloudStatus?.status || "disabled";
    const copy = status === "online"
        ? "Supabase connected"
        : status === "checking"
            ? "Checking Supabase…"
            : status === "offline"
                ? "Supabase offline"
                : "Offline only";

    const styles = status === "online"
        ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
        : status === "checking"
            ? "bg-sky-50 text-sky-700 border border-sky-100"
            : "bg-amber-50 text-amber-700 border border-amber-100";

    return (
        <span className={`hidden sm:inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${styles}`}>
            {copy}
        </span>
    );
}
