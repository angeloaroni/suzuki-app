# 🎻 SuzukiTracker 2.0

¡Bienvenido a **SuzukiTracker**, la plataforma definitiva para la gestión de la enseñanza del Método Suzuki! Esta aplicación ha sido diseñada para ofrecer una experiencia premium, dinámica y eficiente tanto para profesores como para padres.

---

## ✨ Características Principales

- **👨‍🎓 Gestión de Estudiantes**: Seguimiento detallado de cada alumno, su progreso y niveles.
- **📅 Control de Asistencia**: Interfaz intuitiva y rápida para marcar la asistencia diaria con visualización de calendario.
- **🎵 Repertorio y Canciones**: Sistema de tarjetas interactivas (tipo acordeón) para gestionar las canciones de cada libro de Suzuki.
- **📝 Notas de Progreso**: Registro de avances y observaciones detalladas por cada sesión.
- **🌐 Portal para Padres**: Acceso directo y simplificado para que los padres sigan el progreso de sus hijos sin complicaciones de login.
- **🎨 Diseño Premium**: Interfaz moderna con animaciones fluidas (Framer Motion), modo oscuro y optimización total para dispositivos móviles.

---

## 🛠️ Stack Tecnológico

SuzukiTracker utiliza las tecnologías más modernas para garantizar velocidad y escalabilidad:

- **Framework**: [Next.js 13.5 (App Router)](https://nextjs.org/)
- **Base de Datos**: [Prisma ORM](https://www.prisma.io/)
- **Estilos**: [Tailwind CSS](https://tailwindcss.com/)
- **Animaciones**: [Framer Motion](https://www.framer.com/motion/)
- **Autenticación**: [NextAuth.js](https://next-auth.js.org/)
- **Iconos**: [Lucide React](https://lucide.dev/)
- **Manejo de Formularios/Esquemas**: [Zod](https://zod.dev/)

---

## 🚀 Instalación y Desarrollo

Para ejecutar el proyecto localmente:

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

## 🤖 Antigravity 2.0 - Agentes

Este proyecto está optimizado para trabajar con el ecosistema de **Antigravity**. Contiene flujos de trabajo personalizados y habilidades para acelerar el desarrollo:

- **Workflows**: Ubicados en `_agents/workflows/`
  - `/mobile-optimization`: Optimización para UX móvil.
  - `/nextjs-best-practices`: Estándares de nivel PRO para Next.js.
  - `/ui-ux-design`: Pautas de diseño premium.

---

## 📄 Licencia

Este proyecto es privado. Todos los derechos reservados.

---
*Desarrollado con ❤️ por Angelo Aroni con la ayuda de Antigravity 2.0*
