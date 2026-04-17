/**
 * Utility functions for practice session calculations
 * Pure functions, no server-side dependencies
 */

export function calculateStreak(sessions: Array<{ date: Date | string }>): number {
    if (sessions.length === 0) return 0

    const dates = sessions
        .map(s => {
            const d = new Date(s.date)
            return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
        })
        .sort((a, b) => b - a) // newest first

    // Remove duplicates
    const uniqueDates = [...new Set(dates)]

    const today = new Date()
    const todayMs = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()
    const yesterdayMs = todayMs - 86400000

    // Streak must start from today or yesterday
    if (uniqueDates[0] !== todayMs && uniqueDates[0] !== yesterdayMs) {
        return 0
    }

    let streak = 1
    for (let i = 1; i < uniqueDates.length; i++) {
        const diff = uniqueDates[i - 1] - uniqueDates[i]
        if (diff === 86400000) { // exactly 1 day apart
            streak++
        } else {
            break
        }
    }

    return streak
}
