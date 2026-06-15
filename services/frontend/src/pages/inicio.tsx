import React from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../components/header';
import { Footer } from '../components/footer';
import Chat from '../components/chat';

import { 
  CalendarDays, 
  Search, 
  Clock, 
  Users, 
  Building2,
  Syringe, 
  Baby, 
  Brain,
  Heart,
  ArrowRight,
  BadgeCheck,
  Shield,
  Landmark
} from 'lucide-react'

const programas = [
  {
    nombre: 'Campana de Vacunacion',
    descripcion: 'Proteja a su familia. Conozca el calendario actual de vacunacion contra la Influenza y COVID-19. Disponible en todos nuestros puntos.',
    icono: Syringe,
    destacado: true,
  },
  {
    nombre: 'Control Nino Sano',
    descripcion: 'Seguimiento integral del desarrollo fisico y cognitivo desde el nacimiento.',
    icono: Baby,
  },
  {
    nombre: 'Programa Adulto Mayor',
    descripcion: 'Atencion geriatrica preventiva, entrega de alimentos y control de cronicos.',
    icono: Users,
  },
  {
    nombre: 'Salud Mental',
    descripcion: 'Apoyo psicologico y psiquiatrico para el bienestar emocional de la comunidad.',
    icono: Brain,
  },
  {
    nombre: 'Salud Cardiovascular',
    descripcion: 'Prevencion y tratamiento de hipertension, diabetes y dislipidemia.',
    icono: Heart,
  },
]

