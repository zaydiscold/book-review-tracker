import React, { useState, useMemo } from 'react';
import { BookCard } from './BookCard';
import { BookOpen, CheckCircle2, Heart, Library, XCircle } from 'lucide-react';

export function BookGrid({ books, onEdit, onDelete }) {
    const [activeTab, setActiveTab] = useState('reading');

    const tabs = [
        { id: 'reading', label: 'Current', icon: BookOpen, color: 'text-rose-600' },
        { id: 'completed', label: 'Read', icon: CheckCircle2, color: 'text-sage-600' },
        { id: 'wishlist', label: 'Wishlist', icon: Heart, color: 'text-lavender-600' },
        { id: 'owned', label: 'Owned', icon: Library, color: 'text-honey-600' },
        { id: 'dnf', label: 'DNF', icon: XCircle, color: 'text-stone-500' },
    ];

    const filteredBooks = useMemo(() => {
        return books.filter(book => book.status === activeTab);
    }, [books, activeTab]);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Tabs */}
            <div className="flex overflow-x-auto pb-4 mb-6 gap-2 no-scrollbar">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    const count = books.filter(b => b.status === tab.id).length;

                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`
                                flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300
                                ${isActive
                                    ? 'bg-white shadow-soft text-sage-800 ring-1 ring-stone-100'
                                    : 'text-sage-500 hover:bg-white/50 hover:text-sage-700'}
                            `}
                        >
                            <Icon className={`w-4 h-4 ${isActive ? tab.color : 'text-sage-400'}`} />
                            <span>{tab.label}</span>
                            <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] ${isActive ? 'bg-stone-100 text-sage-600' : 'bg-stone-100/50 text-sage-400'}`}>
                                {count}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Grid */}
            {filteredBooks.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in">
                    {filteredBooks.map((book) => (
                        <BookCard
                            key={book.id}
                            book={book}
                            onEdit={onEdit}
                            onDelete={onDelete}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-white/50 rounded-3xl border border-dashed border-stone-200 animate-fade-in">
                    <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-4 text-sage-300">
                        {React.createElement(tabs.find(t => t.id === activeTab).icon, { className: "w-8 h-8" })}
                    </div>
                    <h3 className="text-lg font-serif font-bold text-sage-700 mb-1">
                        No books in {tabs.find(t => t.id === activeTab).label}
                    </h3>
                    <p className="text-sage-500 text-sm">
                        {activeTab === 'reading' ? "Time to start a new adventure!" :
                            activeTab === 'wishlist' ? "Search above to add books you want to read." :
                                "Books you add with this status will appear here."}
                    </p>
                </div>
            )}
        </div>
    );
}
