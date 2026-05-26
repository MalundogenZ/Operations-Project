import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'
import type { DailyTask, Goal, AreaTask, CalendarEntry, TrackerEntry } from './types'

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

    CREATE TABLE IF NOT EXISTS seeded (
      id INTEGER PRIMARY KEY
    );
  `)

  const already = db.prepare('SELECT id FROM seeded WHERE id = 1').get()
  if (!already) {
    seed(db)
    db.prepare('INSERT INTO seeded (id) VALUES (1)').run()
  }
}

function seed(db: Database.Database) {
  // Tracker data from Notion scrape
  // April: days 26-30, record 2W-3L
  const aprilData = [
    { date: '2026-04-26', mental: 1, spiritual: 1, physical: 1, accountability: 1 }, // W
    { date: '2026-04-27', mental: 0, spiritual: 1, physical: 1, accountability: 0 }, // L
    { date: '2026-04-28', mental: 1, spiritual: 1, physical: 1, accountability: 1 }, // W
    { date: '2026-04-29', mental: 0, spiritual: 0, physical: 0, accountability: 0 }, // L
    { date: '2026-04-30', mental: 0, spiritual: 0, physical: 0, accountability: 0 }, // L
  ]
  // May: days 1-2 both wins
  const mayData = [
    { date: '2026-05-01', mental: 1, spiritual: 1, physical: 1, accountability: 1 }, // W
    { date: '2026-05-02', mental: 1, spiritual: 1, physical: 1, accountability: 1 }, // W
  ]

  const insertTracker = db.prepare(
    'INSERT OR IGNORE INTO tracker (date, mental, spiritual, physical, accountability) VALUES (?, ?, ?, ?, ?)'
  )
  for (const d of [...aprilData, ...mayData]) {
    insertTracker.run(d.date, d.mental, d.spiritual, d.physical, d.accountability)
  }

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

  // Seed a couple of daily tasks
  const insertTask = db.prepare('INSERT INTO daily_tasks (title, completed, created_at) VALUES (?, ?, ?)')
  const today = new Date().toISOString().split('T')[0]
  insertTask.run('Check all daily goals', 0, today)
  insertTask.run('Morning workout', 0, today)
  insertTask.run('Plan tomorrow', 0, today)
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

export function upsertTrackerEntry(date: string, data: Omit<TrackerEntry, 'id' | 'date'>): TrackerEntry {
  const db = getDb()
  db.prepare(`
    INSERT INTO tracker (date, mental, spiritual, physical, accountability)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(date) DO UPDATE SET
      mental = excluded.mental,
      spiritual = excluded.spiritual,
      physical = excluded.physical,
      accountability = excluded.accountability
  `).run(date, data.mental, data.spiritual, data.physical, data.accountability)
  return db.prepare('SELECT * FROM tracker WHERE date = ?').get(date) as TrackerEntry
}

export function computeRecord(): { wins: number; losses: number; streak: number; streakType: 'W' | 'L' } {
  const entries = getAllTrackerEntries()
  let wins = 0
  let losses = 0

  for (const e of entries) {
    const isWin = e.mental && e.spiritual && e.physical && e.accountability
    if (isWin) wins++
    else losses++
  }

  // Compute current streak from end
  let streak = 0
  let streakType: 'W' | 'L' = 'W'
  for (let i = entries.length - 1; i >= 0; i--) {
    const e = entries[i]
    const isWin = !!(e.mental && e.spiritual && e.physical && e.accountability)
    if (i === entries.length - 1) {
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
