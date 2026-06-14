import React from 'react';
import { 
  HeartPulse, 
  ShieldCheck, 
  Users, 
  Clock, 
  Award, 
  Building2 
} from 'lucide-react';
import { Header } from '../components/header';
import { Footer } from '../components/footer';

export default function Nosotros() {
  const valores = [
    {
      icono: HeartPulse,
      titulo: 'Empatía y Calidez',
      desc: 'Entendemos que detrás de cada consulta hay un ser humano. Nuestro trato siempre será cercano, digno y comprensivo.'
    },
    {
      icono: ShieldCheck,
      titulo: 'Ética Profesional',
      desc: 'Actuamos con total transparencia y resguardamos la confidencialidad de la información médica de nuestra comunidad.'
    },
    {
      icono: Users,
      titulo: 'Enfoque Comunitario',
      desc: 'No solo tratamos enfermedades, sino que promovemos la prevención y el bienestar integral de todas las familias.'
    },
    {
      icono: Clock,
      titulo: 'Compromiso y Oportunidad',
      desc: 'Trabajamos día a día para optimizar nuestros tiempos de atención y brindar respuestas oportunas a las necesidades de salud.'
    }
  ];

  return (
    <div>
        <Header />
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
        
      <div className="max-w-5xl mx-auto space-y-16">
        
        {/* Encabezado Principal */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center p-3 bg-secondary/10 rounded-2xl mb-4">
            <Building2 className="h-10 w-10 text-secondary" />
          </div>
          <h1 className="text-display-sm md:text-display-md text-primary font-bold">
            Sobre Nuestro Centro
          </h1>
          <p className="text-body-lg text-on-surface-variant max-w-3xl mx-auto leading-relaxed">
            Somos una institución de salud primaria dedicada a entregar atención médica integral, familiar y comunitaria. 
            Nuestro modelo de salud se centra en las personas, acompañándolas en todas las etapas de su vida con un 
            equipo multidisciplinario altamente calificado.
          </p>
        </div>

        {/* Misión y Visión (Tarjetas Destacadas) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-surface-container-lowest border border-outline-variant/30 p-8 rounded-3xl shadow-sm">
            <h2 className="text-headline-sm text-primary mb-4 flex items-center gap-3">
              <Award className="h-6 w-6 text-secondary" />
              Nuestra Misión
            </h2>
            <p className="text-body-md text-on-surface-variant leading-relaxed">
              Brindar atención de salud primaria con un enfoque biopsicosocial, equitativo y de calidad. 
              Buscamos resolver las necesidades de salud de nuestra población a cargo mediante actividades de fomento, 
              prevención, recuperación y rehabilitación, integrando a las familias y la comunidad en el autocuidado.
            </p>
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant/30 p-8 rounded-3xl shadow-sm">
            <h2 className="text-headline-sm text-primary mb-4 flex items-center gap-3">
              <HeartPulse className="h-6 w-6 text-secondary" />
              Nuestra Visión
            </h2>
            <p className="text-body-md text-on-surface-variant leading-relaxed">
              Consolidarnos como un centro de salud familiar líder, reconocido por su excelencia clínica, 
              innovación en la gestión pública y, sobre todo, por el trato humanizado y el fuerte vínculo 
              de confianza establecido con nuestros usuarios y su entorno.
            </p>
          </div>
        </div>

        {/* Sección de Valores (Grid de 4) */}
        <div className="pt-8">
          <div className="text-center mb-10">
            <h2 className="text-headline-sm text-primary font-bold">Nuestros Pilares</h2>
            <p className="text-body-md text-on-surface-variant mt-2">Los valores que guían nuestro quehacer diario</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {valores.map((valor, index) => {
              const Icono = valor.icono;
              return (
                <div key={index} className="bg-surface-container-lowest border border-outline-variant/30 p-6 rounded-2xl flex flex-col items-center text-center hover:border-secondary/50 transition-colors">
                  <div className="h-12 w-12 bg-secondary/10 rounded-xl flex items-center justify-center mb-4">
                    <Icono className="h-6 w-6 text-secondary" />
                  </div>
                  <h3 className="text-title-md text-on-surface font-medium mb-2">
                    {valor.titulo}
                  </h3>
                  <p className="text-body-sm text-on-surface-variant">
                    {valor.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Cierre / Mensaje estático */}
        <div className="mt-16 bg-primary-container rounded-3xl p-8 text-center border border-on-primary-container/10">
          <h2 className="text-title-lg text-on-primary-container font-medium mb-2">
            La salud de su familia es nuestra prioridad
          </h2>
          <p className="text-body-md text-on-primary-container/80 max-w-2xl mx-auto">
            Agradecemos la confianza que deposita día a día en nuestro equipo de profesionales. 
            Seguiremos trabajando para construir juntos una comunidad más sana.
          </p>
        </div>

      </div>
      
    </div>
    <Footer />
    </div>
  );
}