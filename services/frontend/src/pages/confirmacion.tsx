import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Header } from '../components/header';
import { Footer } from '../components/footer'; // Asumiendo que tienes un Footer


const ConfirmacionPage = () => {
    const { idCita } = useParams();

    // Estados de la interfaz
    const [cita, setCita] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [mensajeExito, setMensajeExito] = useState(null);

    // 1. Buscar los datos unificados de la cita al cargar
    useEffect(() => {
        const fetchCita = async () => {
            try {
                // Llamamos a tu Orquestador (server.js) que hace de proxy hacia Rayen
                const response = await fetch(`/api/citas/${idCita}`);
                
                if (!response.ok) {
                    if (response.status === 404) {
                        throw new Error('Lo sentimos, no pudimos encontrar ninguna cita médica asociada a este enlace. Por favor, verifica el mensaje que recibiste.');
                    }
                    throw new Error('Hubo un problema temporal al conectar con el servidor. Por favor, intenta recargar la página en unos minutos.');
                }
                
                const data = await response.json();
                setCita(data); // data ahora tiene el formato unificado (nombre_legal, especialidad_nombre, etc.)
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchCita();
    }, [idCita]);

    // 2. Función para confirmar o anular
    const manejarRespuesta = async (nuevoEstado) => {
        setLoading(true);
        setError(null); // Limpiamos errores previos
        try {
            // PUT directo al Orquestador
            const response = await fetch(`/api/admin/citas/${idCita}/estado`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    estado_final: nuevoEstado, 
                    id_bloque: cita.id_bloque
                })
            });

            if (!response.ok) throw new Error('No pudimos guardar tu decisión. Por favor, intenta presionar el botón nuevamente.');

            if (nuevoEstado === 'CONFIRMADA') {
                setMensajeExito('¡Gracias! Tu hora médica ha sido confirmada exitosamente. Te esperamos en el CESFAM Curicó.');
            } else {
                setMensajeExito('Tu hora ha sido anulada correctamente. Gracias por avisar, esto nos permite liberar el cupo para otro paciente.');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // --- Sub-componente para formatear fecha/hora ---
    const FormatoFechaHora = ({ fechaIso }) => {
        const fechaObj = new Date(fechaIso);
        const fechaLimpia = fechaObj.toLocaleDateString('es-CL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        const horaLimpia = fechaObj.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
        return (
            <div className="bg-surface-container-low p-4 rounded-lg border border-outline-variant/50 text-left my-6 space-y-2">
                <p className="text-on-surface"><strong className="ml-1">Fecha:</strong> <span className="capitalize">{fechaLimpia}</span></p>
                <p className="text-on-surface"><strong className="ml-1">Hora:</strong> {horaLimpia} hrs.</p>
            </div>
        );
    };

    // ==========================================
    // RENDERIZADO PRINCIPAL (Estructura Base)
    // ==========================================
    return (
        <div className="min-h-screen flex flex-col bg-background font-sans">
            <Header />
            
            <main className="flex-1 py-12 md:py-20 bg-surface">
                <div className=" mx-auto px-4 md:px-0">
                    <div className="bg-surface-container-lowest p-8 md:p-10 rounded-2xl border border-outline-variant/30 shadow-sm text-center">
                        
                        {/* --------------------------------------------------
                           CASO 1: Cargando datos
                        -------------------------------------------------- */}
                        {loading && !cita && !error && (
                            <div className="py-10 space-y-4">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                                <h2 className="text-2xl font-semibold text-on-surface">Cargando información...</h2>
                                <p className="text-on-surface-variant">Estamos recuperando los detalles de tu cita médica.</p>
                            </div>
                        )}

                        {/* --------------------------------------------------
                           CASO 2: Error (Cita no encontrada o error de red)
                        -------------------------------------------------- */}
                        {error && !mensajeExito && (
                            <div className="py-6 space-y-6">
                                <h2 className="text-2xl font-bold text-error">Lo sentimos</h2>
                                <p className="text-on-surface-variant bg-error-container/30 p-4 rounded-lg border border-error/20">
                                    {error}
                                </p>
                                <div className="pt-4">
                                    <Link to="/" className="bg-primary text-on-primary px-6 py-3 rounded-full font-medium hover:bg-primary/90 transition">
                                        Volver al inicio
                                    </Link>
                                </div>
                            </div>
                        )}

                        {/* --------------------------------------------------
                           CASO 3: Éxito (Después de confirmar/anular)
                        -------------------------------------------------- */}
                        {mensajeExito && (
                            <div className="py-6 space-y-6">
                                <h2 className="text-3xl font-bold text-primary">¡Operación exitosa!</h2>
                                <p className="text-lg text-on-surface bg-primary-container/30 p-5 rounded-lg border border-primary/20">
                                    {mensajeExito}
                                </p>
                                <p className="text-sm text-on-surface-variant pt-4">Ya puedes cerrar esta ventana de forma segura.</p>
                            </div>
                        )}

                        {/* --------------------------------------------------
                           CASO 4: Pantalla Principal (Datos de la Cita)
                        -------------------------------------------------- */}
                        {cita && !mensajeExito && !error && (
                            <>
                                <h1 className="text-3xl font-bold text-primary mb-3">Confirmación de Asistencia</h1>
                                <p className="text-lg text-on-surface-variant mb-8">
                                    Hola <strong className="text-on-surface">{cita.nombre_legal} {cita.paciente_pat}</strong>, por favor verifica los detalles de tu próxima atención en el CESFAM Curicó:
                                </p>
                                
                                {/* Bloque de detalles visuales (Actualizado con tu formato) */}
                                <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/30 text-left mb-8 space-y-3 shadow-inner">
                                    <p className="text-on-surface"><strong>Especialidad:</strong> {cita.especialidad_nombre}</p>
                                    <p className="text-on-surface"><strong>Médico:</strong> Dr(a). {cita.prof_nombre} {cita.prof_pat}</p>
                                    
                                    {/* Usamos el sub-componente para la fecha */}
                                    <FormatoFechaHora fechaIso={cita.fecha_hora_inicio} />
                                    
                                    <p className="text-on-surface"><strong>Ubicación:</strong> {cita.box}</p>
                                </div>

                                <p className="text-on-surface mb-8 font-medium text-lg">¿Confirmas tu asistencia a esta hora médica?</p>

                                {/* Grupo de botones con Tailwind */}
                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    <button 
                                        className="flex-1 bg-emerald-600 text-white p-4 rounded-xl font-bold text-lg shadow hover:bg-emerald-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                                        onClick={() => manejarRespuesta('CONFIRMADA')}
                                        disabled={loading}
                                    >
                                        {loading && <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-on-success"></div>}
                                        {loading ? 'Procesando...' : 'Confirmar cita'}
                                    </button>
                                    
                                    <button 
                                        className="flex-1 bg-rose-600 text-white p-4 rounded-xl font-bold text-lg shadow hover:bg-rose-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                                        onClick={() => manejarRespuesta('CANCELADA')}
                                        disabled={loading}
                                    >
                                        {loading && <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-on-error"></div>}
                                        {loading ? 'Procesando...' : 'Anular cita'}
                                    </button>
                                </div>
                            </>
                        )}

                    </div>
                </div>
            </main>
            
            <Footer />
        </div>
    );
};

export default ConfirmacionPage;
