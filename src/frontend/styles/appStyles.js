/**
 * Application styles
 */
import { THEME } from "../constants/theme";

export const styles = {
  wrapper: {
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif",
    margin: "0 auto",
    padding: "3.2rem 2.6rem 4.2rem",
    maxWidth: "1240px",
    color: THEME.textPrimary,
    background: "rgba(255, 255, 255, 0.28)",
    border: "1px solid rgba(255, 255, 255, 0.45)",
    borderRadius: "2.5rem",
    boxShadow: "0 20px 60px rgba(60, 47, 47, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.5) inset, var(--shadow-xl)",
    backdropFilter: "blur(40px) saturate(180%)",
    WebkitBackdropFilter: "blur(40px) saturate(180%)",
    minHeight: "92vh",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    position: "relative",
    overflow: "hidden"
  },
  header: {
    marginBottom: "2.6rem",
    textAlign: "center",
    maxWidth: "760px",
    marginLeft: "auto",
    marginRight: "auto"
  },
  logoWrapper: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "1.2rem",
    marginBottom: "1.1rem",
    flexWrap: "wrap"
  },
  logoIcon: {
    width: "78px",
    height: "68px",
    borderRadius: "22px",
    background: "linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 212, 179, 0.35) 100%)",
    border: "1px solid rgba(255, 255, 255, 0.5)",
    boxShadow: "0 8px 24px rgba(60, 47, 47, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.3) inset",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0.45rem",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
  },
  logoTextGroup: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: "0.2rem"
  },
  logoTitle: {
    fontFamily:
      '"Lucida Handwriting","Brush Script MT","Segoe Script","Snell Roundhand","cursive"',
    fontSize: "2.1rem",
    color: THEME.burntOrange,
    textShadow: "0 2px 6px rgba(217, 130, 43, 0.25)",
    letterSpacing: "0.04em"
  },
  logoSubtitle: {
    fontSize: "0.95rem",
    color: THEME.textMuted,
    fontWeight: 500,
    fontStyle: "italic"
  },
  headerActions: {
    marginTop: "1.4rem",
    display: "flex",
    justifyContent: "center",
    gap: "0.75rem",
    flexWrap: "wrap"
  },
  coverRefreshButton: {
    background: "rgba(255, 185, 140, 0.3)",
    border: "1px solid rgba(255, 255, 255, 0.45)",
    color: THEME.accent,
    padding: "0.7rem 1.5rem",
    borderRadius: "999px",
    fontSize: "0.92rem",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
    boxShadow: "0 4px 12px rgba(60, 47, 47, 0.08)",
    fontFamily: "inherit"
  },
  coverRefreshButtonDisabled: {
    opacity: 0.6,
    cursor: "not-allowed"
  },
  warning: {
    color: THEME.warning
  },
  toast: {
    position: "fixed",
    top: "1.5rem",
    right: "1.4rem",
    left: "50%",
    transform: "translateX(-50%)",
    pointerEvents: "auto",
    zIndex: 9999,
    display: "flex",
    alignItems: "center",
    gap: "0.7rem",
    padding: "1rem 1.5rem",
    borderRadius: "1.5rem",
    border: "1px solid rgba(255, 255, 255, 0.5)",
    boxShadow: "0 12px 32px rgba(60, 47, 47, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.3) inset",
    background: "rgba(255, 232, 214, 0.85)",
    backdropFilter: "blur(30px) saturate(160%)",
    WebkitBackdropFilter: "blur(30px) saturate(160%)",
    color: THEME.textPrimary,
    fontSize: "0.95rem",
    lineHeight: 1.25,
    maxWidth: "min(520px, 90vw)",
    textAlign: "center",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
  },
  toastInfo: {
    borderColor: "rgba(217, 130, 43, 0.45)",
    boxShadow: "0 22px 44px rgba(95, 64, 40, 0.28)"
  },
  toastSuccess: {
    backgroundColor: "rgba(47, 159, 99, 0.52)",
    color: "#0c2f1e",
    borderColor: "rgba(47, 159, 99, 0.9)",
    boxShadow: "0 28px 58px rgba(21, 83, 52, 0.45)"
  },
  toastWarning: {
    backgroundColor: "rgba(229, 182, 89, 0.56)",
    color: "#422f12",
    borderColor: "rgba(229, 182, 89, 0.92)",
    boxShadow: "0 28px 58px rgba(140, 101, 38, 0.44)"
  },
  toastDanger: {
    backgroundColor: "rgba(167, 54, 54, 0.54)",
    color: "#fff4f2",
    borderColor: "rgba(167, 54, 54, 0.92)",
    boxShadow: "0 28px 58px rgba(88, 26, 26, 0.45)"
  },
  toastDismiss: {
    background: "transparent",
    border: "none",
    color: "inherit",
    fontSize: "1.1rem",
    cursor: "pointer",
    lineHeight: 1,
    padding: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  main: {
    display: "flex",
    flexWrap: "wrap",
    gap: "1.6rem",
    alignItems: "stretch",
    justifyContent: "center",
    width: "100%",
    boxSizing: "border-box"
  },
  card: {
    borderRadius: "2rem",
    padding: "2rem",
    background: "linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 232, 214, 0.35) 100%)",
    border: "1px solid rgba(255, 255, 255, 0.5)",
    boxShadow: "0 16px 40px rgba(60, 47, 47, 0.12), 0 0 0 1px rgba(255, 255, 255, 0.4) inset",
    backdropFilter: "blur(30px) saturate(160%)",
    WebkitBackdropFilter: "blur(30px) saturate(160%)",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    position: "relative",
    overflow: "hidden",
    width: "100%",
    maxWidth: "520px",
    flex: "1 1 360px",
    display: "flex",
    flexDirection: "column",
    gap: "1.15rem"
  },
  searchForm: {
    display: "flex",
    gap: "0.65rem",
    marginBottom: "1rem",
    alignItems: "stretch"
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "0.9rem"
  },
  label: {
    display: "flex",
    flexDirection: "column",
    gap: "0.4rem",
    fontSize: "0.95rem",
    color: THEME.textPrimary
  },
  input: {
    borderRadius: "1rem",
    border: "1px solid rgba(255, 255, 255, 0.4)",
    padding: "1rem 1.15rem",
    fontSize: "1.02rem",
    background: "rgba(255, 255, 255, 0.5)",
    color: THEME.textPrimary,
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    boxShadow: "0 4px 12px rgba(60, 47, 47, 0.08), 0 0 0 1px rgba(255, 255, 255, 0.3) inset",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
    width: "100%",
    boxSizing: "border-box",
    outline: "none",
    fontFamily: "inherit"
  },
  textarea: {
    resize: "vertical",
    minHeight: "100px"
  },
  selectContainer: {
    position: "relative",
    display: "flex",
    width: "100%"
  },
  select: {
    appearance: "none",
    WebkitAppearance: "none",
    MozAppearance: "none",
    paddingRight: "3rem",
    background: "rgba(255, 255, 255, 0.5)",
    cursor: "pointer"
  },
  selectArrow: {
    position: "absolute",
    top: "50%",
    right: "1.2rem",
    transform: "translateY(-50%)",
    pointerEvents: "none",
    fontSize: "0.85rem",
    color: THEME.accent
  },
  searchButton: {
    background: "rgba(255, 185, 140, 0.35)",
    color: THEME.accent,
    border: "1px solid rgba(255, 255, 255, 0.45)",
    borderRadius: "1rem",
    padding: "0.85rem 1.2rem",
    cursor: "pointer",
    fontWeight: 600,
    alignSelf: "stretch",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    minWidth: "120px",
    textAlign: "center",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
    boxShadow: "0 4px 12px rgba(60, 47, 47, 0.1)",
    fontFamily: "inherit"
  },
  primaryButton: {
    background: "linear-gradient(135deg, #ffb88c 0%, #e8925b 50%, #d4764d 100%)",
    color: "#2c1e1e",
    border: "1px solid rgba(255, 255, 255, 0.4)",
    borderRadius: "1.1rem",
    padding: "0.95rem 1.6rem",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: "1rem",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    boxShadow: "0 8px 20px rgba(212, 118, 77, 0.35), 0 0 0 1px rgba(255, 255, 255, 0.2) inset",
    alignSelf: "flex-start",
    fontFamily: "inherit"
  },
  secondaryButtonMuted: {
    background: "transparent",
    color: THEME.textMuted,
    border: `1px solid rgba(46, 26, 18, 0.2)`,
    borderRadius: "999px",
    padding: "0.4rem 0.85rem",
    cursor: "pointer",
    transition: "border 0.2s ease, background 0.2s ease"
  },
  coverControls: {
    display: "flex",
    flexDirection: "column",
    gap: "0.9rem"
  },
  toggleRow: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    fontSize: "0.92rem",
    color: THEME.textMuted
  },
  inlineRow: {
    display: "flex",
    gap: "0.9rem",
    flexWrap: "wrap"
  },
  inlineField: {
    flex: "1 1 200px"
  },
  inlineFieldCompact: {
    maxWidth: "320px"
  },
  inlineReview: {
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
    padding: "1.2rem",
    border: "1px solid rgba(255, 255, 255, 0.4)",
    borderRadius: "1.3rem",
    background: "rgba(255, 232, 214, 0.4)",
    backdropFilter: "blur(15px)",
    WebkitBackdropFilter: "blur(15px)",
    boxShadow: "0 4px 12px rgba(60, 47, 47, 0.08)"
  },
  ratingGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
    background: "rgba(255, 255, 255, 0.4)",
    border: "1px solid rgba(255, 255, 255, 0.5)",
    borderRadius: "1.2rem",
    padding: "1rem",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
    boxShadow: "0 4px 12px rgba(60, 47, 47, 0.08)"
  },
  ratingInputs: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "0.5rem",
    width: "100%"
  },
  ratingDisplay: {
    fontSize: "0.95rem",
    color: THEME.accent,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "0.9rem",
    border: "1px solid rgba(255, 255, 255, 0.5)",
    background: "rgba(255, 255, 255, 0.45)",
    padding: "0.6rem 1.2rem",
    minWidth: "120px",
    fontWeight: 600,
    textAlign: "center",
    boxShadow: "0 4px 12px rgba(60, 47, 47, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.3) inset",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
    minHeight: "48px"
  },
  ratingDisplayInput: {
    cursor: "text",
    gap: "0.25rem"
  },
  ratingDisplayInputField: {
    width: "60px",
    fontSize: "1.1rem",
    fontWeight: 600,
    color: THEME.accent,
    background: "transparent",
    border: "none",
    textAlign: "center",
    outline: "none",
    padding: 0,
    margin: 0,
    appearance: "textfield",
    WebkitAppearance: "none",
    MozAppearance: "textfield"
  },
  ratingDisplaySuffix: {
    fontSize: "0.85rem",
    color: THEME.accent,
    opacity: 0.85
  },
  inlineToggle: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    fontSize: "0.9rem",
    color: THEME.textMuted
  },
  coverPreview: {
    display: "flex",
    gap: "1rem",
    alignItems: "center"
  },
  coverImage: {
    width: "96px",
    height: "144px",
    objectFit: "cover",
    borderRadius: "0.75rem",
    border: `1px solid rgba(217, 130, 43, 0.25)`,
    background: "rgba(249, 223, 198, 0.42)"
  },
  coverPreviewMeta: {
    display: "flex",
    flexDirection: "column",
    gap: "0.35rem"
  },
  smallButton: {
    background: "rgba(255, 185, 140, 0.3)",
    border: "1px solid rgba(255, 255, 255, 0.45)",
    borderRadius: "0.9rem",
    padding: "0.5rem 1rem",
    fontSize: "0.82rem",
    cursor: "pointer",
    color: THEME.accent,
    fontWeight: 600,
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
    boxShadow: "0 2px 8px rgba(60, 47, 47, 0.08)",
    fontFamily: "inherit"
  },
  dangerButton: {
    background: "rgba(226, 70, 82, 0.12)",
    border: `1px solid ${THEME.danger}`,
    color: THEME.danger,
    borderRadius: "0.9rem",
    padding: "0.4rem 0.95rem",
    fontSize: "0.82rem",
    cursor: "pointer",
    marginLeft: "0.55rem",
    fontWeight: 600
  },
  helperText: {
    fontSize: "0.9rem",
    color: THEME.textMuted,
    marginBottom: "0.9rem"
  },
  helperTextSmall: {
    fontSize: "0.8rem",
    color: THEME.textMuted,
    marginTop: "-0.25rem"
  },
  discordRow: {
    display: "flex",
    gap: "0.65rem",
    alignItems: "center"
  },
  discordInput: {
    flex: 1,
    minWidth: 0
  },
  discordButton: {
    background: THEME.accentSoft,
    color: THEME.accent,
    border: `1px solid ${THEME.accent}`,
    borderRadius: "0.9rem",
    padding: "0.6rem 0.9rem",
    cursor: "pointer",
    transition: "border 0.2s ease, background 0.2s ease"
  },
  discordSection: {
    marginTop: 0,
    padding: "1.6rem 1.8rem",
    border: "1px solid rgba(255, 255, 255, 0.5)",
    borderRadius: "2rem",
    background: "linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 232, 214, 0.35) 100%)",
    boxShadow: "0 12px 32px rgba(60, 47, 47, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.4) inset",
    backdropFilter: "blur(30px) saturate(160%)",
    WebkitBackdropFilter: "blur(30px) saturate(160%)",
    display: "flex",
    flexDirection: "column",
    gap: "0.85rem",
    maxWidth: "600px",
    marginLeft: "auto",
    marginRight: "auto",
    flex: "1 1 320px",
    position: "relative",
    overflow: "hidden",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
  },
  switchLabel: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    cursor: "pointer",
    userSelect: "none"
  },
  switchInput: {
    display: "none"
  },
  switchTrack: {
    position: "relative",
    width: "44px",
    height: "24px",
    borderRadius: "999px",
    background: "rgba(0,0,0,0.15)",
    transition: "background 0.2s ease"
  },
  switchThumb: {
    position: "absolute",
    top: "3px",
    left: "3px",
    width: "18px",
    height: "18px",
    borderRadius: "50%",
    background: "white",
    boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
    transition: "transform 0.2s ease",
    transform: "translateX(0)"
  },
  switchCopy: {
    fontSize: "0.85rem",
    color: THEME.textMuted
  },
  utilityGrid: {
    display: "flex",
    flexWrap: "wrap",
    gap: "1.4rem",
    marginTop: "2.4rem",
    width: "100%"
  },
  listSection: {
    marginTop: "2.6rem"
  },
  list: {
    listStyle: "none",
    padding: 0,
    display: "flex",
    flexDirection: "column",
    gap: "1.1rem"
  },
  listItem: {
    border: "1px solid rgba(255, 255, 255, 0.45)",
    borderRadius: "1.5rem",
    padding: "1.3rem",
    background: "rgba(255, 255, 255, 0.35)",
    display: "flex",
    gap: "1.1rem",
    alignItems: "flex-start",
    boxShadow: "0 8px 24px rgba(60, 47, 47, 0.12), 0 0 0 1px rgba(255, 255, 255, 0.3) inset",
    backdropFilter: "blur(20px) saturate(150%)",
    WebkitBackdropFilter: "blur(20px) saturate(150%)",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
  },
  meta: {
    fontSize: "0.85rem",
    color: THEME.textMuted
  },
  reviewList: {
    marginTop: "0.5rem",
    paddingLeft: "1rem"
  },
  reviewHeader: {
    display: "flex",
    alignItems: "center",
    gap: "0.4rem",
    flexWrap: "wrap"
  },
  starRow: {
    display: "inline-flex",
    gap: "0.08rem",
    fontSize: "2rem",
    color: THEME.accent,
    userSelect: "none"
  },
  starInputWrapper: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.18rem",
    padding: "0.25rem 0 0.35rem",
    width: "66%",
    maxWidth: "360px",
    minWidth: "200px",
    margin: "-0.25rem auto 0"
  },
  starButton: {
    background: "transparent",
    border: "none",
    cursor: "pointer",
    fontSize: "2.9rem",
    lineHeight: 1,
    padding: "0.22rem 0.14rem",
    flex: "1 1 0%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  starFull: {
    color: "#f4c245",
    filter: "drop-shadow(0 2px 4px rgba(212, 118, 77, 0.4))",
    WebkitTextStroke: "0.5px rgba(212, 118, 77, 0.5)",
    textShadow: "0 0 8px rgba(244, 194, 69, 0.5)"
  },
  starHalf: {
    display: "inline-block",
    backgroundImage: "linear-gradient(90deg, #f4c245 0%, #f4c245 50%, rgba(60, 47, 47, 0.2) 50%)",
    color: "transparent",
    backgroundClip: "text",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    filter: "drop-shadow(0 2px 4px rgba(212, 118, 77, 0.3))",
    WebkitTextStroke: "0.5px rgba(212, 118, 77, 0.4)"
  },
  starEmpty: {
    color: "rgba(60, 47, 47, 0.2)",
    display: "inline-block",
    filter: "drop-shadow(0 1px 2px rgba(60, 47, 47, 0.1))",
    WebkitTextStroke: "0.5px rgba(60, 47, 47, 0.15)"
  },
  reviewScore: {
    fontSize: "0.85rem",
    color: THEME.textPrimary,
    fontWeight: 600
  },
  reviewScoreSmall: {
    fontSize: "0.75rem",
    color: THEME.textMuted
  },
  reviewStatusBadge: {
    fontSize: "0.72rem",
    color: THEME.accent,
    background: "rgba(217, 130, 43, 0.18)",
    borderRadius: "999px",
    padding: "0.18rem 0.55rem",
    fontWeight: 600
  },
  reviewTimestamp: {
    fontSize: "0.7rem",
    color: THEME.textMuted,
    marginLeft: "auto"
  },
  reviewActions: {
    marginTop: "0.4rem"
  },
  badge: {
    display: "inline-block",
    background: THEME.accent,
    color: "#3b2618",
    padding: "0.25rem 0.65rem",
    borderRadius: "999px",
    fontSize: "0.78rem",
    marginBottom: "0.75rem",
    fontWeight: 600
  },
  badgeSecondary: {
    display: "inline-block",
    marginLeft: "0.5rem",
    background: "rgba(229, 182, 89, 0.22)",
    color: "#8f5a1f",
    padding: "0.15rem 0.55rem",
    borderRadius: "999px",
    fontSize: "0.74rem"
  },
  utilitySection: {
    marginTop: 0,
    padding: "1.5rem",
    border: "1px solid rgba(255, 255, 255, 0.5)",
    borderRadius: "2rem",
    background: "linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 232, 214, 0.35) 100%)",
    boxShadow: "0 12px 32px rgba(60, 47, 47, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.4) inset",
    backdropFilter: "blur(30px) saturate(160%)",
    WebkitBackdropFilter: "blur(30px) saturate(160%)",
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
    flex: "1 1 220px",
    maxWidth: "360px",
    position: "relative",
    overflow: "hidden",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
  },
  error: {
    color: THEME.danger,
    fontSize: "0.85rem"
  },
  searchResults: {
    listStyle: "none",
    padding: 0,
    margin: "0 0 1.1rem 0",
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem"
  },
  searchResultItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "0.9rem",
    padding: "0.85rem 1rem",
    border: "1px solid rgba(255, 255, 255, 0.45)",
    borderRadius: "1.2rem",
    background: "rgba(255, 255, 255, 0.4)",
    boxShadow: "0 6px 16px rgba(60, 47, 47, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.3) inset",
    backdropFilter: "blur(15px)",
    WebkitBackdropFilter: "blur(15px)",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
  },
  coverLink: {
    color: THEME.accent,
    fontSize: "0.85rem"
  },
  searchResultContent: {
    display: "flex",
    gap: "0.75rem",
    alignItems: "center"
  },
  searchResultCover: {
    width: "48px",
    height: "72px",
    objectFit: "cover",
    borderRadius: "0.55rem",
    border: `1px solid rgba(217, 130, 43, 0.25)`,
    background: "rgba(249, 223, 198, 0.42)"
  },
  searchResultCoverPlaceholder: {
    width: "48px",
    height: "72px",
    borderRadius: "0.55rem",
    border: `1px dashed rgba(217,130,43,0.45)`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "0.7rem",
    color: THEME.textMuted,
    background: THEME.surfaceAlt
  },
  searchResultActions: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: "0.4rem"
  },
  availability: {
    marginTop: "0.35rem",
    display: "flex",
    gap: "0.35rem",
    flexWrap: "wrap"
  },
  availabilityBadge: {
    display: "inline-flex",
    alignItems: "center",
    padding: "0.2rem 0.5rem",
    borderRadius: "999px",
    fontSize: "0.75rem",
    background: "rgba(242, 193, 153, 0.24)",
    color: THEME.accent,
    fontWeight: 500
  },
  downloadBadge: {
    display: "inline-flex",
    alignItems: "center",
    padding: "0.2rem 0.55rem",
    borderRadius: "999px",
    fontSize: "0.75rem",
    background: "rgba(47, 159, 99, 0.18)",
    color: THEME.success,
    fontWeight: 500,
    marginLeft: "0.35rem"
  },
  availabilityAction: {
    fontSize: "0.75rem",
    color: THEME.accent
  },
  availabilityActionRead: {
    color: THEME.success
  },
  availabilityActionDownload: {
    color: THEME.success
  },
  availabilityActionBorrow: {
    color: THEME.warning
  },
  availabilityActionWaitlist: {
    color: "#cfa0e9"
  },
  availabilityActionsList: {
    display: "flex",
    flexWrap: "wrap",
    gap: "0.35rem",
    marginTop: "0.35rem"
  },
  searchTabs: {
    display: "flex",
    gap: "0.5rem",
    marginBottom: "1rem",
    borderBottom: "1px solid rgba(232, 146, 91, 0.2)",
    paddingBottom: "0.5rem"
  },
  searchTab: {
    background: "transparent",
    border: "none",
    color: THEME.textMuted,
    padding: "0.5rem 1rem",
    borderRadius: "0.5rem",
    fontSize: "0.9rem",
    fontWeight: 500,
    cursor: "pointer",
    transition: "all 0.2s ease",
    fontFamily: "inherit"
  },
  searchTabActive: {
    background: "rgba(217, 130, 43, 0.15)",
    color: THEME.accent,
    fontWeight: 600
  },
  searchTabCount: {
    display: "inline-block",
    marginLeft: "0.4rem",
    background: "rgba(217, 130, 43, 0.2)",
    color: THEME.accent,
    padding: "0.1rem 0.4rem",
    borderRadius: "999px",
    fontSize: "0.7rem",
    fontWeight: 600
  },
  libgenBadge: {
    display: "inline-block",
    background: "rgba(95, 64, 196, 0.15)",
    color: "#5f40c4",
    padding: "0.2rem 0.5rem",
    borderRadius: "999px",
    fontSize: "0.75rem",
    fontWeight: 500
  },
  libgenMirrorLink: {
    fontSize: "0.75rem",
    color: "#5f40c4",
    textDecoration: "none",
    marginLeft: "0.5rem"
  },
  libgenMetadata: {
    display: "flex",
    gap: "0.5rem",
    marginTop: "0.3rem",
    flexWrap: "wrap"
  },
  libgenMetadataItem: {
    fontSize: "0.7rem",
    color: THEME.textMuted,
    background: "rgba(255, 255, 255, 0.3)",
    padding: "0.15rem 0.4rem",
    borderRadius: "0.3rem"
  },
  libgenWidget: {
    background: "rgba(95, 64, 196, 0.08)",
    border: "1px solid rgba(95, 64, 196, 0.2)",
    borderRadius: "1rem",
    padding: "1rem",
    marginTop: "0.75rem"
  },
  libgenWidgetHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "0.75rem"
  },
  libgenWidgetTitle: {
    fontSize: "0.9rem",
    fontWeight: 600,
    color: "#5f40c4",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem"
  },
  mirrorButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0.6rem 0.8rem",
    background: "rgba(255, 255, 255, 0.5)",
    border: "1px solid rgba(95, 64, 196, 0.2)",
    borderRadius: "0.6rem",
    fontSize: "0.8rem",
    color: "#5f40c4",
    textDecoration: "none",
    transition: "all 0.2s ease"
  },
  mirrorButtonPrimary: {
    background: "rgba(95, 64, 196, 0.12)",
    borderColor: "rgba(95, 64, 196, 0.3)"
  },
  findLibgenButton: {
    background: "rgba(95, 64, 196, 0.12)",
    color: "#5f40c4",
    border: "1px solid rgba(95, 64, 196, 0.3)",
    padding: "0.5rem 1rem",
    borderRadius: "0.6rem",
    fontSize: "0.85rem",
    fontWeight: 500,
    cursor: "pointer",
    transition: "all 0.2s ease",
    fontFamily: "inherit"
  },
  findLibgenButtonSearching: {
    opacity: 0.6,
    cursor: "not-allowed"
  },
  analyticsCard: {
    background: "linear-gradient(135deg, rgba(95, 64, 196, 0.08) 0%, rgba(95, 64, 196, 0.12) 100%)",
    border: "1px solid rgba(95, 64, 196, 0.25)",
    borderRadius: "1.5rem",
    padding: "1.5rem",
    marginTop: "1rem"
  },
  analyticsTitle: {
    fontSize: "1.1rem",
    fontWeight: 600,
    color: "#5f40c4",
    marginBottom: "1rem",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem"
  },
  analyticsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "1rem",
    marginBottom: "1rem"
  },
  analyticsStat: {
    background: "rgba(255, 255, 255, 0.5)",
    borderRadius: "0.8rem",
    padding: "1rem",
    textAlign: "center"
  },
  analyticsValue: {
    fontSize: "1.8rem",
    fontWeight: 700,
    color: "#5f40c4",
    marginBottom: "0.25rem"
  },
  analyticsLabel: {
    fontSize: "0.75rem",
    color: THEME.textMuted,
    textTransform: "uppercase",
    letterSpacing: "0.05em"
  },
  formatsList: {
    display: "flex",
    gap: "0.5rem",
    flexWrap: "wrap",
    marginTop: "0.75rem"
  },
  formatBadge: {
    background: "rgba(95, 64, 196, 0.15)",
    color: "#5f40c4",
    padding: "0.4rem 0.8rem",
    borderRadius: "999px",
    fontSize: "0.75rem",
    fontWeight: 600
  },
  bookActions: {
    display: "flex",
    gap: "0.5rem",
    marginTop: "0.6rem",
    flexWrap: "wrap"
  },
  libraryCover: {
    width: "96px",
    height: "144px",
    objectFit: "cover",
    borderRadius: "0.8rem",
    border: `1px solid rgba(217, 130, 43, 0.25)`,
    background: "rgba(249, 223, 198, 0.4)"
  },
  libraryCoverPlaceholder: {
    width: "96px",
    height: "144px",
    borderRadius: "0.8rem",
    border: `1px dashed rgba(217,130,43,0.45)`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "0.8rem",
    color: THEME.textMuted,
    background: THEME.surfaceAlt
  },
  bookContent: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem"
  },
  libraryToolIdeas: {
    display: "flex",
    flexWrap: "wrap",
    gap: "0.6rem",
    marginTop: "0.5rem",
    justifyContent: "center"
  },
  fakeToolButton: {
    background: "rgba(242, 193, 153, 0.18)",
    border: `1px dashed rgba(217, 130, 43, 0.5)`,
    borderRadius: "0.9rem",
    padding: "0.6rem 1.1rem",
    fontSize: "0.82rem",
    color: THEME.accent,
    fontWeight: 600,
    cursor: "not-allowed",
    opacity: 0.8,
    display: "flex",
    flexDirection: "column",
    gap: "0.3rem",
    alignItems: "center",
    textAlign: "center",
    minWidth: "180px"
  },
  fakeToolHelper: {
    fontSize: "0.72rem",
    color: THEME.textMuted,
    fontWeight: 500,
    maxWidth: "160px",
    lineHeight: 1.2
  },
  footer: {
    marginTop: "3rem",
    textAlign: "center",
    fontSize: "0.85rem",
    color: THEME.textMuted
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(60, 47, 47, 0.4)",
    backdropFilter: "blur(8px)",
    WebkitBackdropFilter: "blur(8px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10000,
    padding: "1rem",
    transition: "all 0.3s ease"
  },
  modalContainer: {
    background: "linear-gradient(135deg, rgba(255, 255, 255, 0.5) 0%, rgba(255, 232, 214, 0.45) 100%)",
    borderRadius: "2rem",
    border: "1px solid rgba(255, 255, 255, 0.6)",
    boxShadow: "0 20px 60px rgba(60, 47, 47, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.5) inset",
    backdropFilter: "blur(40px) saturate(180%)",
    WebkitBackdropFilter: "blur(40px) saturate(180%)",
    maxWidth: "600px",
    width: "100%",
    maxHeight: "90vh",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
  },
  modalHeader: {
    padding: "1.5rem 1.5rem 0",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "1rem"
  },
  modalBookTitle: {
    fontSize: "0.9rem",
    fontWeight: "normal",
    color: THEME.textMuted,
    fontStyle: "italic"
  },
  modalCloseButton: {
    background: "transparent",
    border: "none",
    fontSize: "1.5rem",
    cursor: "pointer",
    color: THEME.textMuted,
    padding: "0.25rem",
    lineHeight: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "0.5rem",
    transition: "background 0.2s ease, color 0.2s ease"
  },
  modalBody: {
    padding: "1.5rem",
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
    flex: 1,
    overflow: "auto"
  },
  modalFooter: {
    padding: "0 1.5rem 1.5rem",
    display: "flex",
    gap: "0.75rem",
    justifyContent: "flex-end"
  }
};
