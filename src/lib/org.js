import { PRIYA_EMAIL, AMIT_EMAIL, NEHA_EMAIL } from './employeeSeed'

export const MANAGER_EMAIL = 'raj@goalflow.com'
export { NEHA_EMAIL }

/** Direct reports by manager email */
export const TEAM_BY_MANAGER = {
  [MANAGER_EMAIL]: [
    {
      email: PRIYA_EMAIL,
      name: 'Priya Sharma',
      department: 'Sales — North',
      title: 'Regional Sales Lead',
      reportingLine: 'Reports to Raj Mehta (L1)',
    },
    {
      email: NEHA_EMAIL,
      name: 'Neha Kapoor',
      department: 'Marketing',
      title: 'Brand Manager',
      reportingLine: 'Reports to Raj Mehta (L1)',
    },
    {
      email: AMIT_EMAIL,
      name: 'Amit Verma',
      department: 'Sales — Enterprise',
      title: 'Account Executive',
      reportingLine: 'Reports to Raj Mehta (L1)',
    },
  ],
}

export function getTeamForManager(managerEmail) {
  return TEAM_BY_MANAGER[managerEmail] || []
}

export function getEmployeeDisplay(email) {
  for (const team of Object.values(TEAM_BY_MANAGER)) {
    const found = team.find((m) => m.email === email)
    if (found) return found
  }
  return {
    email,
    name: email.split('@')[0],
    department: '',
    title: '',
    reportingLine: '',
  }
}

export function decodeEmployeeParam(param) {
  try {
    return decodeURIComponent(param)
  } catch {
    return param
  }
}
