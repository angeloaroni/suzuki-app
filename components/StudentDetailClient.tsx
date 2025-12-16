'use client'

import { useState } from "react"
import Link from "next/link"
import SongCard from "@/components/SongCard"
import AssignBookModal from "@/components/AssignBookModal"
import AddSongModal from "@/components/AddSongModal"
import EditBookModal from "@/components/EditBookModal"
import { removeBookFromStudent, toggleBookGraduation } from "@/app/actions/book-assignment"
import { BookOpen, Plus, Edit, Music, Trash2, GraduationCap } from "lucide-react"

interface Book {
    id: string
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
        const action = currentStatus ? "quitar la graduación" : "graduar"
        if (confirm(`¿Estás seguro de que deseas ${action} al estudiante del libro "${bookTitle}"?`)) {
            const result = await toggleBookGraduation(assignmentId)
            if (result.success) {
                window.location.reload()
            } else {
                alert(result.error || "Error al actualizar graduación")
            }
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
            {/* Header */}
            <div className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <Link href="/dashboard" className="text-sm text-indigo-600 hover:underline mb-2 block font-medium">
                                ← Volver al Dashboard
                            </Link>
                            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                                {student.name}
                            </h1>
                            <p className="text-gray-600 mt-1">
                                {student.dob
                                    ? `Edad: ${Math.floor((Date.now() - new Date(student.dob).getTime()) / (365 * 24 * 60 * 60 * 1000))} años`
                                    : 'Sin fecha de nacimiento'}
                                {student.notes && ` • ${student.notes}`}
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowAssignBook(true)}
                                className="px-4 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl transition-all shadow-lg font-medium flex items-center gap-2"
                            >
                                <BookOpen className="w-4 h-4" />
                                Asignar Libro
                            </button>
                            <Link
                                href={`/students/${student.id}/edit`}
                                className="px-4 py-2.5 border-2 border-indigo-200 rounded-xl text-indigo-700 hover:bg-indigo-50 transition-all font-medium flex items-center gap-2"
                            >
                                <Edit className="w-4 h-4" />
                                Editar
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
                        <div key={book.id} className="mb-12">
                            {/* Book Header */}
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                                        <BookOpen className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                            {book.title}
                                            {book.isGraduated && (
                                                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full font-medium flex items-center gap-1">
                                                    <GraduationCap className="w-3 h-3" />
                                                    Graduado
                                                </span>
                                            )}
                                        </h2>
                                        <p className="text-sm text-gray-600">
                                            {book.songs.length} canciones
                                            {book.isGraduated && book.graduationDate && (
                                                <span className="ml-2 text-yellow-700">
                                                    • {new Date(book.graduationDate).toLocaleDateString()}
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleToggleGraduation(book.id, book.title, book.isGraduated)}
                                        className={`p-2 rounded-xl transition-all border ${book.isGraduated
                                            ? 'bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-200'
                                            : 'text-gray-400 hover:bg-gray-50 border-transparent hover:border-gray-200'}`}
                                        title={book.isGraduated ? "Graduado (Click para deshacer)" : "Marcar como graduado"}
                                    >
                                        <GraduationCap className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => handleRemoveBook(book.id, book.title)}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100"
                                        title="Eliminar libro"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => handleAddSong(book)}
                                        className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl hover:bg-indigo-100 transition-all font-medium flex items-center gap-2"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Agregar Canción
                                    </button>
                                    <button
                                        onClick={() => handleEditBook(book)}
                                        className="px-4 py-2 bg-gray-50 text-gray-700 rounded-xl hover:bg-indigo-100 transition-all font-medium flex items-center gap-2"
                                    >
                                        <Edit className="w-4 h-4" />
                                        Editar Libro
                                    </button>
                                </div>
                            </div>

                            {/* Songs Grid */}
                            {book.songs.length === 0 ? (
                                <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-8 text-center">
                                    <Music className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                    <p className="text-gray-600 mb-4">No hay canciones en este libro</p>
                                    <button
                                        onClick={() => handleAddSong(book)}
                                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                                    >
                                        Agregar Primera Canción
                                    </button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                    {book.songs.map(song => (
                                        <SongCard
                                            key={song.id}
                                            studentId={student.id}
                                            song={{
                                                id: song.id,
                                                templateId: song.templateId,
                                                title: song.title,
                                                imageUrl: song.imageUrl,
                                                completed: song.completed,
                                                learnedLeft: song.learnedLeft,
                                                learnedRight: song.learnedRight,
                                                learnedBoth: song.learnedBoth,
                                                notes: song.notes,
                                                youtubeUrl: song.youtubeUrl,
                                                audioUrl: song.audioUrl,
                                                progressNotesCount: song.progresses?.length ?? 0
                                            }}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
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
