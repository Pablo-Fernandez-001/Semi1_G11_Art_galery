import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api.js";
import { useAuth } from "../hooks/useAuth.js";

export default function Profile() {
  const { user } = useAuth(); // usuario logueado
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!user) return;

    (async () => {
      try {
        const data = await api.get(`/usuario/${user.id}`);
        setMe(data);
      } catch {
        setErr("No se pudo cargar tu perfil.");
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  async function agregarSaldo() {
    const montoStr = prompt("Ingresa la cantidad a agregar:");
    if (!montoStr) return;
    const monto = parseFloat(montoStr);
    if (isNaN(monto) || monto <= 0) {
      alert("Cantidad inválida.");
      return;
    }

    try {
      await api.post(`/usuario/${user.id}/saldo`, { monto });
      // refrescar saldo
      const data = await api.get(`/usuario/${user.id}`);
      setMe(data);
      alert(`Se agregaron Q ${monto.toFixed(2)} a tu saldo.`);
    } catch (err) {
      console.error(err);
      alert("No se pudo agregar saldo.");
    }
  }

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
          {me.foto_perfil ? (
            <img
              src={me.foto_perfil}
              alt={me.username}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : null}
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: "bold", marginBottom: 4 }}>{me.nombre_completo}</div>
          <div style={{ color: "#bbb", fontSize: 14, marginBottom: 6 }}>@{me.username}</div>
          <div style={{ fontSize: 14 }}>
            Saldo: <b>Q {Number(me.saldo || 0).toFixed(2)}</b>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <Link
            to="/edit-profile"
            style={{
              padding: "8px 12px",
              border: "1px solid #444",
              borderRadius: 4,
              color: "white",
              textDecoration: "none",
              textAlign: "center",
            }}
          >
            Editar perfil
          </Link>

          <button
            onClick={agregarSaldo}
            style={{
              padding: "8px 12px",
              border: "1px solid #444",
              borderRadius: 4,
              color: "white",
              background: "linear-gradient(to right, #4ade80, #16a34a)",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Agregar saldo
          </button>
        </div>
      </div>
    </section>
  );
}
