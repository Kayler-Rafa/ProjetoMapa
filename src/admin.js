import React, { useState } from "react";
import { createClient } from "@supabase/supabase-js";

// --- conexão supabase (mesmo do App.js) ---
const supabaseUrl = "https://ffkgrwmstrnfmiddbysf.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZma2dyd21zdHJuZm1pZGRieXNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0MTU5MDksImV4cCI6MjA3MTk5MTkwOX0.7izMXSyPc36H-EW6tRJYI2ZVk17othv7Bi0yiSiHpLo";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function Admin() {
  const [logged, setLogged] = useState(false);
  const [password, setPassword] = useState("");
  const [confirming, setConfirming] = useState(false);

  const FAKE_PASS = "jw1914jw"; // senha fake

  const handleReset = async () => {
    const { data, error } = await supabase
      .from("quadras")
      .delete()
      .not("path_name", "is", null)
      .select();

    if (error) {
      console.error("Erro ao resetar:", error);
      alert("Erro ao resetar!");
      return;
    }

    alert(`Removidas ${data?.length ?? 0} quadras do BD.`);
    setConfirming(false);
  };

  if (!logged) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white shadow-lg rounded-xl p-8 w-80">
          <h1 className="text-xl font-bold mb-4 text-center">Login Admin</h1>
          <input
            type="password"
            placeholder="Digite a senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            onClick={() => {
              if (password === FAKE_PASS) {
                setLogged(true);
              } else {
                alert("Senha incorreta!");
              }
            }}
            className="w-full bg-blue-600 text-white py-2 rounded-lg shadow-md hover:bg-blue-700 hover:shadow-lg active:scale-95 transition"
          >
            Entrar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
      <h1 className="text-2xl font-bold mb-6">Painel Admin</h1>

      {!confirming ? (
        <button
          onClick={() => setConfirming(true)}
          className="px-6 py-3 bg-red-600 text-white font-semibold rounded-xl shadow-md hover:bg-red-700 hover:shadow-lg active:scale-95 transition"
        >
          Resetar todas as quadras
        </button>
      ) : (
        <div className="bg-white shadow-lg rounded-xl p-6 text-center">
          <p className="mb-4 font-semibold text-gray-700">
            Tem certeza que deseja resetar todas as quadras?
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={handleReset}
              className="px-5 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 hover:shadow-lg active:scale-95 transition"
            >
              Confirmar
            </button>
            <button
              onClick={() => setConfirming(false)}
              className="px-5 py-2 bg-gray-300 text-gray-800 font-semibold rounded-lg shadow-md hover:bg-gray-400 hover:shadow-lg active:scale-95 transition"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
