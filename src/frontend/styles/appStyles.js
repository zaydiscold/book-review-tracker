/**
 * Cozy Reading Journal - Application Styles
 * Warm, inviting, and elegant design for book lovers
 */

// Cozy color palette
const COZY = {
  // Backgrounds
  cream50: '#FFFBF5',
  cream100: '#FFF7ED',
  rose50: '#FFF1F2',
  rose100: '#FFE4E6',
  lavender50: '#FAF5FF',

  // Surfaces
  white: '#FFFFFF',
  whiteGlass: 'rgba(255, 255, 255, 0.85)',

  // Text
  sage600: '#495749',
  sage500: '#5A6D5A',
  sage400: '#7F927F',
  sage300: '#A8B5A8',

  // Accents
  rose400: '#FB7185',
  rose500: '#F43F5E',
  rose300: '#FDA4AF',
  lavender400: '#C084FC',
  lavender300: '#D8B4FE',
  peach400: '#FB923C',
  honey400: '#FBBF24',

  // Shadows
  softShadow: '0 2px 15px rgba(0, 0, 0, 0.08)',
  softShadowLg: '0 10px 40px rgba(0, 0, 0, 0.1)',
  softShadowXl: '0 20px 60px rgba(0, 0, 0, 0.12)',
  innerShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.06)',
};

