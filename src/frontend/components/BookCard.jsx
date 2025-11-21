import React from 'react';
import { getCoverUrl } from '../../utils/covers';

export function BookCard({ book, onEdit, onDelete }) {
    const coverUrl = getCoverUrl(book.cover, 'M');
    const rating = book.rating || 0;

    return (
        <div className="group relative bg-white rounded-3xl shadow-soft hover:shadow-soft-xl transition-all duration-300 overflow-hidden hover:-translate-y-1 ring-1 ring-black/5">
            {/* Cover Image Area */}
            <div className="aspect-[2/3] bg-stone-100 relative overflow-hidden">
                {coverUrl ? (
                    <img
                        src={coverUrl}
                        alt={`Cover of ${book.title}`}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-rose-50/50 text-rose-300">
                        <div className="w-12 h-12 mb-3 rounded-full bg-rose-100 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                            </svg>
                        </div>
                        <span className="text-sm font-medium font-serif text-rose-400">No Cover</span>
                    </div>
                )}

                {/* Status Badge */}
                <div className="absolute top-3 right-3">
                    <span className={`
                        px-3 py-1 rounded-full text-xs font-bold tracking-wide shadow-sm backdrop-blur-md
                        ${book.status === 'reading' ? 'bg-rose-400/90 text-white' : ''}
                        ${book.status === 'finished' ? 'bg-sage-500/90 text-white' : ''}
                        ${book.status === 'wishlist' ? 'bg-lavender-400/90 text-white' : ''}
                        ${!['reading', 'finished', 'wishlist'].includes(book.status) ? 'bg-white/90 text-sage-600' : ''}
                    `}>
                        {book.status}
                    </span>
                </div>

                {/* Hover Overlay with Actions */}
                <div className="absolute inset-0 bg-sage-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3 backdrop-blur-[2px]">
                    <button
                        onClick={() => onEdit(book)}
                        className="p-3 bg-white text-sage-600 rounded-full shadow-lg hover:bg-rose-50 hover:text-rose-500 hover:scale-110 transition-all duration-200"
                        title="Edit Details"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                            <path d="M21.731 2.269a2.625 2.625 0 00-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 000-3.712zM19.513 8.199l-3.712-3.712-12.15 12.15a5.25 5.25 0 00-1.32 2.214l-.8 2.685a.75.75 0 00.933.933l2.685-.8a5.25 5.25 0 002.214-1.32L19.513 8.2z" />
                        </svg>
                    </button>
                    <button
                        onClick={() => onDelete(book)}
                        className="p-3 bg-white text-rose-500 rounded-full shadow-lg hover:bg-rose-50 hover:text-rose-600 hover:scale-110 transition-all duration-200"
                        title="Remove Book"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                            <path fillRule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 013.878.512.75.75 0 11-.49 1.478l-.56 17.433A2.25 2.25 0 0117.08 26.25H6.92a2.25 2.25 0 01-2.248-2.122L4.11 6.695a48.817 48.817 0 01-3.878-.512.75.75 0 11.49-1.478 48.809 48.809 0 013.878-.512v-.227c0-1.185 1.054-2.126 2.365-2.126h6.268c1.31 0 2.365.941 2.365 2.126zM18.04 6.75l.55 17.155h-13.18l.55-17.155h12.08z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Book Info */}
            <div className="p-5">
                <h3 className="font-serif font-bold text-lg text-sage-700 leading-tight mb-1 line-clamp-2 min-h-[3rem]">
                    {book.title}
                </h3>
                <p className="text-sm text-sage-400 mb-4 font-medium line-clamp-1">
                    {book.author}
                </p>

                {/* Rating Display */}
                <div className="flex items-center gap-1.5">
                    <div className="flex text-honey-400">
                        {[...Array(5)].map((_, i) => (
                            <svg key={i} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-4 h-4 ${i < Math.round(rating / 2) ? 'text-honey-400' : 'text-stone-200'}`}>
                                <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                            </svg>
                        ))}
                    </div>
                    <span className="text-xs font-bold text-sage-400 ml-1">{book.rating ? book.rating : ''}</span>
                </div>
            </div>
        </div>
    );
}
