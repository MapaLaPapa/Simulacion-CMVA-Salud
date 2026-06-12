const nodemailer = require('nodemailer');
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const cron = require('node-cron');
const { enviarNotificaciones } = require('./notificaciones');

const app = express();

app.use(cors());
app.use(express.json());

const RAYEN_API = process.env.RAYEN_API_URL;

// --- ENDPOINTS DE MONITOREO (HEALTHCHECKS) ---

app.get('/api/ping', (req, res) => {
    res.json({ mensaje: 'Backend del frontend funciona' });
});


app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'UP', message: 'Servicio operativo' });
});

// --- ENDPOINTS PARA LA API DE RAYEN ---

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
        const respuesta = await fetch(`${RAYEN_API}/api/especialidades`);
        const data = await respuesta.json(); 
        res.status(respuesta.status).json(data);
    } catch (error) { 
        res.status(500).json({ error: 'Error conectando con Rayen' }); 
    }
});

app.get('/api/pacientes/:rut', async (req, res) => {
    try {
        const respuesta = await fetch(`${RAYEN_API}/api/pacientes/${req.params.rut}`);
        const data = await respuesta.json();
        res.status(respuesta.status).json(data);
    } catch (error) { 
        res.status(500).json({ error: 'Error conectando con Rayen' }); 
    }
});

app.get('/api/profesionales', async (req, res) => {
    try {
        const queryParams = new URLSearchParams(req.query).toString();
        const urlCompleta = `${RAYEN_API}/api/profesionales?${queryParams}`;
        
        const respuesta = await fetch(urlCompleta);
        const data = await respuesta.json();
        res.status(respuesta.status).json(data);
    } catch (error) { 
        console.error("Error buscando profesionales:", error.message);
        res.status(500).json({ error: 'Error conectando con Rayen' }); 
    }
});

app.get('/api/horarios/:rol_id', async (req, res) => {
    try {
        const queryParams = new URLSearchParams(req.query).toString();
        const urlCompleta = `${RAYEN_API}/api/horarios/${req.params.rol_id}?${queryParams}`;

        const respuesta = await fetch(urlCompleta);
        const data = await respuesta.json();
        res.status(respuesta.status).json(data);
    } catch (error) { 
        console.error("Error horarios:", error.message);
        res.status(500).json({ error: 'Error consultando horarios en Rayen' }); 
    }
});

app.post('/api/pacientes', async (req, res) => {
    try {
        const respuesta = await fetch(`${RAYEN_API}/api/pacientes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(req.body)
        });
        const data = await respuesta.json();
        res.status(respuesta.status).json(data);
    } catch (error) {
        console.error("Error de red en proxy:", error.message);
        res.status(500).json({ error: 'Error de conexión con el servidor interno' });
    }
});

app.post('/api/citas', async (req, res) => {
    try {
        const respuesta = await fetch(`${RAYEN_API}/api/citas`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(req.body)
        });
        const data = await respuesta.json();
        res.status(respuesta.status).json(data);
    } catch (error) {
        console.error("Error creando cita:", error);
        res.status(500).json({ error: 'Error interno conectando a Rayen' });
    }
});

app.get('/api/admin/agenda-completa', async (req, res) => {
    try {
        const respuesta = await fetch(`${RAYEN_API}/api/admin/agenda-completa`);
        const data = await respuesta.json(); 
        res.json(data); 
    } catch (error) { 
        res.status(500).json({ error: 'Error cruzando datos de agenda en Rayen' }); 
    }
});

app.get('/api/citas/detalle/:idCita', async (req, res) => {
    try {
        const respuesta = await fetch(`${RAYEN_API}/api/citas/${req.params.idCita}`);
        if (!respuesta.ok) {
            return res.status(respuesta.status).json({ error: 'Error al buscar cita en Rayen' });
        }
        const data = await respuesta.json();
        res.json(data); 
    } catch (error) { 
        console.error("Error en el proxy de detalles:", error);
        res.status(500).json({ error: 'Error de comunicación con la API de Rayen' }); 
    }
});

app.put('/api/admin/citas/:id_cita/estado', async (req, res) => {
    try {
        const respuesta = await fetch(`${RAYEN_API}/api/admin/citas/${req.params.id_cita}/estado`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(req.body)
        });
        const data = await respuesta.json();
        res.status(respuesta.status).json(data);
    } catch (error) {
        console.error("Error actualizando estado:", error);
        res.status(500).json({ error: 'Error actualizando cita en Rayen' });
    }
});

app.get('/api/admin/citas/:id_cita/estado', async (req, res) => {
    try {
        const respuesta = await fetch(`${RAYEN_API}/api/admin/citas/${req.params.id_cita}/estado`, {
            method: 'GET', 
            headers: { 'Accept': 'application/json' }
        });
        const data = await respuesta.json();
        res.status(respuesta.status).json(data);
    } catch (error) {
        console.error("Error obteniendo estado:", error);
        res.status(500).json({ error: 'Error obteniendo el estado de la cita en Rayen' });
    }
});


// --- NOTIFICACIONES ---

cron.schedule('0 * * * *', () => {
    enviarNotificaciones();
});


// --- PORTAL PACIENTE ---

const codigosTemporales = {};

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
        const respuesta = await fetch(`${RAYEN_API}/api/pacientes/${rut}/correo`);
        
        if (!respuesta.ok) {
            return res.status(404).json({ error: 'RUT no registrado en el sistema' });
        }

        const data = await respuesta.json();

        if (!data.email || !data.email.includes('@')) {
            return res.status(400).json({ 
                error: 'No tiene un correo válido registrado. Por favor, acérquese al CESFAM para actualizar sus datos.' 
            });
        }

        const codigo = Math.floor(100000 + Math.random() * 900000).toString();
        codigosTemporales[rut] = { codigo, expira: Date.now() + 5 * 60 * 1000 };

        const [user, domain] = data.email.split('@');
        const correoOculto = user.length > 2 
            ? `${user[0]}****${user[user.length-1]}@${domain}`
            : `*@${domain}`;

        if (data.email) { 
         try {
            const mailOptions = {
                from: '"CESFAM Villa Alemana" <tu_correo_de_prueba@gmail.com>',
                to: data.email,
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
            console.log(`[EXITO] Correo enviado correctamente a ${data.email}`);
            } catch (errorCorreo) {
                    console.error('[ERROR] Falló el envío del correo:', errorCorreo);
                }
            } else {
                console.log(`[INFO] El paciente RUT ${rut} no tiene email registrado. Solo podrá ver el código en pantalla/consola.`);
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

    if (!registro || registro.codigo !== codigo || Date.now() > registro.expira) {
        return res.status(401).json({ error: 'Código incorrecto o expirado' });
    }

    try {
        const respuesta = await fetch(`${RAYEN_API}/api/perfil-paciente/${rut}`);
        const perfil = await respuesta.json();
        res.json(perfil);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener perfil' });
    }
});

app.put('/api/pacientes/:rut/contacto', async (req, res) => {
    const { rut } = req.params;
    const { codigo_verificacion } = req.body;
    
    const registro = codigosTemporales[rut];
    if (!registro || registro.codigo !== codigo_verificacion) {
        return res.status(401).json({ error: 'Sesión no autorizada' });
    }

    try {
        const respuesta = await fetch(`${RAYEN_API}/api/pacientes/${rut}/contacto`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(req.body)
        });
        const data = await respuesta.json();
        res.status(respuesta.status).json(data);
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar contacto' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor backend corriendo y escuchando en el puerto ${PORT}`);
});