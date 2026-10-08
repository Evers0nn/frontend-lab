import React, { useState } from "react";

import Sidebar from "./Sidebar";
import Header from "./Header";

export default function Layout({
  children,
  view,
  mudarView,
}) {
  const [menuAberto, setMenuAberto] =
    useState(false);

  const titulos = {
    estoque: "Estoque Geral",
    solicitacoes: "Solicitações",
    gerenciar: "Novo Material",
    nova_saida: "Registrar Saída",
    projetos_graficos: "Dashboard de Projetos",
    auditoria: "Auditoria",
    configs: "Controle de Usuários",
    mudar_senha: "Segurança",
  };

  return (
    <div className="app-layout">

      <Sidebar
        view={view}
        mudarView={mudarView}
        aberto={menuAberto}
        fecharMenu={() =>
          setMenuAberto(false)
        }
      />

      <main className="main-area">

        <Header
          abrirMenu={() =>
            setMenuAberto(true)
          }
          titulo={
            titulos[view] ||
            "Controle de Materiais"
          }
        />

        <section className="content-area">
          {children}
        </section>

      </main>

    </div>
  );
}