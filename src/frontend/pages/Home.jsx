import React from 'react';
import { HeroSection } from '../components/HeroSection';
import { LibGenWidget } from '../components/LibGenWidget';

export function Home({ onSearch, searchResults, searching, searchError, onAddBook }) {
    return (
        <div className="animate-fade-in">
            <HeroSection onSearch={onSearch} />

            {/* Search Results Section */}
            {searching && (
                <div className="text-center py-12">
                    <div className="animate-spin w-8 h-8 border-4 border-rose-400 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-sage-500">Searching the archives...</p>
                </div>
            )}

            {searchError && (
                <div className="mb-10 mx-4 md:mx-0 rounded-2xl border border-rose-200 bg-rose-50/70 px-4 py-3 text-rose-700 shadow-soft animate-slide-up">
                    {searchError}
                </div>
            )}

            {searchResults.length > 0 && (
                <div className="mb-16 animate-fade-in container mx-auto px-4">
                    <h3 className="text-2xl font-serif font-bold text-sage-700 mb-6">Search Results</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {searchResults.map((result) => (
                            <div key={result.md5} className="bg-white p-6 rounded-3xl shadow-soft border border-stone-100 flex flex-col">
                                <h4 className="font-bold text-lg text-sage-800 mb-2">{result.title}</h4>
                                <p className="text-sage-500 mb-4">{result.author}</p>
                                <div className="mt-auto flex gap-3">
                                    <button
                                        onClick={() => onAddBook({ ...result, status: 'wishlist' })}
                                        className="flex-1 bg-rose-100 text-rose-600 py-2 rounded-full font-medium hover:bg-rose-200 transition-colors"
                                    >
                                        Add to Wishlist
                                    </button>
                                    <button
                                        onClick={() => onAddBook({ ...result, status: 'reading' })}
                                        className="flex-1 bg-sage-100 text-sage-600 py-2 rounded-full font-medium hover:bg-sage-200 transition-colors"
                                    >
                                        Start Reading
                                    </button>
                                </div>
                                {/* LibGen Widget for direct downloads */}
                                <div className="mt-4 pt-4 border-t border-stone-100">
                                    <LibGenWidget book={{ libgenMetadata: result.libgenMetadata }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {!searching && searchResults.length === 0 && !searchError && (
                <div className="text-center py-20 text-sage-400">
                    <p className="text-lg">Search for a book to begin your journey.</p>
                </div>
            )}
        </div>
    );
}
