import { useState, useEffect } from 'react';
import { Link , useLocation} from 'react-router-dom';
import { 
  Search, Loader2, AlertCircle, Calendar, 
  Users, Stethoscope, Hospital, LogOut, Clock, CheckCircle2, ChevronDown, 
  LayoutList,
  BarChart
} from 'lucide-react';


interface BloqueAgenda {
  id_bloque: number;
  cesfam: string;
  fecha_hora_inicio: string;
  box: string;
  estado: string;          
  rut_medico: string;
  nombre_medico: string;
  apellido_medico: string;
  especialidad: string;
  id_cita: number | null;
  rut_paciente: string | null;
  nombre_paciente: string | null;
  apellido_paciente: string | null;
  estado_final: string;    
}


type EstadoConfig = {
  [key: string]: { label: string; color: string; dotColor: string };
};

const estadoConfig: EstadoConfig = {
  disponible: { label: 'Disponible', color: 'bg-green-50 text-green-700', dotColor: 'bg-green-500' },
  reservada: { label: 'Reservada', color: 'bg-amber-100 text-amber-800', dotColor: 'bg-amber-500' },
  confirmada: { label: 'Confirmada', color: 'bg-secondary-fixed/50 text-on-secondary-fixed-variant', dotColor: 'bg-secondary' },
  cancelada: { label: 'Cancelada', color: 'bg-error-container text-on-error-container', dotColor: 'bg-error' },
  asistida: { label: 'Asistida', color: 'bg-tertiary-fixed/50 text-on-tertiary-fixed', dotColor: 'bg-tertiary' },
  inasistida: { label: 'No Asiste', color: 'bg-red-100 text-red-800', dotColor: 'bg-red-600' }
};


