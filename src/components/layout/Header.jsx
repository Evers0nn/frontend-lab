import React from "react";

export default function Header({
  abrirMenu,
  titulo,
}) {
  return (
    <header className="topbar">

      <button
        className="mobile-menu-button"
        onClick={abrirMenu}
      >
        ☰
      </button>

      <div className="topbar-title">
        <div>
          <h1>{titulo}</h1>
          <span>Controle de materiais</span>
        </div>
      </div>

      <img
        className="topbar-logo"
        src="/logo-instituto.png"
        alt="Instituto"
      />

    </header>
  );
}