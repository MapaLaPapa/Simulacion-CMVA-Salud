const nodemailer = require('nodemailer');
const twilio = require('twilio');
require('dotenv').config();

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const FRONTEND_URL = process.env.FRONTEND_URL;

// ==========================================
// FUNCIONES AUXILIARES DE BASE DE DATOS
// ==========================================
const checkHistorial = async (id_cita, canal, db_pacientes) => {
    const [rows] = await db_pacientes.query(
        'SELECT id_notificacion FROM Historial_Notificaciones WHERE id_cita = ? AND canal = ?', 
        [id_cita, canal]
    );
    return rows.length > 0;
};

const guardarHistorial = async (id_cita, canal, estado, id_mensaje, error_detalles, db_pacientes) => {
    await db_pacientes.query(`
        INSERT INTO Historial_Notificaciones (id_cita, canal, estado, fecha_envio, id_mensaje_proveedor, detalles_error)
        VALUES (?, ?, ?, NOW(), ?, ?)
    `, [id_cita, canal, estado, id_mensaje || null, error_detalles || null]);
};

// ==========================================
// 1. FUNCIÓN PARA SMS
// ==========================================
const enviarSms = async (cita, db_pacientes) => {
    try {
        const yaEnviado = await checkHistorial(cita.id_cita, 'SMS', db_pacientes);
        if (yaEnviado) return;

        const fechaObj = new Date(cita.fecha_hora_inicio);
        const fechaLimpia = fechaObj.toLocaleDateString('es-CL'); 
        const horaLimpia = fechaObj.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
        
        const linkConfirmacion = `${FRONTEND_URL}/confirmar/${cita.id_cita}`;
        const mensajeSms = `CESFAM: Hola ${cita.nombre_paciente}, tu cita es el ${fechaLimpia} a las ${horaLimpia}. Confirma aqui: ${linkConfirmacion}`;

        const response = await client.messages.create({
            body: mensajeSms,
            from: process.env.TWILIO_PHONE_NUMBER, 
            to: cita.telefono 
        });

        await guardarHistorial(cita.id_cita, 'SMS', 'ENVIADO', response.sid, null, db_pacientes);

    } catch (error) {
        console.error(`Falló SMS para ${cita.nombre_paciente}:`, error.message);
        await guardarHistorial(cita.id_cita, 'SMS', 'FALLIDO', null, error.message, db_pacientes);
    }
};

// ==========================================
// 2. FUNCIÓN PARA WHATSAPP
// ==========================================
const enviarWsp = async (cita, db_pacientes) => {
    try {
        const yaEnviado = await checkHistorial(cita.id_cita, 'WSP', db_pacientes);
        if (yaEnviado) return; 

        const fechaObj = new Date(cita.fecha_hora_inicio);
        const fechaLimpia = fechaObj.toLocaleDateString('es-CL'); 
        const horaLimpia = fechaObj.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }); 
        const linkConfirmacion = `${FRONTEND_URL}/confirmar/${cita.id_cita}`;

        const responseWsp = await client.messages.create({
            from: `whatsapp:${process.env.TWILIO_PHONE_NUMBER_WSP}`,
            contentSid: 'HXb84817f0a394c14d484c1095c4d4084c', 
            contentVariables: JSON.stringify({ "1": cita.nombre_paciente, "2": fechaLimpia+" a las "+horaLimpia, "3": linkConfirmacion}),
            to: `whatsapp:${cita.telefono}`
        });

        await guardarHistorial(cita.id_cita, 'WSP', 'ENVIADO', responseWsp.sid, null, db_pacientes);

    } catch (error) {
        console.error(`Falló WSP para ${cita.nombre_paciente}:`, error.message);
        await guardarHistorial(cita.id_cita, 'WSP', 'FALLIDO', null, error.message, db_pacientes);
    }
};

