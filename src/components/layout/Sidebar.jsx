import React from "react";
import { useAuth } from "../../context/AuthContext";

const CORES = {
  roxoEscuro: "#574591",
  roxoMedio: "#766AA7",
  roxoClaro: "#CEC9DD",
  laranja: "#F4A521",
};

export default function Sidebar({
  view,
  mudarView,
  aberto,
  fecharMenu,
}) {
  const { user, logout } = useAuth();

  const nivel = parseInt(user?.nivel_acesso || 2);

  const menuPrincipal = [
    {
      id: "estoque",
      icon: "📦",
      label: "Estoque Geral",
    },
    {
      id: "solicitacoes",
      icon: "📥",
      label: "Solicitações",
    },
    {
      id: "gerenciar",
      icon: "➕",
      label: "Novo Material",
    },
    {
      id: "nova_saida",
      icon: "📤",
      label: "Registrar Saída",
    },
    {
      id: "projetos_graficos",
      icon: "📊",
      label: "Dashboard Projetos",
    },
  ];

  const menuAdministracao = [
    ...(nivel <= 1
      ? [
          {
            id: "auditoria",
            icon: "📜",
            label: "Log Departamento",
          },
        ]
      : []),

    ...(nivel <= 1
      ? [
          {
            id: "configs",
            icon: "👥",
            label: "Controle Usuários",
          },
        ]
      : []),

    {
      id: "mudar_senha",
      icon: "🔑",
      label: "Trocar Senha",
    },
  ];

  const navegar = (id) => {
    mudarView(id);
    fecharMenu?.();
  };

  return (
    <>
      {aberto && (
        <div
          className="sidebar-overlay"
          onClick={fecharMenu}
        />
      )}

      <aside
        className={`sidebar ${
          aberto ? "sidebar-open" : ""
        }`}
      >

        <div className="sidebar-logo">
          <img
            src="/logo-territorio.png"
            alt="Território do Fazer"
          />
        </div>

        <div className="sidebar-section">
          <span>MENU</span>
        </div>

        <nav>
          {menuPrincipal.map((item) => (
            <button
              key={item.id}
              className={`sidebar-item ${
                view === item.id
                  ? "sidebar-item-active"
                  : ""
              }`}
              onClick={() => navegar(item.id)}
            >
              <span className="sidebar-icon">
                {item.icon}
              </span>

              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {menuAdministracao.length > 0 && (
          <>
            <div className="sidebar-section">
              <span>ADMINISTRAÇÃO</span>
            </div>

            <nav>
              {menuAdministracao.map((item) => (
                <button
                  key={item.id}
                  className={`sidebar-item ${
                    view === item.id
                      ? "sidebar-item-active"
                      : ""
                  }`}
                  onClick={() =>
                    navegar(item.id)
                  }
                >
                  <span className="sidebar-icon">
                    {item.icon}
                  </span>

                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
          </>
        )}

        <div className="sidebar-user">

          <div className="sidebar-user-avatar">
            {user?.nome?.charAt(0)?.toUpperCase()}
          </div>

          <div className="sidebar-user-info">
            <strong>{user?.nome}</strong>

            <span>
              {nivel === 0
                ? "Administrador Geral"
                : nivel === 1
                ? "Responsável"
                : "Monitor / Operador"}
            </span>
          </div>

          <button
            className="sidebar-logout"
            onClick={logout}
            title="Sair"
          >
            ↪
          </button>

        </div>

      </aside>
    </>
  );
}