import type { TrackerEntry } from './types'

export interface WinState {
  mental: boolean
  spiritual: boolean
  physical: boolean
  accountability: boolean
  mental_note: string
  spiritual_note: string
  physical_note: string
  accountability_note: string
}

export function trackerToWinState(entry: TrackerEntry | null): WinState {
  return {
    mental: !!(entry?.mental),
    spiritual: !!(entry?.spiritual),
    physical: !!(entry?.physical),
    accountability: !!(entry?.accountability),
    mental_note: entry?.mental_note ?? '',
    spiritual_note: entry?.spiritual_note ?? '',
    physical_note: entry?.physical_note ?? '',
    accountability_note: entry?.accountability_note ?? '',
  }
}
