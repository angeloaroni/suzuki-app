---
name: Next.js Pro
description: Estándares avanzados para el desarrollo en Next.js dentro de SuzukiTracker.
---

# Next.js Pro Skill

Esta habilidad asegura que el código siga los mejores patrones de Next.js (App Router) y React.

## 🏗️ Arquitectura de Componentes

1. **Server vs Client**: Priorizar Server Components para la carga de datos. Usar Client Components (`'use client'`) solo cuando sea estrictamente necesario para interactividad o hooks de cliente.
2. **Server Actions**: Utilizar Server Actions para todas las mutaciones de datos (Prisma). Están ubicadas en `app/actions/`.
3. **Manejo de Estados**: Evitar prop drilling. Usar contextos de React o estados locales bien definidos.

## ⚡ Rendimiento y Optimización

1. **Streaming**: Usar `loading.tsx` y `Suspense` para estados de carga parciales.
2. **Caché**: Aprovechar el `cache` de React y `revalidatePath` para mantener los datos frescos sin sobrecargar la base de datos.
3. **Imágenes**: Siempre usar `next/image` con las propiedades `width`, `height` o `fill` adecuadas.

## 🛡️ Seguridad y Tipado

- **Zod**: Validar siempre los inputs de las Server Actions con esquemas de Zod.
- **TypeScript**: No usar `any`. Definir interfaces claras para los tipos de Prisma y props de componentes.
