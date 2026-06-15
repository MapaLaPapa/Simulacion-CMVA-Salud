'use client'

import { useState } from 'react'
import { Header } from '../components/header'
import { Footer } from '../components/footer'
import { 
  Search, Calendar, Clock, User, AlertCircle, CheckCircle2, 
  XCircle, Loader2, Stethoscope, Edit2, Save, X, Mail, KeyRound, ArrowLeft
} from 'lucide-react'

// Interfaces 
interface CitaPaciente {
  id_cita: number;
  fecha_hora_inicio: string;
  especialidad: string;
  nombre_medico: string;
  apellido_medico: string;
  estado_cita: string;
  cesfam: string;
  box: string;
}

interface DatosPaciente {
  rut: string;
  nombre: string;
  apellido: string;
  telefono: string;
  email: string;
  citas: CitaPaciente[];
}

const estadoConfig: Record<string, any> = {
  'RESERVADA': { label: 'Reservada', color: 'bg-amber-100 text-amber-800', icon: Clock },
  'CONFIRMADA': { label: 'Confirmada', color: 'bg-secondary-fixed/50 text-on-secondary-fixed-variant', icon: CheckCircle2 },
  'CANCELADA': { label: 'Cancelada', color: 'bg-error-container text-on-error-container', icon: XCircle },
  'ASISTIDA': { label: 'Asistida', color: 'bg-tertiary-fixed/50 text-on-tertiary-fixed', icon: CheckCircle2 },
  'INASISTIDA': { label: 'No Asiste', color: 'bg-red-100 text-red-800', icon: AlertCircle }
}


