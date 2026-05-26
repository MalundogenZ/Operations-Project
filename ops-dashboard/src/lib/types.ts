export interface DailyTask {
  id: number
  title: string
  completed: number
  created_at: string
}

export interface Goal {
  id: number
  name: string
  status: 'Not started' | 'In progress' | 'Done' | 'Overachieved'
  task_types: string // JSON array string
  due_date: string | null
  description: string | null
  month: string
}

export interface AreaTask {
  id: number
  area: 'university' | 'fintech' | 'investment' | 'personal'
  name: string
  status: 'Not started' | 'In progress' | 'Done'
}

export interface CalendarEntry {
  id: number
  name: string
  date: string
  tags: string // JSON array string
}

export interface TrackerEntry {
  id: number
  date: string
  mental: number
  spiritual: number
  physical: number
  accountability: number
}

export type GoalStatus = Goal['status']
export type AreaTaskStatus = AreaTask['status']
export type Area = AreaTask['area']
