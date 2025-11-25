import React from 'react';
import { getLibGenMirrorUrl } from '../../data/libgen';

export function LibGenWidget({ book, onTryNextVersion }) {
  if (!book || !book.libgenMetadata) return null;

  const {
    extension,
    filesize,
    size, // Backend might return 'size'
    downloadUrl,
    md5,
    currentIndex,
    totalResults
  } = book.libgenMetadata;

  const mirrorUrl = getLibGenMirrorUrl(md5);

  // Handle size display: prefer 'size' (formatted string), fallback to 'filesize' (bytes)
  let formattedSize = 'Unknown size';
  if (size) {
    formattedSize = size;
  } else if (filesize) {
    formattedSize = (parseInt(filesize) / (1024 * 1024)).toFixed(1) + ' MB';
  }

  return (
    <div className="bg-paper-50 rounded-xl p-4 border border-taupe-200 mt-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold uppercase tracking-wider text-ink-600">LibGen Archive</span>
        {extension && (
          <span className="px-2 py-0.5 bg-white border border-taupe-200 rounded text-xs font-mono text-ink-500 uppercase">
            {extension}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col">
          <span className="text-xs text-ink-400 font-medium">File Size</span>
          <span className="text-sm font-bold text-ink-700">{formattedSize}</span>
        </div>

        <a
          href={downloadUrl || mirrorUrl}
          target="_blank"
          rel="noreferrer"
          className="flex-1 flex items-center justify-center gap-2 bg-taupe-500 text-white px-4 py-2 rounded-lg font-medium shadow-sm hover:bg-taupe-600 hover:shadow-md transition-all active:scale-95"
        >
          Download
        </a>
      </div>

      {/* Version Navigation (if applicable) */}
      {totalResults > 1 && onTryNextVersion && (
        <div className="mt-3 pt-3 border-t border-taupe-200 flex items-center justify-between text-xs">
          <span className="text-ink-400">
            Version {currentIndex + 1} of {totalResults}
          </span>
          <button
            onClick={onTryNextVersion}
            className="text-clay-400 hover:text-clay-500 font-medium hover:underline flex items-center gap-1"
          >
            Try different version
          </button>
        </div>
      )}
    </div>
  );
}
