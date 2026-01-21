'use client'

import { useState } from "react"
import Link from "next/link"
import AssignBookModal from "@/components/AssignBookModal"
import AddSongModal from "@/components/AddSongModal"
import EditBookModal from "@/components/EditBookModal"
import { removeBookFromStudent, toggleBookGraduation } from "@/app/actions/book-assignment"
import { BookOpen, Plus, Edit, Music, Trash2, GraduationCap } from "lucide-react"
import BookSection from "@/components/BookSection"

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
    books: Book[]
}

interface StudentDetailClientProps {
    student: Student
}

export default function StudentDetailClient({ student }: StudentDetailClientProps) {
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
                window.location.reload()
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
                window.location.reload()
            } else {
                alert(result.error || "Error al actualizar graduación")
            }
        } else {
            console.log("❌ [Client] Cancelled by user")
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
            {/* Header */}
            <div className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="min-w-0">
                            <Link href="/dashboard" className="text-xs sm:text-sm text-indigo-600 hover:underline mb-1 sm:mb-2 block font-medium">
                                ← Volver al Dashboard
                            </Link>
                            <h1 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 truncate">
                                {student.name}
                            </h1>
                            <p className="text-sm sm:text-base text-gray-600 mt-1 line-clamp-2 sm:line-clamp-none">
                                {student.dob
                                    ? `Edad: ${Math.floor((Date.now() - new Date(student.dob).getTime()) / (365 * 24 * 60 * 60 * 1000))} años`
                                    : 'Sin fecha de nacimiento'}
                                {student.notes && ` • ${student.notes}`}
                            </p>
                        </div>
                        <div className="flex gap-2 sm:gap-3">
                            <button
                                onClick={() => setShowAssignBook(true)}
                                className="flex-1 sm:flex-none px-3 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl transition-all shadow-lg font-medium flex items-center justify-center gap-2 text-sm sm:text-base"
                            >
                                <BookOpen className="w-4 h-4" />
                                <span className="whitespace-nowrap">Asignar Libro</span>
                            </button>
                            <Link
                                href={`/students/${student.id}/edit`}
                                className="flex-1 sm:flex-none px-3 sm:px-4 py-2 sm:py-2.5 border-2 border-indigo-200 rounded-xl text-indigo-700 hover:bg-indigo-50 transition-all font-medium flex items-center justify-center gap-2 text-sm sm:text-base"
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
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                        <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <BookOpen className="w-10 h-10 text-indigo-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                            No hay libros asignados
                        </h3>
                        <p className="text-gray-500 mb-8 max-w-md mx-auto">
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
                    student.books.map(book => (
                        <BookSection
                            key={book.id}
                            book={book}
                            studentId={student.id}
                            onEditBook={handleEditBook}
                            onAddSong={handleAddSong}
                            onRemoveBook={handleRemoveBook}
                            onToggleGraduation={handleToggleGraduation}
                        />
                    ))
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
