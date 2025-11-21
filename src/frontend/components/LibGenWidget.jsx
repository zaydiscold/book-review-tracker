/**
 * LibGen Widget - displays download options for a book
 */
import { getLibGenMirrorUrl } from "../../data/libgen";
import { styles } from "../styles/appStyles";

export function LibGenWidget({ book, onTryNextVersion, ctaMessage }) {
  if (!book.libgenMetadata?.md5) {
    return null;
  }

  const { currentIndex = 0, totalResults = 1 } = book.libgenMetadata;
  const hasMoreVersions = currentIndex < totalResults - 1;
  const mirrorUrl = getLibGenMirrorUrl(book.libgenMetadata.md5);

  return (
    <div style={styles.libgenWidget}>
      <div style={styles.libgenWidgetHeader}>
        <div style={styles.libgenWidgetTitle}>
          <span>📥</span>
          <span>Download from Library Genesis</span>
        </div>
        {book.libgenMetadata.extension && (
          <span style={styles.libgenBadge}>
            {book.libgenMetadata.extension.toUpperCase()}
          </span>
        )}
      </div>

      {ctaMessage && (
        <div style={{ fontSize: "0.85rem", color: "#5f40c4", fontStyle: "italic", marginBottom: "0.5rem" }}>
          💡 {ctaMessage}
        </div>
      )}

      {totalResults > 1 && (
        <div style={{ fontSize: "0.75rem", color: "#5f40c4", marginBottom: "0.5rem" }}>
          Version {currentIndex + 1} of {totalResults}
          {book.libgenMetadata.publisher && ` • ${book.libgenMetadata.publisher}`}
        </div>
      )}

      {book.libgenMetadata.filesize && (
        <div style={{ fontSize: "0.8rem", color: "#5f40c4", marginBottom: "0.5rem" }}>
          File size: {book.libgenMetadata.filesize}
          {book.libgenMetadata.pages && ` • ${book.libgenMetadata.pages} pages`}
          {book.libgenMetadata.language && ` • ${book.libgenMetadata.language}`}
        </div>
      )}

      <a
        href={book.libgenMetadata.downloadUrl || mirrorUrl}
        target="_blank"
        rel="noreferrer"
        style={{
          ...styles.mirrorButton,
          ...styles.mirrorButtonPrimary
        }}
        onClick={(e) => {
          if (!book.libgenMetadata.downloadUrl) {
            // If no direct download URL, let it fall back to the mirror
            console.warn("No direct download URL available, using mirror");
          }
        }}
      >
        <span>⬇ Download</span>
        <span>→</span>
      </a>

      <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
        {hasMoreVersions && (
          <button
            type="button"
            onClick={() => onTryNextVersion(book)}
            style={{
              ...styles.mirrorButton,
              flex: 1,
              cursor: "pointer",
              fontFamily: "inherit",
              textAlign: "center"
            }}
          >
            <span>🔄 Try Next Version</span>
          </button>
        )}
        <a
          href={mirrorUrl}
          target="_blank"
          rel="noreferrer"
          style={{
            ...styles.mirrorButton,
            flex: 1,
            textDecoration: "none",
            textAlign: "center"
          }}
        >
          <span>🔗 View on LibGen</span>
        </a>
      </div>
    </div>
  );
}
