import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Loader2, AlertCircle, Hospital, LogOut, LayoutList, 
  BarChart, CalendarPlus, Upload, Database, CheckCircle2,
  Clock, User, MapPin, Trash2
} from 'lucide-react';
import Papa from 'papaparse';

interface Profesional {
  rut: string;
  nombre: string;
  apellido_pat: string;
  especialidad: string;
  codigo_esp: string;
  id_rol: number;
}


export default function CargaHoras() {
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [profesionales, setProfesionales] = useState<Profesional[]>([]);
  const [alerta, setAlerta] = useState<{ tipo: 'exito' | 'error', texto: string } | null>(null);

  // --- ESTADO PARA GENERADOR POR RANGO ---
  const [formRango, setFormRango] = useState({
    id_rol: '',
    fecha: '',
    hora_inicio: '08:00',
    hora_fin: '13:00',
    intervalo: '20',
    box: 'BOX A-1'
  });

  // --- ESTADO PARA CARGA CSV ---
  const [csvData, setCsvData] = useState<any[]>([]);

  useEffect(() => {
    // Cargar lista de profesionales para el select
    fetch(`/api/admin/profesionales`)
      .then(res => res.json())
      .then(data => setProfesionales(data));
  }, []);

  const mostrarAlerta = (tipo: 'exito' | 'error', texto: string) => {
    setAlerta({ tipo, texto });
    setTimeout(() => setAlerta(null), 5000);
  };

  // --- LÓGICA: GENERADOR POR RANGO ---
  const generarBloquesManual = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/generar-bloques-rango`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formRango)
      });
      
      if (response.ok) {
        mostrarAlerta('exito', 'Jornada generada con éxito');
      } else {
        throw new Error();
      }
    } catch (error) {
      mostrarAlerta('error', 'Error al generar los bloques en la base de datos');
    } finally {
      setLoading(false);
    }
  };

  // --- LÓGICA: CARGA CSV ---
  const handleFileUpload = (e: any) => {
    const file = e.target.files[0];
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setCsvData(results.data);
        mostrarAlerta('exito', `${results.data.length} filas detectadas en el archivo`);
      }
    });
  };

  const procesarCSV = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/cargar-bloques-csv`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bloques: csvData })
      });
      if (response.ok) {
        mostrarAlerta('exito', 'Planilla importada correctamente');
        setCsvData([]);
      }
    } catch (error) {
      mostrarAlerta('error', 'Error al procesar el archivo CSV');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Alerta */}
      {alerta && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 border ${
          alerta.tipo === 'exito' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          {alerta.tipo === 'exito' ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
          <p className="font-medium">{alerta.texto}</p>
        </div>
      )}

      {/* Sidebar (Igual a tus otros archivos) */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-primary-container hidden lg:block border-r border-outline-variant/20">
        <div className="p-6">
          <Link to="/" className="flex items-center gap-3">
            <div className="bg-secondary/20 p-2 rounded-lg"><Hospital className="h-6 w-6 text-on-primary-container" /></div>
            <div>
              <h1 className="text-headline-sm text-on-primary-container font-bold">CESFAM</h1>
              <p className="text-label-sm text-on-primary-container/70">Villa Alemana</p>
            </div>
          </Link>
        </div>
        <nav className="px-4 space-y-1">
          <Link to="/admin/dashboard" className={`flex items-center gap-3 px-4 py-3 rounded-lg text-label-md transition-all ${location.pathname === '/admin/dashboard' ? 'bg-secondary/20 text-on-primary-container font-bold' : 'text-on-primary-container/70 hover:bg-secondary/10'}`}>
            <LayoutList className="h-5 w-5" /> Gestión de Citas
          </Link>
          <Link to="/admin/stats" className={`flex items-center gap-3 px-4 py-3 rounded-lg text-label-md transition-all ${location.pathname === '/admin/stats' ? 'bg-secondary/20 text-on-primary-container font-bold' : 'text-on-primary-container/70 hover:bg-secondary/10'}`}>
            <BarChart className="h-5 w-5" /> Estadísticas
          </Link>
          <Link to="/admin/carga" className={`flex items-center gap-3 px-4 py-3 rounded-lg text-label-md transition-all ${location.pathname === '/admin/carga' ? 'bg-secondary/20 text-on-primary-container font-bold' : 'text-on-primary-container/70 hover:bg-secondary/10'}`}>
            <CalendarPlus className="h-5 w-5" /> Carga de Horas
          </Link>
        </nav>
      </aside>

      <main className="lg:ml-64 p-4 lg:p-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="text-headline-md text-primary font-bold">Planificación de Agendas</h1>
            <p className="text-body-md text-on-surface-variant">Carga de disponibilidad horaria para profesionales de salud</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* SECCIÓN: GENERADOR POR RANGO */}
            <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/30 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-primary/10 rounded-lg"><Clock className="h-5 w-5 text-primary" /></div>
                <h2 className="text-title-lg font-bold text-primary">Generador por Rango</h2>
              </div>

              <form onSubmit={generarBloquesManual} className="space-y-4">
                <div>
                  <label className="text-label-md mb-1 block">Profesional</label>
                  <select 
                    required
                    className="w-full p-3 bg-surface-container-low border border-outline-variant rounded-xl"
                    value={formRango.id_rol}
                    onChange={(e) => setFormRango({...formRango, id_rol: e.target.value})}
                  >
                    <option value="">Seleccione Médico...</option>
                    {profesionales.map(p => (
                      <option key={p.id_rol} value={p.id_rol}>{p.nombre} {p.apellido_pat} ({p.especialidad})</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-label-md mb-1 block">Fecha</label>
                    <input type="date" required className="w-full p-3 bg-surface-container-low border border-outline-variant rounded-xl" 
                      onChange={(e) => setFormRango({...formRango, fecha: e.target.value})}/>
                  </div>
                  <div>
                    <label className="text-label-md mb-1 block">Box</label>
                    <input type="text" placeholder="Ej: BOX A-1" className="w-full p-3 bg-surface-container-low border border-outline-variant rounded-xl"
                      onChange={(e) => setFormRango({...formRango, box: e.target.value})}/>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-label-md mb-1 block">Inicio</label>
                    <input type="time" value={formRango.hora_inicio} className="w-full p-3 bg-surface-container-low border border-outline-variant rounded-xl"
                      onChange={(e) => setFormRango({...formRango, hora_inicio: e.target.value})}/>
                  </div>
                  <div>
                    <label className="text-label-md mb-1 block">Fin</label>
                    <input type="time" value={formRango.hora_fin} className="w-full p-3 bg-surface-container-low border border-outline-variant rounded-xl"
                      onChange={(e) => setFormRango({...formRango, hora_fin: e.target.value})}/>
                  </div>
                  <div>
                    <label className="text-label-md mb-1 block">Intervalo</label>
                    <select className="w-full p-3 bg-surface-container-low border border-outline-variant rounded-xl"
                      onChange={(e) => setFormRango({...formRango, intervalo: e.target.value})}>
                      <option value="15">15 min</option>
                      <option value="20">20 min</option>
                      <option value="30">30 min</option>
                    </select>
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-primary text-on-primary py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-all shadow-lg"
                >
                  {loading ? <Loader2 className="animate-spin h-5 w-5" /> : <Database className="h-5 w-5" />}
                  Generar Bloques
                </button>
              </form>
            </div>

            {/* SECCIÓN: CARGA MASIVA CSV */}
            <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/30 shadow-sm flex flex-col">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-secondary/10 rounded-lg"><Upload className="h-5 w-5 text-secondary" /></div>
                <h2 className="text-title-lg font-bold text-primary">Carga Masiva (CSV)</h2>
              </div>

              <div className="border-2 border-dashed border-outline-variant rounded-3xl p-8 text-center flex-1 flex flex-col justify-center items-center gap-4 bg-surface-container-low/30">
                <input 
                  type="file" 
                  accept=".csv" 
                  id="csvFile" 
                  className="hidden" 
                  onChange={handleFileUpload}
                />
                <label htmlFor="csvFile" className="cursor-pointer group">
                  <div className="bg-white p-4 rounded-full shadow-md mb-4 group-hover:scale-110 transition-transform">
                    <Upload className="h-8 w-8 text-secondary" />
                  </div>
                  <p className="text-title-sm text-primary font-bold">Seleccionar archivo .csv</p>
                  <p className="text-label-sm text-on-surface-variant">O arrastre el archivo aquí</p>
                </label>
              </div>

              {csvData.length > 0 && (
                <div className="mt-6 p-4 bg-secondary/10 rounded-2xl border border-secondary/20">
                  <div className="flex justify-between items-center mb-4">
                    <p className="text-body-sm font-bold text-secondary">{csvData.length} bloques listos para subir</p>
                    <button onClick={() => setCsvData([])} className="text-error"><Trash2 className="h-4 w-4"/></button>
                  </div>
                  <button 
                    onClick={procesarCSV}
                    className="w-full bg-secondary text-on-secondary py-3 rounded-xl font-bold hover:bg-secondary/90 transition-all"
                  >
                    Procesar Planilla
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}