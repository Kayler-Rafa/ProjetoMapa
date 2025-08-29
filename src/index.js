import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import App from "./App";
import Admin from "./admin"; // <-- usar mesmo case do arquivo


const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Página principal (mapa) */}
        <Route path="/" element={<App />} />

        {/* Página admin */}
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
