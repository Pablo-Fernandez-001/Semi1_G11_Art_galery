import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../services/api.js";
import { useAuth } from "../hooks/useAuth.js";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { saveSession } = useAuth();

  async function submit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const data = await api.post("/login", { username, password });
      // data esperado: { token, user: { username, fullName, avatarUrl } }
      saveSession(data);
      navigate("/");
    } catch {
      setError("Usuario o contraseña incorrectos.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section>
      <h2 style={{ margin: "10px 0 12px" }}>Ingresar</h2>
      <form onSubmit={submit}>
        <input
          type="text"
          placeholder="Usuario"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && (
          <p style={{ color: "#ff6b6b", fontSize: 14, marginBottom: 10 }}>
            {error}
          </p>
        )}

        <button type="submit" disabled={busy}>
          {busy ? "Ingresando..." : "Entrar"}
        </button>
      </form>

      <p style={{ marginTop: 12 }}>
        ¿No tienes cuenta? <Link to="/register">Regístrate</Link>
      </p>
    </section>
  );
}