export default function MisCitasPage() {
  // Estados de flujo (1: Pedir RUT, 2: Pedir Código, 3: Dashboard)
  const [paso, setPaso] = useState<1 | 2 | 3>(1);
  
  // Estados de validación
  const [rut, setRut] = useState('');
  const [codigo, setCodigo] = useState('');
  const [correoOculto, setCorreoOculto] = useState('');
  const [errorGlobal, setErrorGlobal] = useState('');
  const [cargando, setCargando] = useState(false);
  
  // Estado de datos
  const [paciente, setPaciente] = useState<DatosPaciente | null>(null);

  // Estados edición
  const [editando, setEditando] = useState(false);
  const [formData, setFormData] = useState({ telefono: '', email: '' });
  const [guardando, setGuardando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState('');

  // Utilidades
  const formatearRut = (rut: string) => {
    const actual = rut.replace(/^0+/, "");
    if (actual != '' && actual.length > 1) {
      const sinPuntos = actual.replace(/\./g, "");
      const actualLimpio = sinPuntos.replace(/-/g, "");
      const inicio = actualLimpio.substring(0, actualLimpio.length - 1);
      const rutPuntos = inicio.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
      return `${rutPuntos}-${actualLimpio.substring(actualLimpio.length - 1)}`;
    }
    return actual;
  };

  const handleRutChange = (value: string) => {
    const limpio = value.replace(/[^0-9kK]/gi, '').toUpperCase();
    
    if (limpio.length > 9) return;
    
    setRut(limpio);
  };  

  const formatearFecha = (isoString: string) => new Date(isoString).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' });
  const formatearHora = (isoString: string) => new Date(isoString).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });

  // PASO 1: Solicitar envío de código
  const solicitarCodigo = async () => {
    if (rut.length < 8) {
      setErrorGlobal('El RUT ingresado no es válido');
      return;
    }

    setCargando(true);
    setErrorGlobal('');
    
    try {
      // POST al backend para generar y enviar el código
      const res = await fetch(`/api/pacientes/solicitar-codigo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rut })
      });
      
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al conectar con el servidor');
      }
      
      // Si todo sale bien, avanzamos al paso 2 y mostramos el correo oculto
      setCorreoOculto(data.correoOculto);
      setPaso(2);
      
    } catch (err: any) {
      setErrorGlobal(err.message);
    } finally {
      setCargando(false);
    }
  }

  // PASO 2: Verificar el código ingresado
  const verificarCodigo = async () => {
    if (codigo.length !== 6) {
      setErrorGlobal('El código debe tener 6 dígitos');
      return;
    }

    setCargando(true);
    setErrorGlobal('');

    try {
      const res = await fetch(`/api/pacientes/verificar-codigo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rut, codigo })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Código incorrecto o expirado');
      }

      // Si el código es correcto, el backend nos devuelve el perfil completo
      setPaciente(data);
      setFormData({ telefono: data.telefono, email: data.email });
      setPaso(3); // ¡Bienvenido al Dashboard!

    } catch (err: any) {
      setErrorGlobal(err.message);
    } finally {
      setCargando(false);
    }
  }

  // PASO 3: Guardar nuevos datos de contacto
  const guardarDatosContacto = async () => {
    setGuardando(true);
    setMensajeExito('');
    setErrorGlobal('');

    try {
      // Nota: Idealmente el backend debería pedir un token de sesión aquí también, 
      // pero para simplificar usaremos el RUT y el mismo código validado antes
      const res = await fetch(`/api/pacientes/${rut}/contacto`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, codigo_verificacion: codigo }) 
      });

      if (!res.ok) throw new Error('No se pudieron actualizar los datos');

      setPaciente(prev => prev ? { ...prev, telefono: formData.telefono, email: formData.email } : null);
      setEditando(false);
      setMensajeExito('Datos actualizados correctamente');
      setTimeout(() => setMensajeExito(''), 3000);
      
    } catch (err: any) {
      setErrorGlobal(err.message);
    } finally {
      setGuardando(false);
    }
  }

  const hoyStr = new Date().toISOString();
  const citasProximas = paciente?.citas.filter(c => 
    c.fecha_hora_inicio >= hoyStr && (c.estado_cita === 'RESERVADA' || c.estado_cita === 'CONFIRMADA')
  ).sort((a, b) => new Date(a.fecha_hora_inicio).getTime() - new Date(b.fecha_hora_inicio).getTime()) || [];

  const citasPasadas = paciente?.citas.filter(c => 
    c.fecha_hora_inicio < hoyStr || c.estado_cita === 'ASISTIDA' || c.estado_cita === 'INASISTIDA' || c.estado_cita === 'CANCELADA'
  ).sort((a, b) => new Date(b.fecha_hora_inicio).getTime() - new Date(a.fecha_hora_inicio).getTime()) || [];


  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 py-8 md:py-12 bg-surface flex flex-col items-center">
        <div className="w-full max-w-3xl px-4 md:px-12">
          
          <h1 className="text-headline-md text-primary text-center mb-2">Portal del Paciente</h1>
          
          {/* VISTA 1: INGRESO DE RUT */}
          {paso === 1 && (
            <div className=" mx-auto mt-8">
              <p className="text-body-md text-on-surface-variant text-center mb-8">
                Ingrese su RUT para acceder a sus citas programadas
              </p>
              <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-6 shadow-sm">
                <label className="block text-label-md text-on-surface mb-2">RUT del Paciente</label>
                <input
                  type="text"
                  // 1. AQUÍ llamas a formatearRut (solo para la vista)
                  value={formatearRut(rut)} 
                  
                  // 2. AQUÍ llamas al limpiador
                  onChange={(e) => handleRutChange(e.target.value)} 
                  
                  placeholder="12.345.678-9"
                  className="w-full px-4 py-3 border border-outline-variant rounded-lg focus:ring-2 focus:ring-secondary/50 focus:border-secondary"
              />
                
                {errorGlobal && (
                  <p className="mb-4 text-label-sm text-error flex items-center justify-center gap-2">
                    <AlertCircle className="h-4 w-4" /> {errorGlobal}
                  </p>
                )}

                <button
                  onClick={solicitarCodigo}
                  disabled={rut.length < 8 || cargando}
                  className="w-full bg-primary text-on-primary px-6 py-3 rounded-lg text-label-md hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
                >
                  {cargando ? <Loader2 className="h-5 w-5 animate-spin" /> : <Mail className="h-5 w-5" />}
                  Enviar código de acceso
                </button>
              </div>
            </div>
          )}

          {/* VISTA 2: VERIFICACIÓN DE CÓDIGO */}
          {paso === 2 && (
            <div className="mx-auto mt-8 text-center">
               <button 
                onClick={() => { setPaso(1); setCodigo(''); setErrorGlobal(''); }}
                className="mb-6 flex items-center gap-2 text-primary hover:underline text-label-sm mx-auto"
               >
                 <ArrowLeft className="h-4 w-4" /> Volver atrás
               </button>

              <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-8 shadow-sm">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <KeyRound className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-headline-sm text-on-surface mb-2">Verificación de Identidad</h2>
                <p className="text-body-md text-on-surface-variant mb-6">
                  Hemos enviado un código de 6 dígitos a su correo electrónico registrado:<br/>
                  <strong className="text-primary">{correoOculto}</strong>
                </p>

                <input
                  type="text"
                  maxLength={6}
                  value={codigo}
                  onChange={(e) => {
                    setCodigo(e.target.value.replace(/\D/g, ''));
                    setErrorGlobal('');
                  }}
                  placeholder="000000"
                  className="w-full px-4 py-3 border border-outline-variant rounded-lg focus:ring-2 focus:ring-secondary/50 focus:border-secondary bg-surface-container-lowest text-headline-md tracking-[0.5em] text-center mb-4"
                  onKeyDown={(e) => e.key === 'Enter' && verificarCodigo()}
                />

                {errorGlobal && (
                  <p className="mb-4 text-label-sm text-error flex items-center justify-center gap-2">
                    <AlertCircle className="h-4 w-4" /> {errorGlobal}
                  </p>
                )}

                <button
                  onClick={verificarCodigo}
                  disabled={codigo.length !== 6 || cargando}
                  className="w-full bg-secondary text-on-secondary px-6 py-3 rounded-lg text-label-md hover:bg-secondary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
                >
                  {cargando ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle2 className="h-5 w-5" />}
                  Verificar y Entrar
                </button>
              </div>
            </div>
          )}

          {/* VISTA 3: DASHBOARD DEL PACIENTE */}
          {paso === 3 && paciente && (
            <div className="space-y-6 mt-4">
              
              <div className="bg-secondary-fixed/20 rounded-xl p-5 border border-secondary-fixed/30 relative shadow-sm">
                {!editando ? (
                  <button 
                    onClick={() => setEditando(true)}
                    className="absolute top-4 right-4 p-2 text-secondary hover:bg-secondary/10 rounded-full transition-colors"
                    title="Editar información"
                  >
                    <Edit2 className="h-5 w-5" />
                  </button>
                ) : null}

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center shrink-0">
                    <User className="h-6 w-6 text-secondary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-headline-sm text-primary">{paciente.nombre} {paciente.apellido}</p>
                    <p className="text-label-sm text-on-surface-variant mb-3">RUT: {paciente.rut}</p>
                    
                    {editando ? (
                      <div className="mt-4 space-y-3 ">
                        <div>
                          <label className="text-label-sm text-on-surface">Teléfono</label>
                          <input 
                            title='Nuevo Telefono'
                            type="text" 
                            value={formData.telefono} 
                            onChange={e => setFormData({...formData, telefono: e.target.value})}
                            className="w-full px-3 py-2 border border-outline-variant rounded mt-1 text-body-md"
                          />
                        </div>
                        <div>
                          <label className="text-label-sm text-on-surface">Correo Electrónico</label>
                          <input 
                            title='Nuevo Correo'
                            type="email" 
                            value={formData.email} 
                            onChange={e => setFormData({...formData, email: e.target.value})}
                            className="w-full px-3 py-2 border border-outline-variant rounded mt-1 text-body-md"
                          />
                        </div>
                        
                        {errorGlobal && <p className="text-error text-label-sm">{errorGlobal}</p>}
                        
                        <div className="flex gap-2 pt-2">
                          <button 
                            onClick={guardarDatosContacto}
                            disabled={guardando}
                            className="flex items-center gap-1 bg-secondary text-white px-3 py-1.5 rounded text-label-sm hover:bg-secondary/90 disabled:opacity-50"
                          >
                            {guardando ? <Loader2 className="h-4 w-4 animate-spin"/> : <Save className="h-4 w-4" />}
                            Guardar
                          </button>
                          <button 
                            onClick={() => {
                              setEditando(false);
                            setFormData({ telefono: paciente.telefono, email: paciente.email });
                              setErrorGlobal('');
                            }}
                            className="flex items-center gap-1 bg-surface-container border border-outline text-on-surface px-3 py-1.5 rounded text-label-sm hover:bg-surface-container-high"
                          >
                            <X className="h-4 w-4" /> Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="flex flex-col sm:flex-row gap-4 text-body-md text-on-surface">
                          <p>📞 {paciente.telefono || 'Sin registrar'}</p>
                          <p>✉️ {paciente.email || 'Sin registrar'}</p>
                        </div>
                        {mensajeExito && (
                          <p className="mt-2 text-label-sm text-secondary flex items-center gap-1">
                            <CheckCircle2 className="h-4 w-4" /> {mensajeExito}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* CITAS PRÓXIMAS */}
              <div>
                <h2 className="text-headline-sm text-primary mb-4 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-secondary" />
                  Citas Próximas ({citasProximas.length})
                </h2>
                {citasProximas.length === 0 ? (
                  <div className="bg-surface-container-low rounded-xl p-8 text-center border border-outline-variant/30">
                    <Calendar className="h-12 w-12 mx-auto mb-4 text-on-surface-variant/50" />
                    <p className="text-body-md text-on-surface-variant">No tiene citas programadas</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {citasProximas.map((cita) => {
                      const estado = estadoConfig[cita.estado_cita] || estadoConfig['RESERVADA'];
                      const EstadoIcon = estado.icon;
                      return (
                        <div key={cita.id_cita} className="bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-5 shadow-sm">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-start gap-4">
                              <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center shrink-0">
                                <Stethoscope className="h-6 w-6 text-secondary" />
                              </div>
                              <div>
                                <h3 className="text-headline-sm text-primary text-lg">{cita.especialidad}</h3>
                                <p className="text-body-md text-on-surface-variant">Dr(a). {cita.nombre_medico} {cita.apellido_medico}</p>
                                <div className="flex flex-wrap items-center gap-4 mt-2 text-label-sm text-on-surface-variant">
                                  <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />{formatearFecha(cita.fecha_hora_inicio)}</span>
                                  <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{formatearHora(cita.fecha_hora_inicio)} hrs</span>
                                  <span className="flex items-center gap-1 font-medium">{cita.cesfam} • {cita.box}</span>
                                </div>
                              </div>
                            </div>
                            <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-label-sm ${estado.color}`}>
                              <EstadoIcon className="h-4 w-4" />
                              {estado.label}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* HISTORIAL */}
              {citasPasadas.length > 0 && (
                <div>
                  <h2 className="text-headline-sm text-on-surface-variant mb-4 flex items-center gap-2">
                    <Clock className="h-5 w-5" /> Historial de Citas
                  </h2>
                  <div className="space-y-3">
                    {citasPasadas.map((cita) => {
                      const estado = estadoConfig[cita.estado_cita] || estadoConfig['RESERVADA'];
                      const EstadoIcon = estado.icon;
                      return (
                        <div key={cita.id_cita} className="bg-surface-container-low border border-outline-variant/20 rounded-lg p-4">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div>
                              <p className="text-label-md text-on-surface font-medium">{cita.especialidad}</p>
                              <p className="text-label-sm text-on-surface-variant">
                                Dr(a). {cita.nombre_medico} {cita.apellido_medico} - {formatearFecha(cita.fecha_hora_inicio)} {formatearHora(cita.fecha_hora_inicio)}
                              </p>
                            </div>
                            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-label-sm ${estado.color}`}>
                              <EstadoIcon className="h-3.5 w-3.5" />
                              {estado.label}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </main>
      <Footer />
    </div>
  )
}