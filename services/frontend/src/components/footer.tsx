import { Hospital } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-surface-container-low border-t border-outline-variant/20">
      <div className="flex flex-col md:flex-row justify-between items-center w-full px-2 md:px-12 py-12 max-w-7xl mx-auto gap-6">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <Hospital className="text-primary w-6 h-6" strokeWidth={2} />
          <span className="text-headline-sm font-bold text-primary">
            CESFAM Villa Alemana
          </span>
        </div>

        {/* Links */}
        <nav className="flex flex-wrap justify-center gap-3 md:gap-6">
          <Link 
            to="https://www.gob.cl" 
            target="_blank"
            className="text-label-sm text-on-surface-variant hover:text-secondary transition-opacity opacity-90 hover:opacity-100"
          >
            Gobierno de Chile
          </Link>
          <Link 
            to="#" 
            className="text-label-sm text-on-surface-variant hover:text-secondary transition-opacity opacity-90 hover:opacity-100"
          >
            CMVA
          </Link>
          <Link 
            to="#" 
            className="text-label-sm text-on-surface-variant hover:text-secondary transition-opacity opacity-90 hover:opacity-100"
          >
            Transparencia Activa
          </Link>
          <Link 
            to="#" 
            className="text-label-sm text-on-surface-variant hover:text-secondary transition-opacity opacity-90 hover:opacity-100"
          >
            Privacidad
          </Link>
        </nav>

        {/* Copyright */}
        <div className="text-body-md text-on-surface text-sm opacity-80">
          © {new Date().getFullYear()} Corporacion Municipal de Villa Alemana - Salud
        </div>
      </div>
    </footer>
  )
}
