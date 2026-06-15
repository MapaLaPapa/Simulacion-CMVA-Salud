import React, { useState, useEffect, useMemo } from 'react'
import { format, addDays } from 'date-fns'
import { es } from 'date-fns/locale'
import { 
  Search, ArrowRight, ArrowLeft, Check, User, 
  Stethoscope, Baby, HeartPulse, Smile, AlertCircle, CheckCircle2,
  ChevronLeft, ChevronRight, Loader2
} from 'lucide-react'

export type Paciente = { rut: string; nombre_legal: string; apellido_pat: string; apellido_mat: string; nombre_social?: string; fecha_nac: string; sexo_registral: string; sexo_nacimiento: string; identidad_genero: string; telefono: string; email?: string; direccion: string; };
export type Especialidad = { id: string; nombre: string; descripcion: string; icono: string; duracionMinutos: number; medicos_activos: number;};
export type Profesional = { id: string; rol_id: number; nombre: string; apellido_pat: string; apellido_mat: string; cesfam: string; };
export type HorarioDisponible = { id_bloque: number; fecha: string; fecha_hora_fin: string; box: string; };

const iconos: Record<string, React.ComponentType<{ className?: string }>> = {
  'stethoscope': Stethoscope,
  'baby': Baby,
  'heart-pulse': HeartPulse,
  'smile': Smile
}

type Paso = 'rut' | 'especialidad' | 'profesional' | 'fecha' | 'confirmar' | 'exito'

interface DatosReserva {
  paciente: Paciente
  especialidadId: string
  profesionalId: number
  id_bloque: number
  fecha: string
  hora: string
  cesfam: string
  box: string
}