export default function DashboardAdmin() {
  
  const [agenda, setAgenda] = useState<BloqueAgenda[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const location = useLocation();
  
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [filtroEspecialidad, setFiltroEspecialidad] = useState('todas');

  const [alerta, setAlerta] = useState<{ tipo: 'exito' | 'error' | 'info', texto: string } | null>(null);
  
  const cargarAgenda = async () => {
    try {
        setLoading(true);
        const res = await fetch(`/api/admin/agenda-completa`);
        if (!res.ok) throw new Error('Error al cargar la agenda');
        
        const data = await res.json();
        
        setAgenda(data.agenda);
        
        
    } catch (err) {
        setError('No se pudo conectar con el servidor.');
    } finally {
        setLoading(false);
    }
};

  useEffect(() => {
    cargarAgenda();
    }, []);

    const mostrarAlerta = (tipo: 'exito' | 'error' | 'info', texto: string) => {
      setAlerta({ tipo, texto });
      setTimeout(() => {
        setAlerta(null);
      }, 5000);
    };

    const actualizarEstadoCita = async (idCita: number, nuevoEstado: string) => {
    try {
        const citaActual = agenda.find(item => item.id_cita === idCita);
        
        if (!citaActual || !citaActual.id_bloque) {
            mostrarAlerta('error', "Error: No se encontró el bloque asociado a esta cita.");
            return;
        }

        const respuesta = await fetch(`/api/admin/citas/${idCita}/estado`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                estado_final: nuevoEstado,       
                id_bloque: citaActual.id_bloque  
            })
        });

        if (respuesta.ok) {
            setAgenda(prevAgenda => 
                prevAgenda.map(bloque => 
                    bloque.id_cita === idCita ? { ...bloque, estado_final: nuevoEstado } : bloque
                )
            );
            mostrarAlerta('exito', "Estado actualizado con éxito");
        } else {
            mostrarAlerta('error', "Error al actualizar el estado en el servidor");
        }
    } catch (error) {
        mostrarAlerta('error', "Error de conexión con el servidor");
    }
};

  const agendaFiltrada = agenda.filter((bloque) => {
    
    const term = busqueda.toLowerCase().replace(/[\.\-]/g, '');
    const matchRut = bloque.rut_paciente?.replace(/[\.\-]/g, '').includes(term) || 
                     bloque.rut_medico?.replace(/[\.\-]/g, '').includes(term);
    const matchNombre = `${bloque.nombre_paciente} ${bloque.apellido_paciente}`.toLowerCase().includes(term) || 
                        `${bloque.nombre_medico} ${bloque.apellido_medico}`.toLowerCase().includes(term);
    const pasaBusqueda = !busqueda || matchRut || matchNombre;

    
    const estadoReal = bloque.estado === 'DISPONIBLE' ? 'disponible' : 'confirmada';
    const pasaEstado = filtroEstado === 'todos' || bloque.estado_final === filtroEstado;

    
    const pasaEspecialidad = filtroEspecialidad === 'todas' || bloque.especialidad === filtroEspecialidad;

    return pasaBusqueda && pasaEstado && pasaEspecialidad;
  });
  
  const especialidadesUnicas = [...new Set(agenda.map(b => b.especialidad))];
  
  const hoyStr = new Date().toISOString().split('T')[0]; 
  const citasTotales = agenda.filter(b => b.estado === 'RESERVADO');
  const citasHoy = citasTotales.filter(b => b.fecha_hora_inicio.startsWith(hoyStr));
  const bloquesDisponibles = agenda.filter(b => b.estado === 'DISPONIBLE'); 


  const formatearFecha = (isoString: string) => {
    return new Date(isoString).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' });
  };
  const formatearHora = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin h-10 w-10 text-primary" /></div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-error"><AlertCircle className="h-10 w-10 mr-2" />{error}</div>;

  return (
    <div className="min-h-screen bg-background">

      {/* COMPONENTE DE ALERTA FLOTANTE */}
      {alerta && (
          <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-[100] flex items-center gap-3 px-6 py-4 rounded-lg shadow-lg transition-all border ${
              alerta.tipo === 'error' ? 'bg-red-50 border-red-200 text-red-800' : 
              alerta.tipo === 'exito' ? 'bg-green-50 border-green-200 text-green-800' : 
              'bg-blue-50 border-blue-200 text-blue-800'
          }`}>
              {alerta.tipo === 'error' && <AlertCircle className="h-5 w-5" />}
              {alerta.tipo === 'exito' && <CheckCircle2 className="h-5 w-5" />}
              {alerta.tipo === 'info' && <AlertCircle className="h-5 w-5" />}
              <p className="font-medium text-sm">{alerta.texto}</p>
              <button 
                  onClick={() => setAlerta(null)}
                  className="ml-4 text-gray-400 hover:text-gray-600"
              >
                  &times;
              </button>
          </div>
      )}
      {/* FIN DE LA ALERTA */}

      {/* Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-primary-container hidden lg:block">
        <div className="p-6">
          <Link to="/" className="flex items-center gap-3">
            <div className="bg-secondary/20 p-2 rounded-lg">
              <Hospital className="h-6 w-6 text-on-primary-container" />
            </div>
            <div>
              <h1 className="text-headline-sm text-on-primary-container font-bold">CESFAM</h1>
              <p className="text-label-sm text-on-primary-container/70">Villa Alemana</p>
            </div>
          </Link>
        </div>

        <nav className="px-4 space-y-1"> 
          <Link 
            to="/admin/dashboard" 
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-label-md transition-all ${
              location.pathname === '/admin/dashboard' 
                ? 'bg-secondary/20 text-on-primary-container font-bold'
                : 'text-on-primary-container/70 hover:bg-secondary/10 hover:text-on-primary-container'
            }`}
          >
            <LayoutList className="h-5 w-5" />
            Gestión de Citas
          </Link>
          
          <Link 
            to="/admin/stats" 
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-label-md transition-all ${
              location.pathname === '/admin/stats' 
                ? 'bg-secondary/20 text-on-primary-container font-bold'
                : 'text-on-primary-container/70 hover:bg-secondary/10 hover:text-on-primary-container'
            }`}
          >
            <BarChart className="h-5 w-5" />
            Estadísticas
          </Link>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-on-primary-container/10">
          <div className="flex items-center gap-3 px-2 mb-4">
            <div className="w-10 h-10 bg-secondary/20 rounded-full flex items-center justify-center">
              <span className="text-label-md text-on-primary-container font-medium">AD</span>
            </div>
            <div>
              <p className="text-label-md text-on-primary-container font-medium">Administrador</p>
              <p className="text-label-sm text-on-primary-container/70">admin@cesfam.cl</p>
            </div>
          </div>
          <Link to="/" className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-secondary/10 transition-colors text-on-primary-container/70 hover:text-on-primary-container text-label-md">
            <LogOut className="h-4 w-4" />
            Cerrar Sesión
          </Link>
        </div>
      </aside>

      {/* Header mobile */}
      <header className="lg:hidden bg-primary-container p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Hospital className="h-6 w-6 text-on-primary-container" />
          <span className="text-headline-sm text-on-primary-container font-bold">CESFAM Admin</span>
        </div>
        <Link to="/" className="p-2 text-on-primary-container">
          <LogOut className="h-5 w-5" />
        </Link>
      </header>

      {/* Contenido principal */}
      <main className="lg:ml-64 p-4 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Título */}
          <div className="mb-8">
            <h1 className="text-headline-md text-primary">Gestión de Citas</h1>
            <p className="text-body-md text-on-surface-variant mt-1">
              Administre las citas médicas del CESFAM
            </p>
          </div>

          {/* Estadísticas (Calculadas automáticamente) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-secondary" />
                </div>
                <div>
                  <p className="text-headline-md text-primary font-bold">{citasHoy.length}</p>
                  <p className="text-label-sm text-on-surface-variant">Citas Hoy</p>
                </div>
              </div>
            </div>

            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                  <Clock className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-headline-md text-primary font-bold">{bloquesDisponibles.length}</p>
                  <p className="text-label-sm text-on-surface-variant">Cupos Libres</p>
                </div>
              </div>
            </div>

            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-secondary-fixed/30 rounded-lg flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-secondary" />
                </div>
                <div>
                  <p className="text-headline-md text-primary font-bold">{citasTotales.length}</p>
                  <p className="text-label-sm text-on-surface-variant">Confirmadas</p>
                </div>
              </div>
            </div>

            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-fixed/30 rounded-lg flex items-center justify-center">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-headline-md text-primary font-bold">{agenda.length}</p>
                  <p className="text-label-sm text-on-surface-variant">Total Agenda</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filtros */}
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-4 mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-on-surface-variant" />
                <input
                  type="text"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Buscar por paciente, RUT o profesional..."
                  className="w-full pl-10 pr-4 py-2.5 border border-outline-variant rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary bg-surface-container-lowest text-body-md"
                />
              </div>

              <div className="relative">
                <select
                  title="Filtro por estado"
                  value={filtroEstado}
                  onChange={(e) => setFiltroEstado(e.target.value)}
                  className="appearance-none bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2.5 pr-10 focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary text-body-md"
                >
                  <option value="todos">Todos los estados</option>
                  <option value="disponible">Disponibles</option>
                  <option value="confirmada">Confirmadas</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant pointer-events-none" />
              </div>

              <div className="relative">
                <select
                  title="Filtro por especialidad"
                  value={filtroEspecialidad}
                  onChange={(e) => setFiltroEspecialidad(e.target.value)}
                  className="appearance-none bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2.5 pr-10 focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary text-body-md"
                >
                  <option value="todas">Todas las especialidades</option>
                  {especialidadesUnicas.map(esp => (
                    <option key={esp} value={esp}>{esp}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Tabla de citas */}
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 overflow-hidden">
            
            {/* Desktop table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-surface-container-low border-b border-outline-variant/30">
                  <tr>
                    <th className="text-left px-6 py-4 text-label-md text-on-surface-variant">Paciente</th>
                    <th className="text-left px-6 py-4 text-label-md text-on-surface-variant">Especialidad</th>
                    <th className="text-left px-6 py-4 text-label-md text-on-surface-variant">Profesional</th>
                    <th className="text-left px-6 py-4 text-label-md text-on-surface-variant">Fecha y Hora</th>
                    <th className="text-left px-6 py-4 text-label-md text-on-surface-variant">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/30">
                  {agendaFiltrada.length === 0 ? (
                    <tr><td colSpan={5} className="px-6 py-8 text-center text-on-surface-variant">No se encontraron resultados</td></tr>
                  ) : (
                    agendaFiltrada.map((bloque) => {
                      const config = estadoConfig[bloque.estado_final] || estadoConfig.reservada;

                      return (
                        <tr key={bloque.id_bloque} className="hover:bg-surface-container-low/50 transition-colors">
                          <td className="px-6 py-4">
                            {bloque.id_cita ? (
                              <div>
                                <p className="text-body-md text-on-surface font-medium">{bloque.nombre_paciente} {bloque.apellido_paciente}</p>
                                <p className="text-label-sm text-on-surface-variant">{bloque.rut_paciente}</p>
                              </div>
                            ) : (
                              <span className="text-on-surface-variant/50 italic">Sin agendar</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 text-body-md text-on-surface">
                              <Stethoscope className="h-4 w-4 text-on-surface-variant" />
                              {bloque.especialidad}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-body-md text-on-surface">Dr(a). {bloque.nombre_medico} {bloque.apellido_medico}</p>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <p className="text-body-md text-on-surface">{formatearFecha(bloque.fecha_hora_inicio)}</p>
                              <p className="text-label-sm text-on-surface-variant">{formatearHora(bloque.fecha_hora_inicio)} hrs • {bloque.box}</p>
                            </div>
                          </td>
                          {/* Reemplaza la celda de estado en la tabla desktop por esta: */}
                            <td className="px-6 py-4">
                            {bloque.id_cita ? (
                                <div className="relative inline-block">
                                <select
                                    title='Cambiar estado'
                                    value={bloque.estado_final}
                                    onChange={(e) => actualizarEstadoCita(bloque.id_cita!, e.target.value)}
                                    className={`appearance-none pl-3 pr-8 py-1 rounded-full text-label-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 border-none cursor-pointer ${config.color}`}
                                >
                                    <option value="reservada">Reservada</option>
                                    <option value="confirmada">Confirmada</option>
                                    <option value="cancelada">Cancelada</option>
                                    <option value="asistida">Asistida</option>
                                    <option value="inasistida">No Asiste</option>
                                </select>
                                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 pointer-events-none opacity-50" />
                                </div>
                            ) : (
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-label-sm ${config.color}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${config.dotColor}`}></span>
                                {config.label}
                                </span>
                            )}
                            </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="lg:hidden divide-y divide-outline-variant/30">
              {agendaFiltrada.length === 0 ? (
                <div className="p-8 text-center text-on-surface-variant">No se encontraron resultados</div>
              ) : (
                agendaFiltrada.map((bloque) => {
                  const config = estadoConfig[bloque.estado_final] || estadoConfig.reservada;

                  return (
                    <div key={bloque.id_bloque} className="p-4">
                      {/* Busca donde se renderiza el estado en la card móvil y reemplázalo: */}
                        <div className="flex items-start justify-between mb-3">
                        <div>
                            {bloque.id_cita ? (
                            <>
                                <p className="text-body-md text-on-surface font-medium">{bloque.nombre_paciente} {bloque.apellido_paciente}</p>
                                <p className="text-label-sm text-on-surface-variant">{bloque.rut_paciente}</p>
                            </>
                            ) : (
                            <p className="text-body-md text-on-surface-variant italic">Bloque sin agendar</p>
                            )}
                        </div>
                        
                        {/* Selector dinámico para móvil */}
                        {bloque.id_cita ? (
                            <div className="relative">
                            <select
                                title='Cambiar estado'
                                value={bloque.estado_final}
                                onChange={(e) => actualizarEstadoCita(bloque.id_cita!, e.target.value)}
                                className={`appearance-none pl-3 pr-8 py-1.5 rounded-full text-label-sm font-medium border-none ${config.color}`}
                            >
                                <option value="reservada">Reservada</option>
                                <option value="confirmada">Confirmada</option>
                                <option value="cancelada">Cancelada</option>
                                <option value="asistida">Asistida</option>
                                <option value="inasistida">No Asiste</option>
                            </select>
                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 pointer-events-none opacity-50" />
                            </div>
                        ) : (
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-label-sm ${config.color}`}>
                            {config.label}
                            </span>
                        )}
                        </div>
                      
                      <div className="space-y-1 text-body-md mb-3">
                        <p className="flex items-center gap-2 text-on-surface">
                          <Stethoscope className="h-4 w-4 text-on-surface-variant" />
                          {bloque.especialidad}
                        </p>
                        <p className="text-on-surface-variant ml-6">
                          Dr(a). {bloque.nombre_medico} {bloque.apellido_medico}
                        </p>
                        <p className="flex items-center gap-2 text-on-surface mt-2">
                          <Calendar className="h-4 w-4 text-on-surface-variant" />
                          {formatearFecha(bloque.fecha_hora_inicio)} a las {formatearHora(bloque.fecha_hora_inicio)} hrs
                        </p>
                        <p className="text-label-sm text-on-surface-variant ml-6">
                          {bloque.cesfam} • {bloque.box}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            
          </div>
        </div>
      </main>
    </div>
  );
}