'use client'

import { useState } from "react"
import Link from "next/link"
import AssignBookModal from "@/components/AssignBookModal"
import AddSongModal from "@/components/AddSongModal"
import EditBookModal from "@/components/EditBookModal"
import { removeBookFromStudent, toggleBookGraduation } from "@/app/actions/book-assignment"
import { useRouter } from "next/navigation"
import { BookOpen, Plus, Edit, Music, Trash2, GraduationCap, CalendarCheck, Clock } from "lucide-react"
import BookSection from "@/components/BookSection"
import SharePortalButton from "@/components/SharePortalButton"

interface Book {
    id: string
    templateId: string
    title: string
    number: number
    isGraduated: boolean
    graduationDate: Date | null
    songs: Array<{
        id: string
        templateId?: string
        title: string
        order: number
        imageUrl: string | null
        completed: boolean
        learnedLeft: boolean
        learnedRight: boolean
        learnedBoth: boolean
        notes: string | null
        youtubeUrl: string | null
        audioUrl: string | null
        progresses?: Array<{ id: string }>
    }>
}

interface Student {
    id: string
    name: string
    dob: Date | null
    notes: string | null
    accessCode: string | null
    books: Book[]
    attendances?: Array<{
        id: string
        date: string
        present: boolean
        notes?: string | null
    }>
    practiceSessions?: Array<{
        id: string
        date: string
        duration: number
        notes?: string | null
    }>
}

interface StudentDetailClientProps {
    student: Student
}

import { AnimatedList, AnimatedItem } from "@/components/AnimatedList"

