import React, { useState, useEffect } from 'react';
import { StarRatingInput } from './StarRatingInput';
import { BOOK_STATUS_SECTIONS, REVIEW_DISABLED_STATUSES } from '../constants/bookStatus';

export function BookForm({
    initialData,
    onSubmit,
    onCancel,
    isEditing = false,
    coverPreviewUrl,
    onClearCover
}) {
    const [formData, setFormData] = useState(initialData);
    const [addReviewWithBook, setAddReviewWithBook] = useState(false);
    const [reviewDraft, setReviewDraft] = useState({ rating: "", text: "", status: initialData.status });
    const [coverType, setCoverType] = useState("");
    const [coverValue, setCoverValue] = useState("");

    useEffect(() => {
        setFormData(initialData);
        setReviewDraft(prev => ({ ...prev, status: initialData.status }));
    }, [initialData]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData, addReviewWithBook ? reviewDraft : null);
    };

    const handleStatusChange = (e) => {
        const newStatus = e.target.value;
        setFormData({ ...formData, status: newStatus });

        if (REVIEW_DISABLED_STATUSES.has(newStatus)) {
            setAddReviewWithBook(false);
        }
        setReviewDraft(prev => ({ ...prev, status: newStatus }));
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-stone-100">
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-bold text-sage-800 mb-1">Title</label>
                    <input
                        className="input"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="The Left Hand of Darkness"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-bold text-sage-800 mb-1">Author</label>
                    <input
                        className="input"
                        value={formData.author}
                        onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                        placeholder="Ursula K. Le Guin"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {!isEditing && (
                        <div>
                            <label className="block text-sm font-bold text-sage-800 mb-1">Status</label>
                            <div className="relative">
                                <select
                                    className="input appearance-none cursor-pointer"
                                    value={formData.status}
                                    onChange={handleStatusChange}
                                >
                                    {BOOK_STATUS_SECTIONS.map((section) => (
                                        <optgroup key={section.label} label={section.label}>
                                            {section.options.map((status) => (
                                                <option key={status.value} value={status.value}>
                                                    {status.label}
                                                </option>
                                            ))}
                                        </optgroup>
                                    ))}
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-stone-400">
                                    ▾
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Cover Source Logic would go here, simplified for now */}
                </div>

                {/* Review Section Toggle */}
                {!isEditing && !REVIEW_DISABLED_STATUSES.has(formData.status) && (
                    <div className="pt-4 border-t border-stone-100">
                        <label className="flex items-center gap-2 cursor-pointer mb-4">
                            <input
                                type="checkbox"
                                checked={addReviewWithBook}
                                onChange={(e) => setAddReviewWithBook(e.target.checked)}
                                className="rounded text-rose-500 focus:ring-rose-200"
                            />
                            <span className="text-sm text-sage-500">Add a review now</span>
                        </label>

                        {addReviewWithBook && (
                            <div className="space-y-4 animate-fade-in">
                                <div>
                                    <label className="block text-sm font-bold text-sage-800 mb-1">Rating</label>
                                    <div className="flex items-center gap-4">
                                        <StarRatingInput
                                            value={reviewDraft.rating}
                                            onChange={(val) => setReviewDraft({ ...reviewDraft, rating: val })}
                                        />
                                        <span className="text-sm text-sage-500 font-medium">
                                            {reviewDraft.rating ? `${reviewDraft.rating}/5` : 'Rate this book'}
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-sage-800 mb-1">Review</label>
                                    <textarea
                                        className="input min-h-[100px]"
                                        value={reviewDraft.text}
                                        onChange={(e) => setReviewDraft({ ...reviewDraft, text: e.target.value })}
                                        placeholder="What did you think?"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <div className="flex justify-end gap-3 pt-4">
                    {onCancel && (
                        <button
                            type="button"
                            onClick={onCancel}
                            className="btn-secondary"
                        >
                            Cancel
                        </button>
                    )}
                    <button
                        type="submit"
                        className="btn-primary"
                    >
                        {isEditing ? 'Save Changes' : 'Add Book'}
                    </button>
                </div>
            </div>
        </form>
    );
}
