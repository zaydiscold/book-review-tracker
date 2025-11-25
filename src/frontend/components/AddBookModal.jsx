import React, { useState } from 'react';

const STATUS_OPTIONS = [
    { value: 'reading', label: 'Reading' },
    { value: 'wishlist', label: 'Wishlist' },
    { value: 'finished', label: 'Finished' },
    { value: 'on-hold', label: 'On Hold' },
    { value: 'did-not-finish', label: 'Did Not Finish' }
];

const COVER_TYPES = [
    { value: '', label: 'Auto (no cover)' },
    { value: 'isbn', label: 'ISBN' },
    { value: 'olid', label: 'OLID (edition_key)' },
    { value: 'id', label: 'OpenLibrary cover ID' },
    { value: 'lccn', label: 'LCCN' },
    { value: 'oclc', label: 'OCLC' },
    { value: 'url', label: 'Direct Image URL' }
];

export function AddBookModal({ isOpen, onClose, onSave }) {
    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState('');
    const [status, setStatus] = useState('reading');
    const [coverType, setCoverType] = useState('');
    const [coverValue, setCoverValue] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!title.trim()) return;

        const cover = coverType && coverValue.trim()
            ? { type: coverType, value: coverValue.trim() }
            : null;

        onSave({
            title: title.trim(),
            author: author.trim(),
            status,
            cover
        });

        setTitle('');
        setAuthor('');
        setStatus('reading');
        setCoverType('');
        setCoverValue('');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-serif font-bold text-sage-800">Add a Book</h3>
                    <button onClick={onClose} className="text-sage-400 hover:text-rose-500">Close</button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-sage-600 mb-1">Title</label>
                        <input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full rounded-lg border border-stone-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-200"
                            placeholder="Book title"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-sage-600 mb-1">Author</label>
                        <input
                            value={author}
                            onChange={(e) => setAuthor(e.target.value)}
                            className="w-full rounded-lg border border-stone-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-200"
                            placeholder="Author name"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-sage-600 mb-1">Status</label>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="w-full rounded-lg border border-stone-200 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-rose-200"
                        >
                            {STATUS_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <div className="flex gap-2">
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-sage-600 mb-1">Cover type</label>
                                <select
                                    value={coverType}
                                    onChange={(e) => setCoverType(e.target.value)}
                                    className="w-full rounded-lg border border-stone-200 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-rose-200"
                                >
                                    {COVER_TYPES.map((opt) => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-sage-600 mb-1">Cover value</label>
                                <input
                                    value={coverValue}
                                    onChange={(e) => setCoverValue(e.target.value)}
                                    className="w-full rounded-lg border border-stone-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-200"
                                    placeholder="e.g., 9780140328721"
                                    disabled={!coverType}
                                />
                            </div>
                        </div>
                        <p className="text-xs text-sage-400">
                            Tip: Open Library provides cover types like ISBN, OLID (edition_key), cover ID, LCCN, or OCLC. Use direct image URL if you already have one.
                        </p>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-lg border border-stone-200 text-sage-600 hover:bg-stone-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 rounded-lg bg-rose-500 text-white font-medium hover:bg-rose-600 transition-colors"
                        >
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
