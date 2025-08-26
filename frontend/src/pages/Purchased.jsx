import React, { useEffect, useState } from "react";
import { api } from "../services/api.js";

export default function Purchased() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const data = await api.get("/purchased"); // { items: [{ id, title, author, year, imageUrl }] }
        setItems(data.items || []);
      } catch {
        setErr("No se pudieron cargar tus obras.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <p>Cargando obras…</p>;
  if (err) return <p style={{ color: "#ff6b6b" }}>{err}</p>;

  return (
    <section>
      <h2 style={{ margin: "0 0 12px" }}>Obras adquiridas</h2>

      {items.length === 0 ? (
        <p>No has adquirido obras todavía.</p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: 12,
          }}
        >
          {items.map((it) => (
            <div key={it.id} className="card">
              <div style={{ marginBottom: 8 }}>
                <img
                  src={it.imageUrl}
                  alt={it.title}
                  style={{ width: "100%", height: 150, objectFit: "cover", borderRadius: 4 }}
                />
              </div>
              <div style={{ fontWeight: "bold" }}>{it.title}</div>
              <div style={{ color: "#bbb", fontSize: 14 }}>
                {it.author} • {it.year}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
