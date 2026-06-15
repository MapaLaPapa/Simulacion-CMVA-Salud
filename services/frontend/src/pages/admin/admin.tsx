import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'
import { Hospital, Lock, Mail, AlertCircle, ArrowLeft, Eye, EyeOff } from 'lucide-react'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
        const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
        });

        if (res.ok) {
        navigate('/admin/dashboard');
        } else {
        const errorData = await res.json();
        setError(errorData.error);
        setLoading(false);
        }
    } catch (err) {
        setError('Error al conectar con el servidor.');
        setLoading(false);
    }
    }

  return (
    <div className="min-h-screen bg-primary-container flex items-center justify-center p-4">
      <div className="w-full ">
        {/* Link volver */}
        <Link 
          to="/"
          className="inline-flex items-center gap-2 text-on-primary-container/80 hover:text-on-primary-container mb-6 transition-colors text-label-md"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al inicio
        </Link>

        {/* Card de login */}
        <div className="bg-surface-container-lowest rounded-xl shadow-lg border border-outline-variant/30 p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="bg-secondary/10 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Hospital className="h-8 w-8 text-secondary" />
            </div>
            <h1 className="text-headline-md text-primary">Panel de Administracion</h1>
            <p className="text-body-md text-on-surface-variant mt-1">CESFAM Villa Alemana</p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-label-md text-on-surface mb-2">
                Correo Electronico
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-on-surface-variant" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="correo@cesfam.cl"
                  className="w-full pl-10 pr-4 py-3 border border-outline-variant rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary bg-surface-container-lowest text-body-md"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-label-md text-on-surface mb-2">
                Contrasena
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-on-surface-variant" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ingrese su contrasena"
                  className="w-full pl-10 pr-12 py-3 border border-outline-variant rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary bg-surface-container-lowest text-body-md"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-error-container text-on-error-container px-4 py-3 rounded-lg flex items-start gap-3 text-label-sm">
                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-secondary text-on-secondary py-3 rounded-lg text-label-md hover:bg-secondary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>

          <p className="text-label-sm text-on-surface-variant text-center mt-6">
            Credenciales de prueba: admin@cesfam.cl / admin123
          </p>
        </div>
      </div>
    </div>
  )
}
