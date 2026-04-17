---
description: Pautas de Diseño e Interacción UI/UX (PRO Level)
---

# UI / UX Design Guidelines

Este flujo de trabajo asegura que Suzuki Tracker mantenga un diseño "World-Class" premium, estético e intuitivo.

## Identidad y Estética Visual 🎨
- **Colores Premium:** Refina constantemente las variables `indigo`, `purple` y acentos visuales vibrantes (`emerald`, `amber`). Las llamadas a la acción (CTAs) principales siempre deben contrastar contundentemente con fondos sutilmente oscurecidos.
- **Glassmorphism y Profundidad:** Donde se presenten popups o cabeceras fijas (`Sticky`), usa efectos translucidos discretos tipo `backdrop-blur-md bg-white/80` (y su contraparte limpia en Dark Mode, ej: `bg-gray-900/80`).

## Interacciones e Indicadores (Feedback Loop) 🔄
- **Animaciones Suaves (Framer Motion):** Cada lista que soporte altas mutaciones (Ej. Re-ordenamientos, eliminaciones, creaciones de alumnos/libros) DEBE usar componentes como `<AnimatePresence>` para dar una noción sólida de hacia o desde dónde va el elemento.
- **Feedback Constante:** Toda acción exitosa guardada (o fallida) en el servidor debe comunicar visualmente qué pasó usando un Toast Notifications estilizado o actualizaciones optimistas. Evita abusar de los nativos e intrusivos `alert()` de Javascript.

## Experiencia Móvil (Mobile-first en mente) 📱
- **Áreas táctiles (Touch Targets):** Asegura que todo botón de acción en lista o navegación en celular contenga al menos un pad de `44px x 44px`.
- **Botón Flotante (FAB):** Para tareas principales (Agegar Notas de Práctica, Asignar Requisitos Rápidos), fomenta interactuar usando Floating Action Buttons en la parte inferior para rápido acceso dactilar y prevenir superposición en la barra de navegación.

## Gamificación 🏆
- Agrega elementos de gozo en la práctica. Usar íconos que denotan progreso completado o estrellas/recompensas visuales por hitos de estudiante para que el método Suzuki sea divertido de seguir día con día en la app.
