const nodemailer = require('nodemailer');
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const mysql = require('mysql2/promise');

const app = express();
app.use(cors());
app.use(express.json());

const cron = require('node-cron');
const { enviarNotificaciones } = require('./notificaciones');

const db_profesionales_cluster = mysql.createPoolCluster({
    canRetry: true,          
    removeNodeErrorCount: 1, 
    restoreNodeTimeout: 15000
});

db_profesionales_cluster.add('PRIMARIA', {
    host: process.env.DB_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_ROOT_PASSWORD,
    database: process.env.MYSQL_DATABASE_PRIMARY,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

db_profesionales_cluster.add('REPLICA', {
    host: process.env.DB_HOST_REPLICA,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_ROOT_PASSWORD,
    database: process.env.MYSQL_DATABASE_PRIMARY,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

const db_profesionales = db_profesionales_cluster.of('*', 'ORDER');




const db_pacientes_cluster = mysql.createPoolCluster({
    canRetry: true,          
    removeNodeErrorCount: 1, 
    restoreNodeTimeout: 15000
});

db_pacientes_cluster.add('PRIMARIA', {
    host: process.env.DB_HOST,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_ROOT_PASSWORD,
    database: process.env.MYSQL_DATABASE_REPLICA,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

db_pacientes_cluster.add('REPLICA', {
    host: process.env.DB_HOST_REPLICA,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_ROOT_PASSWORD,
    database: process.env.MYSQL_DATABASE_REPLICA,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

const db_pacientes = db_pacientes_cluster.of('*', 'ORDER');



app.post('/api/admin/login', (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
        return res.status(400).json({ error: 'Debe ingresar correo y contraseña' });
    }
    
    if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
        return res.status(200).json({ mensaje: 'Login exitoso' });
    } else {
        return res.status(401).json({ error: 'Credenciales inválidas' });
    }
});


app.get('/api/especialidades', async (req, res) => {
    try {
        const [rows] = await db_profesionales.query('SELECT e.codigo_esp AS id, e.especialidad AS nombre, COUNT(p.rut) AS medicos_activos FROM Especialidades e LEFT JOIN Roles r ON e.codigo_esp = r.codigo_esp LEFT JOIN Profesionales p ON r.rut = p.rut AND p.estado = 1 GROUP BY e.codigo_esp, e.especialidad');
        res.json(rows);
    } catch (error) {
        console.error('Error al consultar especialidades:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});


app.get('/api/pacientes/:rut', async (req, res) => {
    try {
        const pacienteRut = req.params.rut;        
        const [rows] = await db_pacientes.query(
            'SELECT rut, nombre_legal, apellido_pat, apellido_mat FROM Pacientes WHERE rut = ?', 
            [pacienteRut]
        );
        
        if (rows.length > 0) {
            res.json(rows[0]); 
        } else {
            res.status(404).json({ mensaje: 'Paciente no encontrado. Listo para registro.' });
        }

    } catch (error) {
        console.error('Error al buscar el RUT:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

app.get('/api/profesionales', async (req, res) => {
    try {
        const codigoEspecialidad = req.query.especialidad;
        
        if (!codigoEspecialidad) {
            return res.status(400).json({ error: 'Falta el código de la especialidad' });
        }

        const query = `
            SELECT 
                p.rut AS id, 
                r.id_rol AS rol_id,
                p.nombre, 
                p.apellido_pat,
                p.apellido_mat,
		r.cesfam
            FROM Profesionales p
            INNER JOIN Roles r ON p.rut = r.rut
            WHERE r.codigo_esp = ? AND p.estado = 1
        `;

        const [rows] = await db_profesionales.query(query, [codigoEspecialidad]);
        
        res.json(rows);
        
    } catch (error) {
        console.error('Error al consultar profesionales:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});


app.get('/api/horarios/:rol_id', async (req, res) => {
    try {
        const rolId = req.params.rol_id; 
        const mesStr = req.query.mes;

        if (!mesStr) {
            return res.status(400).json({ error: 'Debe especificar el mes (YYYY-MM)' });
        }
        
        const query = `
            SELECT 
                id_bloque,
                fecha_hora_inicio AS fecha, 
                fecha_hora_fin,
                box
            FROM Agenda_Bloques
            WHERE id_rol = ? 
              AND DATE_FORMAT(fecha_hora_inicio, '%Y-%m') = ?
              AND estado = 'DISPONIBLE'
            ORDER BY fecha_hora_inicio ASC
        `;
        
        const [bloquesDisponibles] = await db_profesionales.query(query, [rolId, mesStr]);
        
        res.json(bloquesDisponibles);

    } catch (error) {
        console.error('Error al consultar horarios:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});



app.post('/api/pacientes', async (req, res) => {
    try {
        const {
            rut,
            nombre_legal,
            apellido_pat,
            apellido_mat,
            nombre_social,
            fecha_nac,
            sexo_registral,
            sexo_nacimiento,
            identidad_genero,
            telefono,
            email,
            direccion
        } = req.body;
        
        if (!rut || !nombre_legal || !apellido_pat || !apellido_mat || !fecha_nac || !sexo_registral || !sexo_nacimiento || !telefono || !direccion) {
            return res.status(400).json({ error: 'Faltan campos obligatorios para el registro.' });
        }

        const query = `
            INSERT INTO Pacientes (
                rut, nombre_legal, apellido_pat, apellido_mat, nombre_social,
                fecha_nac, sexo_registral, sexo_nacimiento, identidad_genero,
                telefono, email, direccion
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        const valores = [
            rut,
            nombre_legal,
            apellido_pat,
            apellido_mat,
            nombre_social || null,
            fecha_nac,
            sexo_registral,
            sexo_nacimiento,
            identidad_genero || null,
            telefono,
            email || null,
            direccion
        ];
        
        await db_pacientes.query(query, valores);
        
        res.status(201).json({ mensaje: 'Paciente registrado exitosamente' });

    } catch (error) {
        console.error('Error al registrar paciente:', error);
        
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'Ya existe un paciente registrado con este RUT en el sistema.' });
        }

        res.status(500).json({ error: 'Error interno del servidor al crear el paciente.' });
    }
});

app.post('/api/citas', async (req, res) => {
    const connection = await db_profesionales.getConnection();
    const connectionPacientes = await db_pacientes.getConnection();
    
    try {
        const { rutPaciente, id_bloque } = req.body;

        if (!rutPaciente || !id_bloque) {
            return res.status(400).json({ error: 'Faltan datos obligatorios' });
        }

        await connection.beginTransaction();
        
        const [bloqueCheck] = await connection.query(
            `SELECT estado FROM Agenda_Bloques WHERE id_bloque = ? FOR UPDATE`, 
            [id_bloque]
        );

        if (bloqueCheck.length === 0 || bloqueCheck[0].estado !== 'DISPONIBLE') {
            await connection.rollback();
            return res.status(409).json({ error: 'Lo sentimos, esta hora acaba de ser reservada por otro paciente.' });
        }
        
        await connection.query(
            `UPDATE Agenda_Bloques SET estado = 'RESERVADO' WHERE id_bloque = ?`,
            [id_bloque]
        );

        
        await connectionPacientes.query(
            `INSERT INTO Citas_Agendadas (rut_paciente, id_bloque_externo, origen_reserva, fecha_registro) 
             VALUES (?, ?, 'WEB', NOW())`,
            [rutPaciente, id_bloque]
        );
        
        await connection.commit();
        res.status(201).json({ mensaje: 'Cita confirmada exitosamente' });

    } catch (error) {
        await connection.rollback();
        console.error('Error al guardar la cita:', error);
        res.status(500).json({ error: 'Error interno del servidor al procesar la cita' });
    } finally {
        connection.release();
        connectionPacientes.release();
    }
});


app.get('/api/admin/agenda-completa', async (req, res) => {
    try {
        const queryAgenda = `
            SELECT 
                a.id_bloque, r.cesfam, r.bloque_tiempo, a.fecha_hora_inicio, 
                a.box, a.estado, 
                d.rut AS rut_medico, d.nombre AS nombre_medico, 
                d.apellido_pat AS apellido_medico, d.apellido_mat AS apellido_medico_mat, 
                e.especialidad 
            FROM Agenda_Bloques a 
            LEFT JOIN Roles r ON a.id_rol = r.id_rol 
            JOIN Profesionales d ON r.rut = d.rut 
            JOIN Especialidades e ON r.codigo_esp = e.codigo_esp
            ORDER BY a.fecha_hora_inicio ASC;
        `;
        const [bloques] = await db_profesionales.query(queryAgenda);
        
        const queryCitas = `
            SELECT 
                c.id_cita, c.origen_reserva, c.fecha_registro, c.estado_cita, 
                p.rut AS rut_paciente, p.nombre_legal AS nombre_paciente, 
                p.apellido_pat AS apellido_paciente, p.apellido_mat AS apellido_paciente_mat, 
                p.telefono, c.id_bloque_externo 
            FROM Citas_Agendadas c 
            JOIN Pacientes p ON c.rut_paciente = p.rut;
        `;
        const [citas] = await db_pacientes.query(queryCitas);
        
        const diccionarioCitas = {};
        citas.forEach(cita => {
            diccionarioCitas[cita.id_bloque_externo] = cita;
        });
        
const agendaFinal = bloques.map(bloque => {
            const datosCita = diccionarioCitas[bloque.id_bloque];
            return {
                ...bloque,
                id_cita: datosCita ? datosCita.id_cita : null,
                rut_paciente: datosCita ? datosCita.rut_paciente : null,
                nombre_paciente: datosCita ? datosCita.nombre_paciente : null,
                apellido_paciente: datosCita ? datosCita.apellido_paciente : null,
                telefono_paciente: datosCita ? datosCita.telefono : null,
                origen_reserva: datosCita ? datosCita.origen_reserva : null,
                estado_final: datosCita ? datosCita.estado_cita.toLowerCase() : 'disponible'
            };
        });

        // --- NUEVA SECCIÓN DE ESTADÍSTICAS ---
        const stats = {
            origen: { WEB: 0, IVR: 0 },
            especialidades: {},
            asistencia: { asistida: 0, inasistida: 0, reservada: 0 },
            ocupacion: { total: agendaFinal.length, agendados: 0 }
        };

        agendaFinal.forEach(item => {
            // 1. Tasa de ocupación
            if (item.id_cita) stats.ocupacion.agendados++;

            // 2. Origen (Solo si hay cita)
            if (item.origen_reserva) {
                stats.origen[item.origen_reserva] = (stats.origen[item.origen_reserva] || 0) + 1;
            }

            // 3. Demanda por especialidad (Solo si está agendado o finalizado)
            if (item.id_cita) {
                const esp = item.especialidad;
                stats.especialidades[esp] = (stats.especialidades[esp] || 0) + 1;
            }

            // 4. Asistencia
            if (stats.asistencia.hasOwnProperty(item.estado_final)) {
                stats.asistencia[item.estado_final]++;
            }
        });

        // Devolvemos ambos objetos: la lista para la tabla y los stats para las tarjetas
        res.status(200).json({ agenda: agendaFinal, stats });
    } catch (error) {
        console.error('Error al cruzar la agenda y los pacientes:', error);
        res.status(500).json({ error: 'Error interno al procesar el dashboard' });
    }
});




app.put('/api/admin/citas/:id_cita/estado', async (req, res) => {
    const { id_cita } = req.params;
    
    // 1. Extraemos los datos del body de forma segura (evita el error 'undefined')
    const { estado_final, id_bloque } = req.body || {};

    // 2. Validación de seguridad: verificamos que nos enviaron todo lo necesario
    if (!estado_final || !id_bloque) {
        return res.status(400).json({ 
            error: 'Faltan parámetros: "estado_final" e "id_bloque" son obligatorios.' 
        });
    }

    // Estandarizamos a mayúsculas para que coincida con el ENUM de tu base de datos
    const estadoPaciente = estado_final.toUpperCase();

    try {
        // 3. Actualizamos la BD de Pacientes (estado de la cita)
        const queryPacientes = 'UPDATE Citas_Agendadas SET estado_cita = ? WHERE id_cita = ?';
        await db_pacientes.query(queryPacientes, [estadoPaciente, id_cita]);

        // 4. Lógica de Mapeo: ¿Qué significa este estado para la agenda del médico?
        let estadoProfesional = '';

        if (estadoPaciente === 'CANCELADA') {
            estadoProfesional = 'DISPONIBLE'; // Se libera el cupo
        } 
        else if (estadoPaciente === 'RESERVADA' || estadoPaciente === 'CONFIRMADA') {
            estadoProfesional = 'RESERVADO';  // El cupo está tomado
        } 
        else if (estadoPaciente === 'ASISTIDA' || estadoPaciente === 'INASISTIDA') {
            estadoProfesional = 'FINALIZADO'; // El bloque de tiempo ya pasó/se cerró
        } 
        else {
            // Si el frontend envía un estado inventado, detenemos el proceso
            return res.status(400).json({ 
                error: `El estado '${estadoPaciente}' no es válido.` 
            });
        }

        // 5. Actualizamos la BD de Profesionales (disponibilidad del bloque)
        const queryProfesionales = 'UPDATE Agenda_Bloques SET estado = ? WHERE id_bloque = ?';
        await db_profesionales.query(queryProfesionales, [estadoProfesional, id_bloque]);

        // 6. Respondemos con éxito al frontend
        res.status(200).json({ 
            mensaje: 'Cita y agenda actualizadas correctamente',
            estado_paciente: estadoPaciente,
            estado_bloque: estadoProfesional
        });

    } catch (error) {
        // 7. Manejo de errores de base de datos
        console.error('Error al actualizar el estado:', error);
        res.status(500).json({ 
            error: 'Error interno al actualizar la cita en las bases de datos.' 
        });
    }
});


app.get('/api/admin/citas/:id_cita', async (req, res) => {
    // 1. Obtenemos el ID de la cita desde la URL
    const { id_cita } = req.params;

    try {
        // 2. Preparamos la consulta SELECT
        const queryPacientes = 'SELECT estado_cita FROM Citas_Agendadas WHERE id_cita = ?';
        
        // 3. Ejecutamos la consulta (asumiendo que usas mysql2 con promesas)
        const [rows] = await db_pacientes.query(queryPacientes, [id_cita]);

        // 4. Verificamos si la cita existe
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Cita no encontrada' });
        }

        // 5. Devolvemos el estado al frontend
        res.status(200).json({ estado_cita: rows[0].estado_cita });

    } catch (error) {
        // 6. Manejo de errores
        console.error('Error al obtener el estado de la cita:', error);
        res.status(500).json({ error: 'Error interno al obtener el estado de la cita' });
    }
});


app.get('/api/admin/citas/:id_cita/estado', async (req, res) => {
    // 1. Obtenemos el ID de la cita desde la URL
    const { id_cita } = req.params;

    try {
        // 2. Preparamos la consulta SELECT
        const queryPacientes = 'SELECT estado_cita FROM Citas_Agendadas WHERE id_cita = ?';
        
        // 3. Ejecutamos la consulta (asumiendo que usas mysql2 con promesas)
        const [rows] = await db_pacientes.query(queryPacientes, [id_cita]);

        // 4. Verificamos si la cita existe
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Cita no encontrada' });
        }

        // 5. Devolvemos el estado al frontend
        res.status(200).json({ estado_cita: rows[0].estado_cita });

    } catch (error) {
        // 6. Manejo de errores
        console.error('Error al obtener el estado de la cita:', error);
        res.status(500).json({ error: 'Error interno al obtener el estado de la cita' });
    }
});



// Endpoint para obtener el detalle de una cita específica desde bases distribuidas
app.get('/api/citas/:idCita', async (req, res) => {
    const idCita = req.params.idCita;

    try {
        // PASO 1: Buscar al paciente y el ID del bloque en db_pacientes
        const queryCitas = `
            SELECT 
                c.id_cita, c.estado_cita, c.id_bloque_externo,
                p.nombre_legal AS nombre_paciente, 
                p.apellido_pat AS apellido_paciente, 
                p.apellido_mat AS apellido_paciente_mat
            FROM Citas_Agendadas c
            JOIN Pacientes p ON c.rut_paciente = p.rut
            WHERE c.id_cita = ?;
        `;
        
        const [citas] = await db_pacientes.query(queryCitas, [idCita]);

        if (citas.length === 0) {
            return res.status(404).json({ error: "Cita no encontrada en el sistema de pacientes" });
        }

        const datosPaciente = citas[0];

        // PASO 2: Usar el id_bloque_externo para buscar la agenda en db_profesionales
        const queryAgenda = `
            SELECT 
                a.fecha_hora_inicio, a.box,
                d.nombre AS nombre_medico, 
                d.apellido_pat AS apellido_medico,
                e.especialidad AS nombre_especialidad
            FROM Agenda_Bloques a
            LEFT JOIN Roles r ON a.id_rol = r.id_rol
            JOIN Profesionales d ON r.rut = d.rut
            JOIN Especialidades e ON r.codigo_esp = e.codigo_esp
            WHERE a.id_bloque = ?;
        `;

        const [bloques] = await db_profesionales.query(queryAgenda, [datosPaciente.id_bloque_externo]);

        if (bloques.length === 0) {
            return res.status(404).json({ error: "Bloque médico no encontrado en la agenda" });
        }

        const datosAgenda = bloques[0];

        // PASO 3: Unificar ambas consultas en un solo objeto para React
        const respuestaFinal = {
            id_cita: datosPaciente.id_cita,
	    id_bloque: datosPaciente.id_bloque_externo,
            estado_cita: datosPaciente.estado_cita,
            // Datos del Paciente
            nombre_legal: datosPaciente.nombre_paciente,
            paciente_pat: datosPaciente.apellido_paciente,
            paciente_mat: datosPaciente.apellido_paciente_mat,
            // Datos Médicos (Bloque)
            fecha_hora_inicio: datosAgenda.fecha_hora_inicio,
            box: datosAgenda.box,
            prof_nombre: datosAgenda.nombre_medico,
            prof_pat: datosAgenda.apellido_medico,
            especialidad_nombre: datosAgenda.nombre_especialidad
        };

        // Devolvemos el objeto armado
        res.json(respuestaFinal);

    } catch (error) {
        console.error("Error al obtener la cita unificada:", error);
        res.status(500).json({ error: "Error interno del servidor al orquestar los datos" });
    }
});


//NOTIFICACIONES

// Ejecutar cada hora en el minuto 0 (Ej: 10:00, 11:00, 12:00)
cron.schedule('0 * * * *', () => {
    // Le pasamos las dos conexiones para que el orquestador trabaje
    enviarNotificaciones(db_profesionales, db_pacientes);
});

// Prueba de arranque manual al iniciar el servidor
enviarNotificaciones(db_profesionales, db_pacientes);

const codigosTemporales = {};
//ARREGLAR
app.post('/api/pacientes/solicitar-codigo', async (req, res) => {
    const { rut } = req.body;
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS 
        }
    });

    try {
        // --- CORRECCIÓN: Consulta SQL directa en lugar de fetch ---
        const [pacientes] = await db_pacientes.query('SELECT email FROM Pacientes WHERE rut = ?', [rut]);
        
        if (pacientes.length === 0) {
            return res.status(404).json({ error: 'RUT no registrado en el sistema' });
        }

        const emailPaciente = pacientes[0].email;

        // Validación del correo
        if (!emailPaciente || !emailPaciente.includes('@')) {
            return res.status(400).json({ 
                error: 'No tiene un correo válido registrado. Por favor, acérquese al CESFAM para actualizar sus datos.' 
            });
        }

        // Generamos código y guardamos sesión
        const codigo = Math.floor(100000 + Math.random() * 900000).toString();
        codigosTemporales[rut] = {
            codigo,
            expira: Date.now() + 5 * 60 * 1000
        };

        // Censuramos el correo para el frontend
        const [user, domain] = emailPaciente.split('@');
        const correoOculto = user.length > 2 
            ? `${user[0]}****${user[user.length-1]}@${domain}`
            : `*@${domain}`;

        try {
            const mailOptions = {
                from: '"CESFAM Villa Alemana" <tu_correo_de_prueba@gmail.com>',
                to: emailPaciente, // Usamos la variable directa de la BD
                subject: '🔑 Tu Código de Acceso - Portal Paciente CESFAM',
                html: `
                    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                        <h2 style="color: #0056b3;">Portal Paciente CESFAM</h2>
                        <p>Hola,</p>
                        <p>Se ha solicitado un código de acceso para el RUT <strong>${rut}</strong>.</p>
                        <div style="background-color: #f4f4f4; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
                            <span style="font-size: 24px; font-weight: bold; letter-spacing: 5px;">${codigo}</span>
                        </div>
                        <p style="font-size: 12px; color: #666;">Si no solicitaste este código, por favor ignora este mensaje.</p>
                    </div>
                `
            };

            await transporter.sendMail(mailOptions);
            console.log(`[EXITO] Correo enviado correctamente a ${emailPaciente}`);
        } catch (errorCorreo) {
            console.error('[ERROR] Falló el envío del correo:', errorCorreo);
        }
            
        res.json({ correoOculto });
        
    } catch (error) {
        console.error('Error detallado al generar código:', error);
        res.status(500).json({ error: 'Error interno al generar el código de acceso' });
    }
});

app.post('/api/pacientes/verificar-codigo', async (req, res) => {
    const { rut, codigo } = req.body;
    const registro = codigosTemporales[rut];

    // 1. Verificamos la seguridad
    if (!registro || registro.codigo !== codigo || Date.now() > registro.expira) {
        return res.status(401).json({ error: 'Código incorrecto o expirado' });
    }

    // 2. Si es exitoso, borramos el código para que no se re-use
    delete codigosTemporales[rut];

    // 3. Le decimos al frontend que todo está OK. 
    // El frontend ahora debe hacer un fetch normal a /api/perfil-paciente/:rut
    res.status(200).json({ mensaje: 'Código verificado con éxito', autorizado: true });
});

app.put('/api/pacientes/:rut/contacto', async (req, res) => {
    const { rut } = req.params;
    const { telefono, email, codigo_verificacion } = req.body;
    
    // 1. Verificamos que el código siga siendo válido para autorizar el cambio
    const registro = codigosTemporales[rut];
    if (!registro || registro.codigo !== codigo_verificacion) {
        return res.status(401).json({ error: 'Sesión no autorizada o código expirado' });
    }

    try {
        // 2. Ejecutamos el UPDATE directo en la base de datos
        const [resultado] = await db_pacientes.query(
            'UPDATE Pacientes SET telefono = ?, email = ? WHERE rut = ?',
            [telefono, email, rut]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({ error: 'Paciente no encontrado en la base de datos' });
        }

        // 3. Limpiamos la sesión por seguridad
        delete codigosTemporales[rut];

        res.status(200).json({ mensaje: 'Datos de contacto actualizados correctamente' });
        
    } catch (error) {
        console.error('Error al actualizar contacto:', error);
        res.status(500).json({ error: 'Error interno al actualizar los datos en MySQL' });
    }
});




app.get('/api/perfil-paciente/:rut', async (req, res) => {
    const { rut } = req.params;
    
    try {
        // 1. Consulta optimizada a db_pacientes (Perfil + Citas)
        const [pacientes] = await db_pacientes.query(
            `SELECT p.rut, p.nombre_legal, p.apellido_pat, p.apellido_mat, p.telefono, p.email, 
                    c.id_cita, c.id_bloque_externo, c.estado_cita
             FROM Pacientes p
             LEFT JOIN Citas_Agendadas c ON p.rut = c.rut_paciente
             WHERE p.rut = ?`, 
            [rut]
        );

        if (pacientes.length === 0) {
            return res.status(404).json({ error: 'Paciente no encontrado' });
        }

        const pacienteData = {
            rut: pacientes[0].rut,
            nombre: pacientes[0].nombre_legal,
            apellido: `${pacientes[0].apellido_pat} ${pacientes[0].apellido_mat}`, 
            telefono: pacientes[0].telefono,
            email: pacientes[0].email
        };

        // Si no hay citas, retornamos el perfil con arreglo vacío
        if (pacientes[0].id_cita === null) {
            return res.json({ ...pacienteData, citas: [] });
        }

        const idsBloques = pacientes.map(cita => cita.id_bloque_externo);

        // 2. NUEVA CONSULTA a db_profesionales con tus JOINS
        const [bloques] = await db_profesionales.query(
            `SELECT 
                a.id_bloque, a.fecha_hora_inicio, a.estado, 
                p.nombre, p.apellido_pat, p.apellido_mat, r.cesfam, a.box,
                e.especialidad
             FROM Agenda_Bloques a 
             JOIN Roles r ON a.id_rol = r.id_rol
             JOIN Profesionales p ON r.rut = p.rut
             JOIN Especialidades e ON r.codigo_esp = e.codigo_esp
             WHERE a.id_bloque IN (?)`, // Reintegramos el WHERE
            [idsBloques]
        );

        const diccionarioBloques = {};
        bloques.forEach(bloque => {
            diccionarioBloques[bloque.id_bloque] = bloque;
        });

        // 3. Mapeo final ajustado a los nuevos nombres de columna
        const citasCompletas = pacientes.map(cita => {
            const b = diccionarioBloques[cita.id_bloque_externo] || {};

            return {
                id_cita: cita.id_cita,
                estado_cita: cita.estado_cita,
                fecha_hora_inicio: b.fecha_hora_inicio,
                especialidad: b.especialidad,
                // Ajustamos a los nombres de p.nombre, p.apellido_pat, etc.
                nombre_medico: b.nombre || '',
                apellido_medico: b.nombre ? `${b.apellido_pat} ${b.apellido_mat}` : '',
                cesfam: b.cesfam,
                box: b.box
            };
        });

        citasCompletas.sort((a, b) => new Date(b.fecha_hora_inicio).getTime() - new Date(a.fecha_hora_inicio).getTime());

        res.json({ ...pacienteData, citas: citasCompletas });

    } catch (error) {
        console.error('Error con la nueva consulta de profesionales:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});



// Endpoint para obtener SOLO el correo del paciente (API de Base de Datos)
app.get('/api/pacientes/:rut/correo', async (req, res) => {
    const { rut } = req.params;
    
    try {
        const [pacientes] = await db_pacientes.query(
            'SELECT email FROM Pacientes WHERE rut = ?', 
            [rut]
        );

        if (pacientes.length === 0) {
            return res.status(404).json({ error: 'RUT no registrado' });
        }

        res.json({ email: pacientes[0].email });
        
    } catch (error) {
        console.error('Error al buscar correo:', error);
        res.status(500).json({ error: 'Error interno en la base de datos' });
    }
});



// Endpoint para actualizar contacto (En tu API de BD)
app.put('/api/pacientes/:rut/contacto', async (req, res) => {
    const { rut } = req.params;
    const { telefono, email } = req.body;
    
    try {
        // Ejecutamos el UPDATE y desestructuramos el resultado
        const [resultado] = await db_pacientes.query(
            'UPDATE Pacientes SET telefono = ?, email = ? WHERE rut = ?',
            [telefono, email, rut]
        );

        // Verificamos si MySQL realmente encontró y modificó el registro
        if (resultado.affectedRows === 0) {
            return res.status(404).json({ error: 'Paciente no encontrado en la base de datos' });
        }

        res.status(200).json({ mensaje: 'Datos de contacto actualizados correctamente' });
        
    } catch (error) {
        console.error('Error al actualizar contacto:', error);
        res.status(500).json({ error: 'Error interno al actualizar los datos en MySQL' });
    }
});





// GET: Buscar citas que ocurran dentro de 48 horas
app.get('/api/notificaciones/pendientes', async (req, res) => {
    try {
        // 1. Buscamos en db_profesionales los bloques a 48 horas
        const [bloques] = await db_profesionales.query(`
            SELECT id_bloque, fecha_hora_inicio 
            FROM Agenda_Bloques 
            WHERE fecha_hora_inicio BETWEEN NOW() + INTERVAL 47 HOUR AND NOW() + INTERVAL 48 HOUR
              AND estado = 'RESERVADO' OR id_bloque = 4
        `);

        if (bloques.length === 0) return res.json([]);
        const idsBloques = bloques.map(b => b.id_bloque);

        // 2. Buscamos en db_pacientes a quién le pertenecen esos bloques
        const [citas] = await db_pacientes.query(`
            SELECT c.id_cita, c.id_bloque_externo, p.nombre_legal, p.telefono, p.email
            FROM Citas_Agendadas c
            JOIN Pacientes p ON c.rut_paciente = p.rut
            WHERE c.id_bloque_externo IN (?)
        `, [idsBloques]);

        // 3. Unimos los datos para la VM 1
        const notificaciones = citas.map(cita => {
            const bloque = bloques.find(b => b.id_bloque === cita.id_bloque_externo);
            return {
                id_cita: cita.id_cita,
                nombre_paciente: cita.nombre_legal,
                telefono: cita.telefono,
                fecha_hora_inicio: bloque.fecha_hora_inicio,
		email: cita.email
            };
        });

        res.json(notificaciones);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error interno buscando pendientes' });
    }
});

// GET: Comprobar si ya se le envió un SMS a esta cita (para no hacer spam)
app.get('/api/notificaciones/historial/:id_cita/:canal', async (req, res) => {
    try {
        const [rows] = await db_pacientes.query(`
            SELECT id_notificacion FROM Historial_Notificaciones 
            WHERE id_cita = ? AND canal = ?
        `, [req.params.id_cita, req.params.canal]);
        res.json({ existe: rows.length > 0 });
    } catch (error) { res.status(500).json({ error: 'Error' }); }
});

// POST: Guardar el resultado del envío en el historial
app.post('/api/notificaciones/historial', async (req, res) => {
    const { id_cita, canal, estado, id_mensaje, error_detalles } = req.body;
    try {
        await db_pacientes.query(`
            INSERT INTO Historial_Notificaciones (id_cita, canal, estado, fecha_envio, id_mensaje_proveedor, detalles_error)
            VALUES (?, ?, ?, NOW(), ?, ?)
        `, [id_cita, canal, estado, id_mensaje || null, error_detalles || null]);
        res.status(201).json({ mensaje: 'Historial guardado' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error guardando historial' });
    }
});



app.post('/api/ivr/agendar', async (req, res) => {
    const connection = await db_profesionales.getConnection();
    const connectionPacientes = await db_pacientes.getConnection();
    
    try {
        const { rut, especialidad } = req.body;

        if (!rut || !especialidad) {
            return res.status(400).send('Faltan datos');
        }

        // 1. Definimos qué buscar según el botón del IVR
        // Ajustamos para que busque el código o nombre exacto de tu tabla Especialidades
        let filtroEspecialidad = '';
        if (especialidad === '1') {
            filtroEspecialidad = 'MED-GRAL'; // Puedes cambiarlo a 'Medicina General' si prefieres buscar por nombre
        } else if (especialidad === '2') {
            filtroEspecialidad = 'CONTROL'; // Ajusta este código al que uses para consulta repetida
        } else {
            return res.status(400).send("Especialidad no válida");
        }

        await connection.beginTransaction();
        await connectionPacientes.beginTransaction();

        // 2. Verificar que el paciente exista
        const [pacienteCheck] = await connectionPacientes.query(
            `SELECT rut FROM Pacientes WHERE rut = ?`, 
            [rut]
        );
        
        if (pacienteCheck.length === 0) {
            await connection.rollback();
            await connectionPacientes.rollback();
            console.log(`[IVR] Rechazado: RUT ${rut} no registrado.`);
            return res.status(404).send('Paciente no registrado');
        }

        // 3. LA CONSULTA ESTRELLA (Corregida con tus JOINs)
        // Buscamos el bloque disponible cruzando con Roles y Especialidades
        const queryBusqueda = `
            SELECT a.id_bloque 
            FROM Agenda_Bloques a
            JOIN Roles r ON a.id_rol = r.id_rol
            JOIN Especialidades e ON r.codigo_esp = e.codigo_esp
            WHERE a.estado = 'DISPONIBLE' 
              AND (e.codigo_esp = ? OR e.especialidad = ?)
            ORDER BY a.fecha_hora_inicio ASC 
            LIMIT 1 FOR UPDATE
        `;

        // Pasamos el filtro dos veces por si en tu BD es el código o el nombre literal
        const [bloqueDisponible] = await connection.query(queryBusqueda, [filtroEspecialidad, filtroEspecialidad]);

        if (bloqueDisponible.length === 0) {
            await connection.rollback();
            await connectionPacientes.rollback();
            console.log(`[IVR] Sin horas disponibles para la especialidad: ${filtroEspecialidad}.`);
            return res.status(404).send('No hay horas disponibles');
        }

        const id_bloque = bloqueDisponible[0].id_bloque;

        // 4. Reservar el bloque
        await connection.query(
            `UPDATE Agenda_Bloques SET estado = 'RESERVADO' WHERE id_bloque = ?`,
            [id_bloque]
        );

        // 5. Guardar la cita (Notar que dice 'TELEFONO' para que calce con tu dashboard)
        await connectionPacientes.query(
            `INSERT INTO Citas_Agendadas (rut_paciente, id_bloque_externo, origen_reserva, fecha_registro, estado_cita) 
             VALUES (?, ?, 'IVR', NOW(), 'RESERVADA')`,
            [rut, id_bloque]
        );
        
        await connection.commit();
        await connectionPacientes.commit();
        
        console.log(`[IVR] ÉXITO: Cita de ${filtroEspecialidad} confirmada para RUT ${rut} en bloque ${id_bloque}`);
        res.status(200).send('OK');

    } catch (error) {
        await connection.rollback();
        await connectionPacientes.rollback();
        console.error('[IVR] Error al procesar la cita telefónica:', error);
        res.status(500).send('Error interno');
    } finally {
        connection.release();
        connectionPacientes.release();
    }
});








app.post('/api/ivr/anular', async (req, res) => {
    const { rut } = req.body;

    try {
        // PASO 1: Buscar TODAS las citas activas de ese paciente en su base de datos
        // Aquí no necesitamos permiso de la otra DB
        const [citas] = await db_pacientes.query(
            "SELECT id_cita, id_bloque_externo FROM Citas_Agendadas WHERE rut_paciente = ? AND estado_cita = 'RESERVADA'", 
            [rut]
        );

        if (citas.length === 0) {
            return res.status(404).send('No se encontraron citas');
        }

        // Sacamos una lista de todos los IDs de bloques que tiene el paciente
        const idsBloques = citas.map(c => c.id_bloque_externo);

        // PASO 2: Consultar en la DB de Profesionales cuál de esos bloques es el más cercano
        const [bloqueCercano] = await db_profesionales.query(`
            SELECT id_bloque 
            FROM Agenda_Bloques 
            WHERE id_bloque IN (?) 
              AND fecha_hora_inicio >= NOW()
            ORDER BY fecha_hora_inicio ASC 
            LIMIT 1
        `, [idsBloques]);

        if (bloqueCercano.length === 0) {
            return res.status(404).send('No hay citas futuras para anular');
        }

        const id_bloque_a_liberar = bloqueCercano[0].id_bloque;

        // PASO 3: Liberar el bloque (DB Profesionales)
        await db_profesionales.query(
            "UPDATE Agenda_Bloques SET estado = 'DISPONIBLE' WHERE id_bloque = ?",
            [id_bloque_a_liberar]
        );

        // PASO 4: Anular la cita (DB Pacientes)
        await db_pacientes.query(
            "UPDATE Citas_Agendadas SET estado_cita = 'CANCELADA' WHERE id_bloque_externo = ?",
            [id_bloque_a_liberar]
        );

        res.status(200).send('OK');

    } catch (error) {
        console.error('[IVR] Error al anular la cita telefónica:', error);
        res.status(500).send('Error interno');
    }
});





const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
