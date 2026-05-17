import { getEmployeeDisplay } from './org'

export function auditMetaForEmployee(email) {
  const profile = getEmployeeDisplay(email)
  return {
    department: profile.department || '',
    goalTitle: 'FY26 goal sheet',
  }
}
