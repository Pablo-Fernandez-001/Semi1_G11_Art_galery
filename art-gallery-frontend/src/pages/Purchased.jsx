import React, { useEffect, useState } from "react";
import { api } from "../services/api.js";

export default function Purchased() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // Recuperar usuario desde localStorage
  const user = JSON.parse(localStorage.getItem("user") || "null");

  useEffect(() => {
    (async () => {
      if (!user) {
        setErr("Debes iniciar sesión para ver tus obras.");
        setLoading(false);
        return;
      }

      try {
        const data = await api.get(`/usuario/${user.id}/compras`);
        setItems(data || []);
      } catch {
        setErr("No se pudieron cargar tus obras.");
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  if (loading) return <p className="text-neutral-400">Cargando obras…</p>;
  if (err) return <p className="text-red-500">{err}</p>;

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold text-white">Obras adquiridas</h2>

      {items.length === 0 ? (
        <p className="text-neutral-400">No has adquirido obras todavía.</p>
      ) : (
        <ul className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {items.map((it) => (
            <li
              key={it.id}
              className="bg-neutral-900/70 border border-neutral-800 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition flex flex-col"
            >
              <img
                src={it.imagen_url}
                alt={it.titulo}
                className="w-full h-48 object-cover"
              />
              <div className="p-3 flex-1 flex flex-col justify-between text-sm text-white">
                <div>
                  <div className="font-semibold truncate">{it.titulo}</div>
                  <div className="text-neutral-400">
                    {it.autor} • {it.año_publicacion}
                  </div>
                  <div className="text-neutral-400 text-xs mt-1">
                    Comprado el: {new Date(it.fecha_compra).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
