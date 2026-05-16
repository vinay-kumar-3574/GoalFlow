export const SHEET_STATUS = {
  draft: 'draft',
  submitted: 'submitted',
  returned: 'returned',
  locked: 'locked',
}

export const SHEET_STATUS_LABELS = {
  draft: 'Draft',
  submitted: 'Submitted — awaiting manager',
  returned: 'Returned for rework',
  locked: 'Approved & locked',
}

export const UOM_TYPES = {
  numeric: 'numeric',
  percent: 'percent',
  timeline: 'timeline',
  zero: 'zero',
}

export const UOM_LABELS = {
  [UOM_TYPES.numeric]: 'Numeric',
  [UOM_TYPES.percent]: 'Percentage (%)',
  [UOM_TYPES.timeline]: 'Timeline (date)',
  [UOM_TYPES.zero]: 'Zero-based',
}

export const UOM_DIRECTIONS = {
  min: 'min',
  max: 'max',
}

export const CHECKIN_STATUS = {
  notStarted: 'not_started',
  onTrack: 'on_track',
  completed: 'completed',
}

export const CHECKIN_STATUS_LABELS = {
  [CHECKIN_STATUS.notStarted]: 'Not Started',
  [CHECKIN_STATUS.onTrack]: 'On Track',
  [CHECKIN_STATUS.completed]: 'Completed',
}

export const PERIODS = {
  q1: 'q1',
  q2: 'q2',
  q3: 'q3',
  q4: 'q4',
}

export const PERIOD_LABELS = {
  [PERIODS.q1]: 'Q1 Check-in (July)',
  [PERIODS.q2]: 'Q2 Check-in (October)',
  [PERIODS.q3]: 'Q3 Check-in (January)',
  [PERIODS.q4]: 'Q4 / Annual (Mar–Apr)',
}

export const THRUST_AREAS = [
  'Revenue & Growth',
  'Customer Experience',
  'Operational Excellence',
  'People & Culture',
  'Innovation & Quality',
]

export const MAX_GOALS = 8
export const MIN_WEIGHT_PER_GOAL = 10
export const TARGET_WEIGHT_TOTAL = 100
