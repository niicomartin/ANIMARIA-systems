"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [usuario, setUsuario] = useState("");

  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  // =========================
  // LOGIN
  // =========================

  const iniciarSesion = async () => {
    try {
      if (!usuario || !password) {
        alert("Complete usuario y contraseña");

        return;
      }

      setLoading(true);

      const res = await fetch("/api/login", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          usuario,
          password,
        }),
      });

      const data = await res.json();

      // ERROR

      if (!res.ok) {
        alert(data.error);

        setLoading(false);

        return;
      }

      // COOKIE

      document.cookie = `usuarioLogueado=${data.usuario}; path=/`;

      // LOCAL STORAGE

      localStorage.setItem(
        "usuarioLogueado",
        JSON.stringify({
          usuario: data.usuario,

          rol: data.rol,
        }),
      );

      // REDIRECCION

      if (data.rol === "admin") {
        router.push("/dashboard");
      } else {
        router.push("/ventas");
      }
    } catch (error) {
      console.log(error);

      alert("Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-10 rounded-2xl shadow w-[400px]">
        <h1 className="text-4xl font-bold text-center text-black mb-8">
          ANIMARIA
        </h1>

        {/* INPUTS */}

        <div className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Usuario"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            className="border p-3 rounded-xl text-black"
          />

          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border p-3 rounded-xl text-black"
          />
        </div>

        {/* BOTON */}

        <button
          onClick={iniciarSesion}
          disabled={loading}
          className="bg-black text-white w-full py-3 rounded-xl mt-6 hover:bg-gray-800 disabled:bg-gray-400"
        >
          {loading ? "Ingresando..." : "Iniciar Sesión"}
        </button>
      </div>
    </main>
  );
}
