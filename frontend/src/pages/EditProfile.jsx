import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api.js";

export default function EditProfile() {
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState(""); // contraseña actual para confirmar cambios
  const [avatarFile, setAvatarFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  async function submit(e) {
    e.preventDefault();
    setMsg("");
    if (!password) {
      return setMsg("Debes ingresar tu contraseña para confirmar los cambios.");
    }

    setBusy(true);
    try {
      // Subida opcional de nueva foto a S3
      let avatarPath = null;
      if (avatarFile) {
        const ext = (avatarFile.name.split(".").pop() || "jpg").toLowerCase();
        const key = `Fotos_Perfil/${Date.now()}.${ext}`;
        const { url } = await api.get(
          `/upload-url?key=${encodeURIComponent(key)}&contentType=${encodeURIComponent(
            avatarFile.type || "image/jpeg"
          )}`
        );
        await api.putFile(url, avatarFile); // PUT binario a S3
        avatarPath = key; // en BD guardas solo la ruta
      }

      await api.post("/edit-profile", { fullName, password, avatarPath });
      navigate("/profile");
    } catch {
      setMsg("No se pudo actualizar (verifica tu contraseña o la red).");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section>
      <h2 style={{ margin: "0 0 12px" }}>Editar perfil</h2>

      <form onSubmit={submit}>
        <input
          type="text"
          placeholder="Nuevo nombre (opcional)"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />

        <div style={{ marginBottom: 12 }}>
          <label style={{ display: "block", marginBottom: 6, fontSize: 14 }}>
            Nueva foto (opcional)
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

        <input
          type="password"
          placeholder="Contraseña para confirmar cambios"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {msg && <p style={{ color: "#ff6b6b", fontSize: 14, marginBottom: 10 }}>{msg}</p>}

        <button type="submit" disabled={busy}>
          {busy ? "Guardando…" : "Guardar cambios"}
        </button>
      </form>
    </section>
  );
}
