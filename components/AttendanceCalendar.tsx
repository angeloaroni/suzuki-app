'use client'

import { useState, useCallback, useMemo, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Check, X, Calendar as CalendarIcon, User, Search, Filter, TrendingUp, CalendarDays } from 'lucide-react'
import { toggleAttendance, getAttendanceByMonth, deleteAttendance } from '@/app/actions/attendance'

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

const YEARS = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i)

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
    const [showDatePicker, setShowDatePicker] = useState(false)

    useEffect(() => {
        const fetchAttendance = async () => {
            setIsUpdatingAll(true)
            const result = await getAttendanceByMonth(year, month)
            if (result.data) {
                setAttendances(result.data as AttendanceRecord[])
            }
            setIsUpdatingAll(false)
        }
        
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

        // Cycle logic: None -> Present -> Absent -> None
        if (existingAttendance && !existingAttendance.present) {
            // If it was "Absent", delete it to leave it "Clean"
            const result = await deleteAttendance(studentId, dateStr)
            if (result.success) {
                setAttendances(prev => prev.filter(a => 
                    !(a.studentId === studentId && a.date.startsWith(dateStr))
                ))
            }
        } else {
            // If it was "None" -> "Present", or "Present" -> "Absent"
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
        }

        setLoading(null)
    }

    return (
        <div className="space-y-6 sm:space-y-8">
            {/* General Summary Card - Compact Version */}
            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-4 sm:p-6 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-24 -mt-24 blur-3xl opacity-50"></div>
                <div className="relative z-10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 sm:gap-6">
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2 mb-1">
                            <TrendingUp className="w-4 h-4 text-indigo-200" />
                            <span className="text-indigo-100 font-bold uppercase tracking-widest text-[9px] sm:text-xs">Resumen Mensual</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <h2 className="text-xl sm:text-3xl font-black truncate">
                                {MONTHS[month]} {year}
                            </h2>
                            <button 
                                onClick={() => setShowDatePicker(!showDatePicker)}
                                className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-all border border-white/10"
                            >
                                <CalendarDays className="w-4 h-4 sm:w-5 h-5" />
                            </button>
                        </div>
                        
                        {/* Inline Quick Selector */}
                        {showDatePicker && (
                            <div className="mt-4 p-3 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 grid grid-cols-3 gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                <select 
                                    value={month} 
                                    onChange={(e) => { setMonth(Number(e.target.value)); setShowDatePicker(false); }}
                                    className="bg-indigo-900/40 border-none rounded-lg text-xs font-bold py-1 px-2 focus:ring-0"
                                >
                                    {MONTHS.map((m, i) => <option key={m} value={i} className="text-gray-900">{m}</option>)}
                                </select>
                                <select 
                                    value={year} 
                                    onChange={(e) => { setYear(Number(e.target.value)); setShowDatePicker(false); }}
                                    className="bg-indigo-900/40 border-none rounded-lg text-xs font-bold py-1 px-2 focus:ring-0"
                                >
                                    {YEARS.map(y => <option key={y} value={y} className="text-gray-900">{y}</option>)}
                                </select>
                                <button 
                                    onClick={() => setShowDatePicker(false)}
                                    className="bg-white/20 hover:bg-white/30 rounded-lg text-[10px] font-black uppercase transition-all"
                                >
                                    Cerrar
                                </button>
                            </div>
                        )}
                    </div>
                    
                    <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-4">
                        <div className="bg-white/10 backdrop-blur-md rounded-xl p-2.5 sm:p-4 border border-white/10 flex-1 sm:flex-none text-center sm:text-left min-w-[70px] sm:min-w-[100px]">
                            <p className="text-indigo-100 text-[8px] sm:text-[10px] font-black uppercase mb-0.5">Asistió</p>
                            <p className="text-lg sm:text-2xl font-black">{totalStats.present}</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md rounded-xl p-2.5 sm:p-4 border border-white/10 flex-1 sm:flex-none text-center sm:text-left min-w-[70px] sm:min-w-[100px]">
                            <p className="text-indigo-100 text-[8px] sm:text-[10px] font-black uppercase mb-0.5">Falta</p>
                            <p className="text-lg sm:text-2xl font-black">{totalStats.absent}</p>
                        </div>
                        <div className="flex flex-col gap-1">
                            <button 
                                onClick={() => navigateMonth('next')} 
                                className="p-1 px-3 bg-white/20 hover:bg-white/30 rounded-lg transition-all border border-white/10"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                            <button 
                                onClick={() => navigateMonth('prev')} 
                                className="p-1 px-3 bg-white/20 hover:bg-white/30 rounded-lg transition-all border border-white/10"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Student List View */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="bg-gray-50/50 dark:bg-gray-900/50 p-3 sm:p-4 border-b border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Buscar estudiante..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all border"
                        />
                    </div>
                    <div className="flex items-center justify-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">
                        <Filter className="w-3 h-3" />
                        {filteredStudents.length} Alumnos
                    </div>
                </div>

                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                    {filteredStudents.length === 0 ? (
                        <div className="p-12 text-center text-gray-500 text-sm">
                            No se encontraron estudiantes
                        </div>
                    ) : (
                        filteredStudents.map(student => (
                            <div key={student.id} className="p-3 sm:p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors group">
                                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                                    <div className="w-9 h-9 sm:w-10 sm:h-10 bg-indigo-50 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 flex-shrink-0">
                                        <User className="w-5 h-5" />
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="font-bold text-gray-900 dark:text-gray-100 truncate text-sm sm:text-base">{student.name}</h3>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-[9px] sm:text-[10px] font-black text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-2 py-0.5 rounded-full flex items-center gap-1 uppercase">
                                                <Check className="w-2.5 h-2.5" /> {studentStats[student.id].present}
                                            </span>
                                            <span className="text-[9px] sm:text-[10px] font-black text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 px-2 py-0.5 rounded-full flex items-center gap-1 uppercase">
                                                <X className="w-2.5 h-2.5" /> {studentStats[student.id].absent}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setSelectedStudent(student)}
                                    className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-[10px] sm:text-xs font-black text-indigo-600 dark:text-indigo-400 hover:shadow-md transition-all uppercase tracking-tighter"
                                >
                                    Registro
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Attendance Detail Modal - Improved for Mobile */}
            {selectedStudent && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[100] flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-lg w-full max-h-[92vh] flex flex-col border border-gray-100 dark:border-gray-700 overflow-hidden transform animate-in zoom-in-95 duration-300">
                        <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 p-5 sm:p-6 text-white relative flex-shrink-0">
                            <button 
                                onClick={() => setSelectedStudent(null)}
                                className="absolute right-4 top-4 p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                                    <CalendarIcon className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="text-lg sm:text-xl font-black line-clamp-1">{selectedStudent.name}</h2>
                                    <p className="text-indigo-100 text-[10px] font-bold uppercase tracking-widest">
                                        Asistencia • {MONTHS[month]} {year}
                                    </p>
                                </div>
                            </div>
                            
                            {/* Modal Stats Summary */}
                            <div className="grid grid-cols-2 gap-3 mt-4">
                                <div className="bg-indigo-900/30 rounded-xl p-2 flex items-center gap-3 border border-white/5">
                                    <div className="w-7 h-7 bg-green-500 rounded-lg flex items-center justify-center shadow-lg"><Check className="w-4 h-4 text-white" /></div>
                                    <div>
                                        <p className="text-[8px] font-black uppercase opacity-60">Asistencias</p>
                                        <p className="text-sm font-black">{studentStats[selectedStudent.id].present}</p>
                                    </div>
                                </div>
                                <div className="bg-indigo-900/30 rounded-xl p-2 flex items-center gap-3 border border-white/5">
                                    <div className="w-7 h-7 bg-red-500 rounded-lg flex items-center justify-center shadow-lg"><X className="w-4 h-4 text-white" /></div>
                                    <div>
                                        <p className="text-[8px] font-black uppercase opacity-60">Faltas</p>
                                        <p className="text-sm font-black">{studentStats[selectedStudent.id].absent}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 sm:p-6 no-scrollbar">
                            <CalendarGrid 
                                year={year}
                                month={month}
                                studentId={selectedStudent.id}
                                attendances={attendances}
                                loading={loading}
                                onToggle={handleToggleAttendance}
                            />
                        </div>

                        <div className="p-4 bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-sm border-t border-gray-100 dark:border-gray-700 flex justify-end flex-shrink-0">
                            <button 
                                onClick={() => setSelectedStudent(null)}
                                className="w-full sm:w-auto px-10 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:shadow-xl transition-all active:scale-95"
                            >
                                Finalizar
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
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {DAYS_OF_WEEK.map(day => (
                <div key={day} className="text-center text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase pb-2">
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
                        className={`relative aspect-square rounded-xl sm:rounded-2xl flex flex-col items-center justify-center transition-all border-2 ${
                            isLoadingCell ? 'bg-gray-100 dark:bg-gray-700 animate-pulse' :
                            attendance?.present ? 'bg-green-500 border-green-500 text-white shadow-lg z-10' :
                            attendance && !attendance.present ? 'bg-red-500 border-red-500 text-white shadow-lg z-10' :
                            isToday(day) ? 'bg-white dark:bg-gray-800 border-indigo-500 text-indigo-600 dark:text-indigo-400 shadow-sm' :
                            'bg-gray-50 dark:bg-gray-900 border-transparent text-gray-600 dark:text-gray-400 hover:border-gray-200 dark:hover:border-gray-700'
                        }`}
                    >
                        <span className="text-[11px] sm:text-sm font-black">{day}</span>
                        {!isLoadingCell && attendance && (
                            <div className="absolute top-1 right-1 sm:top-1.5 sm:right-1.5 bg-white/20 rounded-full p-0.5">
                                {attendance.present ? 
                                    <Check className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-white" /> : 
                                    <X className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-white" />
                                }
                            </div>
                        )}
                    </button>
                )
            })}
        </div>
    )
}
