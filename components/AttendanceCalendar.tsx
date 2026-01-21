'use client'

import { useState, useCallback } from 'react'
import { ChevronLeft, ChevronRight, Check, X } from 'lucide-react'
import { toggleAttendance } from '@/app/actions/attendance'

interface Student {
    id: string
    name: string
}

interface AttendanceRecord {
    id: string
    studentId: string
    date: string
    present: boolean
}

interface AttendanceCalendarProps {
    students: Student[]
    initialAttendances: AttendanceRecord[]
    initialYear: number
    initialMonth: number
}

const DAYS_OF_WEEK = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const MONTHS = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

export function AttendanceCalendar({
    students,
    initialAttendances,
    initialYear,
    initialMonth
}: AttendanceCalendarProps) {
    const [year, setYear] = useState(initialYear)
    const [month, setMonth] = useState(initialMonth)
    const [attendances, setAttendances] = useState<AttendanceRecord[]>(initialAttendances)
    const [loading, setLoading] = useState<string | null>(null)

    // Get days in month
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const firstDayOfMonth = new Date(year, month, 1).getDay()

    // Generate calendar days
    const calendarDays: (number | null)[] = []
    for (let i = 0; i < firstDayOfMonth; i++) {
        calendarDays.push(null)
    }
    for (let day = 1; day <= daysInMonth; day++) {
        calendarDays.push(day)
    }

    const navigateMonth = (direction: 'prev' | 'next') => {
        if (direction === 'prev') {
            if (month === 0) {
                setMonth(11)
                setYear(year - 1)
            } else {
                setMonth(month - 1)
            }
        } else {
            if (month === 11) {
                setMonth(0)
                setYear(year + 1)
            } else {
                setMonth(month + 1)
            }
        }
    }

    const getAttendanceForDay = useCallback((studentId: string, day: number) => {
        const dateStr = new Date(year, month, day).toISOString().split('T')[0]
        return attendances.find(a =>
            a.studentId === studentId &&
            a.date.startsWith(dateStr)
        )
    }, [attendances, year, month])

    const handleToggleAttendance = async (studentId: string, day: number) => {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
        const key = `${studentId}-${day}`

        setLoading(key)

        const existingAttendance = getAttendanceForDay(studentId, day)
        const newPresent = existingAttendance ? !existingAttendance.present : true

        const result = await toggleAttendance(studentId, dateStr, newPresent)

        if (result.success && result.attendance) {
            setAttendances(prev => {
                const filtered = prev.filter(a =>
                    !(a.studentId === studentId && a.date.startsWith(dateStr))
                )
                return [...filtered, {
                    id: result.attendance.id,
                    studentId: result.attendance.studentId,
                    date: result.attendance.date.toISOString?.() || dateStr,
                    present: result.attendance.present
                }]
            })
        }

        setLoading(null)
    }

    const today = new Date()
    const isToday = (day: number) =>
        day === today.getDate() &&
        month === today.getMonth() &&
        year === today.getFullYear()

    return (
        <div className="space-y-6">
            {/* Month Navigation */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => navigateMonth('prev')}
                    className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                    <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    {MONTHS[month]} {year}
                </h2>
                <button
                    onClick={() => navigateMonth('next')}
                    className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                    <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
            </div>

            {/* Calendar Grid */}
            <div className="overflow-x-auto">
                <table className="w-full border-collapse min-w-[800px]">
                    <thead>
                        <tr>
                            <th className="sticky left-0 bg-white dark:bg-gray-800 z-10 px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
                                Estudiante
                            </th>
                            {calendarDays.map((day, index) => (
                                <th
                                    key={index}
                                    className={`px-2 py-3 text-center text-xs font-medium border-b border-gray-200 dark:border-gray-700 min-w-[40px] ${day && isToday(day)
                                        ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300'
                                        : 'text-gray-500 dark:text-gray-400'
                                        }`}
                                >
                                    {day && (
                                        <>
                                            <div className="text-[10px] text-gray-400 dark:text-gray-500">
                                                {DAYS_OF_WEEK[new Date(year, month, day).getDay()]}
                                            </div>
                                            <div className={day && isToday(day) ? 'font-bold' : ''}>
                                                {day}
                                            </div>
                                        </>
                                    )}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {students.map(student => (
                            <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                <td className="sticky left-0 bg-white dark:bg-gray-800 z-10 px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100 border-b border-gray-100 dark:border-gray-700 whitespace-nowrap">
                                    {student.name}
                                </td>
                                {calendarDays.map((day, index) => {
                                    if (!day) {
                                        return (
                                            <td
                                                key={index}
                                                className="px-2 py-3 border-b border-gray-100 dark:border-gray-700"
                                            />
                                        )
                                    }

                                    const attendance = getAttendanceForDay(student.id, day)
                                    const isLoadingCell = loading === `${student.id}-${day}`

                                    return (
                                        <td
                                            key={index}
                                            className={`px-2 py-3 border-b border-gray-100 dark:border-gray-700 ${isToday(day) ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''
                                                }`}
                                        >
                                            <button
                                                onClick={() => handleToggleAttendance(student.id, day)}
                                                disabled={isLoadingCell}
                                                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all mx-auto ${isLoadingCell
                                                    ? 'bg-gray-100 dark:bg-gray-700 animate-pulse'
                                                    : attendance?.present
                                                        ? 'bg-green-500 hover:bg-green-600 text-white shadow-sm'
                                                        : attendance && !attendance.present
                                                            ? 'bg-red-500 hover:bg-red-600 text-white shadow-sm'
                                                            : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-400 dark:text-gray-500'
                                                    }`}
                                            >
                                                {!isLoadingCell && attendance?.present && (
                                                    <Check className="w-4 h-4" />
                                                )}
                                                {!isLoadingCell && attendance && !attendance.present && (
                                                    <X className="w-4 h-4" />
                                                )}
                                            </button>
                                        </td>
                                    )
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-green-500 flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                    </div>
                    <span>Asistió</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-red-500 flex items-center justify-center">
                        <X className="w-3 h-3 text-white" />
                    </div>
                    <span>No asistió</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-gray-100 dark:bg-gray-700" />
                    <span>Sin marcar</span>
                </div>
            </div>
        </div>
    )
}