export const styles = {
  wrapper: {
    fontFamily: '"Inter", "Helvetica", system-ui, sans-serif',
    margin: '0 auto',
    padding: '2rem',
    maxWidth: '1400px',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #FFFBF5 0%, rgba(255, 241, 242, 0.3) 50%, rgba(250, 245, 255, 0.2) 100%)',
    color: COZY.sage600
  },

  header: {
    textAlign: 'center',
    marginBottom: '3rem',
    padding: '2.5rem',
    background: COZY.whiteGlass,
    backdropFilter: 'blur(12px)',
    borderRadius: '2rem',
    border: `2px solid ${COZY.white}`,
    boxShadow: COZY.softShadowLg
  },

  logoWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '1.5rem',
    marginBottom: '1rem'
  },

  logoIcon: {
    width: '70px',
    height: '70px',
    borderRadius: '1.5rem',
    background: 'linear-gradient(135deg, #FDA4AF 0%, #FB7185 100%)',
    border: `2px solid ${COZY.white}`,
    boxShadow: COZY.softShadow,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: COZY.white
  },

  logoTitle: {
    fontFamily: '"Playfair Display", "Georgia", serif',
    fontSize: '2.5rem',
    fontWeight: '700',
    color: COZY.sage600,
    letterSpacing: '-0.02em',
    marginBottom: '0.5rem'
  },

  logoSubtitle: {
    fontSize: '1rem',
    color: COZY.sage400,
    fontWeight: '500',
    fontStyle: 'italic'
  },

  headerActions: {
    marginTop: '1.5rem',
    display: 'flex',
    justifyContent: 'center',
    gap: '1rem',
    flexWrap: 'wrap'
  },

  coverRefreshButton: {
    background: COZY.lavender300,
    border: `2px solid ${COZY.lavender400}`,
    color: COZY.sage600,
    padding: '0.75rem 1.75rem',
    borderRadius: '1.5rem',
    fontSize: '0.95rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: COZY.softShadow,
    fontFamily: 'inherit'
  },

  coverRefreshButtonDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed'
  },

  warning: {
    color: COZY.peach400,
    marginTop: '1rem',
    fontWeight: '500'
  },

  toast: {
    position: 'fixed',
    top: '2rem',
    right: '50%',
    transform: 'translateX(50%)',
    pointerEvents: 'auto',
    zIndex: 9999,
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1.25rem 2rem',
    borderRadius: '1.5rem',
    border: `2px solid ${COZY.white}`,
    boxShadow: COZY.softShadowXl,
    background: COZY.whiteGlass,
    backdropFilter: 'blur(16px)',
    color: COZY.sage600,
    fontSize: '1rem',
    maxWidth: '500px',
    fontWeight: '500'
  },

  toastInfo: {
    borderLeftWidth: '4px',
    borderLeftColor: COZY.lavender400
  },

  toastSuccess: {
    borderLeftWidth: '4px',
    borderLeftColor: '#5A6D5A' // sage for success
  },

  toastWarning: {
    borderLeftWidth: '4px',
    borderLeftColor: COZY.honey400
  },

  toastDanger: {
    borderLeftWidth: '4px',
    borderLeftColor: COZY.rose500
  },

  toastDismiss: {
    background: 'transparent',
    border: 'none',
    color: COZY.sage400,
    fontSize: '1.5rem',
    cursor: 'pointer',
    padding: 0,
    lineHeight: 1
  },

  main: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '2rem',
    width: '100%'
  },

  card: {
    borderRadius: '2rem',
    padding: '2.5rem',
    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 251, 245, 0.9) 100%)',
    backdropFilter: 'blur(12px)',
    border: `2px solid rgba(255, 255, 255, 0.8)`,
    boxShadow: COZY.softShadow,
    width: '100%',
    maxWidth: '600px',
    flex: '1 1 400px',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
    transition: 'all 0.3s ease'
  },

  searchForm: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '1.5rem'
  },

  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem'
  },

  label: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    fontSize: '0.95rem',
    color: COZY.sage600,
    fontWeight: '600'
  },

  input: {
    borderRadius: '1.25rem',
    border: `2px solid rgba(168, 181, 168, 0.3)`,
    padding: '1rem 1.25rem',
    fontSize: '1rem',
    background: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(8px)',
    color: COZY.sage600,
    transition: 'all 0.2s ease',
    boxShadow: COZY.innerShadow,
    width: '100%',
    boxSizing: 'border-box',
    outline: 'none',
    fontFamily: 'inherit'
  },

  textarea: {
    resize: 'vertical',
    minHeight: '120px',
    fontFamily: 'inherit'
  },

  selectContainer: {
    position: 'relative',
    display: 'flex',
    width: '100%'
  },

  select: {
    appearance: 'none',
    paddingRight: '3rem',
    background: 'rgba(255, 255, 255, 0.8)',
    cursor: 'pointer'
  },

  selectArrow: {
    position: 'absolute',
    top: '50%',
    right: '1.25rem',
    transform: 'translateY(-50%)',
    pointerEvents: 'none',
    color: COZY.rose400
  },

  searchButton: {
    background: COZY.rose400,
    color: COZY.white,
    border: 'none',
    borderRadius: '1.25rem',
    padding: '1rem 2rem',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '1rem',
    transition: 'all 0.2s ease',
    boxShadow: COZY.softShadow,
    fontFamily: 'inherit'
  },

  primaryButton: {
    background: COZY.rose400,
    color: COZY.white,
    border: 'none',
    borderRadius: '1.5rem',
    padding: '1rem 2rem',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '1.05rem',
    transition: 'all 0.2s ease',
    boxShadow: COZY.softShadow,
    fontFamily: 'inherit'
  },

  secondaryButtonMuted: {
    background: 'transparent',
    color: COZY.sage400,
    border: `2px solid ${COZY.sage200}`,
    borderRadius: '1.25rem',
    padding: '0.65rem 1.5rem',
    cursor: 'pointer',
    fontSize: '0.95rem',
    fontWeight: '500',
    transition: 'all 0.2s ease'
  },

  coverControls: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem'
  },

  toggleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    fontSize: '0.95rem',
    color: COZY.sage500
  },

  inlineRow: {
    display: 'flex',
    gap: '1.25rem',
    flexWrap: 'wrap'
  },

  inlineField: {
    flex: '1 1 200px'
  },

  inlineFieldCompact: {
    maxWidth: '320px'
  },

  inlineReview: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
    padding: '1.75rem',
    border: `2px solid ${COZY.lavender300}`,
    borderRadius: '1.5rem',
    background: 'rgba(250, 245, 255, 0.3)',
    backdropFilter: 'blur(8px)'
  },

  ratingGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    background: 'rgba(255, 255, 255, 0.8)',
    border: `2px solid ${COZY.cream100}`,
    borderRadius: '1.5rem',
    padding: '1.5rem'
  },

  ratingInputs: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.75rem',
    width: '100%'
  },

  ratingDisplay: {
    fontSize: '1.25rem',
    color: COZY.honey400,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '1.25rem',
    border: `2px solid ${COZY.cream100}`,
    background: COZY.cream50,
    padding: '1rem 1.75rem',
    fontWeight: '700',
    fontFamily: '"Playfair Display", "Georgia", serif'
  },

  ratingDisplayInput: {
    cursor: 'text',
    gap: '0.35rem'
  },

  ratingDisplayInputField: {
    width: '70px',
    fontSize: '1.35rem',
    fontWeight: '700',
    color: COZY.honey400,
    background: 'transparent',
    border: 'none',
    textAlign: 'center',
    outline: 'none',
    fontFamily: '"Playfair Display", "Georgia", serif'
  },

  ratingDisplaySuffix: {
    fontSize: '1rem',
    color: COZY.sage400
  },

  inlineToggle: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    fontSize: '0.95rem',
    color: COZY.sage500
  },

  coverPreview: {
    display: 'flex',
    gap: '1.25rem',
    alignItems: 'center'
  },

  coverImage: {
    width: '110px',
    height: '165px',
    objectFit: 'cover',
    borderRadius: '1rem',
    border: `2px solid ${COZY.white}`,
    boxShadow: COZY.softShadow
  },

  coverPreviewMeta: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem'
  },

  smallButton: {
    background: COZY.lavender100,
    border: `1px solid ${COZY.lavender200}`,
    borderRadius: '1rem',
    padding: '0.65rem 1.25rem',
    fontSize: '0.9rem',
    cursor: 'pointer',
    color: COZY.lavender600,
    fontWeight: '600',
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 8px rgba(192, 132, 252, 0.15)',
    fontFamily: 'inherit'
  },

  dangerButton: {
    background: COZY.rose100,
    border: `1px solid ${COZY.rose300}`,
    color: COZY.rose600,
    borderRadius: '1rem',
    padding: '0.5rem 1.25rem',
    fontSize: '0.9rem',
    cursor: 'pointer',
    fontWeight: '600',
    transition: 'all 0.2s ease'
  },

  helperText: {
    fontSize: '0.9rem',
    color: COZY.sage400,
    lineHeight: 1.5
  },

  helperTextSmall: {
    fontSize: '0.85rem',
    color: COZY.sage400,
    marginTop: '-0.5rem'
  },

  discordRow: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'center'
  },

  discordInput: {
    flex: 1,
    minWidth: 0
  },

  discordButton: {
    background: COZY.lavender400,
    color: COZY.white,
    border: 'none',
    borderRadius: '1.25rem',
    padding: '0.85rem 1.5rem',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '0.95rem',
    transition: 'all 0.2s ease'
  },

  discordSection: {
    padding: '2.5rem',
    border: `2px solid ${COZY.lavender200}`,
    borderRadius: '2rem',
    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(250, 245, 255, 0.7) 100%)',
    backdropFilter: 'blur(12px)',
    boxShadow: COZY.softShadow,
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
    maxWidth: '700px',
    flex: '1 1 400px'
  },

  switchLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    cursor: 'pointer',
    userSelect: 'none'
  },

  switchInput: {
    display: 'none'
  },

  switchTrack: {
    position: 'relative',
    width: '52px',
    height: '28px',
    borderRadius: '14px',
    background: COZY.sage200,
    transition: 'background 0.2s ease'
  },

  switchThumb: {
    position: 'absolute',
    top: '3px',
    left: '3px',
    width: '22px',
    height: '22px',
    borderRadius: '50%',
    background: COZY.white,
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
    transition: 'transform 0.2s ease'
  },

  switchCopy: {
    fontSize: '0.95rem',
    color: COZY.sage500
  },

  utilityGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '2rem',
    marginTop: '3rem',
    width: '100%'
  },

  listSection: {
    marginTop: '3rem'
  },

  list: {
    listStyle: 'none',
    padding: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem'
  },

  listItem: {
    border: `2px solid rgba(255, 255, 255, 0.8)`,
    borderRadius: '2rem',
    padding: '2rem',
    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 251, 245, 0.9) 50%, rgba(255, 241, 242, 0.8) 100%)',
    backdropFilter: 'blur(12px)',
    display: 'flex',
    gap: '1.5rem',
    alignItems: 'flex-start',
    boxShadow: COZY.softShadow,
    transition: 'all 0.3s ease'
  },

  meta: {
    fontSize: '0.9rem',
    color: COZY.sage400
  },

  reviewList: {
    marginTop: '0.75rem',
    paddingLeft: '1.25rem'
  },

  reviewHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    flexWrap: 'wrap'
  },

  starRow: {
    display: 'inline-flex',
    gap: '0.15rem',
    fontSize: '1.5rem',
    color: COZY.honey400,
    textShadow: '0 1px 2px rgba(245, 158, 11, 0.3)'
  },

  starInputWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.35rem',
    padding: '0.75rem',
    width: '100%',
    maxWidth: '420px',
    margin: '0 auto'
  },

  starButton: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontSize: '2.5rem',
    lineHeight: 1,
    padding: '0.35rem',
    flex: '1 1 0%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: COZY.honey400,
    transition: 'transform 0.1s ease'
  },

  starFull: {
    color: COZY.honey400,
    textShadow: '0 1px 3px rgba(245, 158, 11, 0.4)'
  },

  starHalf: {
    color: COZY.honey400,
    opacity: 0.6
  },

  starEmpty: {
    color: COZY.sage200
  },

  reviewScore: {
    fontSize: '1rem',
    color: COZY.honey400,
    fontWeight: '700',
    fontFamily: '"Playfair Display", "Georgia", serif'
  },

  reviewScoreSmall: {
    fontSize: '0.85rem',
    color: COZY.sage400
  },

  reviewStatusBadge: {
    fontSize: '0.8rem',
    color: COZY.rose500,
    background: COZY.rose100,
    borderRadius: '999px',
    padding: '0.35rem 0.85rem',
    fontWeight: '600'
  },

  reviewTimestamp: {
    fontSize: '0.75rem',
    color: COZY.sage400,
    marginLeft: 'auto'
  },

  reviewActions: {
    marginTop: '0.75rem'
  },

  badge: {
    display: 'inline-block',
    background: COZY.rose400,
    color: COZY.white,
    padding: '0.35rem 0.85rem',
    borderRadius: '999px',
    fontSize: '0.85rem',
    fontWeight: '600'
  },

  badgeSecondary: {
    display: 'inline-block',
    marginLeft: '0.5rem',
    background: COZY.lavender100,
    color: COZY.lavender600,
    padding: '0.25rem 0.75rem',
    borderRadius: '999px',
    fontSize: '0.85rem',
    fontWeight: '500'
  },

  utilitySection: {
    padding: '2.5rem',
    border: `2px solid ${COZY.peach200}`,
    borderRadius: '2rem',
    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 247, 237, 0.8) 100%)',
    backdropFilter: 'blur(12px)',
    boxShadow: COZY.softShadow,
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
    flex: '1 1 280px',
    maxWidth: '420px'
  },

  error: {
    color: COZY.rose500,
    fontSize: '0.9rem',
    fontWeight: '500'
  },

  searchResults: {
    listStyle: 'none',
    padding: 0,
    margin: '0 0 1.5rem 0',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },

  searchResultItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '1.25rem',
    padding: '1.25rem 1.5rem',
    border: `2px solid ${COZY.cream100}`,
    borderRadius: '1.5rem',
    background: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(8px)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.06)',
    transition: 'all 0.2s ease'
  },

  coverLink: {
    color: COZY.rose400,
    fontSize: '0.9rem',
    fontWeight: '500',
    textDecoration: 'none'
  },

  searchResultContent: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'center'
  },

  searchResultCover: {
    width: '55px',
    height: '82px',
    objectFit: 'cover',
    borderRadius: '0.75rem',
    border: `2px solid ${COZY.white}`,
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
  },

  searchResultCoverPlaceholder: {
    width: '55px',
    height: '82px',
    borderRadius: '0.75rem',
    border: `2px dashed ${COZY.sage300}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.75rem',
    color: COZY.sage400,
    background: COZY.cream50
  },

  searchResultActions: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '0.65rem'
  },

  availability: {
    marginTop: '0.65rem',
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap'
  },

  availabilityBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.3rem 0.75rem',
    borderRadius: '999px',
    fontSize: '0.8rem',
    background: COZY.peach100,
    color: COZY.peach500,
    fontWeight: '600'
  },

  downloadBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.3rem 0.75rem',
    borderRadius: '999px',
    fontSize: '0.8rem',
    background: COZY.sage100,
    color: COZY.sage600,
    fontWeight: '600',
    marginLeft: '0.5rem'
  },

  libgenBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.3rem 0.75rem',
    borderRadius: '999px',
    fontSize: '0.8rem',
    background: COZY.lavender100,
    color: COZY.lavender600,
    fontWeight: '600'
  },

  libgenMetadata: {
    marginTop: '0.65rem',
    display: 'flex',
    gap: '0.65rem',
    flexWrap: 'wrap'
  },

  libgenMetadataItem: {
    fontSize: '0.85rem',
    color: COZY.sage400
  },

  availabilityAction: {
    fontSize: '0.8rem',
    color: COZY.rose400,
    fontWeight: '500'
  },

  availabilityActionRead: {
    color: COZY.sage500
  },

  availabilityActionDownload: {
    color: COZY.sage500
  },

  availabilityActionBorrow: {
    color: COZY.honey500
  },

  availabilityActionWaitlist: {
    color: COZY.lavender400
  },

  availabilityActionsList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
    marginTop: '0.65rem'
  },

  searchTabs: {
    display: 'flex',
    gap: '0.75rem',
    marginBottom: '1.5rem',
    borderBottom: `2px solid ${COZY.cream100}`,
    paddingBottom: '0.75rem'
  },

  searchTab: {
    background: 'transparent',
    border: 'none',
    color: COZY.sage400,
    padding: '0.65rem 1.5rem',
    borderRadius: '1rem',
    fontSize: '0.95rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  },

  searchTabActive: {
    background: COZY.rose400,
    color: COZY.white,
    boxShadow: '0 2px 8px rgba(251, 113, 133, 0.3)'
  },

  searchTabCount: {
    marginLeft: '0.5rem',
    padding: '0.15rem 0.65rem',
    borderRadius: '999px',
    background: 'rgba(255, 255, 255, 0.3)',
    fontSize: '0.85rem'
  },

  // Modal styles
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(73, 87, 73, 0.4)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10000
  },

  modalContent: {
    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(255, 251, 245, 0.95) 100%)',
    backdropFilter: 'blur(16px)',
    border: `2px solid ${COZY.white}`,
    borderRadius: '2rem',
    padding: '3rem',
    maxWidth: '650px',
    width: '90%',
    maxHeight: '90vh',
    overflow: 'auto',
    boxShadow: COZY.softShadowXl,
    color: COZY.sage600
  },

  modalHeader: {
    fontSize: '2rem',
    fontWeight: '700',
    marginBottom: '2rem',
    color: COZY.sage600,
    fontFamily: '"Playfair Display", "Georgia", serif'
  },

  modalActions: {
    display: 'flex',
    gap: '1.25rem',
    marginTop: '2rem',
    justifyContent: 'flex-end'
  }
};
