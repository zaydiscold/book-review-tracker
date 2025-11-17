/**
 * Logo component for the Book Review Tracker
 */
import { styles } from "../styles/appStyles";

export function Logo() {
  return (
    <div style={styles.logoWrapper}>
      <div style={styles.logoIcon} aria-hidden="true">
        <svg
          width="72"
          height="64"
          viewBox="0 0 72 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="book-spine" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#F2C199" />
              <stop offset="100%" stopColor="#D9822B" />
            </linearGradient>
            <linearGradient id="book-cover" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FFF5EC" />
              <stop offset="100%" stopColor="#F9DFC6" />
            </linearGradient>
            <linearGradient id="bookmark" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#A73636" />
              <stop offset="100%" stopColor="#6e2121" />
            </linearGradient>
          </defs>
          <rect x="6" y="10" width="18" height="46" rx="4" fill="url(#book-cover)" />
          <rect x="26" y="8" width="20" height="48" rx="4" fill="url(#book-spine)" />
          <rect x="48" y="14" width="18" height="42" rx="4" fill="#F4E2CF" />
          <rect x="9" y="16" width="12" height="2.4" rx="1.2" fill="#D9822B" opacity="0.8" />
          <rect x="9" y="24" width="12" height="2.4" rx="1.2" fill="#D9822B" opacity="0.65" />
          <rect x="9" y="32" width="12" height="2.4" rx="1.2" fill="#D9822B" opacity="0.5" />
          <rect x="30" y="18" width="12" height="2.4" rx="1.2" fill="#FDF2E6" opacity="0.9" />
          <rect x="30" y="28" width="12" height="2.4" rx="1.2" fill="#FDF2E6" opacity="0.8" />
          <rect x="30" y="38" width="12" height="2.4" rx="1.2" fill="#FDF2E6" opacity="0.7" />
          <rect x="52" y="20" width="10" height="2.2" rx="1.1" fill="#D9822B" opacity="0.7" />
          <rect x="52" y="28" width="10" height="2.2" rx="1.1" fill="#D9822B" opacity="0.55" />
          <rect x="52" y="36" width="10" height="2.2" rx="1.1" fill="#D9822B" opacity="0.4" />
          <path
            d="M44 8 L44 0 L52 6"
            fill="url(#bookmark)"
            stroke="#6e2121"
            strokeWidth="1"
            strokeLinejoin="round"
          />
          <ellipse cx="36" cy="54" rx="28" ry="5" fill="rgba(60, 47, 47, 0.18)" />
        </svg>
      </div>
      <div style={styles.logoTextGroup}>
        <span style={styles.logoTitle}>Book Review Tracker</span>
        <span style={styles.logoSubtitle}>a cozy corner for every chapter</span>
      </div>
    </div>
  );
}
