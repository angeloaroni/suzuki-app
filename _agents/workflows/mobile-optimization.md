---
description: Mejores prácticas para optimización móvil y layouts compactos en Suzuki App.
---

# Mobile Optimization & Compact Layouts Guide 📱

Este flujo asegura que la aplicación sea altamente usable en dispositivos pequeños, maximizando el espacio sin sacrificar la estética premium.

## Principios de Diseño Móvil 🛠️

### 1. Stats y Grillas Compactas
- **Grid dinámico:** Evita `grid-cols-1` para elementos de información rápida (stats). Usa `grid-cols-2` o incluso `grid-cols-3` si el contenido es numérico o icónico.
- **Micro-padding:** Reduce rellenos de `p-6` a `p-3` o `p-4` en móviles.
- **Tipografía adaptativa:** Usa `text-xs` o `text-[10px]` para labels secundarios y `text-xl` para valores destacados.

### 2. Header de Estudiante Optimizado
- **Layout de una línea:** Intenta agrupar acciones (botones) y metadatos (edad, notas) en una sola fila visual si es posible.
- **Botones de Icono:** En móviles, prioriza botones `icon-only` con fondos sutiles (`bg-opacity-10`) para ahorrar espacio horizontal.
- **Zonas de Toque:** Mantener un área mínima de `44px` (o usar paddings generosos en botones pequeños) para facilitar el clic.

### 3. Reducción de Espacio Vertical (White Space Control)
- **Sticky Headers:** Usa headers con `backdrop-blur` pero mantén su altura mínima.
- **Evitar Botones Full-Width:** A menos que sea un CTA crítico (como "Guardar"), prefiere botones compactos alineados para evitar que el contenido importante sea empujado fuera de la pantalla.

## Implementación en Suzuki Tracker 🚀
- **Dashboard:** Las fichas de resumen deben usar `grid-cols-2` para permitir ver más de un vistazo.
- **Perfil Estudiante:** Las opciones de "Portal", "Asignar" y "Editar" deben vivir al lado de la descripción en una fila compacta.