// ==========================================
// 3. NODEMAILER (CORREO)
// ==========================================
const enviarCorreo = async (cita, db_pacientes) => {
    if (!cita.email) return; 

    try {
        const yaEnviado = await checkHistorial(cita.id_cita, 'CORREO', db_pacientes);
        if (yaEnviado) return;

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS 
            }
        });

        const fechaObj = new Date(cita.fecha_hora_inicio);
        const fechaLimpia = fechaObj.toLocaleDateString('es-CL'); 
        const horaLimpia = fechaObj.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
        const linkConfirmacion = `${FRONTEND_URL}/confirmar/${cita.id_cita}`;

        const htmlCuerpo = `
            <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
                <div style="background-color: #0056b3; color: white; padding: 20px; text-align: center;">
                    <h2 style="margin: 0;">Recordatorio de Cita Médica</h2>
                    <p style="margin: 5px 0 0 0;">CESFAM Curicó</p>
                </div>
                <div style="padding: 20px;">
                    <p>Estimado/a <strong>${cita.nombre_paciente}</strong>,</p>
                    <p>Le recordamos que tiene una atención programada con nosotros:</p>
                    <ul style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; list-style: none;">
                        <li>📅 <strong>Fecha:</strong> ${fechaLimpia}</li>
                        <li>⏰ <strong>Hora:</strong> ${horaLimpia}</li>
                    </ul>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${linkConfirmacion}" style="background-color: #28a745; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px; display: inline-block;">Confirmar o Anular Cita</a>
                    </div>
                    <p style="font-size: 12px; color: #777; text-align: center; margin-top: 30px;">Este es un mensaje automático del sistema Rayen. Por favor no responda a esta dirección.</p>
                </div>
            </div>
        `;

        const info = await transporter.sendMail({
            from: `"Sistema Rayen CESFAM" <${process.env.EMAIL_USER}>`,
            to: cita.email,
            subject: `Recordatorio de cita médica: ${fechaLimpia}`,
            html: htmlCuerpo
        });

        await guardarHistorial(cita.id_cita, 'CORREO', 'ENVIADO', info.messageId, null, db_pacientes);

    } catch (error) {
        console.error(`Falló Correo para ${cita.nombre_paciente}:`, error.message);
        await guardarHistorial(cita.id_cita, 'CORREO', 'FALLIDO', null, error.message, db_pacientes);
    }
};

// ==========================================
// ORQUESTADOR PRINCIPAL
// ==========================================
const enviarNotificaciones = async (db_profesionales, db_pacientes) => {
    try {
        // 1. Buscamos en db_profesionales los bloques a 48 horas directamente con SQL
        const [bloques] = await db_profesionales.query(`
            SELECT id_bloque, fecha_hora_inicio 
            FROM Agenda_Bloques 
            WHERE fecha_hora_inicio BETWEEN NOW() + INTERVAL 47 HOUR AND NOW() + INTERVAL 48 HOUR
              AND estado = 'RESERVADO'
        `);

        if (bloques.length === 0) return;
        const idsBloques = bloques.map(b => b.id_bloque);

        // 2. Buscamos a los pacientes en db_pacientes
        const [citas] = await db_pacientes.query(`
            SELECT c.id_cita, c.id_bloque_externo, p.nombre_legal, p.telefono, p.email
            FROM Citas_Agendadas c
            JOIN Pacientes p ON c.rut_paciente = p.rut
            WHERE c.id_bloque_externo IN (?)
        `, [idsBloques]);

        // 3. Unimos los datos
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

        if (notificaciones.length === 0) return;

        // 4. Procesamos los envíos pasándole la conexión a la base de datos a cada función
        for (const cita of notificaciones) {
            await enviarSms(cita, db_pacientes);
            await enviarWsp(cita, db_pacientes);
            await enviarCorreo(cita, db_pacientes);
        }

    } catch (error) {
        console.error("Error general en el orquestador de notificaciones:", error.message);
    }
};

module.exports = { enviarNotificaciones };