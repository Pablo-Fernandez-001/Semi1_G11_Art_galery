import React from "react";
import { Routes, Route, Navigate, Link } from "react-router-dom";

// Importa tus páginas
import Gallery from "./pages/Gallery.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Profile from "./pages/Profile.jsx";
import EditProfile from "./pages/EditProfile.jsx";
import Purchased from "./pages/Purchased.jsx";

import { useAuth } from "./hooks/useAuth.js";

export default function App() {
  const { isAuthenticated, logout } = useAuth();

  return (
    <div>
      {/* Navbar simple */}
      <header>
        <h1>ArtGalleryCloud</h1>
        <nav>
          <Link to="/">Galería</Link>
          {isAuthenticated && <Link to="/purchased">Obras</Link>}
          {isAuthenticated && <Link to="/profile">Perfil</Link>}
          {!isAuthenticated && <Link to="/login">Ingresar</Link>}
          {!isAuthenticated && <Link to="/register">Registro</Link>}
          {isAuthenticated && (
            <button
              style={{
                marginLeft: "10px",
                background: "transparent",
                color: "white",
                border: "none",
                cursor: "pointer",
              }}
              onClick={logout}
            >
              Salir
            </button>
          )}
        </nav>
      </header>

      {/* Contenido */}
      <main>
        <Routes>
          <Route path="/" element={<Gallery />} />
          <Route
            path="/login"
            element={isAuthenticated ? <Navigate to="/" /> : <Login />}
          />
          <Route
            path="/register"
            element={isAuthenticated ? <Navigate to="/" /> : <Register />}
          />
          <Route
            path="/profile"
            element={isAuthenticated ? <Profile /> : <Navigate to="/login" />}
          />
          <Route
            path="/edit-profile"
            element={isAuthenticated ? <EditProfile /> : <Navigate to="/login" />}
          />
          <Route
            path="/purchased"
            element={isAuthenticated ? <Purchased /> : <Navigate to="/login" />}
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>

      {/* Footer simple */}
      <footer>
        <p>© {new Date().getFullYear()} ArtGalleryCloud – SEMI1</p>
      </footer>
    </div>
  );
}
