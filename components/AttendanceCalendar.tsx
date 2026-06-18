'use client'

import { useState, useCallback, useMemo, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Check, X, Calendar as CalendarIcon, User, Search, Filter, TrendingUp, CalendarDays, ArrowRight, Settings2 } from 'lucide-react'
import { toggleAttendance, getAttendanceByRange, deleteAttendance, markAllAttendance } from '@/app/actions/attendance'

interface Student {
    id: string
    name: string
}

interface AttendanceRecord {
    id: string
    studentId: string
    date: string
    present: boolean
    notes?: string | null
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

const formatDateKey = (year: number, month: number, day: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

const formatDateDisplay = (date: Date) => {
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function AttendanceCalendar({
    students,
    initialAttendances,
    initialYear,
    initialMonth
}: AttendanceCalendarProps) {
    const [range, setRange] = useState({
        start: new Date(initialYear, initialMonth, 1),
        end: new Date(initialYear, initialMonth + 1, 0),
        label: 'Este mes'
    })
    const [attendances, setAttendances] = useState<AttendanceRecord[]>(initialAttendances)
    const [loading, setLoading] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
    const [showRangePicker, setShowRangePicker] = useState(false)
    const [markAllLoading, setMarkAllLoading] = useState(false)

    // Helper for date equality
    const isSameDate = (d1: Date, d2: Date) => 
        d1.getFullYear() === d2.getFullYear() && 
        d1.getMonth() === d2.getMonth() && 
        d1.getDate() === d2.getDate();

    useEffect(() => {
        const fetchAttendance = async () => {
            const start = range.start.toISOString()
            const end = range.end.toISOString()
            const result = await getAttendanceByRange(start,end)
            if (result.data) {
                setAttendances(result.data as AttendanceRecord[])
            }
        }
        
        // Initial set is from props, only fetch if range changes from default
        fetchAttendance()
    }, [range])

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

    const handleToggleAttendance = async (studentId: string, day: number, currentMonth: number, currentYear: number, notes?: string) => {
        const dateStr = formatDateKey(currentYear, currentMonth, day)
        const key = `${studentId}-${day}`
        setLoading(key)

        const existingAttendance = attendances.find(a => 
            a.studentId === studentId && a.date.startsWith(dateStr)
        )

        if (existingAttendance && !existingAttendance.present) {
            const result = await deleteAttendance(studentId, dateStr)
            if (result.success) {
                setAttendances(prev => prev.filter(a => !(a.studentId === studentId && a.date.startsWith(dateStr))))
            }
        } else {
            const newPresent = existingAttendance ? !existingAttendance.present : true
            const result = await toggleAttendance(studentId, dateStr, newPresent, notes)
            if (result.success && result.attendance) {
                setAttendances(prev => {
                    const filtered = prev.filter(a => !(a.studentId === studentId && a.date.startsWith(dateStr)))
                    return [...filtered, {
                        id: result.attendance.id,
                        studentId: result.attendance.studentId,
                        date: result.attendance.date.toISOString?.() || dateStr,
                        present: result.attendance.present,
                        notes: result.attendance.notes
                    }]
                })
            }
        }
        setLoading(null)
    }

    const predefinedRanges = [
        { label: 'Hoy', getValue: () => ({ start: new Date(), end: new Date() }) },
        { label: 'Ayer', getValue: () => {
            const d = new Date(); d.setDate(d.getDate() - 1);
            return { start: new Date(d), end: new Date(d) }
        }},
        { label: 'Esta semana', getValue: () => {
            const now = new Date();
            const start = new Date(now);
            start.setDate(now.getDate() - now.getDay());
            return { start, end: now }
        }},
        { label: 'Este mes', getValue: () => ({
            start: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            end: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
        })},
        { label: 'Este año', getValue: () => ({
            start: new Date(new Date().getFullYear(), 0, 1),
            end: new Date(new Date().getFullYear(), 11, 31)
        })},
        { label: 'Últimos 7 días', getValue: () => {
            const end = new Date();
            const start = new Date(); start.setDate(end.getDate() - 7);
            return { start, end }
        }},
        { label: 'Últimos 30 días', getValue: () => {
            const end = new Date();
            const start = new Date(); start.setDate(end.getDate() - 30);
            return { start, end }
        }},
        { label: 'Últimos 90 días', getValue: () => {
            const end = new Date();
            const start = new Date(); start.setDate(end.getDate() - 90);
            return { start, end }
        }},
        { label: 'Todo el tiempo', getValue: () => ({
            start: new Date(2020, 0, 1),
            end: new Date()
        })}
    ]

    return (
        <div className="space-y-6">
            {/* Range Picker Button & Summary */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 sm:p-6 transition-all">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2 mb-1">
                            <CalendarIcon className="w-4 h-4 text-indigo-500" />
                            <span className="text-[10px] sm:text-xs font-black text-gray-400 uppercase tracking-widest">Periodo Seleccionado</span>
                        </div>
                        <button 
                            onClick={() => setShowRangePicker(!showRangePicker)}
                            className="flex items-center gap-3 bg-gray-50 dark:bg-gray-900 px-4 py-2 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-900 transition-all group"
                        >
                            <span className="text-sm sm:text-base font-bold text-gray-900 dark:text-gray-100">
                                {range.label === 'Personalizado' ? `${formatDateDisplay(range.start)} - ${formatDateDisplay(range.end)}` : range.label}
                            </span>
                            <ChevronRight className={`w-4 h-4 text-gray-400 group-hover:text-indigo-500 transition-transform ${showRangePicker ? 'rotate-90' : ''}`} />
                        </button>
                    </div>

                    <div className="flex gap-4 w-full md:w-auto">
                        <div className="flex-1 md:flex-none bg-green-50 dark:bg-green-900/20 px-4 py-2 rounded-xl border border-green-100 dark:border-green-800/30">
                            <p className="text-[10px] font-black text-green-600 dark:text-green-400 uppercase tracking-tighter">Asistencias</p>
                            <p className="text-xl font-black text-green-700 dark:text-green-300">{totalStats.present}</p>
                        </div>
                        <div className="flex-1 md:flex-none bg-red-50 dark:bg-red-900/20 px-4 py-2 rounded-xl border border-red-100 dark:border-red-800/30">
                            <p className="text-[10px] font-black text-red-600 dark:text-red-400 uppercase tracking-tighter">Faltas</p>
                            <p className="text-xl font-black text-red-700 dark:text-red-300">{totalStats.absent}</p>
                        </div>
                    </div>
                </div>

                {/* Dropdown Range Picker */}
                {showRangePicker && (
                    <div className="mt-6 p-4 bg-gray-50/50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-700 animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="flex flex-wrap gap-2">
                            {predefinedRanges.map((r) => (
                                <button
                                    key={r.label}
                                    onClick={() => {
                                        const values = r.getValue()
                                        setRange({ ...values, label: r.label })
                                        setShowRangePicker(false)
                                    }}
                                    className={`flex-1 min-w-[120px] sm:min-w-[140px] px-3 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-tighter transition-all border text-center ${
                                        range.label === r.label 
                                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' 
                                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-indigo-300'
                                    }`}
                                >
                                    {r.label}
                                </button>
                            ))}
                        </div>
                        
                        <div className="mt-6 flex flex-col items-stretch gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                            <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] items-center gap-3">
                                <div>
                                    <label className="text-[9px] font-black text-gray-400 uppercase block mb-1">Desde</label>
                                    <input 
                                        type="date" 
                                        value={range.start.toISOString().split('T')[0]}
                                        onChange={(e) => setRange(prev => ({ ...prev, start: new Date(e.target.value), label: 'Personalizado' }))}
                                        className="w-full bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-lg text-xs px-3 py-2.5 focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                                    />
                                </div>
                                <div className="hidden sm:block mt-4">
                                    <ArrowRight className="w-4 h-4 text-gray-400" />
                                </div>
                                <div>
                                    <label className="text-[9px] font-black text-gray-400 uppercase block mb-1">Hasta</label>
                                    <input 
                                        type="date" 
                                        value={range.end.toISOString().split('T')[0]}
                                        onChange={(e) => setRange(prev => ({ ...prev, end: new Date(e.target.value), label: 'Personalizado' }))}
                                        className="w-full bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-lg text-xs px-3 py-2.5 focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                                    />
                                </div>
                            </div>
                            <button 
                                onClick={() => setShowRangePicker(false)}
                                className="w-full px-8 py-3 bg-indigo-600 text-white rounded-xl font-black uppercase text-xs tracking-widest hover:bg-indigo-700 transition-all shadow-lg active:scale-[0.98]"
                            >
                                Aplicar Periodo
                            </button>
                        </div>
                    </div>
                )}
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
                            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all border font-medium"
                        />
                    </div>
                    <button
                        onClick={async () => {
                            const today = new Date()
                            const dateStr = formatDateKey(today.getFullYear(), today.getMonth(), today.getDate())
                            setMarkAllLoading(true)
                            await markAllAttendance(dateStr, true)
                            const start = range.start.toISOString()
                            const end = range.end.toISOString()
                            const result = await getAttendanceByRange(start, end)
                            if (result.data) {
                                setAttendances(result.data as AttendanceRecord[])
                            }
                            setMarkAllLoading(false)
                        }}
                        disabled={markAllLoading}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all font-bold text-[10px] uppercase tracking-tighter shadow-sm disabled:opacity-50"
                    >
                        {markAllLoading ? (
                            <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                        ) : (
                            <Check className="w-4 h-4" />
                        )}
                        Marcar todos presentes
                    </button>
                </div>

                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                    {filteredStudents.length === 0 ? (
                        <div className="p-12 text-center text-gray-500 text-sm">No se encontraron estudiantes</div>
                    ) : (
                        filteredStudents.map(student => (
                            <div key={student.id} className="p-4 flex flex-col min-[420px]:flex-row items-start min-[420px]:items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-all duration-200 gap-4">
                                <div className="flex items-center gap-3 sm:gap-4 min-w-0 w-full min-[420px]:w-auto">
                                    <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold flex-shrink-0">
                                        {student.name.charAt(0)}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h3 className="font-bold text-gray-900 dark:text-gray-100 truncate">{student.name}</h3>
                                        <div className="flex flex-wrap gap-2 mt-1">
                                            <span className="text-[9px] font-black text-green-600 dark:text-green-400 bg-green-100/50 dark:bg-green-900/20 px-2 py-0.5 rounded-full uppercase whitespace-nowrap tracking-tighter">ASI: {studentStats[student.id].present}</span>
                                            <span className="text-[9px] font-black text-red-600 dark:text-red-400 bg-red-100/50 dark:bg-red-900/20 px-2 py-0.5 rounded-full uppercase whitespace-nowrap tracking-tighter">FAL: {studentStats[student.id].absent}</span>
                                        </div>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setSelectedStudent(student)}
                                    className="w-full min-[420px]:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-indigo-600 hover:text-white transition-all font-bold text-[10px] uppercase tracking-tighter shadow-sm flex-shrink-0"
                                >
                                    <Settings2 className="w-4 h-4" />
                                    Gestionar
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Attendance Detail Modal with Month Swiper */}
            {selectedStudent && (
                <StudentAttendanceModal 
                    student={selectedStudent}
                    attendances={attendances}
                    onClose={() => setSelectedStudent(null)}
                    onToggle={handleToggleAttendance}
                    loading={loading}
                />
            )}
        </div>
    )
}

interface StudentAttendanceModalProps {
    student: Student
    attendances: AttendanceRecord[]
    onClose: () => void
    onToggle: (studentId: string, day: number, month: number, year: number, notes?: string) => void
    loading: string | null
}

function StudentAttendanceModal({ student, attendances, onClose, onToggle, loading }: StudentAttendanceModalProps) {
    // Current view month within the modal
    const [viewMonth, setViewMonth] = useState(new Date().getMonth())
    const [viewYear, setViewYear] = useState(new Date().getFullYear())
    const [notes, setNotes] = useState('')

    const navigate = (dir: 'prev' | 'next') => {
        if (dir === 'prev') {
            if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); }
            else setViewMonth(viewMonth - 1);
        } else {
            if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); }
            else setViewMonth(viewMonth + 1);
        }
    }

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[100] flex items-center justify-center p-3 sm:p-4">
             <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-lg w-full max-h-[92vh] flex flex-col border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-600 to-purple-700 p-6 text-white relative">
                    <button onClick={onClose} className="absolute right-4 top-4 p-2 hover:bg-white/20 rounded-xl transition-all"><X className="w-6 h-6" /></button>
                    <h2 className="text-xl font-black mb-1">{student.name}</h2>
                    <div className="flex items-center gap-4 mt-4 bg-white/10 p-3 rounded-2xl border border-white/10">
                        <button onClick={() => navigate('prev')} className="hover:bg-white/20 p-2 rounded-lg"><ChevronLeft className="w-5 h-5" /></button>
                        <div className="flex-1 text-center font-black uppercase tracking-widest text-sm">
                            {MONTHS[viewMonth]} {viewYear}
                        </div>
                        <button onClick={() => navigate('next')} className="hover:bg-white/20 p-2 rounded-lg"><ChevronRight className="w-5 h-5" /></button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 no-scrollbar">
                    <CalendarGrid 
                        year={viewYear}
                        month={viewMonth}
                        studentId={student.id}
                        attendances={attendances}
                        onToggle={(sId: string, d: number) => onToggle(sId, d, viewMonth, viewYear, notes)}
                        loading={loading}
                    />
                    <div className="mt-4">
                        <label className="text-[9px] font-black text-gray-400 dark:text-gray-500 uppercase block mb-1">Notas</label>
                        <input
                            type="text"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Agregar notas..."
                            className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                        />
                    </div>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-700 flex justify-end">
                    <button onClick={onClose} className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl">Listo</button>
                </div>
            </div>
        </div>
    )
}

interface CalendarGridProps {
    year: number
    month: number
    studentId: string
    attendances: AttendanceRecord[]
    loading: string | null
    onToggle: (studentId: string, day: number) => void
}

function CalendarGrid({ year, month, studentId, attendances, loading, onToggle }: CalendarGridProps) {
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const firstDayOfMonth = new Date(year, month, 1).getDay()

    const calendarDays: (number | null)[] = []
    for (let i = 0; i < firstDayOfMonth; i++) calendarDays.push(null)
    for (let day = 1; day <= daysInMonth; day++) calendarDays.push(day)

    const today = new Date()
    const isToday = (day: number) => day === today.getDate() && month === today.getMonth() && year === today.getFullYear()

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
                const attendance = attendances.find((a: AttendanceRecord) => a.studentId === studentId && a.date.startsWith(dateStr))
                const isLoadingCell = loading === `${studentId}-${day}`

                return (
                    <button
                        key={day}
                        onClick={() => onToggle(studentId, day)}
                        disabled={isLoadingCell}
                        className={`relative aspect-square rounded-xl flex flex-col items-center justify-center transition-all border-2 ${
                            isLoadingCell ? 'bg-gray-100 dark:bg-gray-700 animate-pulse' :
                            attendance?.present ? 'bg-green-500 border-green-500 text-white shadow-lg' :
                            attendance && !attendance.present ? 'bg-red-500 border-red-500 text-white shadow-lg' :
                            isToday(day) ? 'bg-white dark:bg-gray-800 border-indigo-500 text-indigo-600 shadow-sm' :
                            'bg-gray-50 dark:bg-gray-900 border-transparent text-gray-600 dark:text-gray-400'
                        }`}
                    >
                        <span className="text-sm font-black">{day}</span>
                        {!isLoadingCell && attendance && (
                            <div className="absolute top-1 right-1 bg-white/20 rounded-full p-0.5">
                                {attendance.present ? <Check className="w-2.5 h-2.5 text-white" /> : <X className="w-2.5 h-2.5 text-white" />}
                            </div>
                        )}
                    </button>
                )
            })}
        </div>
    )
}
