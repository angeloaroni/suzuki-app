"use client"

import { useState, useTransition } from "react"
import { addSuzukiBookToStudent } from "@/app/actions/book"
import { useRouter } from "next/navigation"

export default function AddBookButtons({ studentId, existingBookNumbers }: { studentId: string, existingBookNumbers: number[] }) {
    const [isPending, startTransition] = useTransition()
    const router = useRouter()

    const handleAddBook = (bookNumber: number) => {
        startTransition(async () => {
            await addSuzukiBookToStudent(studentId, bookNumber)
            router.refresh()
        })
    }

    return (
        <div className="flex gap-4 mt-4">
            {[1, 2, 3].map((num) => (
                !existingBookNumbers.includes(num) && (
                    <button
                        key={num}
                        onClick={() => handleAddBook(num)}
                        disabled={isPending}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
                    >
                        {isPending ? "Añadiendo..." : `Añadir Libro ${num}`}
                    </button>
                )
            ))}
        </div>
    )
}
