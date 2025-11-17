/**
 * LibGen Analytics Dashboard Component
 */
import { styles } from "../styles/appStyles";

export function LibGenAnalyticsDashboard({ stats, onBatchSearch, batchSearching }) {
  if (!stats || stats.total === 0) {
    return null;
  }

  return (
    <div style={styles.analyticsCard}>
      <div style={styles.analyticsTitle}>
        <span>📊</span>
        <span>Library Genesis Statistics</span>
      </div>

      <div style={styles.analyticsGrid}>
        <div style={styles.analyticsStat}>
          <div style={styles.analyticsValue}>{stats.withLibgen}</div>
          <div style={styles.analyticsLabel}>Books on LibGen</div>
        </div>

        <div style={styles.analyticsStat}>
          <div style={styles.analyticsValue}>{stats.percentage}%</div>
          <div style={styles.analyticsLabel}>Coverage</div>
        </div>

        <div style={styles.analyticsStat}>
          <div style={styles.analyticsValue}>{stats.totalSize}</div>
          <div style={styles.analyticsLabel}>Total Size</div>
        </div>

        <div style={styles.analyticsStat}>
          <div style={styles.analyticsValue}>{Object.keys(stats.formats).length}</div>
          <div style={styles.analyticsLabel}>Formats</div>
        </div>
      </div>

      {Object.keys(stats.formats).length > 0 && (
        <div>
          <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "#5f40c4", marginBottom: "0.5rem" }}>
            Available Formats:
          </div>
          <div style={styles.formatsList}>
            {Object.entries(stats.formats).map(([format, count]) => (
              <span key={format} style={styles.formatBadge}>
                {format} ({count})
              </span>
            ))}
          </div>
        </div>
      )}

      {stats.withLibgen < stats.total && (
        <div style={{ marginTop: "1rem" }}>
          <button
            type="button"
            onClick={onBatchSearch}
            disabled={batchSearching}
            style={{
              ...styles.findLibgenButton,
              ...(batchSearching ? styles.findLibgenButtonSearching : {}),
              width: "100%",
              padding: "0.75rem"
            }}
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
