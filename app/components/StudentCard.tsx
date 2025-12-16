import Link from 'next/link'
import { Calendar, Music } from 'lucide-react'

interface StudentCardProps {
    student: {
        id: string
        name: string
        dob: Date | null
        booksCount: number
        currentSong?: string
        lastUpdated?: Date
    }
}

export default function StudentCard({ student }: StudentCardProps) {
    const age = student.dob
        ? Math.floor((Date.now() - student.dob.getTime()) / (1000 * 60 * 60 * 24 * 365))
        : null

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('es-ES', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        }).format(date)
    }

    return (
        <Link href={`/students/${student.id}`}>
            <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 cursor-pointer border border-gray-100">
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">{student.name}</h3>
                        {age && (
                            <p className="text-sm text-gray-500 flex items-center mt-1">
                                <Calendar className="w-4 h-4 mr-1" />
                                {age} años
                            </p>
                        )}
                    </div>
                    <div className="bg-indigo-100 text-indigo-600 px-3 py-1 rounded-full text-sm font-medium">
                        {student.booksCount} {student.booksCount === 1 ? 'libro' : 'libros'}
                    </div>
                </div>

                {student.currentSong && (
                    <div className="flex items-center text-sm text-gray-600 mb-2">
                        <Music className="w-4 h-4 mr-2 text-indigo-500" />
                        <span className="font-medium">{student.currentSong}</span>
                    </div>
                )}

                {student.lastUpdated && (
                    <p className="text-xs text-gray-400 mt-3">
                        Última actualización: {formatDate(student.lastUpdated)}
                    </p>
                )}
            </div>
        </Link>
    )
}
