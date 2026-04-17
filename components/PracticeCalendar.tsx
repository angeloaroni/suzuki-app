'use client'

import { useMemo } from 'react'
import { Flame } from 'lucide-react'

interface PracticeSession {
    id: string
    date: string
    duration: number
    notes: string | null
}

interface PracticeCalendarProps {
    sessions: PracticeSession[]
    streak: number
}

export default function PracticeCalendar({ sessions, streak }: PracticeCalendarProps) {
    const { weeks, monthLabel } = useMemo(() => {
        const today = new Date()
        const days: Array<{ date: Date; practiced: boolean; duration: number }> = []

        // Generate last 35 days (5 weeks)
        for (let i = 34; i >= 0; i--) {
            const d = new Date(today)
            d.setDate(d.getDate() - i)
            const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

            const session = sessions.find(s => {
                const sd = new Date(s.date)
                const sDateStr = `${sd.getFullYear()}-${String(sd.getMonth() + 1).padStart(2, '0')}-${String(sd.getDate()).padStart(2, '0')}`
                return sDateStr === dateStr
            })

            days.push({
                date: d,
                practiced: !!session,
                duration: session?.duration || 0
            })
        }

        // Group into weeks
        const weeks: typeof days[] = []
        for (let i = 0; i < days.length; i += 7) {
            weeks.push(days.slice(i, i + 7))
        }

        const monthLabel = today.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })

        return { weeks, monthLabel }
    }, [sessions])

    const dayNames = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

    return (
        <div className="space-y-4">
            {/* Streak Badge */}
            {streak > 0 && (
                <div className="flex items-center justify-center gap-2 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-3">
                    <Flame className="w-5 h-5 text-orange-500" />
                    <span className="text-sm font-bold text-orange-700 dark:text-orange-300">
                        🔥 {streak} {streak === 1 ? 'día' : 'días'} de racha
                    </span>
                    {streak >= 7 && <span className="text-lg">🏆</span>}
                    {streak >= 30 && <span className="text-lg">👑</span>}
                </div>
            )}

            {/* Calendar Grid */}
            <div className="overflow-hidden">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3 text-center capitalize">
                    Últimos 35 días
                </p>

                {/* Day labels */}
                <div className="grid grid-cols-7 gap-1 mb-1">
                    {dayNames.map(day => (
                        <div key={day} className="text-center text-[10px] text-gray-400 dark:text-gray-500 font-medium">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Calendar cells */}
                {weeks.map((week, weekIdx) => (
                    <div key={weekIdx} className="grid grid-cols-7 gap-1 mb-1">
                        {week.map((day, dayIdx) => {
                            const isToday = day.date.toDateString() === new Date().toDateString()
                            const dayNumber = day.date.getDate()

                            return (
                                <div
                                    key={dayIdx}
                                    className={`
                                        relative aspect-square rounded-lg flex flex-col items-center justify-center text-xs transition-all
                                        ${day.practiced
                                            ? 'bg-gradient-to-br from-green-400 to-emerald-500 dark:from-green-500 dark:to-emerald-600 text-white shadow-sm'
                                            : 'bg-gray-100 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400'
                                        }
                                        ${isToday ? 'ring-2 ring-indigo-500 ring-offset-1 dark:ring-offset-gray-800' : ''}
                                    `}
                                    title={`${day.date.toLocaleDateString('es-ES')}${day.practiced ? ` - ${day.duration} min` : ''}`}
                                >
                                    <span className="font-semibold text-[11px]">{dayNumber}</span>
                                    {day.practiced && (
                                        <span className="text-[8px] opacity-80">{day.duration}m</span>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                ))}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-gray-100 dark:bg-gray-700/50"></div>
                    <span>Sin práctica</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-gradient-to-br from-green-400 to-emerald-500"></div>
                    <span>Practicado</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded ring-2 ring-indigo-500"></div>
                    <span>Hoy</span>
                </div>
            </div>

            {/* Total Stats */}
            <div className="text-center pt-2 border-t border-gray-100 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-bold text-gray-900 dark:text-gray-100">
                        {sessions.filter(s => {
                            const d = new Date(s.date)
                            const thirtyDaysAgo = new Date()
                            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 35)
                            return d >= thirtyDaysAgo
                        }).length}
                    </span>
                    {' '}días practicados en las últimas 5 semanas
                </p>
            </div>
        </div>
    )
}
