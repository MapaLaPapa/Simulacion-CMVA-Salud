const nodemailer = require('nodemailer');
const twilio = require('twilio');
require('dotenv').config();

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const RAYEN_API = process.env.RAYEN_API_URL;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';


// 1. FUNCIÓN PARA SMS

const enviarSms = async (cita) => {
    try {
        const resCheck = await fetch(`${RAYEN_API}/api/notificaciones/historial/${cita.id_cita}/SMS`);
        const historialCheck = await resCheck.json();
        if (historialCheck.existe) return;

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

        await fetch(`${RAYEN_API}/api/notificaciones/historial`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_cita: cita.id_cita, canal: 'SMS', estado: 'ENVIADO', id_mensaje: response.sid })
        });

    } catch (error) {
        console.error(`Falló SMS para ${cita.nombre_paciente}:`, error.message);
        await fetch(`${RAYEN_API}/api/notificaciones/historial`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_cita: cita.id_cita, canal: 'SMS', estado: 'FALLIDO', error_detalles: error.message })
        });
    }
};


// 2. FUNCIÓN PARA WHATSAPP

const enviarWsp = async (cita) => {
    try {
        const resCheck = await fetch(`${RAYEN_API}/api/notificaciones/historial/${cita.id_cita}/WSP`);
        const historialCheck = await resCheck.json();
        if (historialCheck.existe) return; 

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

        await fetch(`${RAYEN_API}/api/notificaciones/historial`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_cita: cita.id_cita, canal: 'WSP', estado: 'ENVIADO', id_mensaje: responseWsp.sid })
        });

    } catch (error) {
        console.error(`Falló WSP para ${cita.nombre_paciente}:`, error.message);
        await fetch(`${RAYEN_API}/api/notificaciones/historial`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_cita: cita.id_cita, canal: 'WSP', estado: 'FALLIDO', error_detalles: error.message })
        });
    }
};


// 3. Nodemailer

const enviarCorreo = async (cita) => {
    if (!cita.email) return; 

    try {
        const resCheck = await fetch(`${RAYEN_API}/api/notificaciones/historial/${cita.id_cita}/CORREO`);
        const historialCheck = await resCheck.json();
        if (historialCheck.existe) return;

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

        await fetch(`${RAYEN_API}/api/notificaciones/historial`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_cita: cita.id_cita, canal: 'CORREO', estado: 'ENVIADO', id_mensaje: info.messageId })
        });

    } catch (error) {
        console.error(`Falló Correo para ${cita.nombre_paciente}:`, error.message);
        await fetch(`${RAYEN_API}/api/notificaciones/historial`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_cita: cita.id_cita, canal: 'CORREO', estado: 'FALLIDO', error_detalles: error.message })
        });
    }
};




const enviarNotificaciones = async () => {
    try {
        const res = await fetch(`${RAYEN_API}/api/notificaciones/pendientes`);
        const citas = await res.json();
        
        if (citas.length === 0) return;

        for (const cita of citas) {
            await enviarSms(cita);
            await enviarWsp(cita);
            await enviarCorreo(cita);
        }

    } catch (error) {
        console.error("Error general en el orquestador de notificaciones:", error.message);
    }
};

module.exports = { enviarNotificaciones };