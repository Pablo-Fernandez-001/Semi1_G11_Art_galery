import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../services/api.js";

export default function Register() {
  const [form, setForm] = useState({
    username: "",
    fullName: "",
    password: "",
    confirm: "",
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  function onChange(k, v) {
    setForm((s) => ({ ...s, [k]: v }));
  }

  async function submit(e) {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirm) {
      return setError("Las contraseñas no coinciden.");
    }

    setBusy(true);
    try {
      // 1) Subir avatar opcional a S3 (Fotos_Perfil/)
      let avatarPath = null;
      if (avatarFile) {
        const key = `Fotos_Perfil/${form.username}.jpg`;
        const { url } = await api.get(
          `/upload-url?key=${encodeURIComponent(key)}&contentType=${encodeURIComponent(
            avatarFile.type || "image/jpeg"
          )}`
        );
        await api.putFile(url, avatarFile); // PUT binario a S3
        avatarPath = key; // guardamos solo la ruta
      }

      // 2) Registrar en backend
      await api.post("/register", { ...form, avatarPath });
      navigate("/login");
    } catch {
      setError("No se pudo registrar (usuario existente o error de red).");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section>
      <h2 style={{ margin: "10px 0 12px" }}>Registro</h2>

      <form onSubmit={submit}>
        <input
          type="text"
          placeholder="Usuario"
          value={form.username}
          onChange={(e) => onChange("username", e.target.value)}
        />
        <input
          type="text"
          placeholder="Nombre completo"
          value={form.fullName}
          onChange={(e) => onChange("fullName", e.target.value)}
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={form.password}
          onChange={(e) => onChange("password", e.target.value)}
        />
        <input
          type="password"
          placeholder="Confirmación de contraseña"
          value={form.confirm}
          onChange={(e) => onChange("confirm", e.target.value)}
        />

        <div style={{ marginBottom: 12 }}>
          <label style={{ display: "block", marginBottom: 6, fontSize: 14 }}>
            Foto de perfil (opcional)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
          />
          {avatarFile && (
            <div style={{ marginTop: 8 }}>
              <img
                src={URL.createObjectURL(avatarFile)}
                alt="Preview"
                style={{
                  width: 80,
                  height: 80,
                  objectFit: "cover",
                  borderRadius: "50%",
                  border: "1px solid #333",
                }}
                onLoad={(e) => URL.revokeObjectURL(e.currentTarget.src)}
              />
            </div>
          )}
        </div>

        {error && (
          <p style={{ color: "#ff6b6b", fontSize: 14, marginBottom: 10 }}>
            {error}
          </p>
        )}

        <button type="submit" disabled={busy}>
          {busy ? "Creando cuenta..." : "Crear cuenta"}
        </button>
      </form>

      <p style={{ marginTop: 12 }}>
        ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
      </p>
    </section>
  );
}
