import React from 'react';
import { getLibGenMirrorUrl } from '../../data/libgen';
import { Download, ExternalLink, Database } from 'lucide-react';

export function LibGenWidget({ book, onTryNextVersion }) {
  if (!book || !book.libgenMetadata) return null;

  const {
    extension,
    filesize,
    downloadUrl,
    md5,
    currentIndex,
    totalResults
  } = book.libgenMetadata;

  const mirrorUrl = getLibGenMirrorUrl(md5);

  // Format filesize (e.g., "1234567" -> "1.2 MB")
  const formattedSize = filesize
    ? (parseInt(filesize) / (1024 * 1024)).toFixed(1) + ' MB'
    : 'Unknown size';

  return (
    <div className="bg-stone-50 rounded-2xl p-4 border border-stone-100">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-sage-600">
          <Database className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-wider">LibGen Archive</span>
        </div>
        {extension && (
          <span className="px-2 py-0.5 bg-white border border-stone-200 rounded text-xs font-mono text-sage-500 uppercase">
            {extension}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col">
          <span className="text-xs text-sage-400 font-medium">File Size</span>
          <span className="text-sm font-bold text-sage-700">{formattedSize}</span>
        </div>

        <a
          href={downloadUrl || mirrorUrl}
          target="_blank"
          rel="noreferrer"
          className="flex-1 flex items-center justify-center gap-2 bg-sage-600 text-white px-4 py-2 rounded-xl font-medium shadow-sm hover:bg-sage-700 hover:shadow-md transition-all active:scale-95"
          onClick={(e) => {
            if (!downloadUrl) {
              console.warn("No direct download URL available, using mirror");
            }
          }}
        >
          <Download className="w-4 h-4" />
          <span>Download</span>
        </a>
      </div>

      {/* Version Navigation (if applicable) */}
      {totalResults > 1 && onTryNextVersion && (
        <div className="mt-3 pt-3 border-t border-stone-200 flex items-center justify-between text-xs">
          <span className="text-sage-400">
            Version {currentIndex + 1} of {totalResults}
          </span>
          <button
            onClick={onTryNextVersion}
            className="text-rose-500 hover:text-rose-600 font-medium hover:underline flex items-center gap-1"
          >
            Try different version
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
}
