import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api.js";

export default function Profile() {
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const data = await api.get("/me"); // { username, fullName, balance, avatarUrl }
        setMe(data);
      } catch {
        setErr("No se pudo cargar tu perfil.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <p>Cargando perfil…</p>;
  if (err) return <p style={{ color: "#ff6b6b" }}>{err}</p>;
  if (!me) return <p>No hay datos de perfil.</p>;

  return (
    <section>
      <h2 style={{ margin: "0 0 12px" }}>Perfil</h2>

      <div className="card" style={{ display: "flex", gap: 16, alignItems: "center" }}>
        <div
          style={{
            width: 84,
            height: 84,
            borderRadius: "50%",
            overflow: "hidden",
            background: "#2a2a2a",
            border: "1px solid #333",
            flexShrink: 0,
          }}
        >
          {me.avatarUrl ? (
            <img
              src={me.avatarUrl}
              alt={me.username}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : null}
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: "bold", marginBottom: 4 }}>{me.fullName}</div>
          <div style={{ color: "#bbb", fontSize: 14, marginBottom: 6 }}>@{me.username}</div>
          <div style={{ fontSize: 14 }}>Saldo: <b>Q {Number(me.balance || 0).toFixed(2)}</b></div>
        </div>

        <Link
          to="/edit-profile"
          style={{
            padding: "8px 12px",
            border: "1px solid #444",
            borderRadius: 4,
            color: "white",
            textDecoration: "none",
          }}
        >
          Editar perfil
        </Link>
      </div>
    </section>
  );
}
