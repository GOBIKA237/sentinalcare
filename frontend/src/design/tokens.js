// SentinelCare design tokens
// Direction: calm, human, "instrument panel" rather than clinical/alarm.
// A warm sage-and-slate palette with muted (not siren) risk colors, a
// human display serif for headers, and a mono face for numeric readouts.

export const color = {
  // Base surfaces
  bg: '#F2F5F1',          // pale sage-grey page background
  bgRaised: '#FFFFFF',    // card surface
  bgSunken: '#E8ECE7',    // wells, inputs, dividers
  ink: '#2A3B36',         // primary text — deep forest-slate, not black
  inkMuted: '#5C6B64',    // secondary text
  inkFaint: '#8A968F',    // tertiary / placeholder text
  border: '#DCE3DD',

  // Brand / primary
  primary: '#5B7A6D',       // sage — used for primary actions, focus
  primaryHover: '#4A6759',
  primarySoft: '#E3EBE6',

  // Risk bands (muted, not traffic-light red/yellow/green)
  riskLow: '#6B9080',
  riskLowSoft: '#E4EEE9',
  riskModerate: '#C99A4A',
  riskModerateSoft: '#F6ECDA',
  riskHigh: '#B5563D',
  riskHighSoft: '#F5E4DE',

  // Signal types — deliberately distinct hue family from risk bands
  // so "why" (signal) is never visually confused with "how bad" (risk).
  signalOrganizational: '#7B8CA6', // dusty blue — workload/ops
  signalOrganizationalSoft: '#E7EAF0',
  signalSurvey: '#8B6F8E',         // muted plum — self-reported
  signalSurveySoft: '#EFE8EF',
  signalBehavioral: '#4F8A8B',     // teal — reaction-time / game signals
  signalBehavioralSoft: '#E2EDED',
  signalChat: '#C9A24A',           // warm gold — chat-derived
  signalChatSoft: '#F6EEDC',
};

export const signalMeta = {
  organizational: {
    label: 'Organizational',
    short: 'Org',
    color: color.signalOrganizational,
    soft: color.signalOrganizationalSoft,
    description: 'Workload, scheduling, or operational tempo data.',
  },
  survey: {
    label: 'Survey',
    short: 'Survey',
    color: color.signalSurvey,
    soft: color.signalSurveySoft,
    description: 'Self-reported check-in or survey responses.',
  },
  behavioral: {
    label: 'Behavioral',
    short: 'Behavioral',
    color: color.signalBehavioral,
    soft: color.signalBehavioralSoft,
    description: 'Patterns from behavioral tasks (e.g. reaction time).',
  },
  chat: {
    label: 'Chat',
    short: 'Chat',
    color: color.signalChat,
    soft: color.signalChatSoft,
    description: 'Patterns from chat-based check-ins, not message content.',
  },
};

export const riskMeta = {
  low: { label: 'Low', color: color.riskLow, soft: color.riskLowSoft },
  moderate: { label: 'Moderate', color: color.riskModerate, soft: color.riskModerateSoft },
  high: { label: 'High', color: color.riskHigh, soft: color.riskHighSoft },
};

export const font = {
  display: `'Fraunces', 'Iowan Old Style', Georgia, serif`, // warm, human — headers only
  body: `'Inter', 'Helvetica Neue', Arial, sans-serif`,      // reading text
  mono: `'IBM Plex Mono', 'SF Mono', Menlo, monospace`,      // counts, timestamps, IDs
};

export const radius = {
  sm: '8px',
  md: '14px',
  lg: '22px',
  pill: '999px',
};

export const shadow = {
  card: '0 1px 2px rgba(42, 59, 54, 0.04), 0 4px 16px rgba(42, 59, 54, 0.06)',
  raised: '0 2px 4px rgba(42, 59, 54, 0.06), 0 8px 24px rgba(42, 59, 54, 0.10)',
};

// Minimum number of distinct personnel a cohort must contain before any
// per-band breakdown is rendered. Below this, the trend view suppresses
// the breakdown for that week rather than showing a value that could be
// used to infer an individual's status in a small unit.
export const MIN_COHORT_SIZE = 5;
