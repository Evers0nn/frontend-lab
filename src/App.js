import React, { useState } from "react";
import "./index.css";

import { AuthProvider, useAuth } from "./context/AuthContext";

import Login from "./pages/Login/Login";
import Estoque from "./pages/Estoque/Estoque";
import Solicitacoes from "./pages/Solicitacoes/Solicitacoes";
import NovoMaterial from "./pages/NovoMaterial/NovoMaterial";
import RegistrarSaida from "./pages/Saidas/RegistrarSaida";
import Projetos from "./pages/Projetos/Projetos";
import Auditoria from "./pages/Auditoria/Auditoria";
import Usuarios from "./pages/Usuarios/Usuarios";
import TrocarSenha from "./pages/Perfil/TrocarSenha";

import Layout from "./components/layout/Layout";

function Sistema() {
  const { user } = useAuth();

  const [view, setView] = useState("estoque");

  if (!user) {
    return <Login />;
  }

  const renderPage = () => {
    switch (view) {
      case "estoque":
        return <Estoque />;

      case "solicitacoes":
        return <Solicitacoes />;

      case "gerenciar":
        return <NovoMaterial />;

      case "nova_saida":
        return <RegistrarSaida />;

      case "projetos_graficos":
        return <Projetos />;

      case "auditoria":
        return <Auditoria />;

      case "configs":
        return <Usuarios />;

      case "mudar_senha":
        return <TrocarSenha />;

      default:
        return <Estoque />;
    }
  };

  return (
    <Layout
      view={view}
      mudarView={setView}
    >
      {renderPage()}
    </Layout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Sistema />
    </AuthProvider>
  );
}