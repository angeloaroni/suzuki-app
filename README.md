# Musivo

Plataforma para la gestión de enseñanza musical. Diseñada para profesores y alumnos de cualquier instrumento y metodología.

---

## Características Principales

- **Gestión de Estudiantes**: Seguimiento detallado de cada alumno, su progreso y niveles.
- **Control de Asistencia**: Interfaz intuitiva para marcar la asistencia diaria con visualización de calendario.
- **Repertorio y Canciones**: Sistema interactivo para gestionar las canciones de cada libro.
- **Notas de Progreso**: Registro de avances y observaciones detalladas por cada sesión.
- **Portal para Padres**: Acceso directo y simplificado para que los padres sigan el progreso de sus hijos.
- **Práctica**: Timer y calendario de práctica visible para profesores y padres.
- **Diseño Premium**: Interfaz moderna con modo oscuro y optimización total para dispositivos móviles.

---

## Stack Tecnológico

- **Framework**: [Next.js 13.5 (App Router)](https://nextjs.org/)
- **Base de Datos**: [Prisma ORM](https://www.prisma.io/) + PostgreSQL
- **Estilos**: [Tailwind CSS](https://tailwindcss.com/)
- **Animaciones**: [Framer Motion](https://www.framer.com/motion/)
- **Autenticación**: JWT personalizado con `jose`
- **Iconos**: [Lucide React](https://lucide.dev/)
- **Validación**: [Zod](https://zod.dev/)

---

## Instalación y Desarrollo

1.  **Clonar el repositorio:**
    ```bash
    git clone https://github.com/angeloaroni/suzuki-app.git
    cd suzuki-app
    ```

2.  **Instalar dependencias:**
    ```bash
    npm install
    ```

3.  **Configurar variables de entorno:**
    Crea un archivo `.env` en la raíz (ver `.env.example`).

4.  **Ejecutar base de datos (Prisma):**
    ```bash
    npx prisma generate
    npx prisma db push
    ```

5.  **Iniciar servidor de desarrollo:**
    ```bash
    npm run dev
    ```

---

## Licencia

Este proyecto es privado. Todos los derechos reservados.

---
*Desarrollado con ❤️ por Angelo Aroni*
