import React from 'react';
import { X, Download, Upload, FileJson } from 'lucide-react';

export function SettingsModal({ isOpen, onClose }) {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="settings-modal-title"
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative bg-white rounded-3xl shadow-soft-xl w-full max-w-md overflow-hidden animate-slide-up">
                <div className="p-6 border-b border-stone-100 flex items-center justify-between bg-cream-50/50">
                    <h2 id="settings-modal-title" className="text-xl font-serif font-bold text-sage-800">Settings & Data</h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-sage-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-colors"
                        aria-label="Close settings"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Export Section */}
                    <div>
                        <h3 className="text-sm font-bold text-sage-400 uppercase tracking-wider mb-3">Export</h3>
                        <div className="space-y-3">
                            <button className="w-full flex items-center gap-3 p-4 rounded-2xl border-2 border-stone-100 hover:border-rose-200 hover:bg-rose-50/30 transition-all group text-left">
                                <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Download className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="font-bold text-sage-800">Export to Goodreads</div>
                                    <div className="text-xs text-sage-500">Download CSV compatible with Goodreads import</div>
                                </div>
                            </button>

                            <button className="w-full flex items-center gap-3 p-4 rounded-2xl border-2 border-stone-100 hover:border-sage-200 hover:bg-sage-50/30 transition-all group text-left">
                                <div className="w-10 h-10 rounded-full bg-sage-100 text-sage-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <FileJson className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="font-bold text-sage-800">Backup Data</div>
                                    <div className="text-xs text-sage-500">Download full JSON backup of your library</div>
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Import Section */}
                    <div>
                        <h3 className="text-sm font-bold text-sage-400 uppercase tracking-wider mb-3">Import</h3>
                        <button className="w-full flex items-center gap-3 p-4 rounded-2xl border-2 border-stone-100 border-dashed hover:border-sage-300 hover:bg-sage-50/30 transition-all group text-left">
                            <div className="w-10 h-10 rounded-full bg-stone-100 text-stone-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Upload className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="font-bold text-sage-800">Import Backup</div>
                                <div className="text-xs text-sage-500">Restore from a JSON backup file</div>
                            </div>
                        </button>
                    </div>
                </div>

                <div className="p-4 bg-stone-50 text-center text-xs text-sage-400">
                    Book Review Tracker v1.0 • Local Data Only
                </div>
            </div>
        </div>
    );
}
