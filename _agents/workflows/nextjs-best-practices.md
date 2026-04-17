---
description: Mejores prácticas y arquitectura para desarrollo en Next.js (PRO Level)
---

# Next.js & React Best Practices (Nivel PRO)

Este flujo de trabajo guía las decisiones arquitectónicas para que el proyecto escale manteniéndose rápido, confiable y mantenible.

## Arquitectura de Componentes
- **Separación Client/Server:** Usa Server Components intermitentes (`page.tsx`, `layout.tsx`) para la obtención inicial de datos con Prisma y pasa la data a componentes del cliente (`ClientComponent.tsx`) que requieran interactividad.
- **Micro-componentes:** Si un componente sobrepasa las 250 líneas, considera extraer su lógica a sub-componentes especializados u hooks personalizados.

## Gestión de Datos (Next.js 13+ App Router)
- **Server Actions:** Toda mutación o inserción a base de datos debe hacerse usando Server Actions con validación sólida. Evita API Routes clásicos a menos que lo requiera un webhook externo.
- **Validación Zod:** Toda entrada que provenga de un formulario o cliente debe estar respaldada y validada estrictamente por esquemas Zod en el Server Action antes de interactuar con Prisma.

## Rendimiento y Accesibilidad
- **Imágenes:** Emplea siempre `next/image` (`<Image />`) para automatizar el WebP, Lazy Loading y la generación de "blur" en marcadores visuales (blurDataURL).
- **Esqueletos de Carga:** Donde sea pertinente, usa `loading.tsx` y `Suspense` para renderizar *Skeletons* de estado de carga y mejorar el LCP (Largest Contentful Paint).

## Manejo Visual
- Configura todas tus propiedades recurrentes (colores corporativos, bordes, animaciones) extendiendo `tailwind.config.js`.
- Evita usar utilidades mágicas como `w-[245px]`. Aprovecha las variables estandarizadas.

## Refactorización de Server Actions
// turbo
1. Al crear nuevas validaciones, ubícalas siempre en `lib/validations/`.
// turbo
2. Usa `revalidatePath` en cada mutación de datos exitosa para que Next.js actualice la memoria de interfaz del usuario de inmediato sin refrescos de navegador molestos.