export default function StudentDetailClient({ student }: StudentDetailClientProps) {
    const router = useRouter()
    const [showAssignBook, setShowAssignBook] = useState(false)
    const [showAddSong, setShowAddSong] = useState(false)
    const [showEditBook, setShowEditBook] = useState(false)
    const [selectedBook, setSelectedBook] = useState<Book | null>(null)

    const handleEditBook = (book: Book) => {
        setSelectedBook(book)
        setShowEditBook(true)
    }

    const handleAddSong = (book: Book) => {
        setSelectedBook(book)
        setShowAddSong(true)
    }

    const handleRemoveBook = async (assignmentId: string, bookTitle: string) => {
        if (confirm(`¿Estás seguro de que deseas eliminar el libro "${bookTitle}" de este estudiante? Esta acción eliminará todo el progreso asociado.`)) {
            const result = await removeBookFromStudent(assignmentId)
            if (result.success) {
                router.refresh()
            } else {
                alert(result.error || "Error al eliminar el libro")
            }
        }
    }

    const handleToggleGraduation = async (assignmentId: string, bookTitle: string, currentStatus: boolean) => {
        console.log("🖱️ [Client] handleToggleGraduation clicked", { assignmentId, bookTitle, currentStatus })
        const action = currentStatus ? "quitar la graduación" : "graduar"
        if (confirm(`¿Estás seguro de que deseas ${action} al estudiante del libro "${bookTitle}"?`)) {
            console.log("✅ [Client] Confirmed. Calling server action...")
            const result = await toggleBookGraduation(assignmentId)
            console.log("🔙 [Client] Server action result:", result)
            if (result.success) {
                router.refresh()
            } else {
                alert(result.error || "Error al actualizar graduación")
            }
        } else {
            console.log("❌ [Client] Cancelled by user")
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950 transition-colors duration-500">
            {/* Header */}
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm border-b border-gray-100 dark:border-gray-800 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="min-w-0 flex-1">
                            <Link href="/dashboard" className="text-xs sm:text-sm text-indigo-600 dark:text-indigo-400 hover:underline mb-1 sm:mb-2 block font-medium">
                                ← Volver al Dashboard
                            </Link>
                            <div className="flex flex-col min-[450px]:flex-row min-[450px]:items-baseline gap-1 sm:gap-3">
                                <h1 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 truncate">
                                    {student.name}
                                </h1>
                                <p className="text-xs sm:text-base text-gray-500 dark:text-gray-400 font-medium">
                                    {student.dob
                                        ? `${Math.floor((Date.now() - new Date(student.dob).getTime()) / (365 * 24 * 60 * 60 * 1000))} años`
                                        : 'Sin edad'}
                                    {student.notes && ` • ${student.notes}`}
                                </p>
                            </div>
                            
                            {/* Mobile-only compact actions row - Single Row */}
                            <div className="flex sm:hidden items-center gap-1.5 mt-4 w-full">
                                <div className="flex-1 min-w-0">
                                    <SharePortalButton
                                        studentId={student.id}
                                        studentName={student.name}
                                        existingCode={student.accessCode}
                                        compact
                                        showLabel
                                    />
                                </div>
                                <button
                                    onClick={() => setShowAssignBook(true)}
                                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl shadow-md text-[9px] font-black uppercase tracking-tight"
                                >
                                    <Plus className="w-4 h-4 flex-shrink-0" />
                                    <span>Libro</span>
                                </button>
                                <Link
                                    href={`/students/${student.id}/edit`}
                                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 border-2 border-indigo-200 dark:border-indigo-900 text-indigo-700 dark:text-indigo-300 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 shadow-sm"
                                >
                                    <Edit className="w-4 h-4 flex-shrink-0" />
                                    <span className="text-[9px] font-black uppercase tracking-tight">Editar</span>
                                </Link>
                            </div>
                        </div>

                        {/* Desktop buttons Section (hidden on mobile) */}
                        <div className="hidden sm:flex gap-3 flex-wrap">
                            <SharePortalButton
                                studentId={student.id}
                                studentName={student.name}
                                existingCode={student.accessCode}
                            />
                            <button
                                onClick={() => setShowAssignBook(true)}
                                className="px-4 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl transition-all shadow-lg font-medium flex items-center justify-center gap-2"
                            >
                                <BookOpen className="w-4 h-4" />
                                <span className="whitespace-nowrap">Asignar Libro</span>
                            </button>
                            <Link
                                href={`/students/${student.id}/edit`}
                                className="px-4 py-2.5 border-2 border-indigo-200 dark:border-indigo-900 rounded-xl text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all font-medium flex items-center justify-center gap-2"
                            >
                                <Edit className="w-4 h-4" />
                                <span>Editar</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                {student.books.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-12 text-center">
                        <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/40 dark:to-purple-900/40 rounded-full flex items-center justify-center mx-auto mb-6">
                            <BookOpen className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                            No hay libros asignados
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
                            Asigna un libro Suzuki para comenzar a seguir el progreso
                        </p>
                        <button
                            onClick={() => setShowAssignBook(true)}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg font-medium"
                        >
                            <BookOpen className="w-5 h-5" />
                            Asignar Primer Libro
                        </button>
                    </div>
                ) : (
                    <AnimatedList className="space-y-8">
                        {student.books.map(book => (
                            <AnimatedItem key={book.id}>
                                <BookSection
                                    book={book}
                                    studentId={student.id}
                                    onEditBook={handleEditBook}
                                    onAddSong={handleAddSong}
                                    onRemoveBook={handleRemoveBook}
                                    onToggleGraduation={handleToggleGraduation}
                                />
                            </AnimatedItem>
                        ))}
                    </AnimatedList>
                )}

                {/* Attendance History */}
                {student.attendances && student.attendances.length > 0 && (
                    <div className="mt-8">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                            <CalendarCheck className="w-5 h-5 text-indigo-600" />
                            Asistencia Reciente
                        </h3>
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                            <div className="grid grid-cols-7 gap-1">
                                {student.attendances.slice(0, 28).map((a) => (
                                    <div
                                        key={a.id}
                                        className={`aspect-square rounded-lg flex items-center justify-center text-xs font-medium ${
                                            a.present
                                                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                                                : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                                        }`}
                                        title={`${new Date(a.date).toLocaleDateString('es-ES')} - ${a.present ? 'Presente' : 'Ausente'}${a.notes ? ` (${a.notes})` : ''}`}
                                    >
                                        {new Date(a.date).getDate()}
                                    </div>
                                ))}
                            </div>
                            <div className="flex items-center gap-4 mt-4 text-sm">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-green-100 dark:bg-green-900/30 rounded"></div>
                                    <span className="text-gray-600 dark:text-gray-400">Presente</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 bg-red-100 dark:bg-red-900/30 rounded"></div>
                                    <span className="text-gray-600 dark:text-gray-400">Ausente</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Practice History */}
                {student.practiceSessions && student.practiceSessions.length > 0 && (
                    <div className="mt-8">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-amber-600" />
                            Práctica Reciente
                        </h3>
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                            <div className="grid grid-cols-7 gap-1 mb-4">
                                {student.practiceSessions.slice(0, 28).map((p) => (
                                    <div
                                        key={p.id}
                                        className={`aspect-square rounded-lg flex items-center justify-center text-xs font-medium ${
                                            p.duration > 0
                                                ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                                                : 'bg-gray-100 dark:bg-gray-700 text-gray-400'
                                        }`}
                                        title={`${new Date(p.date).toLocaleDateString('es-ES')} - ${p.duration} min${p.notes ? ` (${p.notes})` : ''}`}
                                    >
                                        {new Date(p.date).getDate()}
                                    </div>
                                ))}
                            </div>
                            <div className="flex items-center gap-6 text-sm">
                                <div>
                                    <span className="text-gray-500 dark:text-gray-400">Total: </span>
                                    <span className="font-bold text-gray-900 dark:text-gray-100">
                                        {student.practiceSessions.reduce((acc, p) => acc + p.duration, 0)} min
                                    </span>
                                </div>
                                <div>
                                    <span className="text-gray-500 dark:text-gray-400">Sesiones: </span>
                                    <span className="font-bold text-gray-900 dark:text-gray-100">
                                        {student.practiceSessions.filter(p => p.duration > 0).length}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Modals */}
            <AssignBookModal
                isOpen={showAssignBook}
                onClose={() => setShowAssignBook(false)}
                studentId={student.id}
                studentName={student.name}
            />

            {selectedBook && (
                <>
                    <AddSongModal
                        isOpen={showAddSong}
                        onClose={() => {
                            setShowAddSong(false)
                            setSelectedBook(null)
                        }}
                        bookId={selectedBook.id}
                        bookTitle={selectedBook.title}
                        nextOrder={selectedBook.songs.length + 1}
                    />

                    <EditBookModal
                        isOpen={showEditBook}
                        onClose={() => {
                            setShowEditBook(false)
                            setSelectedBook(null)
                        }}
                        book={{
                            id: selectedBook.id,
                            templateId: selectedBook.templateId || '',
                            title: selectedBook.title,
                            number: selectedBook.number,
                            songCount: selectedBook.songs.length
                        }}
                    />
                </>
            )}
        </div>
    )
}
