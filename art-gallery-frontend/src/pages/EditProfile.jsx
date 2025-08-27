import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api.js";
import { useAuth } from "../hooks/useAuth.js";

export default function EditProfile() {
  const { user, saveSession } = useAuth();
  const [username, setUsername] = useState("");
  const [nombre, setNombre] = useState("");
  const [password, setPassword] = useState("");
  const [fotoFile, setFotoFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      setUsername(user.username);
      setNombre(user.nombre_completo);
    }
  }, [user]);

  async function submit(e) {
    e.preventDefault();
    setMsg("");
    if (!password) return setMsg("Debes ingresar tu contraseña para confirmar cambios.");

    setBusy(true);
    try {
      // Ruta de la foto (solo string)
      let fotoPath = fotoFile ? `Fotos_Perfil/${fotoFile.name}` : user.foto_perfil;

      const body = {
        username,
        nombre,
        foto_perfil: fotoPath,
        password,
      };

      await api.put(`/usuario/${user.id}`, body);

      // Actualizar sesión global
      saveSession({ ...user, username, nombre_completo: nombre, foto_perfil: fotoPath });

      navigate("/profile");
    } catch (err) {
      console.error(err);
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
          placeholder="Usuario"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="text"
          placeholder="Nombre completo"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />

        <div style={{ marginBottom: 12 }}>
          <label style={{ display: "block", marginBottom: 6, fontSize: 14 }}>Nueva foto (opcional)</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFotoFile(e.target.files?.[0] || null)}
          />
          {fotoFile && (
            <div style={{ marginTop: 8 }}>
              <img
                src={URL.createObjectURL(fotoFile)}
                alt="Preview"
                style={{ width: 80, height: 80, objectFit: "cover", borderRadius: "50%", border: "1px solid #333" }}
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
