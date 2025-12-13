"use client"; //para manejar inputs

import { useState } from "react";
import { authClient } from "@/lib/auth-client"; //cliente configurado
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  
  //Estados para capturar lo que escribe el usuario
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    //Llamada a la función de registro
    await authClient.signUp.email({
        email: email,
        password: password,
        name: name,
        callbackURL: "/dashboard", // A donde va si sale bien
        // image: "" -> OJO: El tema de la imagen es complejo (ver nota abajo)
    }, {
        onSuccess: (ctx) => {
            //mando al login o al dashboard.
            router.push("/login"); 
        },
        onError: (ctx) => {
            alert(ctx.error.message);
            setIsLoading(false);
        }
    });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900">
      <form onSubmit={handleRegister} className="bg-slate-800 p-8 w-full max-w-sm rounded-xl border border-slate-700 space-y-4">
        <h1 className="text-center text-2xl font-bold text-white">Crear cuenta</h1>

        {/* Campo Nombre */}
        <div className="space-y-2">
            <Label className="text-white">Apellido y Nombre</Label>
            <Input 
                required 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                placeholder="Juan Perez"
                className="text-white"
            />
        </div>

        {/* Campo Email */}
        <div className="space-y-2">
            <Label className="text-white">Email</Label>
            <Input 
                required 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                placeholder="juan@ejemplo.com"
                className="text-white"
            />
        </div>

        {/* Campo Password */}
        <div className="space-y-2">
            <Label className="text-white">Contraseña</Label>
            <Input 
                required 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                placeholder="******"
                className="text-white"
            />
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? <Loader2 className="animate-spin mr-2"/> : null}
          Registrarse
        </Button>
      </form>
    </div>
  );
}