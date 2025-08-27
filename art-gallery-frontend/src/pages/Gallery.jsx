// src/pages/Gallery.jsx
import React, { useEffect, useState } from "react";
import { api } from "../services/api.js";

export default function Gallery() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null); // para deshabilitar botón mientras compra

  // Recuperar usuario desde localStorage
  const user = JSON.parse(localStorage.getItem("user") || "null");

  useEffect(() => {
    (async () => {
      try {
        const data = await api.get("/galeria");
        setItems(data || []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function comprar(obraId) {
    if (!user) {
      alert("Debes iniciar sesión para comprar.");
      return;
    }
    setBusyId(obraId);
    try {
      await api.post("/comprar", { usuario_id: user.id, obra_id: obraId });
      alert("Compra realizada ✅");
      // refrescar disponibilidad
      setItems((prev) =>
        prev.map((it) =>
          it.id === obraId ? { ...it, disponible: false } : it
        )
      );
    } catch (err) {
      console.error(err);
      alert("No se pudo completar la compra ❌");
    } finally {
      setBusyId(null);
    }
  }

  if (loading) return <p className="text-neutral-400">Cargando galería…</p>;

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold text-white">Galería</h1>

      {items.length === 0 ? (
        <p className="text-neutral-400">No hay obras disponibles.</p>
      ) : (
        <ul className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {items.map((it) => (
            <li
              key={it.id}
              className="bg-neutral-900/70 border border-neutral-800 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition flex flex-col"
            >
              {/* Imagen arriba */}
              <img
                src={it.imagen_url}
                alt={it.titulo}
                className="w-full h-48 object-cover"
              />

              {/* Datos debajo */}
              <div className="p-3 flex-1 flex flex-col justify-between text-sm text-white">
                <div>
                  <div className="font-semibold truncate">{it.titulo}</div>
                  <div className="text-neutral-400">
                    {it.autor} • {it.año_publicacion}
                  </div>
                  <div className="text-yellow-400 font-semibold mt-1">
                    ${it.precio} {/* precio agregado */}
                  </div>
                </div>

                {/* Estado + botón */}
                <div className="mt-3 flex items-center justify-between">
                  <span
                    className={`text-xs ${
                      it.disponible ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {it.disponible ? "Disponible" : "No disponible"}
                  </span>

                  {it.disponible && (
                    <button
                      onClick={() => comprar(it.id)}
                      disabled={busyId === it.id}
                      className="text-xs px-3 py-1 rounded-lg bg-gradient-to-r from-pink-400 to-purple-400 text-black font-semibold hover:from-pink-300 hover:to-purple-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {busyId === it.id
                        ? "Comprando…"
                        : `Adquirir $${it.precio}`} {/* mostrar precio en botón */}
                    </button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
