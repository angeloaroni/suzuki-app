import Link from "next/link";
import { ArrowRight, Music, GraduationCap, BarChart3 } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex flex-col font-sans">
      {/* Header */}
      <header className="fixed w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex-shrink-0 flex items-center justify-center">
                <Music className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg sm:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 truncate">
                SuzukiTracker
              </span>
            </div>
            <nav className="flex items-center gap-2 sm:gap-4 ml-2">
              <Link
                href="/login"
                className="text-xs sm:text-sm md:text-base text-gray-600 hover:text-indigo-600 font-medium transition-colors whitespace-nowrap"
              >
                Iniciar Sesión
              </Link>
              <Link
                href="/register"
                className="px-3 py-2 sm:px-5 sm:py-2.5 bg-indigo-600 text-white rounded-full font-medium hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transform hover:-translate-y-0.5 text-xs sm:text-sm md:text-base whitespace-nowrap"
              >
                Registrarse
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 font-medium text-sm mb-8 animate-fade-in-up">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              Nuevo: Gestión de repertorio completa
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 mb-8 tracking-tight leading-tight">
              Domina el método <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
                Suzuki
              </span> paso a paso
            </h1>

            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              La herramienta definitiva para profesores y alumnos. Gestiona el progreso,
              organiza el repertorio y celebra cada pequeña victoria en el camino musical.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-20">
              <Link
                href="/dashboard"
                className="px-8 py-4 bg-indigo-600 text-white text-lg font-semibold rounded-full hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 hover:shadow-2xl hover:shadow-indigo-300 transform hover:-translate-y-1 flex items-center gap-2"
              >
                Comenzar Ahora <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/about"
                className="px-8 py-4 bg-white text-gray-700 text-lg font-semibold rounded-full hover:bg-gray-50 transition-all border border-gray-200 shadow-sm hover:shadow-md flex items-center gap-2"
              >
                Saber más
              </Link>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
              <FeatureCard
                title="Gestión de Alumnos"
                description="Organiza a tus estudiantes, asigna libros y personaliza su aprendizaje de forma intuitiva."
                icon={<GraduationCap className="w-6 h-6 text-white" />}
                color="bg-blue-500"
              />
              <FeatureCard
                title="Seguimiento Detallado"
                description="Registra el progreso de cada mano y visualiza el avance en tiempo real."
                icon={<BarChart3 className="w-6 h-6 text-white" />}
                color="bg-purple-500"
              />
              <FeatureCard
                title="Repertorio Digital"
                description="Accede a todo el repertorio Suzuki y gestiona el estado de cada pieza."
                icon={<Music className="w-6 h-6 text-white" />}
                color="bg-pink-500"
              />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gray-900 rounded flex items-center justify-center">
              <Music className="w-3 h-3 text-white" />
            </div>
            <span className="font-bold text-gray-900">SuzukiTracker</span>
          </div>
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} SuzukiTracker. Hecho con ❤️ para músicos.
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ title, description, icon, color }: { title: string, description: string, icon: React.ReactNode, color: string }) {
  return (
    <div className="group bg-white p-8 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-indigo-100 relative overflow-hidden">
      <div className={`w-12 h-12 ${color} rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
        {icon}
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors">{title}</h3>
      <p className="text-gray-500 leading-relaxed">{description}</p>

      <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-gradient-to-br from-gray-50 to-gray-100 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500 z-0"></div>
    </div>
  );
}
