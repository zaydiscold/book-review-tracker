import React from 'react';
import { Star, Book, Edit, Trash2 } from 'lucide-react';
import { hasCover, getCoverUrl } from '../utils/covers';

export function BookCard({ book, onEdit, onDelete }) {
    const coverUrl = hasCover(book.cover) ? getCoverUrl(book.cover) : null;

    return (
        <div className="group relative bg-white rounded-3xl shadow-soft hover:shadow-soft-xl transition-all duration-500 hover:-translate-y-2 overflow-hidden border border-stone-100 flex flex-col h-full">
            {/* Cover Image Area */}
            <div className="relative aspect-[2/3] overflow-hidden bg-stone-100">
                {coverUrl ? (
                    <img
                        src={coverUrl}
                        alt={`Cover of ${book.title}`}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-sage-300 p-6 text-center bg-cream-50">
                        <Book className="w-16 h-16 mb-2 opacity-50" strokeWidth={1} />
                        <span className="text-sm font-medium">No Cover</span>
                    </div>
                )}

                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Quick Actions Overlay */}
                <div className="absolute bottom-4 right-4 flex gap-2 translate-y-10 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 delay-100">
                    <button
                        onClick={() => onEdit(book)}
                        className="p-2 bg-white/90 backdrop-blur-sm text-sage-600 rounded-full hover:bg-white hover:text-rose-500 shadow-lg transition-colors"
                        title="Edit"
                    >
                        <Edit className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => onDelete(book)}
                        className="p-2 bg-white/90 backdrop-blur-sm text-sage-600 rounded-full hover:bg-white hover:text-rose-500 shadow-lg transition-colors"
                        title="Delete"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="p-5 flex flex-col flex-grow">
                <div className="mb-1">
                    <h3 className="font-serif font-bold text-lg text-sage-900 leading-tight line-clamp-2 group-hover:text-rose-600 transition-colors">
                        {book.title}
                    </h3>
                    <p className="text-sm text-sage-500 font-medium mt-1">{book.author}</p>
                </div>

                {/* Rating & Status */}
                <div className="mt-auto pt-4 flex items-center justify-between border-t border-stone-50">
                    <div className="flex items-center gap-1 text-honey-400">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="text-sm font-bold text-sage-700">{book.rating || '-'}</span>
                    </div>

                    <div className={`
                px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                ${book.status === 'reading' ? 'bg-rose-100 text-rose-600' :
                            book.status === 'completed' ? 'bg-sage-100 text-sage-600' :
                                'bg-stone-100 text-stone-500'}
            `}>
                        {book.status}
                    </div>
                </div>
            </div>
        </div>
    );
}
