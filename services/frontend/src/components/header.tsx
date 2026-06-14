import { Link, useLocation } from 'react-router-dom';
import { useState } from "react"
import { Menu, X, Hospital, ArrowRight } from "lucide-react"

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation() // Lee la URL actual

  // Función mágica para evaluar si el botón coincide con la URL
  const isActive = (path: string) => {
    if (path.includes('#')) {
      return location.pathname + location.hash === path;
    }
    return location.pathname === path;
  };

  return (
    <header className="bg-surface/95 sticky top-0 z-50 border-b border-outline-variant/30 shadow-sm backdrop-blur-md">
      <div className="flex justify-between items-center w-full px-2 md:px-12 max-w-7xl mx-auto h-20">
        
        <Link to="/" className="flex items-center gap-3">
          <Hospital className="text-secondary w-8 h-8" strokeWidth={2} />
          <span className="text-headline-sm font-bold text-primary tracking-tight">
            CESFAM Villa Alemana
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link 
            to="/" 
            className={`text-label-md transition-colors duration-200 ${
              isActive('/') 
                ? 'text-secondary font-bold border-b-2 border-secondary' 
                : 'text-on-surface-variant hover:text-secondary'
            }`}
          >
            Inicio
          </Link>
          <Link 
            to="/nosotros" 
            className={`text-label-md transition-colors duration-200 ${
              isActive('/nosotros') 
                ? 'text-secondary font-bold border-b-2 border-secondary' 
                : 'text-on-surface-variant hover:text-secondary'
            }`}
          >
            Nosotros
          </Link>
          <Link 
            to="/agendar" 
            className={`text-label-md transition-colors duration-200 ${
              isActive('/agendar') 
                ? 'text-secondary font-bold border-b-2 border-secondary' 
                : 'text-on-surface-variant hover:text-secondary'
            }`}
          >
            Agendar Hora
          </Link>
          <Link 
            to="/faq" 
            className={`text-label-md transition-colors duration-200 ${
              isActive('/faq') 
                ? 'text-secondary font-bold border-b-2 border-secondary' 
                : 'text-on-surface-variant hover:text-secondary'
            }`}
          >
            Preguntas Frecuentes
          </Link>
        </nav>

        {/* CTA Button */}
        <div className="hidden md:flex items-center">
          <Link
            to="/portal-paciente"
            className="bg-secondary text-on-secondary text-label-md px-6 py-3 rounded-lg hover:bg-secondary/90 transition-colors shadow-sm flex items-center gap-1"
          >
            Mi Portal
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 text-on-surface"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-outline-variant/30 bg-surface">
          <nav className="flex flex-col p-4 gap-4">
            <Link
              to="/nosotros"
              className={`text-label-md py-2 transition-colors ${
                isActive('/nosotros') ? 'text-secondary font-bold' : 'text-on-surface-variant hover:text-secondary'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Nosotros
            </Link>
            <Link
              to="/agendar"
              className={`text-label-md py-2 transition-colors ${
                isActive('/agendar') ? 'text-secondary font-bold' : 'text-on-surface-variant hover:text-secondary'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Agendar Hora
            </Link>
            <Link
              to="/mis-citas"
              className={`text-label-md py-2 transition-colors ${
                isActive('/mis-citas') ? 'text-secondary font-bold' : 'text-on-surface-variant hover:text-secondary'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Mis Citas
            </Link>
            <Link
              to="/faq"
              className={`text-label-md py-2 transition-colors ${
                isActive('/faq') ? 'text-secondary font-bold' : 'text-on-surface-variant hover:text-secondary'
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Preguntas Frecuentes
            </Link>
            <Link
              to="/admin"
              className="bg-secondary text-on-secondary text-label-md px-6 py-3 rounded-lg hover:bg-secondary/90 transition-colors shadow-sm flex items-center justify-center gap-1 mt-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Mi Portal
              <ArrowRight className="w-4 h-4" />
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}