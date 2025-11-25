import React, { useState } from 'react';
import { Star, Book, Edit, Trash2, ExternalLink, Download, BookmarkPlus, BookOpen } from 'lucide-react';
import { getCoverUrl, ensureCover } from '../utils/covers';

export function BookCard({ book, onEdit, onDelete, onAdd }) {
    const [coverBroken, setCoverBroken] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);
    const cover = ensureCover(book);
    const coverUrl = !coverBroken && cover ? getCoverUrl(cover, 'L') : null;

    // Reset state when cover changes
    React.useEffect(() => {
        setCoverBroken(false);
        setImageLoaded(false);
    }, [book.cover]);

    // Generate external links
    const openLibraryLink = book.openLibraryUrl || `https://openlibrary.org/search?q=${encodeURIComponent(book.title + ' ' + book.author)}`;

    // Get results from libgen metadata
    const allResults = book.libgenMetadata?.allResults || [];
    const result1 = allResults[0] || book.libgenMetadata;
    const result2 = allResults[1];
    const result3 = allResults[2];

    // Main button: libgen.li (Alternative - uses ID for edition page)
    const directLibGenLink = result1?.id
        ? `https://libgen.li/edition.php?id=${result1.id}`
        : `https://libgen.li/index.php?req=${encodeURIComponent(book.title + ' ' + book.author)}`;

    // Button 2: libgen.st (Saint Helena - Working Primary)
    // Use search by MD5 for reliability
    const mirror2Link = result2?.md5
        ? `http://libgen.st/search.php?req=${result2.md5}&column=md5`
        : result1?.md5
            ? `http://libgen.st/search.php?req=${result1.md5}&column=md5`
            : `http://libgen.st/search.php?req=${encodeURIComponent(book.title)}`;

    // Button 3: libgen.gs (South Georgia - Highly Recommended)
    // Use search by MD5 for reliability
    const mirror3Link = result3?.md5
        ? `http://libgen.gs/search.php?req=${result3.md5}&column=md5`
        : result1?.md5
            ? `http://libgen.gs/search.php?req=${result1.md5}&column=md5`
            : `http://libgen.gs/search.php?req=${encodeURIComponent(book.title)}`;

    return (
        <div className="group relative bg-white rounded-3xl shadow-soft hover:shadow-soft-xl transition-all duration-500 hover:-translate-y-2 overflow-hidden border border-stone-100 flex flex-col h-full">
            {/* Cover Image Area */}
            <div className="relative aspect-[2/3] overflow-hidden bg-stone-100">
                {/* Placeholder / Loading State */}
                <div className={`absolute inset-0 flex flex-col items-center justify-center text-sage-300 p-6 text-center bg-cream-50 transition-opacity duration-300 ${imageLoaded ? 'opacity-0' : 'opacity-100'}`}>
                    <BookOpen className="w-16 h-16 mb-2 opacity-60 animate-spin" strokeWidth={1.5} />
                    <span className="text-xs font-medium text-sage-400">
                        {coverBroken ? 'No Cover' : 'Loading...'}
                    </span>
                </div>

                {/* Cover Image */}
                {coverUrl && !coverBroken && (
                    <img
                        src={coverUrl}
                        alt={`Cover of ${book.title}`}
                        className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 group-hover:scale-110 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                        onLoad={() => setImageLoaded(true)}
                        onError={() => setCoverBroken(true)}
                    />
                )}

                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Quick Actions Overlay */}
                <div className={`absolute bottom-4 right-4 flex gap-2 transition-all duration-300 delay-100 ${onAdd ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 group-hover:translate-y-0 group-hover:opacity-100'}`}>
                    {onAdd ? (
                        <button
                            onClick={() => onAdd(book)}
                            className="p-2 bg-white/90 backdrop-blur-sm text-sage-600 rounded-full hover:bg-white hover:text-rose-500 shadow-lg transition-colors"
                            title="Add to Library"
                        >
                            <BookmarkPlus className="w-4 h-4" />
                        </button>
                    ) : (
                        <>
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
                        </>
                    )}
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
                                book.status === 'wishlist' ? 'bg-lavender-100 text-lavender-600' :
                                    book.status === 'dnf' ? 'bg-stone-200 text-stone-500' :
                                        'bg-stone-100 text-stone-500'}
                    `}>
                        {book.status === 'completed' ? 'Read' : book.status}
                    </div>
                </div>

                {/* External Links Footer */}
                <div className="mt-3 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-sage-400">
                    <a
                        href={openLibraryLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 hover:text-rose-500 transition-colors"
                        title="View on OpenLibrary"
                    >
                        <ExternalLink className="w-3 h-3" />
                        <span>OpenLibrary</span>
                    </a>
                    <div className="flex items-center gap-1">
                        <a
                            href={directLibGenLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 hover:text-rose-500 transition-colors"
                            title={result1?.extension ? `LibGen.li - ${result1.extension.toUpperCase()}` : "LibGen.li"}
                        >
                            <Download className="w-3 h-3" />
                            <span>LibGen</span>
                        </a>
                        <a
                            href={mirror2Link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] bg-stone-100 px-1.5 py-0.5 rounded hover:bg-rose-100 hover:text-rose-600 transition-colors"
                            title={result2?.extension ? `LibGen.st - ${result2.extension.toUpperCase()}` : "LibGen.st"}
                        >
                            2
                        </a>
                        <a
                            href={mirror3Link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] bg-stone-100 px-1.5 py-0.5 rounded hover:bg-rose-100 hover:text-rose-600 transition-colors"
                            title={result3?.extension ? `LibGen.gs - ${result3.extension.toUpperCase()}` : "LibGen.gs"}
                        >
                            3
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