export default function Inicio() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative w-full overflow-hidden bg-surface-container-lowest pt-12 pb-20 md:pt-20 md:pb-24">
          <div className="max-w-7xl mx-auto px-2 md:px-12 flex flex-col md:flex-row items-center gap-12">
            {/* Left Content */}
            <div className="w-full md:w-1/2 flex flex-col gap-6 z-10">
              {/* Badge */}
              <div className="inline-flex items-center gap-1 bg-secondary-fixed/30 text-on-secondary-fixed-variant px-3 py-1 rounded-full text-label-sm w-max border border-secondary-fixed">
                <BadgeCheck className="w-4 h-4" />
                Salud Municipal
              </div>

              {/* Headline */}
              <h1 className="text-headline-lg text-primary max-w-2xl leading-tight text-balance">
                Cuidado integral y cercano para toda la comunidad.
              </h1>

              {/* Description */}
              <p className="text-body-lg text-on-surface-variant text-pretty">
                CESFAM Villa Alemana es su centro de salud familiar. Brindamos atencion primaria de calidad, 
                enfocada en la prevencion, promocion y recuperacion de la salud de nuestros vecinos.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-3">
                <Link 
                  to="/agendar"
                  className="bg-secondary text-on-secondary text-label-md px-12 py-3 rounded-lg hover:bg-secondary/90 transition-colors shadow-sm flex items-center justify-center gap-3 h-12"
                >
                  <CalendarDays className="w-5 h-5" />
                  Agendar Hora
                </Link>
                
              </div>
            </div>

            {/* Right Image */}
            <div className="w-full md:w-1/2 relative">
              <div className="aspect-[4/3] rounded-xl overflow-hidden shadow-lg border border-outline-variant/30 relative bg-surface-container">
                <img 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBVyUNoF-KujU0KV8jX76GYjaGYf2DaU9iN0o1580KHzL_8rGe4pscQgLU9hYebUX45F23BuExT543oh5DXb45DPmF6MsM9E0JXiSncjKCvmqcKlhOBAq7Ix5aC-PlhC44maQhxK5Gdzku4cWEEpyss_3-QvoHeQCVteLONkDLkVve-_bafRi4lecsygSzA0YnEdPD1WAfq8Cg5xpYGE_484kT9owDipo7gV-_9wiW3-7wDFsohHvfMn6NK6O9LhczNtXVJsrpbGV0"
                  alt="Centro de salud moderno CESFAM Villa Alemana"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/40 to-transparent" />
                
                {/* Floating Schedule Card */}
                <div className="absolute bottom-6 left-6 right-6 bg-surface/90 backdrop-blur-md p-3 rounded-lg border border-outline-variant/20 flex items-center gap-3 shadow-sm">
                  <div className="bg-secondary-fixed text-on-secondary-fixed p-2 rounded-full flex items-center justify-center">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-label-sm text-on-surface-variant">Atencion hoy</p>
                    <p className="text-label-md text-on-surface font-bold">08:00 - 20:00 hrs</p>
                  </div>
                </div>
              </div>

              {/* Decorative Element */}
              <div className="absolute -z-10 -bottom-8 -right-8 w-64 h-64 bg-secondary-fixed-dim/20 rounded-full blur-3xl" />
            </div>
          </div>
        </section>

        {/* Stats Strip */}
        <section className="bg-primary-container text-on-primary-container py-6 border-y border-outline-variant/20">
          <div className="max-w-7xl mx-auto px-2 md:px-12 flex flex-wrap justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-secondary-fixed" />
              <div>
                <p className="text-headline-sm text-on-primary font-bold">+50k</p>
                <p className="text-label-sm opacity-80">Pacientes Inscritos</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Syringe className="w-8 h-8 text-secondary-fixed" />
              <div>
                <p className="text-headline-sm text-on-primary font-bold">15+</p>
                <p className="text-label-sm opacity-80">Especialidades</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Building2 className="w-8 h-8 text-secondary-fixed" />
              <div>
                <p className="text-headline-sm text-on-primary font-bold">3</p>
                <p className="text-label-sm opacity-80">Centros Asociados</p>
              </div>
            </div>
          </div>
        </section>

        {/* Programas de Salud (Bento Grid) */}
        <section id="servicios" className="py-20 bg-surface">
          <div className="max-w-7xl mx-auto px-2 md:px-12">
            <div className="mb-12">
              <h2 className="text-headline-md text-primary mb-1">Programas de Salud</h2>
              <p className="text-body-md text-on-surface-variant max-w-2xl">
                Servicios integrales disenados para acompanar cada etapa de su vida y la de su familia.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Large Card - Vacunacion */}
              <div className="md:col-span-2 bg-surface-container-lowest rounded-xl border border-outline-variant/70 p-6 flex flex-col justify-between hover:shadow-sm transition-shadow group overflow-hidden relative min-h-[300px]">
                <div className="z-10 relative">
                  <div className="bg-secondary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-3">
                    <Syringe className="w-6 h-6 text-secondary" />
                  </div>
                  <h3 className="text-headline-sm text-primary mb-1">Campana de Vacunacion</h3>
                  <p className="text-body-md text-on-surface-variant ">
                    Proteja a su familia. Conozca el calendario actual de vacunacion contra la Influenza y COVID-19. Disponible en todos nuestros puntos.
                  </p>
                </div>
                <div className="z-10 relative mt-12">
                  <button className="text-secondary text-label-md flex items-center gap-1 group-hover:gap-2 transition-all">
                    Ver Calendario <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
                {/* Background decoration */}
                <div className="absolute right-0 top-0 w-1/2 h-full opacity-10 pointer-events-none">
                  <img 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBibJG5LD-Uj33ELHxZn5FARq37scl4D-5087RECHm5vW40tZBzGuKF6dtPtqFLaXb3yZffnbsmnjbRqOelfNlV2AngwnXGqVtqcfQea-vzTP51XMJsc2KWSCvZSrC1qyDI9rZYYKUrAG_MN5T3NSvwL9s6v3CT6vKECoDE1II5v1bL2tuGEcffA-xA3w_cpTfhf9wsdN__EqOkmfhW04vELpwDCkqUEUEaSKs5FejVitA4EmEbgi6ufv1w83h5sylO_0WE4y0QrOM"
                    alt=""
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-surface-container-lowest via-surface-container-lowest/10 to-transparent" />
                </div>
              </div>

              {/* Small Cards */}
              {programas.slice(1).map((programa) => (
                <div 
                  key={programa.nombre}
                  className="bg-surface-container-low rounded-xl border border-outline-variant/70 p-6 flex flex-col hover:shadow-sm transition-shadow"
                >
                  <div className="bg-primary-container/10 w-10 h-10 rounded-lg flex items-center justify-center mb-3">
                    <programa.icono className="w-5 h-5 text-primary-container" />
                  </div>
                  <h3 className="text-headline-sm text-primary mb-1 text-lg">{programa.nombre}</h3>
                  <p className="text-body-md text-on-surface-variant text-sm mb-6 flex-grow">{programa.descripcion}</p>
                  <button className="text-primary text-label-md flex items-center gap-1 hover:text-secondary transition-colors">
                    Informacion <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Institutional Logos */}
        <section className="py-6 bg-surface-container-highest border-t border-outline-variant/20">
          <div className="max-w-7xl mx-auto px-2 md:px-12 flex flex-col md:flex-row justify-center items-center gap-12 md:gap-24 opacity-70 grayscale hover:grayscale-0 transition-all duration-300">
            <div className="flex items-center gap-3">
              <Landmark className="w-10 h-10 text-primary" />
              <span className="text-headline-sm font-bold text-primary">Gobierno de Chile</span>
            </div>
            <div className="flex items-center gap-3">
              <Shield className="w-10 h-10 text-secondary" />
              <span className="text-headline-sm font-bold text-secondary">CMVA</span>
            </div>
            <div className="flex items-center gap-3">
              <BadgeCheck className="w-10 h-10 text-tertiary" />
              <span className="text-headline-sm font-bold text-tertiary">Superintendencia de Salud</span>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* Chat widget (floating) */}
      <Chat widget />
    </div>
  );
}