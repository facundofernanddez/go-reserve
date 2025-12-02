import Link from "next/link";

export default function NavBar() {
  return (
    <nav className="my-4 flex justify-between">
      <span className="text-3xl font-bold">GoReserve</span>
      <div className="space-x-6 text-xl cursor-pointer">
        <Link
          href="/booking"
          className=""
        >
          Reservar
        </Link>
        <Link
          href="/auth/login"
          className=""
        >
          Admin
        </Link>
      </div>
    </nav>
  );
}
