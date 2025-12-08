import Link from "next/link";

export default function NavBar() {
  return (
    <header className="sticky top-0 z-40">
      <div className="mx-auto max-w-6xl px-4">
        <nav className="mt-3 mb-4 flex items-center justify-between rounded-2xl bg-white/80 backdrop-blur border border-gray-200 shadow-sm px-4 py-2">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-green-100 grid place-items-center">
              <span className="text-green-700 font-bold">GR</span>
            </div>
            <span className="font-semibold text-gray-900">GoReserve</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/booking"
              className="text-sm text-gray-700 hover:text-green-700 transition-colors"
            >
              Reservas
            </Link>
            <Link
              href="/admin"
              className="text-sm text-gray-700 hover:text-green-700 transition-colors"
            >
              Admin
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
