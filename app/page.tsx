import Link from "next/link";

export default function HomePage() {
  return (
    // CONTENEDOR PRINCIPAL: Asegura que ocupe al menos toda la pantalla
    <div className="relative min-h-screen w-full flex flex-col font-sans overflow-hidden">

      {/* --- ZONA DE FONDOS (Fixed para que no se mueva al hacer scroll) --- */}
      <div className="fixed inset-0 z-0">
        
        {/* CAPA 1: Imagen de PÁDEL (Derecha - Fondo base) */}
        <div className="absolute inset-0">
          <img
            src="/padel.jpg"
            alt="Fondo de pagina principal"
            className="w-full h-full object-cover object-center"
          />
           {/* Overlay oscuro para el lado del pádel */}
          <div className="absolute inset-0 bg-black/60"></div>
        </div>

        {/* CAPA 3: Overlay general para unificar (opcional) */}
        <div className="absolute inset-0 bg-black/30"></div>
      </div>


      {/* --- CONTENIDO (Va encima del fondo con z-10) --- */}
      {/* flex-1 asegura que este contenedor ocupe todo el espacio disponible */}
      <div className="relative z-10 flex-1 flex flex-col">
        
        {/* 1. NAVBAR */}
        <header className="border-b border-white/10 backdrop-blur-md sticky top-0">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <div className="text-2xl font-black text-emerald-400 tracking-wider drop-shadow-sm">
              Go-Reserve
            </div>

            <nav className="flex gap-4">
              <Link
                href="/auth/login"
                className="px-4 py-2 text-sm font-medium text-slate-200 hover:text-white transition-colors"
              >
                Iniciar Sesión
              </Link>
              <Link
                href="/auth/register"
                className="bg-emerald-500 hover:bg-emerald-600 text-white text-sm px-4 py-2 rounded-md transition-colors font-bold shadow-lg shadow-emerald-500/20"
              >
                Registrarse
              </Link>
            </nav>
          </div>
        </header>

        {/* 2. HERO SECTION */}
        {/* flex-1 aquí empuja el footer hacia abajo */}
        <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20">
          <h1 className="text-5xl md:text-8xl font-black mb-8 tracking-tighter text-white drop-shadow-2xl">
            TU PARTIDO <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-green-300 to-teal-400">
              ASEGURADO
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-200 max-w-3xl mb-12 drop-shadow-lg font-medium leading-relaxed">
            Reserva tu cancha favorita en segundos. Sin llamadas, directo al juego.
          </p>

          <div className="flex flex-col sm:flex-row gap-6">
            <Link
              href="/app/components"
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-lg px-10 py-4 rounded-full font-black transition-all transform hover:scale-105 shadow-xl shadow-emerald-500/30"
            >
              RESERVAR AHORA
            </Link>
            <Link
              href="/about"
              className="border-2 border-slate-400/50 hover:border-white text-white text-lg px-10 py-4 rounded-full font-bold transition-all hover:bg-white/10 backdrop-blur-sm"
            >
              Saber más
            </Link>
          </div>
        </main>

        {/* 3. FEATURES */}
        <section className="py-20 bg-black/40 backdrop-blur-md border-t border-white/10">
          <div className="container mx-auto px-4 grid md:grid-cols-3 gap-8">
            {/* Tarjetas con fondo semi-transparente */}
            <div className="p-8 rounded-2xl bg-slate-900/60 border border-white/10 hover:border-emerald-500/50 transition-all hover:-translate-y-1">
              <div className="text-5xl mb-6">📅</div>
              <h3 className="text-2xl font-bold mb-4 text-white">Reserva 24/7</h3>
              <p className="text-slate-300 text-lg">
                Tu cancha disponible a cualquier hora. Olvídate de que no te atiendan el teléfono.
              </p>
            </div>
            
            <div className="p-8 rounded-2xl bg-slate-900/60 border border-white/10 hover:border-emerald-500/50 transition-all hover:-translate-y-1">
              <div className="text-5xl mb-6">⚡</div>
              <h3 className="text-2xl font-bold mb-4 text-white">Confirmación Real</h3>
              <p className="text-slate-300 text-lg">
                Nada de "te aviso". Si la app dice que es tuya, la cancha es tuya al instante.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-slate-900/60 border border-white/10 hover:border-emerald-500/50 transition-all hover:-translate-y-1">
              <div className="text-5xl mb-6">📍</div>
              <h3 className="text-2xl font-bold mb-4 text-white">Clubes Cercanos</h3>
              <p className="text-slate-300 text-lg">
                Usa tu ubicación para encontrar las mejores canchas de fútbol y pádel en tu zona.
              </p>
            </div>
          </div>
        </section>

        {/* 4. Footer */}
        <footer className="py-8 text-center text-slate-400 text-sm border-t border-white/10 bg-black/60 backdrop-blur-md font-medium">
          <p>© 2024 Go-Reserve. Fútbol & Pádel.</p>
        </footer>

      </div>
    </div>
  );
}