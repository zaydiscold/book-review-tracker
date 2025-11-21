import React from 'react';
import { getCoverUrl } from '../../utils/covers';
import { renderStarRating } from './StarRatingDisplay';

export function BookCard({ book, onEdit, onDelete }) {
    const coverUrl = getCoverUrl(book.cover, 'M');
    const rating = book.rating || 0; // Assuming rating might be on the book object or derived

    return (
        <div className="group relative bg-dark-surface rounded-brutal-sm border-4 border-light shadow-brutal-lg hover:shadow-brutal-magenta transition-all duration-200 overflow-hidden hover:translate-x-[2px] hover:translate-y-[2px]">
            {/* Cover Image Area */}
            <div className="aspect-[2/3] bg-dark relative overflow-hidden border-b-4 border-light">
                {coverUrl ? (
                    <img
                        src={coverUrl}
                        alt={`Cover of ${book.title} `}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-dark-elevated text-light-muted">
                        <span className="text-sm font-bold uppercase tracking-wider">No Cover</span>
                    </div>
                )}

                {/* Status Badge */}
                <div className="absolute top-3 right-3">
                    <span className={`
px - 3 py - 1 rounded - brutal border - 2 border - black text - xs font - bold uppercase tracking - wider shadow - brutal
              ${book.status === 'reading' ? 'bg-magenta text-light' : ''}
              ${book.status === 'finished' ? 'bg-neon text-dark' : ''}
              ${book.status === 'wishlist' ? 'bg-electric text-dark' : ''}
              ${!['reading', 'finished', 'wishlist'].includes(book.status) ? 'bg-light text-dark' : ''}
`}>
                        {book.status}
                    </span>
                </div>

                {/* Hover Overlay with Actions */}
                <div className="absolute inset-0 bg-dark/95 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-3">
                    <button
                        onClick={() => onEdit(book)}
                        className="p-3 bg-cyber text-dark rounded-brutal border-3 border-black shadow-brutal hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all"
                        title="Edit Details"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                            <path d="M21.731 2.269a2.625 2.625 0 00-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 000-3.712zM19.513 8.199l-3.712-3.712-12.15 12.15a5.25 5.25 0 00-1.32 2.214l-.8 2.685a.75.75 0 00.933.933l2.685-.8a5.25 5.25 0 002.214-1.32L19.513 8.2z" />
                        </svg>
                    </button>
                    <button
                        onClick={() => onDelete(book)}
                        className="p-3 bg-magenta text-light rounded-brutal border-3 border-black shadow-brutal hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all"
                        title="Remove Book"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                            <path fillRule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 013.878.512.75.75 0 11-.49 1.478l-.56 17.433A2.25 2.25 0 0117.08 26.25H6.92a2.25 2.25 0 01-2.248-2.122L4.11 6.695a48.817 48.817 0 01-3.878-.512.75.75 0 11.49-1.478 48.809 48.809 0 013.878-.512v-.227c0-1.185 1.054-2.126 2.365-2.126h6.268c1.31 0 2.365.941 2.365 2.126zM18.04 6.75l.55 17.155h-13.18l.55-17.155h12.08z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Book Info */}
            <div className="p-4 bg-dark-surface">
                <h3 className="font-bold text-lg text-light leading-tight mb-1 line-clamp-2 min-h-[3rem] uppercase tracking-tight">
                    {book.title}
                </h3>
                <p className="text-sm text-light-muted mb-3 font-mono line-clamp-1">
                    {book.author}
                </p>

                {/* Rating Display */}
                <div className="flex items-center gap-2">
                    <div className="px-2 py-1 bg-dark-elevated border-2 border-electric rounded-brutal">
                        <span className="font-bold text-electric font-mono">{book.rating ? book.rating : '—'}</span>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-electric">
                        <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                    </svg>
                </div>
            </div>
        </div>
    );
}
