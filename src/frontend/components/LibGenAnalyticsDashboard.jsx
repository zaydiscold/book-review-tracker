/**
 * LibGen Analytics Dashboard Component
 */
export function LibGenAnalyticsDashboard({ stats, onBatchSearch, batchSearching }) {
  if (!stats || stats.total === 0) {
    return null;
  }

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-soft border-2 border-stone-100">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">📊</span>
        <span className="text-lg font-semibold text-sage-600">Library Genesis Statistics</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="flex flex-col items-center p-3 bg-cream-50/80 rounded-2xl">
          <div className="text-2xl font-bold text-rose-600">{stats.withLibgen}</div>
          <div className="text-sm text-sage-500">Books on LibGen</div>
        </div>

        <div className="flex flex-col items-center p-3 bg-cream-50/80 rounded-2xl">
          <div className="text-2xl font-bold text-rose-600">{stats.percentage}%</div>
          <div className="text-sm text-sage-500">Coverage</div>
        </div>

        <div className="flex flex-col items-center p-3 bg-cream-50/80 rounded-2xl">
          <div className="text-2xl font-bold text-rose-600">{stats.totalSize}</div>
          <div className="text-sm text-sage-500">Total Size</div>
        </div>

        <div className="flex flex-col items-center p-3 bg-cream-50/80 rounded-2xl">
          <div className="text-2xl font-bold text-rose-600">{Object.keys(stats.formats).length}</div>
          <div className="text-sm text-sage-500">Formats</div>
        </div>
      </div>

      {Object.keys(stats.formats).length > 0 && (
        <div className="mb-4">
          <div className="text-sm font-semibold text-sage-600 mb-2">
            Available Formats:
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(stats.formats).map(([format, count]) => (
              <span key={format} className="px-3 py-1 bg-lavender-100/50 text-sage-600 rounded-full text-xs font-medium">
                {format} ({count})
              </span>
            ))}
          </div>
        </div>
      )}

      {stats.withLibgen < stats.total && (
        <div className="mt-4">
          <button
            type="button"
            onClick={onBatchSearch}
            disabled={batchSearching}
            className={`w-full px-6 py-3 rounded-2xl font-medium transition-all ${batchSearching
                ? "bg-sage-200 text-sage-500 cursor-not-allowed"
                : "bg-rose-500 text-white hover:bg-rose-600 active:scale-95"
              }`}
          >
            {batchSearching
              ? "Searching..."
              : `Find ${stats.total - stats.withLibgen} missing books on LibGen`}
          </button>
        </div>
      )}
    </div>
  );
}
