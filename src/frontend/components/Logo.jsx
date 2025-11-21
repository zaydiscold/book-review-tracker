/**
 * Logo component for the Book Review Tracker
 */
export function Logo() {
  return (
    <div className="flex flex-col items-center gap-4 p-8">
      <div aria-hidden="true">
        <svg
          width="72"
          height="64"
          viewBox="0 0 72 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="book-spine" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#E29578" /> {/* terracotta/rose light */}
              <stop offset="100%" stopColor="#C46D5E" /> {/* terracotta/rose dark */}
            </linearGradient>
            <linearGradient id="book-cover" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FDF6F0" /> {/* paper light */}
              <stop offset="100%" stopColor="#F5E6D3" /> {/* paper dark */}
            </linearGradient>
            <linearGradient id="bookmark" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#839D8E" /> {/* sage */}
              <stop offset="100%" stopColor="#6B8C7A" /> {/* sage dark */}
            </linearGradient>
          </defs>
          <rect x="6" y="10" width="18" height="46" rx="4" fill="url(#book-cover)" />
          <rect x="26" y="8" width="20" height="48" rx="4" fill="url(#book-spine)" />
          <rect x="48" y="14" width="18" height="42" rx="4" fill="#F5E6D3" />
          <rect x="9" y="16" width="12" height="2.4" rx="1.2" fill="#D4A373" opacity="0.8" />
          <rect x="9" y="24" width="12" height="2.4" rx="1.2" fill="#D4A373" opacity="0.65" />
          <rect x="9" y="32" width="12" height="2.4" rx="1.2" fill="#D4A373" opacity="0.5" />
          <rect x="30" y="18" width="12" height="2.4" rx="1.2" fill="#FDF6F0" opacity="0.9" />
          <rect x="30" y="28" width="12" height="2.4" rx="1.2" fill="#FDF6F0" opacity="0.8" />
          <rect x="30" y="38" width="12" height="2.4" rx="1.2" fill="#FDF6F0" opacity="0.7" />
          <rect x="52" y="20" width="10" height="2.2" rx="1.1" fill="#D4A373" opacity="0.7" />
          <rect x="52" y="28" width="10" height="2.2" rx="1.1" fill="#D4A373" opacity="0.55" />
          <rect x="52" y="36" width="10" height="2.2" rx="1.1" fill="#D4A373" opacity="0.4" />
          <path
            d="M44 8 L44 0 L52 6"
            fill="url(#bookmark)"
            stroke="#5A7566"
            strokeWidth="1"
            strokeLinejoin="round"
          />
          <ellipse cx="36" cy="54" rx="28" ry="5" fill="rgba(60, 47, 47, 0.1)" />
        </svg>
      </div>
      <div className="flex flex-col items-center gap-1">
        <span className="text-xl font-serif font-bold text-sage-600">Book Review Tracker</span>
        <span className="text-sm font-hand text-sage-400 italic">a cozy corner for every chapter</span>
      </div>
    </div>
  );
}
