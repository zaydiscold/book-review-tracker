import React, { useEffect, useState } from 'react';
import { Search, Download, ExternalLink, Loader2 } from 'lucide-react';
import { searchLibgen } from '../../data/libgen';
import { LibGenWidget } from './LibGenWidget';

// Working mirrors with specific URL patterns
const MIRROR_CONFIGS = [
    { name: 'Library.lol', url: 'http://library.lol', type: 'lol', location: 'Download' },
    { name: 'LibGen.li', url: 'http://libgen.li', type: 'li', location: 'Alternative' },
    { name: 'LibGen.st', url: 'http://libgen.st', type: 'standard', location: 'Saint Helena' },
    { name: 'LibGen.gs', url: 'http://libgen.gs', type: 'standard', location: 'South Georgia' },
    { name: 'LibGen.lc', url: 'http://libgen.lc', type: 'standard', location: 'Saint Lucia' },
    { name: 'LibGen.rs', url: 'http://libgen.rs', type: 'standard', location: 'Serbia' }
];

function getMirrorLink(mirror, result) {
    if (!result.md5) return `${mirror.url}/search.php?req=${encodeURIComponent(result.title)}`;

    switch (mirror.type) {
        case 'lol':
            return `${mirror.url}/main/${result.md5}`;
        case 'li':
            // libgen.li uses 'id' for edition.php, or md5 for search
            if (result.id) return `${mirror.url}/edition.php?id=${result.id}`;
            return `${mirror.url}/index.php?req=${result.md5}`;
        case 'standard':
        default:
            // Use search by MD5 as it's more reliable than direct book links for some mirrors
            return `${mirror.url}/search.php?req=${result.md5}&column=md5`;
    }
}

export function LibGenView({ onAddBook }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [error, setError] = useState('');

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!query.trim()) return;

        setSearching(true);
        setError('');
        try {
            const searchResults = await searchLibgen(query, { count: 25 });
            setResults(searchResults);
        } catch (err) {
            setError('Failed to search LibGen. Please try again.');
            console.error(err);
        } finally {
            setSearching(false);
        }
    };

    useEffect(() => {
        if ((results && results.length > 0) || error) {
            const target = document.getElementById('libgen-results');
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    }, [results, error]);

    return (
        <div className="min-h-screen bg-cream-50">
            {/* Hero Section Style Search */}
            <div className="relative overflow-hidden bg-cream-50 pt-16 pb-12 sm:pt-24 sm:pb-20">
                {/* Decorative background elements */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full z-0 pointer-events-none">
                    <div className="absolute top-20 left-10 w-72 h-72 bg-rose-100/50 rounded-full blur-3xl mix-blend-multiply animate-float" />
                    <div className="absolute top-40 right-10 w-96 h-96 bg-lavender-100/50 rounded-full blur-3xl mix-blend-multiply animate-float" style={{ animationDelay: '1s' }} />
                    <div className="absolute -bottom-20 left-1/3 w-80 h-80 bg-sage-100/50 rounded-full blur-3xl mix-blend-multiply animate-float" style={{ animationDelay: '2s' }} />
                </div>

                <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8 text-center">
                    <div className="mx-auto max-w-2xl">
                        <div className="mb-8 flex justify-center">
                            <div className="relative rounded-full px-4 py-1.5 text-sm leading-6 text-sage-600 ring-1 ring-sage-900/10 hover:ring-sage-900/20 bg-white/50 backdrop-blur-sm shadow-sm transition-all">
                                <span className="flex items-center gap-2">
                                    <Download className="w-4 h-4 text-rose-400" />
                                    Access millions of books freely
                                </span>
                            </div>
                        </div>

                        <h1 className="text-4xl font-serif font-bold tracking-tight text-sage-900 sm:text-6xl mb-6 drop-shadow-sm">
                            LibGen <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-rose-400">Search</span>
                        </h1>

                        <p className="mt-6 text-lg leading-8 text-sage-600 max-w-xl mx-auto font-light">
                            Search across multiple Library Genesis mirrors to find and download books in various formats.
                        </p>

                        <div className="mt-10 flex items-center justify-center gap-x-6">
                            <form onSubmit={handleSearch} className="relative w-full max-w-md group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Search className="h-5 w-5 text-sage-400 group-focus-within:text-rose-500 transition-colors" />
                                </div>
                                <input
                                    type="text"
                                    className="block w-full rounded-full border-0 py-4 pl-11 pr-4 text-sage-900 shadow-soft ring-1 ring-inset ring-sage-200 placeholder:text-sage-400 focus:ring-2 focus:ring-inset focus:ring-rose-300 sm:text-sm sm:leading-6 transition-all duration-300 bg-white/80 backdrop-blur-sm hover:bg-white"
                                    placeholder="Search for a book, author, or ISBN..."
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                />
                                <button
                                    type="submit"
                                    disabled={searching}
                                    className="absolute right-2 top-2 bottom-2 bg-rose-500 text-white px-6 rounded-full font-medium text-sm shadow-md hover:bg-rose-600 transition-all duration-200 hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {searching ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Searching...
                                        </>
                                    ) : (
                                        "Search"
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            <div id="libgen-results" className="max-w-7xl mx-auto px-4 py-10 space-y-8">
                {searching && (
                    <div className="flex items-center gap-3 text-sage-500">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Searching...</span>
                    </div>
                )}

                {error && (
                    <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700">
                        {error}
                    </div>
                )}

                {results.length > 0 && (
                    <div className="space-y-4">
                        <h3 className="text-xl font-serif font-bold text-sage-700">
                            Found {results.length} results
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {results.map((result) => (
                                <div key={result.md5} className="bg-white p-6 rounded-3xl shadow-soft border border-stone-100 flex flex-col">
                                    <h4 className="font-bold text-lg text-sage-800 mb-2">{result.title}</h4>
                                    <p className="text-sage-500 mb-4">{result.author}</p>

                                    <div className="mt-auto flex gap-3">
                                        <button
                                            onClick={() => onAddBook({ ...result, status: 'wishlist' })}
                                            className="flex-1 bg-rose-100 text-rose-600 py-2 rounded-full font-medium hover:bg-rose-200 transition-colors text-sm"
                                        >
                                            Add to Wishlist
                                        </button>
                                        <button
                                            onClick={() => onAddBook({ ...result, status: 'reading' })}
                                            className="flex-1 bg-sage-100 text-sage-600 py-2 rounded-full font-medium hover:bg-sage-200 transition-colors text-sm"
                                        >
                                            Start Reading
                                        </button>
                                    </div>

                                    <div className="mt-4 pt-4 border-t border-stone-100">
                                        <LibGenWidget book={{ libgenMetadata: result }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {!searching && results.length === 0 && !error && (
                    <div className="text-center py-12">
                        <p className="text-sage-400">
                            Enter a search term above to find books
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
