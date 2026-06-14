import { Header } from '../components/header';
import { Footer } from '../components/footer';
import { BookingForm } from '../components/agendar/formulario';

export default function AgendarPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 py-8 md:py-12 bg-surface">
        <div className="max-w-5xl mx-auto px-2 md:px-12">
          <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/30 p-6 md:p-10">
            <BookingForm />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
