import React, { useEffect, useRef, useState } from "react";
import { ReactComponent as Esmeralda } from "./MapaSem.svg";

export default function App() {
  const svgRef = useRef(null);
  const [selected, setSelected] = useState(new Set());

  useEffect(() => {
    const svgEl = svgRef.current;
    if (!svgEl) return;

    // Seleciona apenas QUADRAS (não pontos/textos)
    const shapes = svgEl.querySelectorAll("path, polygon, rect");
    let counter = 1;

    shapes.forEach((el) => {
      if (!el.id) {
        el.id = `quadra-${counter}`;
        counter += 1;
      }
      el.classList.add("quadra");
      el.style.pointerEvents = "auto";
      el.style.cursor = "pointer";

      // adiciona event listener direto no shape
      el.addEventListener("click", () => toggleSelect(el.id, el));
    });

    // cleanup dos listeners
    return () => {
      shapes.forEach((el) => {
        el.replaceWith(el.cloneNode(true)); // remove listeners
      });
    };
  }, []);

  const toggleSelect = (id, el) => {
    const next = new Set(selected);
    if (next.has(id)) {
      next.delete(id);
      el.classList.remove("selected");
    } else {
      next.add(id);
      el.classList.add("selected");
    }
    setSelected(next);
  };

  const resetAll = () => {
    const svgEl = svgRef.current;
    if (svgEl) {
      svgEl.querySelectorAll(".selected").forEach((el) =>
        el.classList.remove("selected")
      );
    }
    setSelected(new Set());
  };

  return (
    <div className="min-h-screen flex flex-col items-center gap-4 p-4 bg-gray-100">
      <h1 className="text-2xl font-semibold">Mapa Interativo</h1>

      <div className="w-full max-w-4xl border rounded-lg bg-white shadow p-2">
        <Esmeralda ref={svgRef} style={{ width: "100%", height: "auto" }} />
      </div>

      <div className="w-full max-w-4xl flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h2 className="font-medium">Selecionadas ({selected.size})</h2>
          <button
            onClick={resetAll}
            className="px-3 py-1.5 rounded-md bg-gray-900 text-white hover:bg-gray-800"
          >
            Limpar Seleção
          </button>
        </div>
        <div className="min-h-10 bg-white rounded-md border p-3 text-sm">
          {selected.size === 0 ? (
            <span className="text-gray-500">Nenhuma quadra selecionada</span>
          ) : (
            <div className="flex flex-wrap gap-2">
              {[...selected].map((id) => (
                <span
                  key={id}
                  className="px-2 py-1 rounded bg-orange-100 text-orange-700 border border-orange-300"
                >
                  {id}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .quadra:hover { opacity: 0.85; }
        .selected { fill: #999fa5ff !important; opacity: 1 !important; }
      `}</style>
    </div>
  );
}
