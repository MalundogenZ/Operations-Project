import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'
import type {
  DailyTask, Goal, AreaTask, CalendarEntry, TrackerEntry,
  WeeklyReview, QuarterlyPlan, QuarterlyItem, DayResult, PathData
} from './types'

const DB_DIR = path.join(process.cwd(), 'data')
const DB_PATH = path.join(DB_DIR, 'operations.db')

let _db: Database.Database | null = null

function getDb(): Database.Database {
  if (_db) return _db
  if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true })
  _db = new Database(DB_PATH)
  _db.pragma('journal_mode = WAL')
  initSchema(_db)
  return _db
}

function initSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS daily_tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      completed INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (date('now'))
    );

    CREATE TABLE IF NOT EXISTS goals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      status TEXT DEFAULT 'Not started',
      task_types TEXT DEFAULT '[]',
      due_date TEXT,
      description TEXT,
      month TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS area_tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      area TEXT NOT NULL,
      name TEXT NOT NULL,
      status TEXT DEFAULT 'Not started'
    );

    CREATE TABLE IF NOT EXISTS calendar_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      date TEXT NOT NULL,
      tags TEXT DEFAULT '[]'
    );

    CREATE TABLE IF NOT EXISTS tracker (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL UNIQUE,
      mental INTEGER DEFAULT 0,
      spiritual INTEGER DEFAULT 0,
      physical INTEGER DEFAULT 0,
      accountability INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS weekly_reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      week_start TEXT NOT NULL UNIQUE,
      went_well TEXT DEFAULT '',
      improve TEXT DEFAULT '',
      next_focus TEXT DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS quarterly_plans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      year INTEGER NOT NULL,
      quarter INTEGER NOT NULL,
      theme TEXT DEFAULT '',
      notes TEXT DEFAULT '',
      UNIQUE(year, quarter)
    );

    CREATE TABLE IF NOT EXISTS quarterly_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      plan_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      completed INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS path_data (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS seeded (
      id INTEGER PRIMARY KEY
    );
  `)

  // Migrate tracker table to add note columns if they don't exist
  const trackerCols = (db.prepare("PRAGMA table_info(tracker)").all() as { name: string }[]).map(c => c.name)
  if (!trackerCols.includes('mental_note')) db.exec("ALTER TABLE tracker ADD COLUMN mental_note TEXT DEFAULT ''")
  if (!trackerCols.includes('spiritual_note')) db.exec("ALTER TABLE tracker ADD COLUMN spiritual_note TEXT DEFAULT ''")
  if (!trackerCols.includes('physical_note')) db.exec("ALTER TABLE tracker ADD COLUMN physical_note TEXT DEFAULT ''")
  if (!trackerCols.includes('accountability_note')) db.exec("ALTER TABLE tracker ADD COLUMN accountability_note TEXT DEFAULT ''")

  const already = db.prepare('SELECT id FROM seeded WHERE id = 1').get()
  if (!already) {
    seed(db)
    db.prepare('INSERT INTO seeded (id) VALUES (1)').run()
  }
}

const PATH_DEFAULTS: Record<string, unknown> = {
  ultimate_goal: { goal: 'Billionaire ($42B)', company: 'Maximus Investments', year: '2042' },
  skills_technical: [
    { name: 'Python', desc: 'ML, data analysis, automation, APIs' },
    { name: 'AI & Machine Learning', desc: 'NLP, computer vision, TensorFlow, OpenAI API' },
    { name: 'Data Science & Analytics', desc: 'Power BI, Tableau, predictive modeling' },
    { name: 'Cloud Computing', desc: 'AWS, Google Cloud, Microsoft Azure' },
    { name: 'Blockchain & Web3', desc: 'Smart contracts, Solidity, DeFi, dApps' },
  ],
  skills_business: [
    { name: 'Financial Modelling', desc: 'DCF, LBO, valuation, projections' },
    { name: 'Investing Strategies', desc: 'Portfolio management, private equity, REITs' },
    { name: 'Sales & Negotiation', desc: 'Psychology of selling, closing deals' },
    { name: 'Digital Marketing', desc: 'TikTok/Facebook ads, SEO, email marketing' },
    { name: 'Project Management', desc: 'Agile, Scrum, Kanban, Jira' },
  ],
  skills_personal: [
    { name: 'Productivity', desc: 'GTD, time-blocking, prioritisation' },
    { name: 'Languages', desc: 'Spanish, Chinese, or French proficiency' },
    { name: 'Communication', desc: 'Articulation, persuasion, leadership' },
  ],
  skills_future: [
    { name: 'Quantum Computing', desc: 'Encryption, logistics, problem-solving' },
    { name: 'Green Technology & ESG', desc: 'Carbon accounting, clean energy, circular economy' },
    { name: 'Web 3.0', desc: "CBDCs, DeFi, tokenisation of real-world assets" },
    { name: 'Space Economy', desc: 'Satellite technology, space infrastructure' },
    { name: 'Creator Economy', desc: 'AI content creation, micro communities' },
  ],
  roadmap: [
    { phase: 'Bachelors Phase', color: 'border-blue-500/40 bg-blue-500/5', accent: 'text-blue-400', items: ['Get into CCL / CLIP / Economics Club', 'Make €2k/month, save 60%', 'Vienna exchange in final year', 'Internship at UBS'] },
    { phase: 'Finance Career', color: 'border-green-500/40 bg-green-500/5', accent: 'text-green-400', items: ['Private Banking (Portugal, USA, Switzerland)', '3 years maximum', 'Be a killer on the job'] },
    { phase: 'MBA Abroad', color: 'border-yellow-500/40 bg-yellow-500/5', accent: 'text-yellow-400', items: ['USA: Wharton, Harvard, Stanford, Columbia', 'Europe: LBS, HEC Paris, IESE, SDA Bocconi', 'Asia: NUS, HKU as alternatives'] },
    { phase: 'High Finance', color: 'border-orange-500/40 bg-orange-500/5', accent: 'text-orange-400', items: ['Investment Banking', 'Private Equity', 'Consulting', 'Oil & Gas major'] },
    { phase: 'Maximus Investments', color: 'border-purple-500/40 bg-purple-500/5', accent: 'text-purple-400', items: ['Found holding company', 'Investing + AI Automation focus', 'Grow to 7 figures, build network', 'Scale to $42B by 2042'] },
  ],
}

function seed(db: Database.Database) {
  // Seed goals for May 2026
  const insertGoal = db.prepare(
    'INSERT INTO goals (name, status, task_types, due_date, description, month) VALUES (?, ?, ?, ?, ?, ?)'
  )
  const goals = [
    ['Complete Financial Modelling course', 'In progress', '["Finance","University"]', '2026-05-31', 'Finish the DCF and LBO modules', '2026-05'],
    ['Launch digital product MVP', 'In progress', '["Business"]', '2026-05-20', 'Get first paying customer', '2026-05'],
    ['Apply for CCL / Econ Club', 'Not started', '["University"]', '2026-05-15', null, '2026-05'],
    ['Read Sales & Negotiation book', 'Not started', '["Personal"]', '2026-05-31', 'Psychology of selling', '2026-05'],
    ['Set up investment tracking spreadsheet', 'Done', '["Finance"]', null, null, '2026-05'],
    ['Build personal brand on LinkedIn', 'Not started', '["Business","Personal"]', '2026-05-31', null, '2026-05'],
  ]
  for (const g of goals) insertGoal.run(...g)

  // Seed area tasks
  const insertArea = db.prepare('INSERT INTO area_tasks (area, name, status) VALUES (?, ?, ?)')
  const areaTasks = [
    ['university', 'Financial Econometrics assignment', 'In progress'],
    ['university', 'Corporate Finance exam prep', 'Not started'],
    ['university', 'Economics Club application', 'Not started'],
    ['university', 'CLIP application', 'Not started'],
    ['fintech', 'Research stablecoin adoption landscape', 'Done'],
    ['fintech', 'Study Solidity basics', 'In progress'],
    ['fintech', 'Analyze DeFi protocol mechanics', 'Not started'],
    ['investment', 'Review UBS internship requirements', 'Not started'],
    ['investment', 'Build portfolio tracking model', 'In progress'],
    ['investment', 'Research private equity entry points', 'Not started'],
    ['personal', 'Morning workout routine', 'In progress'],
    ['personal', 'Spanish language practice (30min/day)', 'Not started'],
    ['personal', 'Journal every night', 'In progress'],
  ]
  for (const t of areaTasks) insertArea.run(...t)

  // Seed daily tasks for today
  const insertTask = db.prepare('INSERT INTO daily_tasks (title, completed, created_at) VALUES (?, ?, ?)')
  const today = new Date().toISOString().split('T')[0]
  insertTask.run('Check all daily goals', 0, today)
  insertTask.run('Morning workout', 0, today)
  insertTask.run('Plan tomorrow', 0, today)

  // Seed path data
  const insertPath = db.prepare('INSERT OR IGNORE INTO path_data (key, value) VALUES (?, ?)')
  for (const [key, val] of Object.entries(PATH_DEFAULTS)) {
    insertPath.run(key, JSON.stringify(val))
  }
}

// ── Daily Tasks ──────────────────────────────────────────────────────────────

export function getDailyTasks(date: string): DailyTask[] {
  return getDb().prepare('SELECT * FROM daily_tasks WHERE created_at = ? ORDER BY id').all(date) as DailyTask[]
}

export function addDailyTask(title: string, date: string): DailyTask {
  const db = getDb()
  const result = db.prepare('INSERT INTO daily_tasks (title, completed, created_at) VALUES (?, 0, ?)').run(title, date)
  return db.prepare('SELECT * FROM daily_tasks WHERE id = ?').get(result.lastInsertRowid) as DailyTask
}

export function toggleDailyTask(id: number): DailyTask {
  const db = getDb()
  const task = db.prepare('SELECT * FROM daily_tasks WHERE id = ?').get(id) as DailyTask
  db.prepare('UPDATE daily_tasks SET completed = ? WHERE id = ?').run(task.completed ? 0 : 1, id)
  return db.prepare('SELECT * FROM daily_tasks WHERE id = ?').get(id) as DailyTask
}

export function deleteDailyTask(id: number): void {
  getDb().prepare('DELETE FROM daily_tasks WHERE id = ?').run(id)
}

// ── Goals ─────────────────────────────────────────────────────────────────────

export function getGoals(month?: string): Goal[] {
  if (month) {
    return getDb().prepare('SELECT * FROM goals WHERE month = ? ORDER BY id').all(month) as Goal[]
  }
  return getDb().prepare('SELECT * FROM goals ORDER BY month DESC, id').all() as Goal[]
}

export function addGoal(data: Omit<Goal, 'id'>): Goal {
  const db = getDb()
  const result = db.prepare(
    'INSERT INTO goals (name, status, task_types, due_date, description, month) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(data.name, data.status, data.task_types, data.due_date, data.description, data.month)
  return db.prepare('SELECT * FROM goals WHERE id = ?').get(result.lastInsertRowid) as Goal
}

export function updateGoal(id: number, data: Partial<Omit<Goal, 'id'>>): Goal {
  const db = getDb()
  const sets = Object.keys(data).map(k => `${k} = ?`).join(', ')
  db.prepare(`UPDATE goals SET ${sets} WHERE id = ?`).run(...Object.values(data), id)
  return db.prepare('SELECT * FROM goals WHERE id = ?').get(id) as Goal
}

export function deleteGoal(id: number): void {
  getDb().prepare('DELETE FROM goals WHERE id = ?').run(id)
}

// ── Area Tasks ────────────────────────────────────────────────────────────────

export function getAreaTasks(area?: string): AreaTask[] {
  if (area) {
    return getDb().prepare('SELECT * FROM area_tasks WHERE area = ? ORDER BY id').all(area) as AreaTask[]
  }
  return getDb().prepare('SELECT * FROM area_tasks ORDER BY area, id').all() as AreaTask[]
}

export function addAreaTask(area: string, name: string): AreaTask {
  const db = getDb()
  const result = db.prepare('INSERT INTO area_tasks (area, name, status) VALUES (?, ?, ?)').run(area, name, 'Not started')
  return db.prepare('SELECT * FROM area_tasks WHERE id = ?').get(result.lastInsertRowid) as AreaTask
}

export function updateAreaTask(id: number, data: Partial<Omit<AreaTask, 'id'>>): AreaTask {
  const db = getDb()
  const sets = Object.keys(data).map(k => `${k} = ?`).join(', ')
  db.prepare(`UPDATE area_tasks SET ${sets} WHERE id = ?`).run(...Object.values(data), id)
  return db.prepare('SELECT * FROM area_tasks WHERE id = ?').get(id) as AreaTask
}

export function deleteAreaTask(id: number): void {
  getDb().prepare('DELETE FROM area_tasks WHERE id = ?').run(id)
}

// ── Calendar ──────────────────────────────────────────────────────────────────

export function getCalendarEntries(year: number, month: number): CalendarEntry[] {
  const prefix = `${year}-${String(month).padStart(2, '0')}`
  return getDb().prepare("SELECT * FROM calendar_entries WHERE date LIKE ? ORDER BY date").all(`${prefix}%`) as CalendarEntry[]
}

export function addCalendarEntry(name: string, date: string, tags: string): CalendarEntry {
  const db = getDb()
  const result = db.prepare('INSERT INTO calendar_entries (name, date, tags) VALUES (?, ?, ?)').run(name, date, tags)
  return db.prepare('SELECT * FROM calendar_entries WHERE id = ?').get(result.lastInsertRowid) as CalendarEntry
}

export function updateCalendarEntry(id: number, data: Partial<Omit<CalendarEntry, 'id'>>): CalendarEntry {
  const db = getDb()
  const sets = Object.keys(data).map(k => `${k} = ?`).join(', ')
  db.prepare(`UPDATE calendar_entries SET ${sets} WHERE id = ?`).run(...Object.values(data), id)
  return db.prepare('SELECT * FROM calendar_entries WHERE id = ?').get(id) as CalendarEntry
}

export function deleteCalendarEntry(id: number): void {
  getDb().prepare('DELETE FROM calendar_entries WHERE id = ?').run(id)
}

// ── Tracker ───────────────────────────────────────────────────────────────────

export function getTrackerEntry(date: string): TrackerEntry | null {
  return (getDb().prepare('SELECT * FROM tracker WHERE date = ?').get(date) as TrackerEntry) || null
}

export function getAllTrackerEntries(): TrackerEntry[] {
  return getDb().prepare('SELECT * FROM tracker ORDER BY date').all() as TrackerEntry[]
}

export function upsertTrackerEntry(
  date: string,
  data: Omit<TrackerEntry, 'id' | 'date'>
): TrackerEntry {
  const db = getDb()
  db.prepare(`
    INSERT INTO tracker (date, mental, spiritual, physical, accountability, mental_note, spiritual_note, physical_note, accountability_note)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(date) DO UPDATE SET
      mental = excluded.mental,
      spiritual = excluded.spiritual,
      physical = excluded.physical,
      accountability = excluded.accountability,
      mental_note = excluded.mental_note,
      spiritual_note = excluded.spiritual_note,
      physical_note = excluded.physical_note,
      accountability_note = excluded.accountability_note
  `).run(
    date,
    data.mental, data.spiritual, data.physical, data.accountability,
    data.mental_note ?? '', data.spiritual_note ?? '', data.physical_note ?? '', data.accountability_note ?? ''
  )
  return db.prepare('SELECT * FROM tracker WHERE date = ?').get(date) as TrackerEntry
}

function isDayWin(db: Database.Database, date: string): boolean {
  const entry = db.prepare('SELECT * FROM tracker WHERE date = ?').get(date) as TrackerEntry | null
  if (!entry) return false
  const allWins = !!(entry.mental && entry.spiritual && entry.physical && entry.accountability)
  if (!allWins) return false
  const tasks = db.prepare('SELECT * FROM daily_tasks WHERE created_at = ?').all(date) as DailyTask[]
  if (tasks.length === 0) return allWins
  return tasks.every(t => t.completed === 1)
}

export function computeRecord(): { wins: number; losses: number; streak: number; streakType: 'W' | 'L' } {
  const db = getDb()
  const entries = db.prepare('SELECT * FROM tracker ORDER BY date').all() as TrackerEntry[]
  let wins = 0
  let losses = 0
  const results: boolean[] = []

  for (const e of entries) {
    const win = isDayWin(db, e.date)
    if (win) wins++
    else losses++
    results.push(win)
  }

  let streak = 0
  let streakType: 'W' | 'L' = 'W'
  for (let i = results.length - 1; i >= 0; i--) {
    const isWin = results[i]
    if (i === results.length - 1) {
      streakType = isWin ? 'W' : 'L'
      streak = 1
    } else if ((isWin && streakType === 'W') || (!isWin && streakType === 'L')) {
      streak++
    } else {
      break
    }
  }

  return { wins, losses, streak, streakType }
}

export function getDayResults(year: number, month: number): DayResult[] {
  const db = getDb()
  const prefix = `${year}-${String(month).padStart(2, '0')}`
  const entries = db.prepare('SELECT date FROM tracker WHERE date LIKE ? ORDER BY date').all(`${prefix}%`) as { date: string }[]
  return entries.map(e => ({
    date: e.date,
    result: isDayWin(db, e.date) ? 'W' : 'L',
  }))
}

export function getWeekDayResults(dates: string[]): DayResult[] {
  const db = getDb()
  return dates.map(date => {
    const entry = db.prepare('SELECT date FROM tracker WHERE date = ?').get(date) as { date: string } | null
    if (!entry) return { date, result: null }
    return { date, result: isDayWin(db, date) ? 'W' : 'L' }
  })
}

// ── Weekly Reviews ────────────────────────────────────────────────────────────

export function getWeeklyReview(weekStart: string): WeeklyReview | null {
  return (getDb().prepare('SELECT * FROM weekly_reviews WHERE week_start = ?').get(weekStart) as WeeklyReview) || null
}

export function upsertWeeklyReview(weekStart: string, data: Omit<WeeklyReview, 'id' | 'week_start'>): WeeklyReview {
  const db = getDb()
  db.prepare(`
    INSERT INTO weekly_reviews (week_start, went_well, improve, next_focus)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(week_start) DO UPDATE SET
      went_well = excluded.went_well,
      improve = excluded.improve,
      next_focus = excluded.next_focus
  `).run(weekStart, data.went_well, data.improve, data.next_focus)
  return db.prepare('SELECT * FROM weekly_reviews WHERE week_start = ?').get(weekStart) as WeeklyReview
}

// ── Quarterly Plans ───────────────────────────────────────────────────────────

export function getQuarterlyPlan(year: number, quarter: number): QuarterlyPlan | null {
  return (getDb().prepare('SELECT * FROM quarterly_plans WHERE year = ? AND quarter = ?').get(year, quarter) as QuarterlyPlan) || null
}

export function upsertQuarterlyPlan(year: number, quarter: number, data: { theme: string; notes: string }): QuarterlyPlan {
  const db = getDb()
  db.prepare(`
    INSERT INTO quarterly_plans (year, quarter, theme, notes)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(year, quarter) DO UPDATE SET
      theme = excluded.theme,
      notes = excluded.notes
  `).run(year, quarter, data.theme, data.notes)
  return db.prepare('SELECT * FROM quarterly_plans WHERE year = ? AND quarter = ?').get(year, quarter) as QuarterlyPlan
}

export function getQuarterlyItems(planId: number): QuarterlyItem[] {
  return getDb().prepare('SELECT * FROM quarterly_items WHERE plan_id = ? ORDER BY id').all(planId) as QuarterlyItem[]
}

export function addQuarterlyItem(planId: number, title: string): QuarterlyItem {
  const db = getDb()
  const result = db.prepare('INSERT INTO quarterly_items (plan_id, title, completed) VALUES (?, ?, 0)').run(planId, title)
  return db.prepare('SELECT * FROM quarterly_items WHERE id = ?').get(result.lastInsertRowid) as QuarterlyItem
}

export function updateQuarterlyItem(id: number, data: Partial<Omit<QuarterlyItem, 'id' | 'plan_id'>>): QuarterlyItem {
  const db = getDb()
  const sets = Object.keys(data).map(k => `${k} = ?`).join(', ')
  db.prepare(`UPDATE quarterly_items SET ${sets} WHERE id = ?`).run(...Object.values(data), id)
  return db.prepare('SELECT * FROM quarterly_items WHERE id = ?').get(id) as QuarterlyItem
}

export function deleteQuarterlyItem(id: number): void {
  getDb().prepare('DELETE FROM quarterly_items WHERE id = ?').run(id)
}

// ── Path Data ─────────────────────────────────────────────────────────────────

export function getPathData(): PathData[] {
  const db = getDb()
  // Ensure path data is seeded if missing
  for (const [key, val] of Object.entries(PATH_DEFAULTS)) {
    const existing = db.prepare('SELECT key FROM path_data WHERE key = ?').get(key)
    if (!existing) db.prepare('INSERT INTO path_data (key, value) VALUES (?, ?)').run(key, JSON.stringify(val))
  }
  return db.prepare('SELECT * FROM path_data').all() as PathData[]
}

export function updatePathKey(key: string, value: string): void {
  getDb().prepare('INSERT OR REPLACE INTO path_data (key, value) VALUES (?, ?)').run(key, value)
}
