import { z } from "zod"

export const createStudentSchema = z.object({
    name: z.string().min(1, "El nombre es obligatorio").max(100),
    dob: z.string().optional(),
    notes: z.string().max(500).optional(),
    instrument: z.string().max(50).optional(),
})

export const updateStudentSchema = z.object({
    name: z.string().min(1, "El nombre es obligatorio").max(100),
    dob: z.string().optional(),
    notes: z.string().max(500).optional(),
    instrument: z.string().max(50).optional(),
})

export const loginSchema = z.object({
    email: z.string().email("Email inválido"),
    password: z.string().min(1, "La contraseña es requerida"),
})

export const registerSchema = z.object({
    name: z.string().min(1, "El nombre es obligatorio").max(100),
    email: z.string().email("Email inválido"),
    password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
})

export const createBookTemplateSchema = z.object({
    title: z.string().min(1, "El título es obligatorio").max(200),
    number: z.number().int().positive("El número debe ser positivo"),
    coverImage: z.string().optional(),
    instrument: z.string().max(50).optional(),
    songs: z.array(z.object({
        title: z.string().min(1),
        order: z.number().int().positive(),
    })),
})

export const progressSchema = z.object({
    studentSongId: z.string().uuid(),
    metric1: z.number().int().min(0).max(100),
    metric2: z.number().int().min(0).max(100),
    metric3: z.number().int().min(0).max(100),
    note: z.string().max(500).optional(),
})

export const practiceSessionSchema = z.object({
    accessCode: z.string().min(1),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de fecha inválido"),
    duration: z.number().int().min(1).max(480),
    notes: z.string().max(500).optional(),
})
