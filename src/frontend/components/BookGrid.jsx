import React from 'react';
import { BookCard } from './BookCard';

export function BookGrid({ books, onEdit, onDelete }) {
    if (!books || books.length === 0) {
        return (
            <div className="text-center py-20 bg-white rounded-3xl border border-stone-100 shadow-sm">
                <div className="text-6xl mb-6 opacity-80">📚</div>
                <h3 className="text-2xl font-serif font-bold text-ink mb-3">Your library is waiting</h3>
                <p className="text-ink-light max-w-md mx-auto">
                    It looks like you haven't added any books yet. Search for a title above to start your collection.
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 md:gap-8">
            {books.map((book) => (
                <BookCard
                    key={book.id}
                    book={book}
                    onEdit={onEdit}
                    onDelete={onDelete}
                />
            ))}
        </div>
    );
}
