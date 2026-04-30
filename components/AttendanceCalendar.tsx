'use client'

import { useState, useCallback, useMemo, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Check, X, Calendar as CalendarIcon, User, Search, Filter, TrendingUp } from 'lucide-react'
import { toggleAttendance, getAttendanceByMonth } from '@/app/actions/attendance'

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

// Helper to format date consistent with DB (YYYY-MM-DD)
const formatDateKey = (year: number, month: number, day: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

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
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
    const [isUpdatingAll, setIsUpdatingAll] = useState(false)

    // Load attendances when month/year changes
    useEffect(() => {
        const fetchAttendance = async () => {
            setIsUpdatingAll(true)
            const result = await getAttendanceByMonth(year, month)
            if (result.data) {
                setAttendances(result.data as AttendanceRecord[])
            }
            setIsUpdatingAll(false)
        }
        
        // Skip initial load since we have props
        if (year !== initialYear || month !== initialMonth) {
            fetchAttendance()
        }
    }, [year, month, initialYear, initialMonth])

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

    const filteredStudents = students.filter(s => 
        s.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    // Calculate monthly stats per student
    const studentStats = useMemo(() => {
        const stats: Record<string, { present: number, absent: number }> = {}
        students.forEach(s => {
            const studentAttendances = attendances.filter(a => a.studentId === s.id)
            stats[s.id] = {
                present: studentAttendances.filter(a => a.present).length,
                absent: studentAttendances.filter(a => !a.present).length
            }
        })
        return stats
    }, [attendances, students])

    const totalStats = useMemo(() => {
        return {
            present: attendances.filter(a => a.present).length,
            absent: attendances.filter(a => !a.present).length
        }
    }, [attendances])

    const handleToggleAttendance = async (studentId: string, day: number) => {
        const dateStr = formatDateKey(year, month, day)
        const key = `${studentId}-${day}`

        setLoading(key)

        const existingAttendance = attendances.find(a => 
            a.studentId === studentId && a.date.startsWith(dateStr)
        )
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

    return (
        <div className="space-y-8">
            {/* General Summary Card */}
            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="w-5 h-5 text-indigo-200" />
                            <span className="text-indigo-100 font-medium uppercase tracking-wider text-xs">Resumen General</span>
                        </div>
                        <h2 className="text-3xl font-black">
                            {MONTHS[month]} {year}
                        </h2>
                    </div>
                    <div className="flex gap-4 sm:gap-8">
                        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 min-w-[100px] border border-white/10">
                            <p className="text-indigo-100 text-xs font-bold uppercase mb-1">Asistencias</p>
                            <p className="text-2xl font-black">{totalStats.present}</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 min-w-[100px] border border-white/10">
                            <p className="text-indigo-100 text-xs font-bold uppercase mb-1">Faltas</p>
                            <p className="text-2xl font-black">{totalStats.absent}</p>
                        </div>
                        <div className="bg-white/20 backdrop-blur-md rounded-xl p-4 min-w-[100px] border border-white/20 flex flex-col justify-center items-center">
                            <CalendarIcon className="w-6 h-6 mb-1 text-indigo-100" />
                            <div className="flex items-center gap-2">
                                <button onClick={() => navigateMonth('prev')} className="hover:bg-white/20 p-1 rounded-lg transition-colors"><ChevronLeft className="w-4 h-4" /></button>
                                <button onClick={() => navigateMonth('next')} className="hover:bg-white/20 p-1 rounded-lg transition-colors"><ChevronRight className="w-4 h-4" /></button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Student List View */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="bg-gray-50/50 dark:bg-gray-900/50 p-4 border-b border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Buscar estudiante..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all border"
                        />
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-500 dark:text-gray-400">
                        <Filter className="w-4 h-4" />
                        TOTAL: {filteredStudents.length} ESTUDIANTES
                    </div>
                </div>

                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                    {filteredStudents.length === 0 ? (
                        <div className="p-12 text-center text-gray-500">
                            No se encontraron estudiantes
                        </div>
                    ) : (
                        filteredStudents.map(student => (
                            <div key={student.id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors group">
                                <div className="flex items-center gap-4 min-w-0">
                                    <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 flex-shrink-0">
                                        <User className="w-5 h-5" />
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="font-bold text-gray-900 dark:text-gray-100 truncate">{student.name}</h3>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="text-[10px] sm:text-xs font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                                                <Check className="w-3 h-3" /> {studentStats[student.id].present}
                                            </span>
                                            <span className="text-[10px] sm:text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                                                <X className="w-3 h-3" /> {studentStats[student.id].absent}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setSelectedStudent(student)}
                                    className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm"
                                >
                                    Ver / Registrar
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Attendance Detail Modal */}
            {selectedStudent && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-3 sm:p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full max-h-[95vh] overflow-hidden flex flex-col border border-gray-100 dark:border-gray-700">
                        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white relative">
                            <button 
                                onClick={() => setSelectedStudent(null)}
                                className="absolute right-4 top-4 p-2 hover:bg-white/20 rounded-xl transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                            <h2 className="text-xl font-black mb-1">{selectedStudent.name}</h2>
                            <p className="text-indigo-100 text-sm font-medium uppercase tracking-wide">
                                {MONTHS[month]} {year}
                            </p>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6">
                            <CalendarGrid 
                                year={year}
                                month={month}
                                studentId={selectedStudent.id}
                                attendances={attendances}
                                loading={loading}
                                onToggle={handleToggleAttendance}
                            />
                        </div>

                        <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-700 flex justify-end">
                            <button 
                                onClick={() => setSelectedStudent(null)}
                                className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg"
                            >
                                Listo
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

function CalendarGrid({ year, month, studentId, attendances, loading, onToggle }: any) {
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const firstDayOfMonth = new Date(year, month, 1).getDay()

    const calendarDays: (number | null)[] = []
    for (let i = 0; i < firstDayOfMonth; i++) {
        calendarDays.push(null)
    }
    for (let day = 1; day <= daysInMonth; day++) {
        calendarDays.push(day)
    }

    const today = new Date()
    const isToday = (day: number) =>
        day === today.getDate() &&
        month === today.getMonth() &&
        year === today.getFullYear()

    return (
        <div className="grid grid-cols-7 gap-2">
            {DAYS_OF_WEEK.map(day => (
                <div key={day} className="text-center text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase pb-2">
                    {day}
                </div>
            ))}
            {calendarDays.map((day, idx) => {
                if (day === null) return <div key={`empty-${idx}`} />

                const dateStr = formatDateKey(year, month, day)
                const attendance = attendances.find((a: any) => 
                    a.studentId === studentId && a.date.startsWith(dateStr)
                )
                const isLoadingCell = loading === `${studentId}-${day}`

                return (
                    <button
                        key={day}
                        onClick={() => onToggle(studentId, day)}
                        disabled={isLoadingCell}
                        className={`relative aspect-square rounded-xl flex flex-col items-center justify-center transition-all border-2 ${
                            isLoadingCell ? 'bg-gray-100 dark:bg-gray-700 animate-pulse' :
                            attendance?.present ? 'bg-green-500 border-green-500 text-white shadow-lg scale-105 z-10' :
                            attendance && !attendance.present ? 'bg-red-500 border-red-500 text-white shadow-lg scale-105 z-10' :
                            isToday(day) ? 'bg-white dark:bg-gray-800 border-indigo-500 text-indigo-600 dark:text-indigo-400' :
                            'bg-gray-50 dark:bg-gray-900 border-transparent text-gray-600 dark:text-gray-400 hover:border-gray-200 dark:hover:border-gray-700'
                        }`}
                    >
                        <span className="text-sm font-black">{day}</span>
                        {!isLoadingCell && attendance && (
                            <div className="absolute -top-1 -right-1 bg-white dark:bg-gray-800 rounded-full p-0.5 shadow-sm">
                                {attendance.present ? 
                                    <Check className="w-2.5 h-2.5 text-green-600" /> : 
                                    <X className="w-2.5 h-2.5 text-red-600" />
                                }
                            </div>
                        )}
                    </button>
                )
            })}
        </div>
    )
}
