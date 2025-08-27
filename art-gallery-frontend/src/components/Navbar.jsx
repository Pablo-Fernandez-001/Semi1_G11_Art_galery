// src/components/Navbar.jsx
import React from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header
      style={{
        background: "#1f1f1f",
        padding: "10px 20px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      {/* Logo */}
      <Link
        to="/"
        style={{
          fontWeight: "bold",
          color: "white",
          textDecoration: "none",
        }}
      >
        ArtGalleryCloud
      </Link>

      {/* Links en fila */}
      <nav
        style={{
          display: "flex",
          gap: "15px",
          alignItems: "center",
        }}
      >
        <NavLink to="/" style={{ color: "white", textDecoration: "none" }}>
          Galería
        </NavLink>
        {isAuthenticated && (
          <>
            <NavLink
              to="/purchased"
              style={{ color: "white", textDecoration: "none" }}
            >
              Obras
            </NavLink>
            <NavLink
              to="/profile"
              style={{ color: "white", textDecoration: "none" }}
            >
              Perfil
            </NavLink>
          </>
        )}
        {!isAuthenticated && (
          <>
            <NavLink
              to="/login"
              style={{ color: "white", textDecoration: "none" }}
            >
              Ingresar
            </NavLink>
            <NavLink
              to="/register"
              style={{ color: "white", textDecoration: "none" }}
            >
              Registro
            </NavLink>
          </>
        )}
        {isAuthenticated && (
          <button
            onClick={() => {
              logout();
              navigate("/");
            }}
            style={{
              background: "transparent",
              color: "white",
              border: "1px solid #444",
              borderRadius: "4px",
              padding: "5px 10px",
              cursor: "pointer",
            }}
          >
            Salir
          </button>
        )}
      </nav>
    </header>
  );
}
