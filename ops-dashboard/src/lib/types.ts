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
  mental_note: string
  spiritual_note: string
  physical_note: string
  accountability_note: string
}

export interface WeeklyReview {
  id: number
  week_start: string
  went_well: string
  improve: string
  next_focus: string
}

export interface QuarterlyPlan {
  id: number
  year: number
  quarter: number
  theme: string
  notes: string
}

export interface QuarterlyItem {
  id: number
  plan_id: number
  title: string
  completed: number
}

export interface DayResult {
  date: string
  result: 'W' | 'L' | null
}

export interface PathData {
  key: string
  value: string
}

export type GoalStatus = Goal['status']
export type AreaTaskStatus = AreaTask['status']
export type Area = AreaTask['area']
