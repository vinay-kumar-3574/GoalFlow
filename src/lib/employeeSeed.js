import { CHECKIN_STATUS, SHEET_STATUS, UOM_DIRECTIONS, UOM_TYPES } from '../constants/goals'
import { createEmptyGoal, createGoalId } from './goalStorage'

export const SEED_VERSION = 4

const PRIYA_EMAIL = 'priya@goalflow.com'
const AMIT_EMAIL = 'amit@goalflow.com'

export function buildPriyaLockedSeed() {
  const goals = [
    createEmptyGoal({
      id: 'priya_goal_1',
      thrustArea: 'Revenue & Growth',
      title: 'Regional revenue growth',
      description: 'Achieve planned revenue target for North region FY26.',
      uomType: UOM_TYPES.numeric,
      uomDirection: UOM_DIRECTIONS.min,
      target: '100',
      weightage: 30,
    }),
    createEmptyGoal({
      id: 'priya_goal_2',
      thrustArea: 'Operational Excellence',
      title: 'Reduce process TAT',
      description: 'Lower average turnaround time for core operational requests.',
      uomType: UOM_TYPES.numeric,
      uomDirection: UOM_DIRECTIONS.max,
      target: '48',
      weightage: 25,
    }),
    createEmptyGoal({
      id: 'priya_goal_3',
      thrustArea: 'Innovation & Quality',
      title: 'Product launch milestone',
      description: 'Complete Phase 2 launch by committed date.',
      uomType: UOM_TYPES.timeline,
      uomDirection: null,
      target: '2026-09-30',
      deadline: '2026-09-30',
      weightage: 20,
    }),
    createEmptyGoal({
      id: 'priya_goal_4',
      thrustArea: 'People & Culture',
      title: 'Zero safety incidents',
      description: 'Maintain zero recordable safety incidents for the period.',
      uomType: UOM_TYPES.zero,
      uomDirection: null,
      target: '0',
      weightage: 15,
    }),
    createEmptyGoal({
      id: 'priya_goal_5',
      thrustArea: 'Customer Experience',
      title: 'Customer NPS improvement',
      description: 'Improve net promoter score vs prior year baseline.',
      uomType: UOM_TYPES.numeric,
      uomDirection: UOM_DIRECTIONS.min,
      target: '75',
      weightage: 10,
    }),
  ]

  const checkIns = {
    q1: {
      priya_goal_1: {
        actual: '78',
        status: CHECKIN_STATUS.onTrack,
        completionDate: '',
        updatedAt: new Date().toISOString(),
      },
      priya_goal_2: {
        actual: '42',
        status: CHECKIN_STATUS.onTrack,
        completionDate: '',
        updatedAt: new Date().toISOString(),
      },
      priya_goal_3: {
        actual: '2026-08-15',
        status: CHECKIN_STATUS.onTrack,
        completionDate: '2026-08-15',
        updatedAt: new Date().toISOString(),
      },
      priya_goal_4: {
        actual: '0',
        status: CHECKIN_STATUS.completed,
        completionDate: '',
        updatedAt: new Date().toISOString(),
      },
      priya_goal_5: {
        actual: '72',
        status: CHECKIN_STATUS.onTrack,
        completionDate: '',
        updatedAt: new Date().toISOString(),
      },
    },
    q2: {},
    q3: {},
    q4: {},
  }

  return {
    sheet: {
      status: SHEET_STATUS.locked,
      submittedAt: '2026-05-12T10:00:00.000Z',
      approvedAt: '2026-05-18T14:00:00.000Z',
      returnReason: null,
      goals,
    },
    checkIns,
  }
}

/** Draft employee for testing Save as Draft / Submit / Add goal flows */
export function buildAmitDraftSeed() {
  return {
    sheet: {
      status: SHEET_STATUS.draft,
      submittedAt: null,
      approvedAt: null,
      returnReason: null,
      goals: [
        createEmptyGoal({
          id: 'amit_goal_1',
          thrustArea: 'Revenue & Growth',
          title: 'Enterprise pipeline',
          description: 'Build qualified enterprise pipeline for H2.',
          uomType: UOM_TYPES.numeric,
          uomDirection: UOM_DIRECTIONS.min,
          target: '50',
          weightage: 40,
        }),
        createEmptyGoal({
          id: 'amit_goal_2',
          thrustArea: 'Customer Experience',
          title: 'CSAT score',
          description: 'Improve customer satisfaction survey results.',
          uomType: UOM_TYPES.numeric,
          uomDirection: UOM_DIRECTIONS.min,
          target: '85',
          weightage: 35,
        }),
      ],
    },
    checkIns: { q1: {}, q2: {}, q3: {}, q4: {} },
  }
}

/** Submitted sheet for manager approval queue demo */
export function buildNehaSubmittedSeed() {
  return {
    sheet: {
      status: SHEET_STATUS.submitted,
      submittedAt: new Date().toISOString(),
      approvedAt: null,
      returnReason: null,
      goals: [
        createEmptyGoal({
          id: 'neha_goal_1',
          thrustArea: 'Revenue & Growth',
          title: 'Digital campaign ROI',
          description: 'Achieve target return on ad spend for H1 campaigns.',
          uomType: UOM_TYPES.numeric,
          uomDirection: UOM_DIRECTIONS.min,
          target: '4',
          weightage: 35,
        }),
        createEmptyGoal({
          id: 'neha_goal_2',
          thrustArea: 'Customer Experience',
          title: 'Brand awareness index',
          description: 'Lift aided brand awareness vs baseline.',
          uomType: UOM_TYPES.numeric,
          uomDirection: UOM_DIRECTIONS.min,
          target: '62',
          weightage: 30,
        }),
        createEmptyGoal({
          id: 'neha_goal_3',
          thrustArea: 'Innovation & Quality',
          title: 'Campaign launch date',
          description: 'Launch summer campaign on schedule.',
          uomType: UOM_TYPES.timeline,
          uomDirection: null,
          target: '2026-06-15',
          deadline: '2026-06-15',
          weightage: 20,
        }),
        createEmptyGoal({
          id: 'neha_goal_4',
          thrustArea: 'People & Culture',
          title: 'Compliance incidents',
          description: 'Zero marketing compliance violations.',
          uomType: UOM_TYPES.zero,
          uomDirection: null,
          target: '0',
          weightage: 15,
        }),
      ],
    },
    checkIns: { q1: {}, q2: {}, q3: {}, q4: {} },
  }
}

export function buildPriyaDraftSeed() {
  const base = buildPriyaLockedSeed()
  return {
    ...base,
    sheet: {
      ...base.sheet,
      status: SHEET_STATUS.draft,
      submittedAt: null,
      approvedAt: null,
      returnReason: null,
    },
    checkIns: { q1: {}, q2: {}, q3: {}, q4: {} },
  }
}

export const NEHA_EMAIL = 'neha@goalflow.com'

export function getSeedForEmail(email) {
  if (email === PRIYA_EMAIL) return buildPriyaLockedSeed()
  if (email === AMIT_EMAIL) return buildAmitDraftSeed()
  if (email === NEHA_EMAIL) return buildNehaSubmittedSeed()
  return null
}

export { PRIYA_EMAIL, AMIT_EMAIL }
