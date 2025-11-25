import React from 'react';
import { BookGrid } from '../components/BookGrid';

export function MyLibrary({ books, libraryStats, onEdit, onDelete }) {
    return (
        <div className="container mx-auto px-4 py-8 animate-fade-in">
            {/* Main Library Grid */}
            <div className="mb-8 flex items-center justify-between">
                <h3 className="text-2xl font-serif font-bold text-sage-700">Your Library</h3>
                <div className="text-sm text-sage-400 font-medium">
                    {books.length} books • {libraryStats.totalSize}
                </div>
            </div>

            <BookGrid
                books={books}
                onEdit={onEdit}
                onDelete={onDelete}
            />
        </div>
    );
}
