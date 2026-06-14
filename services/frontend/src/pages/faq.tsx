import React, { useState } from 'react';
import { 
  ChevronDown, HelpCircle, Phone, 
  Clock, ShieldCheck, MessageSquare 
} from 'lucide-react';
import { Header } from '../components/header';
import { Footer } from '../components/footer';

export default function FAQ() {
  const [abierto, setAbierto] = useState<number | null>(0);

  const faqs = [
    {
      pregunta: "¿Cómo agendo una cita médica en el portal?",
      respuesta: "Ingrese su RUT en la pantalla principal. Si es su primera vez, el sistema le pedirá un registro rápido. Luego, seleccione la especialidad, el profesional y elija el bloque disponible en el calendario. Finalmente, confirme su cita."
    },
    {
      pregunta: "¿Qué hago si necesito cancelar mi hora?",
      respuesta: "Para liberar el cupo a otro paciente, debe cancelar con al menos 24 horas de antelación. Puede hacerlo llamando a nuestra central de soporte telefónico o directamente en el mesón del CESFAM."
    },
    {
      pregunta: "¿Es seguro ingresar mis datos personales?",
      respuesta: "Absolutamente. Los datos viajan a través de una red privada encriptada y son resguardados bajo estrictas normas de ética profesional y seguridad informática del servicio de salud."
    },
    {
      pregunta: "¿Puedo agendar para un familiar?",
      respuesta: "Sí, siempre que cuente con el RUT de la persona. Si la persona no está registrada, el sistema le permitirá realizar el registro rápido antes de proceder con el agendamiento."
    }
  ];

  return (
    <div>
        <Header />
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-12">
        
        {/* Encabezado */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center p-3 bg-secondary/10 rounded-2xl">
            <HelpCircle className="h-10 w-10 text-secondary" />
          </div>
          <h1 className="text-headline-md text-primary font-bold">Centro de Ayuda</h1>
          <p className="text-body-lg text-on-surface-variant max-w-2xl mx-auto">
            Encuentre respuestas rápidas a sus dudas o utilice nuestra central telefónica integrada.
          </p>
        </div>

        {/* Sección Asterisk / Teléfono */}
        <div className="bg-primary-container rounded-3xl p-8 border border-on-primary-container/10 flex flex-col md:flex-row items-center gap-6">
          <div className="bg-white/50 p-4 rounded-2xl">
            <Phone className="h-8 w-8 text-primary" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-title-lg text-on-primary-container font-bold">Central Telefónica Digital</h3>
            <p className="text-body-md text-on-primary-container/80">
              ¿Sin internet? Llame al <strong>800 600 100</strong> y agende usando nuestro sistema automático por voz.
            </p>
          </div>
          <div className="bg-secondary text-on-secondary px-6 py-2 rounded-full font-bold">
            Soporte 24/7
          </div>
        </div>

        {/* Acordeón de FAQs */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl overflow-hidden">
              <button
                onClick={() => setAbierto(abierto === index ? null : index)}
                className="w-full px-6 py-5 text-left flex justify-between items-center hover:bg-surface-container-low/50 transition-colors"
              >
                <span className="text-title-md text-on-surface font-medium">{faq.pregunta}</span>
                <ChevronDown className={`h-5 w-5 text-on-surface-variant transition-transform ${abierto === index ? 'rotate-180' : ''}`} />
              </button>
              <div className={`px-6 overflow-hidden transition-all duration-300 ${abierto === index ? 'max-h-40 pb-5 opacity-100' : 'max-h-0 opacity-0'}`}>
                <p className="text-body-md text-on-surface-variant border-t border-outline-variant/20 pt-4">
                  {faq.respuesta}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
    <Footer />
    </div>
  );
}