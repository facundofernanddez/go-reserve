"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client"; 
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false); 
  
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true); // 2. Bloqueamos el botón al empezar

    await authClient.signIn.email({
      email,
      password,
    }, {
      onSuccess: () => {
        router.push("/dashboard");
        router.refresh(); // Tip extra: actualiza la data de la sesión
      },
      onError: (ctx) => {
        alert(ctx.error.message);
        setIsLoading(false); // 3. Desbloqueamos si hubo error
      }
    });
    // Nota: No desbloqueamos en onSuccess porque vamos a redirigir 
    // y no queremos que el usuario toque nada mientras cambia de página.
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="bg-slate-900 p-8 w-full max-w-sm rounded-xl border border-slate-700 space-y-4"
      >
        <h1 className="text-center text-2xl font-bold text-white">Iniciar sesión</h1>

        <div className="space-y-2">
          <Label className="text-white">Email</Label>
          <Input
            type="email"
            placeholder="tuemail@gmail.com"
            className="text-white placeholder-gray-500"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-white">Contraseña</Label>
          <Input
            type="password"
            placeholder="••••••••"
            className="text-white placeholder-gray-500"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <Button type="submit" className="w-full">
          Entrar
        </Button>
      </form>
    </div>
  );
}
