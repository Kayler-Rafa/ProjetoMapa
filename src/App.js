import React, { useEffect, useRef, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { ReactComponent as Mapa } from "./MapaSem.svg";

// --- Supabase ---
const supabaseUrl = "https://ffkgrwmstrnfmiddbysf.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZma2dyd21zdHJuZm1pZGRieXNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0MTU5MDksImV4cCI6MjA3MTk5MTkwOX0.7izMXSyPc36H-EW6tRJYI2ZVk17othv7Bi0yiSiHpLo";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Cores
const COLOR_DEFAULT = "";          // volta para a cor original do SVG
const COLOR_SELECTED = "#90caf9";  // azul (selecionada no front)
const COLOR_SAVED = "#9e9e9e";     // cinza (já confirmada no BD)

// Tag names válidas para clique
const CLICKABLE_TAGS = new Set(["path", "polygon", "rect"]);

export default function App() {
  const svgRef = useRef(null);

  const [selected, setSelected] = useState([]); // no front (azul)
  const [saved, setSaved] = useState([]);       // já no BD (cinza)
  const [loading, setLoading] = useState(true);

  // ------ Utils de pintura ------
  const getShapes = () => {
    const root = svgRef.current;
    if (!root) return [];
    return root.querySelectorAll("path, polygon, rect");
  };

  // Salva a cor original de cada shape (uma única vez)
  const cacheOriginalFills = () => {
    getShapes().forEach((el) => {
      if (!el.dataset.origFill) {
        const attrFill =
          el.getAttribute("fill") ||
          el.style.fill ||
          window.getComputedStyle(el).fill ||
          "";
        el.dataset.origFill = attrFill;
      }
    });
  };

  // Aplica as cores (ordem: saved > selected > original)
  const applyColors = () => {
    getShapes().forEach((el) => {
      const id = el.id;
      if (!id) return;

      if (saved.includes(id)) {
        el.style.fill = COLOR_SAVED;
        el.style.opacity = 1;
      } else if (selected.includes(id)) {
        el.style.fill = COLOR_SELECTED;
        el.style.opacity = 1;
      } else {
        // volta para a cor original exportada no SVG
        el.style.fill = el.dataset.origFill || COLOR_DEFAULT;
        el.style.opacity = "";
      }
    });
  };

  // ------ Carrega do BD ------
  useEffect(() => {
    const fetchSaved = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("quadras")
        .select("path_name")
        .eq("marcada", true);

      if (error) {
        console.error("Erro ao carregar do Supabase:", error);
      } else {
        setSaved(data.map((q) => q.path_name));
      }
      setLoading(false);
    };

    fetchSaved();
  }, []);

  // Após o SVG montar, cachear cores originais
  useEffect(() => {
    cacheOriginalFills();
    applyColors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]); // roda quando terminou de carregar a página/BD

  // Sempre que selected/saved mudar, repinta
  useEffect(() => {
    applyColors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, saved]);

  // ------ Clique no SVG ------
  const onSvgClick = (e) => {
    const tag = (e.target.tagName || "").toLowerCase();
    if (!CLICKABLE_TAGS.has(tag)) return;

    const id = e.target.id;
    if (!id) return;

    // Se já está salva no BD, não permite mexer
    if (saved.includes(id)) return;

    setSelected((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  // ------ Confirmar (salvar no BD) ------
  const handleConfirm = async () => {
    if (selected.length === 0) return;

    const rows = selected.map((path_name) => ({ path_name, marcada: true }));

    const { error } = await supabase
      .from("quadras")
      .upsert(rows, { onConflict: "path_name" }); // exige índice único em path_name

    if (error) {
      console.error("Erro ao salvar:", error);
      return;
    }

    setSaved((prev) => [...new Set([...prev, ...selected])]);
    setSelected([]);
    applyColors();
  };

  // ------ Reset (apaga tudo do BD) ------
  const handleReset = async () => {
    // apaga todas as linhas onde path_name não é nulo
    const { data, error } = await supabase
      .from("quadras")
      .delete()
      .not("path_name", "is", null) // supabase v2
      .select();

    if (error) {
      console.error("Erro ao resetar:", error);
      return;
    }

    // limpa estados e repinta
    setSaved([]);
    setSelected([]);
    applyColors();
    console.log("Removidas:", data?.length ?? 0);
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100 p-6">
      <h1 className="text-2xl font-bold mb-6">Mapa Interativo</h1>

      <div className="w-full max-w-5xl bg-white border rounded-lg shadow p-2">
        <Mapa
          ref={svgRef}
          className="w-full h-auto"
          onClick={onSvgClick}
          style={{ cursor: "pointer" }}
        />
      </div>

      <div className="mt-6 flex gap-3">
        <button
          onClick={handleConfirm}
          className="px-4 py-2 bg-green-600 text-white rounded-lg shadow disabled:opacity-50"
          disabled={selected.length === 0}
        >
          Confirmar seleção ({selected.length})
        </button>

        <button
          onClick={handleReset}
          className="px-4 py-2 bg-red-600 text-white rounded-lg shadow"
        >
          Resetar quadras
        </button>
      </div>

      <div className="mt-4 text-sm text-gray-700">
        <div>Selecionadas (front): {selected.join(", ") || "—"}</div>
        <div>Confirmadas (BD): {saved.join(", ") || "—"}</div>
      </div>

      {/* Sem borda preta: não defino stroke aqui. Se quiser hover, use só opacidade */}
      <style>{`
        .hoverable:hover { opacity: 0.85; }
      `}</style>
    </div>
  );
}
