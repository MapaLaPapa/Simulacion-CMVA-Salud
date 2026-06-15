import { useState, useEffect, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Loader2, AlertCircle, Hospital, LogOut, LayoutList, 
  BarChart3, Activity, Users, Globe, PhoneForwarded, Target,
  BarChart
} from 'lucide-react';

interface BloqueAgenda {
  fecha_hora_inicio: string;
  rut_paciente: string | null;
  origen_reserva: string | null;
  especialidad: string;
  estado_final: string;
}

interface EstadisticasCitas {
  origen: {
    WEB: number;
    IVR: number;
  };
  especialidades: Record<string, number>;
  asistencia: {
    asistida: number;
    inasistida: number;
    reservada: number;
    confirmada: number;
  };
  ocupacion: {
    total: number;
    agendados: number;
  };
}


export default function DashboardStats() {
  const [agendaCompleta, setAgendaCompleta] = useState<BloqueAgenda[]>([]);
  const [filtroTiempo, setFiltroTiempo] = useState<'historico' | 'mensual' | 'diario'>('mensual');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const location = useLocation();

  const cargarEstadisticas = async () => {
    try {
        setLoading(true);
        const res = await fetch(`/api/admin/agenda-completa`);
        if (!res.ok) throw new Error('Error al cargar estadísticas');
        
        const data = await res.json();
        setAgendaCompleta(data.agenda); 
        
    } catch (err) {
        setError('No se pudo conectar con el servidor.');
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    cargarEstadisticas();
  }, []);

  // --- CEREBRO: Cálculo de estadísticas al vuelo según el filtro ---
  const estadisticas = useMemo(() => {
    if (!agendaCompleta || agendaCompleta.length === 0) return null;

    const hoy = new Date();
    const mesActual = hoy.getMonth();
    const anioActual = hoy.getFullYear();
    // Ajuste de zona horaria simple para Chile obteniendo YYYY-MM-DD local
    const diaActual = new Date(hoy.getTime() - (hoy.getTimezoneOffset() * 60000)).toISOString().split('T')[0];

    // 1. Filtrar
    const agendaFiltrada = agendaCompleta.filter(item => {
        if (!item.fecha_hora_inicio) return false;
        if (filtroTiempo === 'historico') return true;

        const fechaItem = new Date(item.fecha_hora_inicio);
        if (filtroTiempo === 'mensual') {
            return fechaItem.getMonth() === mesActual && fechaItem.getFullYear() === anioActual;
        }
        if (filtroTiempo === 'diario') {
            return item.fecha_hora_inicio.startsWith(diaActual);
        }
        return true;
    });

    // 2. Acumular
    const stats: EstadisticasCitas = {
        origen: { WEB: 0, IVR: 0 },
        especialidades: {},
        asistencia: { asistida: 0, inasistida: 0, reservada: 0, confirmada: 0 },
        ocupacion: { total: agendaFiltrada.length, agendados: 0 }
    };

    agendaFiltrada.forEach(item => {
        if (item.rut_paciente) stats.ocupacion.agendados++;
        
        if (item.origen_reserva) {
            const origen = item.origen_reserva.toUpperCase() as 'WEB' | 'IVR';
            if (stats.origen[origen] !== undefined) stats.origen[origen]++;
        }
        
        if (item.rut_paciente && item.especialidad) {
            stats.especialidades[item.especialidad] = (stats.especialidades[item.especialidad] || 0) + 1;
        }
        
        const estado = item.estado_final?.toLowerCase() as keyof typeof stats.asistencia;
        if (stats.asistencia[estado] !== undefined) stats.asistencia[estado]++;
    });

    return stats;
  }, [agendaCompleta, filtroTiempo]);

  // Early returns después de los hooks
  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin h-10 w-10 text-primary" /></div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-error"><AlertCircle className="h-10 w-10 mr-2" />{error}</div>;
  if (!estadisticas) return <div className="min-h-screen flex items-center justify-center text-on-surface-variant">No hay datos disponibles para este periodo</div>;

  // --- CÁLCULOS MATEMÁTICOS PARA LOS GRÁFICOS ---
  const totalAsistencia = estadisticas.asistencia.asistida + estadisticas.asistencia.inasistida;
  const tasaAsistencia = totalAsistencia > 0 ? Math.round((estadisticas.asistencia.asistida / totalAsistencia) * 100) : 0;
  
  const tasaOcupacion = estadisticas.ocupacion.total > 0 ? Math.round((estadisticas.ocupacion.agendados / estadisticas.ocupacion.total) * 100) : 0;
  
  const totalOrigen = estadisticas.origen.WEB + estadisticas.origen.IVR;
  const webPct = totalOrigen > 0 ? Math.round((estadisticas.origen.WEB / totalOrigen) * 100) : 0;
  const fonoPct = totalOrigen > 0 ? Math.round((estadisticas.origen.IVR / totalOrigen) * 100) : 0;

  // Ordenar especialidades de mayor a menor demanda
  const especialidadesOrdenadas = Object.entries(estadisticas.especialidades)
    .sort(([, a], [, b]) => b - a);

  return (
    <div className="min-h-screen bg-background">

      {/* Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-primary-container hidden lg:block border-r border-outline-variant/20">
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
          
          <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-headline-md text-primary flex items-center gap-3">
                <Activity className="h-8 w-8 text-secondary" />
                Métricas de Gestión
              </h1>
              <p className="text-body-md text-on-surface-variant mt-1">
                Análisis de rendimiento y comportamiento de pacientes
              </p>
            </div>

            {/* BOTONES DE FILTRO DE TIEMPO */}
            <div className="flex bg-surface-container-lowest p-1.5 rounded-xl border border-outline-variant/30 shadow-sm w-fit">
              <button 
                onClick={() => setFiltroTiempo('diario')}
                className={`px-5 py-2 rounded-lg text-label-md transition-all duration-200 ${
                  filtroTiempo === 'diario' 
                  ? 'bg-primary text-on-primary shadow-md' 
                  : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-high'
                }`}
              >
                Hoy
              </button>
              <button 
                onClick={() => setFiltroTiempo('mensual')}
                className={`px-5 py-2 rounded-lg text-label-md transition-all duration-200 ${
                  filtroTiempo === 'mensual' 
                  ? 'bg-primary text-on-primary shadow-md' 
                  : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-high'
                }`}
              >
                Este Mes
              </button>
              <button 
                onClick={() => setFiltroTiempo('historico')}
                className={`px-5 py-2 rounded-lg text-label-md transition-all duration-200 ${
                  filtroTiempo === 'historico' 
                  ? 'bg-primary text-on-primary shadow-md' 
                  : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-high'
                }`}
              >
                Histórico
              </button>
            </div>
          </div>

          {/* KPIs Principales */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            
            {/* Ocupación */}
            <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/30 shadow-sm">
              <p className="text-label-md text-on-surface-variant mb-2 flex items-center gap-2">
                <Target className="h-4 w-4" /> Ocupación de Agenda
              </p>
              <div className="flex items-end gap-2 mb-4">
                <h3 className="text-display-sm font-bold text-primary">{tasaOcupacion}%</h3>
                <p className="text-label-sm text-on-surface-variant mb-2">
                  ({estadisticas.ocupacion.agendados} de {estadisticas.ocupacion.total} cupos)
                </p>
              </div>
              <div className="w-full bg-surface-container-high h-2.5 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ${tasaOcupacion > 80 ? 'bg-secondary' : 'bg-primary'}`} 
                  style={{ width: `${tasaOcupacion}%` }} 
                />
              </div>
            </div>

            {/* Asistencia */}
            <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/30 shadow-sm">
              <p className="text-label-md text-on-surface-variant mb-2 flex items-center gap-2">
                <Users className="h-4 w-4" /> Efectividad de Asistencia
              </p>
              <div className="flex items-end gap-2 mb-4">
                <h3 className="text-display-sm font-bold text-primary">{tasaAsistencia}%</h3>
                <p className="text-label-sm text-error mb-2">
                  ({estadisticas.asistencia.inasistida} inasistencias)
                </p>
              </div>
              <div className="w-full bg-surface-container-high h-2.5 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ${tasaAsistencia < 70 ? 'bg-error' : 'bg-tertiary'}`} 
                  style={{ width: `${tasaAsistencia}%` }} 
                />
              </div>
            </div>

            {/* Total */}
            <div className="bg-primary text-on-primary p-6 rounded-3xl shadow-md flex flex-col justify-center relative overflow-hidden">
                <div className="absolute -right-4 -bottom-4 opacity-10">
                    <BarChart3 className="w-32 h-32" />
                </div>
                <p className="text-label-md opacity-80 mb-1">Total Pacientes Atendidos</p>
                <h3 className="text-display-md font-bold">{estadisticas.asistencia.asistida}</h3>
                <p className="text-label-sm opacity-80 mt-2">
                  {filtroTiempo === 'diario' ? 'En el día de hoy' : filtroTiempo === 'mensual' ? 'En el mes actual' : 'En todo el registro'}
                </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Gráfico de Origen (Web vs Asterisk) */}
            <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/30 shadow-sm">
              <h3 className="text-title-lg text-primary mb-6 border-b border-outline-variant/30 pb-4">
                Canales de Reserva
              </h3>
              
              <div className="space-y-6">
                {/* Canal Web */}
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 rounded-lg"><Globe className="h-5 w-5 text-blue-600" /></div>
                      <div>
                        <p className="text-label-md text-on-surface">Portal Web</p>
                        <p className="text-body-sm text-on-surface-variant">{estadisticas.origen.WEB} reservas</p>
                      </div>
                    </div>
                    <span className="text-title-md font-bold text-primary">{webPct}%</span>
                  </div>
                  <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                    <div className="bg-blue-500 h-full transition-all duration-1000" style={{ width: `${webPct}%` }} />
                  </div>
                </div>

                {/* Canal Fono */}
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-teal-50 rounded-lg"><PhoneForwarded className="h-5 w-5 text-teal-600" /></div>
                      <div>
                        <p className="text-label-md text-on-surface">Central Telefónica (IVR)</p>
                        <p className="text-body-sm text-on-surface-variant">{estadisticas.origen.IVR} reservas</p>
                      </div>
                    </div>
                    <span className="text-title-md font-bold text-primary">{fonoPct}%</span>
                  </div>
                  <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                    <div className="bg-teal-500 h-full transition-all duration-1000" style={{ width: `${fonoPct}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Demanda por Especialidad */}
            <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/30 shadow-sm">
              <h3 className="text-title-lg text-primary mb-6 border-b border-outline-variant/30 pb-4">
                Demanda por Especialidad
              </h3>
              
              <div className="space-y-5">
                {especialidadesOrdenadas.length === 0 ? (
                    <p className="text-on-surface-variant text-center py-4">No hay datos de demanda aún.</p>
                ) : (
                    especialidadesOrdenadas.map(([nombre, cantidad]) => {
                        const porcentaje = Math.round((cantidad / estadisticas.ocupacion.agendados) * 100) || 0;
                        return (
                            <div key={nombre}>
                                <div className="flex justify-between text-label-md mb-2">
                                    <span className="text-on-surface font-medium">{nombre}</span>
                                    <span className="text-on-surface-variant">{cantidad} citas ({porcentaje}%)</span>
                                </div>
                                <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
                                    <div 
                                        className="bg-secondary/60 h-full rounded-full transition-all duration-1000" 
                                        style={{ width: `${porcentaje}%` }} 
                                    />
                                </div>
                            </div>
                        );
                    })
                )}
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}