export function BookingForm() {
  const [paso, setPaso] = useState<Paso>('rut')
  const [rut, setRut] = useState('')
  const [rutError, setRutError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const [esNuevo, setEsNuevo] = useState(false);
  
  const [especialidadesDB, setEspecialidadesDB] = useState<Especialidad[]>([])
  const [profesionalesDB, setProfesionalesDB] = useState<Profesional[]>([])
  const [horariosDB, setHorariosDB] = useState<HorarioDisponible[]>([])

  const [alerta, setAlerta] = useState<{ tipo: 'exito' | 'error' | 'info', texto: string } | null>(null);

  const [datos, setDatos] = useState<DatosReserva>({
    paciente: {
        rut: '',
        nombre_legal: '',
        apellido_pat: '',
        apellido_mat: '',
        nombre_social: '',
        fecha_nac: '',
        sexo_registral: '',
        sexo_nacimiento: '',
        identidad_genero: '',
        telefono: '',
        email: '',
        direccion: ''
    },
    especialidadId: '',
    profesionalId: 0,
    id_bloque: 0,
    fecha: '',
    hora: '',
    cesfam: '',
    box: ''
  })

  const [mesActual, setMesActual] = useState(new Date())

  
  useEffect(() => {
    
    const cargarEspecialidades = async () => {
      try {
        const res = await fetch(`/api/especialidades`);
        if (res.ok) {
          const data = await res.json();
          setEspecialidadesDB(data);
        }
        } catch (error) {
            console.error("Error al cargar especialidades:", error);
        }
        };
        cargarEspecialidades();
    }, []);

    const handleRutChange = (value: string) => {
        // Elimina todo lo que NO sea número o letra 'K'/'k'. 
        // Si el usuario escribe puntos o guiones, la función los borra al instante.
        const limpio = value.replace(/[^0-9kK]/gi, '').toUpperCase();
        
        // Evitamos que escriban RUTs infinitamente largos
        if (limpio.length > 9) return;

        setRut(limpio);
        setRutError('');
    }

    const formatearRutVisual = (rutLimpio: string) => {
        if (!rutLimpio) return '';
        if (rutLimpio.length <= 1) return rutLimpio;
        
        const cuerpo = rutLimpio.slice(0, -1);
        const dv = rutLimpio.slice(-1);
        
        // Expresión regular que agrega un punto cada 3 números
        return cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, '.') + '-' + dv;
    };
    
    const buscarRut = async () => {
        const rutLimpio = rut.replace(/[^0-9kK]/g, '').toUpperCase();

        if (rutLimpio.length < 8) {
        setRutError('Ingrese un RUT válido')
        return
        }

        setIsLoading(true);
        try {
        const response = await fetch(`/api/pacientes/${rutLimpio}`);

        if (response.ok) {
            const pacienteData = await response.json();
            setDatos({ ...datos, paciente: pacienteData });
            setPaso('especialidad');
        } else if (response.status === 404) {
            setEsNuevo(true);
            setDatos({ ...datos, paciente: { rut: rutLimpio, nombre_legal: '', apellido_pat: '', apellido_mat: '', nombre_social: '', fecha_nac: '', sexo_registral: '', sexo_nacimiento: '', identidad_genero: '', telefono: '', email: '', direccion: '' } });
            setRutError('');
        } else {
        setRutError('Error de conexión con el servidor.');
        }
        }catch (error) {
        setRutError('Error validar rut.');
        } finally {
        setIsLoading(false);
        }
    }

    const mostrarAlerta = (tipo: 'exito' | 'error' | 'info', texto: string) => {
        setAlerta({ tipo, texto });
        setTimeout(() => {
            setAlerta(null);
        }, 5000);
    };

    
    const seleccionarEspecialidad = async (id: string) => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/profesionales?especialidad=${id}`);
            if (res.ok) {
            const data = await res.json();
            
            if (data.length === 0) {
                mostrarAlerta('info', 'Lo sentimos, en este momento no contamos con médicos habilitados para esta especialidad.');
                return;
            }
            
            setDatos({ ...datos, especialidadId: id, profesionalId: 0, fecha: '', hora: '', cesfam: '' });
            setProfesionalesDB(data);
            setPaso('profesional');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
        }
    
    const seleccionarProfesional = async (id: number) => {
        const profSeleccionado = profesionalesDB.find(p => p.rol_id === id);
        const cesfamDelMedico = profSeleccionado ? profSeleccionado.cesfam : '';
        setDatos({ ...datos, profesionalId: id, cesfam: cesfamDelMedico, fecha: '', hora: '' });
        try {
        const mesStr = format(mesActual, 'yyyy-MM');
        const res = await fetch(`/api/horarios/${id}?mes=${mesStr}`);
        if (res.ok) {
            const data = await res.json();
            setHorariosDB(data);
            setPaso('fecha');
        }
        } catch (error) {
        console.error(error);
        } finally {
        setIsLoading(false);
        }
    }

    const fechasDisponibles = new Set(
        horariosDB.map(bloque => bloque.fecha.substring(0, 10))
        );
    
    const horasDisponibles = datos.fecha 
    ? horariosDB
        .filter(bloque => bloque.fecha.startsWith(datos.fecha))
        .map(bloque => ({
            id: bloque.id_bloque,             
            hora: bloque.fecha.substring(11, 16),
            box: bloque.box
        }))
    : [];

    const confirmarCita = async () => {
        setIsLoading(true);
        try {
        const res = await fetch(`/api/citas`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                rutPaciente: datos.paciente.rut,             
                idProfesional: datos.profesionalId, 
                id_bloque: datos.id_bloque          
            })
        });
        if (res.ok) {
            setPaso('exito');
        } else {
            mostrarAlerta('error', 'Hubo un problema al agendar la cita. La hora podría haber sido tomada.');
        }
        } catch (error) {
            mostrarAlerta('error', 'Error de red al intentar guardar la cita.');
        } finally {
        setIsLoading(false);
        }
    }

    const registrarPaciente = async () => {
        if (!datos.paciente?.nombre_legal || !datos.paciente?.sexo_nacimiento) {
            mostrarAlerta('error', 'Por favor, completa todos los campos obligatorios (*)');
            return;
        }
        
        let registralFinal = datos.paciente?.sexo_registral;

        
        if (!registralFinal) {
        if (datos.paciente?.sexo_nacimiento === 'Intersexual') {
            registralFinal = 'Otro'; 
        } else {
            registralFinal = datos.paciente?.sexo_nacimiento;
        }
        }
        
        const pacienteParaBD = {
        ...datos.paciente,
        sexo_registral: registralFinal
        };

        setIsLoading(true);
        try {
            const res = await fetch(`/api/pacientes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(pacienteParaBD) 
            });

            if (res.ok) {
                mostrarAlerta('exito', 'Paciente registrado correctamente');
                setPaso('especialidad');
            } else {
                const errorData = await res.json();
                mostrarAlerta('error', `Error: ${errorData.error}`);
            }
        } catch (error) {
            console.error("Error al guardar paciente:", error);
        } finally {
            setIsLoading(false);
        }
        };    

    const volver = () => {
        switch (paso) {
        case 'especialidad': setPaso('rut'); break;
        case 'profesional': setPaso('especialidad'); break;
        case 'fecha': setPaso('profesional'); break;
        case 'confirmar': setPaso('fecha'); break;
        }
    }

    const especialidadSeleccionada = especialidadesDB.find(e => e.id === datos.especialidadId)
    const profesionalSeleccionado = profesionalesDB.find(p => p.rol_id === datos.profesionalId)

    const pasos = [
        { id: 'rut', label: 'RUT', numero: 1 },
        { id: 'especialidad', label: 'Especialidad', numero: 2 },
        { id: 'profesional', label: 'Profesional', numero: 3 },
        { id: 'fecha', label: 'Fecha', numero: 4 },
        { id: 'confirmar', label: 'Confirmar', numero: 5 }
    ]

    const pasoActual = pasos.findIndex(p => p.id === paso) + 1

    if (paso === 'exito') {
        return (
        <div className="text-center py-12">
            <div className="w-20 h-20 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="h-10 w-10 text-secondary" />
            </div>
            <h2 className="text-headline-md text-primary mb-4">Cita Agendada Exitosamente</h2>
            <p className="text-body-md text-on-surface-variant mb-6 mx-auto">
            Su cita ha sido registrada en el sistema. Recuerde asistir con su carnet.
            </p>
            <button onClick={() => window.location.href = '/'} className="bg-secondary text-on-secondary px-6 py-3 rounded-lg hover:bg-secondary/90">
            Volver al Inicio
            </button>
        </div>
        )
    }

    return (
        <div>
            {/* COMPONENTE DE ALERTA FLOTANTE */}
        {alerta && (
            <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 flex items-center gap-3 px-6 py-4 rounded-lg shadow-lg transition-all border ${
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
        <div className="mb-8">
            <div className="flex items-center justify-between max-w-2xl mx-auto">
            {pasos.map((p, index) => (
                <div key={p.id} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-colors
                    ${pasoActual > p.numero ? 'bg-secondary text-on-secondary' : pasoActual === p.numero ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant'}`}>
                    {pasoActual > p.numero ? <Check className="h-4 w-4" /> : p.numero}
                </div>
                <span className={`ml-2 text-label-sm hidden sm:inline ${pasoActual >= p.numero ? 'text-on-surface' : 'text-on-surface-variant'}`}>{p.label}</span>
                {index < pasos.length - 1 && <div className={`w-8 sm:w-16 h-0.5 mx-2 ${pasoActual > p.numero ? 'bg-secondary' : 'bg-surface-container'}`} />}
                </div>
            ))}
            </div>
        </div>

        {/* PASO 1: RUT */}
        {paso === 'rut' && (
        <div className="mx-auto">
            <h2 className="text-headline-sm text-primary mb-2 text-center">
            {esNuevo ? 'Registro Rápido' : 'Ingrese su RUT'}
            </h2>
            <p className="text-body-md text-on-surface-variant text-center mb-6">
            {esNuevo 
                ? 'Como es su primera vez, necesitamos sus datos básicos para agendar.'
                : 'Buscaremos sus datos para agendar su cita'}
            </p>

            <div className="space-y-4">
            {/* Input de RUT */}
            <input
                    id="rut"
                    type="text"
                    // 1. Aquí mostramos la versión maquillada (ej: 20.950.588-6)
                    value={formatearRutVisual(rut)}
                    // 2. Al escribir, enviamos el valor al manejador (que lo limpiará a 209505886)
                    onChange={(e) => {
                        handleRutChange(e.target.value);
                        setEsNuevo(false);
                    }}
                    disabled={esNuevo}
                    placeholder="12.345.678-9"
                    className="w-full px-4 py-3 border border-outline-variant rounded-lg focus:ring-2 focus:ring-secondary/50 focus:border-secondary disabled:bg-surface-container-low disabled:text-on-surface-variant/50"
                    onKeyDown={(e) => e.key === 'Enter' && !esNuevo && buscarRut()}
                />

            {esNuevo && (
            <div className="space-y-6 mt-4">
                <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/30">
                <h3 className="text-title-md text-primary mb-4 border-b border-outline-variant/30 pb-2">Datos Personales</h3>
                
                {/* NOMBRES Y APELLIDOS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                    <label className="block text-label-md text-on-surface mb-2">Nombre *</label>
                    <input
                        type="text"
                        value={datos.paciente?.nombre_legal || ''}
                        onChange={(e) => setDatos({ ...datos, paciente: { ...datos.paciente!, nombre_legal: e.target.value } })}
                        className="w-full px-4 py-3 border border-outline-variant rounded-lg focus:ring-2 focus:ring-secondary/50 focus:border-secondary"
                        placeholder="Ej: Ana"
                        required
                    />
                    </div>
                    <div>
                    <label className="block text-label-md text-on-surface mb-2">Nombre Social (Opcional)</label>
                    <input
                        type="text"
                        value={datos.paciente?.nombre_social || ''}
                        onChange={(e) => setDatos({ ...datos, paciente: { ...datos.paciente!, nombre_social: e.target.value } })}
                        className="w-full px-4 py-3 border border-outline-variant rounded-lg focus:ring-2 focus:ring-secondary/50 focus:border-secondary"
                        placeholder="Ej: Anita"
                    />
                    </div>
                    <div>
                    <label className="block text-label-md text-on-surface mb-2">Apellido Paterno *</label>
                    <input
                        type="text"
                        value={datos.paciente?.apellido_pat || ''}
                        onChange={(e) => setDatos({ ...datos, paciente: { ...datos.paciente!, apellido_pat: e.target.value } })}
                        className="w-full px-4 py-3 border border-outline-variant rounded-lg focus:ring-2 focus:ring-secondary/50 focus:border-secondary"
                        placeholder="Ej: Díaz"
                        required
                    />
                    </div>
                    <div>
                    <label className="block text-label-md text-on-surface mb-2">Apellido Materno *</label>
                    <input
                        type="text"
                        value={datos.paciente?.apellido_mat || ''}
                        onChange={(e) => setDatos({ ...datos, paciente: { ...datos.paciente!, apellido_mat: e.target.value } })}
                        className="w-full px-4 py-3 border border-outline-variant rounded-lg focus:ring-2 focus:ring-secondary/50 focus:border-secondary"
                        placeholder="Ej: Pérez"
                        required
                    />
                    </div>
                </div>

                {/* DEMOGRAFÍA */}
                <h3 className="text-title-md text-primary mb-4 border-b border-outline-variant/30 pb-2 mt-6"></h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                    <label className="block text-label-md text-on-surface mb-2">Fecha de Nacimiento *</label>
                    <input
                        title="Fecha de Nacimiento"
                        type="date"
                        value={datos.paciente?.fecha_nac || ''}
                        onChange={(e) => setDatos({ ...datos, paciente: { ...datos.paciente!, fecha_nac: e.target.value } })}
                        className="w-full px-4 py-3 border border-outline-variant rounded-lg focus:ring-2 focus:ring-secondary/50 focus:border-secondary bg-white"
                        required
                    />
                    </div>
                    <div>
                    <label className="block text-label-md text-on-surface mb-2">Identidad de Género (Opcional)</label>
                    <input
                        type="text"
                        value={datos.paciente?.identidad_genero || ''}
                        onChange={(e) => setDatos({ ...datos, paciente: { ...datos.paciente!, identidad_genero: e.target.value } })}
                        className="w-full px-4 py-3 border border-outline-variant rounded-lg focus:ring-2 focus:ring-secondary/50 focus:border-secondary"
                        placeholder="Ej: Femenino, No Binario"
                    />
                    </div>
                    <div>
                    <label className="block text-label-md text-on-surface mb-2 pt-4">Sexo al Nacer *</label>
                    <select
                        title="Sexo al Nacer"
                        value={datos.paciente?.sexo_nacimiento || ''}
                        onChange={(e) => setDatos({ ...datos, paciente: { ...datos.paciente!, sexo_nacimiento: e.target.value } })}
                        className="w-full px-4 py-3 border border-outline-variant rounded-lg focus:ring-2 focus:ring-secondary/50 focus:border-secondary bg-white"
                        required
                    >
                        <option value="">Seleccione...</option>
                        <option value="Femenino">Femenino</option>
                        <option value="Masculino">Masculino</option>
                        <option value="Intersexual">Intersexual</option>
                    </select>
                    </div>
                    <div>
                        <label className="block text-label-md text-on-surface mb-2">
                            Sexo Registral (Opcional)
                            {/* Texto de ayuda pequeñito para dar claridad */}
                            <span className="block text-xs text-on-surface-variant font-normal mt-0.5">
                            Si lo omites, usaremos el mismo de tu nacimiento.
                            </span>
                        </label>
                        <select
                            title='Sexo Registral'
                            value={datos.paciente?.sexo_registral || ''}
                            onChange={(e) => setDatos({ ...datos, paciente: { ...datos.paciente!, sexo_registral: e.target.value } })}
                            className="w-full px-4 py-3 border border-outline-variant rounded-lg focus:ring-2 focus:ring-secondary/50 focus:border-secondary bg-white"
                            // ¡Ojo! Le borramos el 'required' de aquí
                        >
                            <option value="">Seleccione...</option>
                            <option value="Femenino">Femenino</option>
                            <option value="Masculino">Masculino</option>
                            <option value="Otro">Otro</option>
                        </select>
                        </div>
                </div>

                {/* CONTACTO */}
                <h3 className="text-title-md text-primary mb-4 border-b border-outline-variant/30 pb-2 mt-6">Datos de Contacto</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                    <label className="block text-label-md text-on-surface mb-2">Teléfono *</label>
                    <input
                        type="tel"
                        value={datos.paciente?.telefono || ''}
                        onChange={(e) => setDatos({ ...datos, paciente: { ...datos.paciente!, telefono: e.target.value } })}
                        className="w-full px-4 py-3 border border-outline-variant rounded-lg focus:ring-2 focus:ring-secondary/50 focus:border-secondary"
                        placeholder="Ej: +56912345678"
                        required
                    />
                    </div>
                    <div>
                    <label className="block text-label-md text-on-surface mb-2">Email (Opcional)</label>
                    <input
                        type="email"
                        value={datos.paciente?.email || ''}
                        onChange={(e) => setDatos({ ...datos, paciente: { ...datos.paciente!, email: e.target.value } })}
                        className="w-full px-4 py-3 border border-outline-variant rounded-lg focus:ring-2 focus:ring-secondary/50 focus:border-secondary"
                        placeholder="ejemplo@correo.com"
                    />
                    </div>
                </div>
                <div>
                    <label className="block text-label-md text-on-surface mb-2">Dirección *</label>
                    <input
                    type="text"
                    value={datos.paciente?.direccion || ''}
                    onChange={(e) => setDatos({ ...datos, paciente: { ...datos.paciente!, direccion: e.target.value } })}
                    className="w-full px-4 py-3 border border-outline-variant rounded-lg focus:ring-2 focus:ring-secondary/50 focus:border-secondary"
                    placeholder="Ej: Prat 123, Curicó"
                    required
                    />
                </div>
                </div>
            </div>
            )}

            {/* Botón dinámico: Cambia su función dependiendo de si es nuevo o no */}
            {!esNuevo ? (
                <button
                onClick={buscarRut} disabled={!rut || isLoading}
                className="w-full bg-secondary text-on-secondary py-3 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
                >
                {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : <Search className="h-5 w-5" />}
                {isLoading ? 'Buscando...' : 'Buscar'}
                </button>
            ) : (
                <button
                    
                    onClick={registrarPaciente} 
                    
                    disabled={!datos.paciente?.nombre_legal || !datos.paciente?.apellido_pat || !datos.paciente?.apellido_mat || isLoading} 
                    className="w-full bg-primary text-on-primary py-3 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
                >
                    {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : null}
                    {isLoading ? 'Guardando Paciente...' : 'Guardar y Continuar'}
                    {!isLoading && <ArrowRight className="h-5 w-5" />}
                </button>
            )}
            </div>
        </div>
        )}

        {/* PASO 2: ESPECIALIDAD */}
            {paso === 'especialidad' && (
            <div className="max-w-2xl mx-auto">
                <button onClick={volver} className="flex items-center gap-2 text-on-surface-variant hover:text-secondary mb-6">
                <ArrowLeft className="h-4 w-4" /> Volver
                </button>
                <h2 className="text-headline-sm text-primary mb-6 text-center">Seleccione Especialidad</h2>
                
                {isLoading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="animate-spin h-8 w-8 text-secondary" />
                </div>
                ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {especialidadesDB.map((esp) => {
                    const Icono = iconos[esp.icono] || Stethoscope;
                    const estaDisponible = esp.medicos_activos > 0; // Evaluamos si hay médicos

                    return (
                        <button 
                        key={esp.id} 
                        onClick={() => seleccionarEspecialidad(esp.id)} 
                        disabled={!estaDisponible} // Bloqueamos el clic si es false
                        className={`p-6 border rounded-xl text-left transition-all ${
                            estaDisponible 
                            ? 'bg-surface-container-lowest border-outline-variant/30 hover:border-secondary hover:shadow-sm' 
                            : 'bg-surface-container-low opacity-60 cursor-not-allowed border-transparent'
                        }`}
                        >
                        <div className="flex justify-between items-start mb-4">
                            <Icono className={`h-6 w-6 ${estaDisponible ? 'text-secondary' : 'text-on-surface-variant'}`} />
                            
                            {/* Etiqueta visual de "No disponible" */}
                            {!estaDisponible && (
                            <span className="text-[10px] uppercase font-bold tracking-wider text-error bg-error/10 px-2 py-1 rounded">
                                No disponible
                            </span>
                            )}
                        </div>
                        
                        <h3 className={`text-headline-sm mb-1 ${estaDisponible ? 'text-primary' : 'text-on-surface-variant'}`}>
                            {esp.nombre}
                        </h3>
                        
                        {/* Si tuvieras descripción en el futuro, se mostraría aquí */}
                        {esp.descripcion && (
                            <p className="text-body-md text-on-surface-variant text-sm">{esp.descripcion}</p>
                        )}
                        </button>
                    )
                    })}
                </div>
                )}
            </div>
            )}

        {/* PASO 3: PROFESIONAL */}
        {paso === 'profesional' && (
            <div className="max-w-2xl mx-auto">
            <button onClick={volver} className="flex items-center gap-2 text-on-surface-variant hover:text-secondary mb-6"><ArrowLeft className="h-4 w-4" /> Volver</button>
            <h2 className="text-headline-sm text-primary mb-6 text-center">Seleccione Profesional</h2>
            
            {isLoading ? (
                <div className="flex justify-center py-12"><Loader2 className="animate-spin h-8 w-8 text-secondary" /></div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {profesionalesDB.length === 0 ? (
                    <p className="col-span-2 text-center text-on-surface-variant">No hay profesionales disponibles para esta especialidad.</p>
                ) : (
                    profesionalesDB.map((prof) => (
                    <button key={prof.rol_id} onClick={() => seleccionarProfesional(prof.rol_id)} className="p-6 bg-surface-container-lowest border border-outline-variant/30 rounded-xl text-left hover:border-secondary hover:shadow-sm flex items-center gap-4">
                        <User className="h-7 w-7 text-on-surface-variant" />
                        <div>
                        <h3 className="text-headline-sm text-primary text-lg">Dr(a). {prof.nombre} {prof.apellido_pat} {prof.apellido_mat}</h3>
                        <p className="text-body-md text-on-surface-variant text-sm">{especialidadSeleccionada?.nombre}</p>
                        </div>
                    </button>
                    ))
                )}
                </div>
            )}
            </div>
        )}

        {/* PASO 4: FECHA Y HORA (Vista Calendario) */}
        {paso === 'fecha' && (
        <div className="max-w-4xl mx-auto ">
            <button onClick={volver} className="flex items-center gap-2 text-on-surface-variant hover:text-secondary mb-6">
            <ArrowLeft className="h-4 w-4" /> Volver
            </button>
            
            {isLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="animate-spin h-8 w-8 text-secondary" /></div>
            ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 ">
                
                {/* CALENDARIO */}
                <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-6">
                
                {/* Cabecera del Mes */}
                <div className="flex justify-between items-center mb-6">
                    <button 
                    title="Mes anterior" 
                    onClick={() => setMesActual(new Date(mesActual.getFullYear(), mesActual.getMonth() - 1, 1))}
                    className="p-2 hover:bg-surface-container rounded-full transition-colors"
                    >
                    <ChevronLeft className="h-5 w-5 text-on-surface-variant" />
                    </button>
                    <h3 className="text-title-md font-medium capitalize text-primary">
                    {format(mesActual, 'MMMM yyyy', { locale: es })}
                    </h3>
                    <button 
                    title="Mes siguiente" 
                    onClick={() => setMesActual(new Date(mesActual.getFullYear(), mesActual.getMonth() + 1, 1))}
                    className="p-2 hover:bg-surface-container rounded-full transition-colors"
                    >
                    <ChevronRight className="h-5 w-5 text-on-surface-variant" />
                    </button>
                </div>

                {/* Cabecera de Días de la Semana (Lu, Ma, Mi...) */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                    {['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'].map(dia => (
                    <div key={dia} className="text-center text-label-sm font-bold text-on-surface-variant py-2">
                        {dia}
                    </div>
                    ))}
                </div>

                {/* Grilla de Números */}
                <div className="grid grid-cols-7 gap-1">
                    
                    {/* 1. Dibujamos los espacios vacíos antes del día 1 */}
                    {Array.from({ 
                    // Calculamos qué día de la semana cae el día 1 (0=Dom, 1=Lun...). Ajustamos para que Lunes sea 0.
                    length: (new Date(mesActual.getFullYear(), mesActual.getMonth(), 1).getDay() + 6) % 7 
                    }).map((_, i) => (
                    <div key={`empty-${i}`} className="p-2" /> 
                    ))}

                    {/* 2. Dibujamos los días reales del mes */}
                    {Array.from({ 
                    // Calculamos cuántos días tiene este mes exacto
                    length: new Date(mesActual.getFullYear(), mesActual.getMonth() + 1, 0).getDate() 
                    }).map((_, index) => {
                    
                    const numeroDia = index + 1;
                    // Creamos la fecha real para este día
                    const fechaDelBoton = new Date(mesActual.getFullYear(), mesActual.getMonth(), numeroDia);
                    // Formato YYYY-MM-DD para comparar con tu base de datos
                    const fechaStr = format(fechaDelBoton, 'yyyy-MM-dd'); 
                    
                    const tieneDisponibilidad = fechasDisponibles.has(fechaStr);
                    
                    // Comparamos si la fecha es anterior a HOY (ignorando la hora)
                    const hoy = new Date();
                    hoy.setHours(0, 0, 0, 0);
                    const esPasado = fechaDelBoton < hoy;

                    return (
                        <button 
                        key={fechaStr} 
                        onClick={() => tieneDisponibilidad && !esPasado && setDatos({ ...datos, fecha: fechaStr, hora: '', id_bloque: 0 })}
                        disabled={esPasado || !tieneDisponibilidad}
                        className={`
                            aspect-square p-2 rounded-full text-body-md flex items-center justify-center transition-all
                            ${datos.fecha === fechaStr 
                            ? 'bg-primary text-on-primary font-bold shadow-md' // Día SELECCIONADO
                            : tieneDisponibilidad && !esPasado 
                                ? 'text-primary font-medium hover:bg-primary/10 border border-primary/20' // Días CON horas libres
                                : 'text-on-surface-variant/30 cursor-not-allowed' // Días SIN horas o pasados
                            }
                        `}
                        >
                        {numeroDia}
                        </button>
                    )
                    })}
                </div>
                </div>

                {/* HORAS DISPONIBLES */}
                <div>
                {datos.fecha && (
                    <div className="grid grid-cols-3 gap-2">
                    {horasDisponibles.map(horario => (
                        <button 
                        key={horario.id} 
                        onClick={() => setDatos({ ...datos, hora: horario.hora, id_bloque: horario.id, box: horario.box })}
                        className={`p-3 border rounded-lg ${datos.hora === horario.hora ? 'bg-secondary text-white' : 'hover:border-secondary'}`}
                        >
                        {horario.hora}
                        </button>
                    ))}
                    </div>
                )}
                </div>
            </div>
            )}

        {/* BOTÓN CONTINUAR */}
        {datos.fecha && datos.hora && (
        <div className="mt-8 text-center">
            <button onClick={() => setPaso('confirmar')} className="bg-secondary text-on-secondary px-8 py-3 rounded-lg flex items-center gap-2 mx-auto">
            Continuar <ArrowRight />
            </button>
        </div>
        )}
    </div>
    )}

        {/* PASO 5: CONFIRMAR */}
        {paso === 'confirmar' && (
            <div className=" mx-auto text-center">
            <button onClick={volver} className="flex items-center gap-2 text-on-surface-variant hover:text-secondary mb-6"><ArrowLeft className="h-4 w-4" /> Volver</button>
            <h2 className="text-headline-sm text-primary mb-6">Confirme su Cita</h2>
            
            <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/30 text-left mb-6">
                <p><strong>Paciente:</strong> {datos.paciente?.nombre_legal} {datos.paciente?.apellido_pat} {datos.paciente?.apellido_mat}</p>
                <p><strong>Especialidad:</strong> {especialidadSeleccionada?.nombre}</p>
                <p><strong>Médico:</strong> Dr(a). {profesionalSeleccionado?.nombre} {profesionalSeleccionado?.apellido_pat}</p>
                <p><strong>Cuándo:</strong> {datos.fecha} a las {datos.hora}</p>
                <p><strong>CESFAM:</strong> {datos.cesfam}</p>
                <p><strong>Box:</strong> {datos.box}</p>
            </div>

            <button onClick={confirmarCita} disabled={isLoading} className="w-full bg-secondary text-on-secondary py-4 rounded-lg flex justify-center gap-2">
                {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : <Check className="h-5 w-5" />}
                {isLoading ? 'Procesando...' : 'Confirmar Cita'}
            </button>
            </div>
        )}
        </div>
    )
    }