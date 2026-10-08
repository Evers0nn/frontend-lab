import React, { useState } from "react";
import "./index.css";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { SystemProvider } from "./context/SystemContext";
import Layout from "./components/layout/Layout";
import Login from "./pages/Login/Login";
import Estoque from "./pages/Estoque/Estoque";
import Solicitacoes from "./pages/Solicitacoes/Solicitacoes";
import NovoMaterial from "./pages/NovoMaterial/NovoMaterial";
import RegistrarSaida from "./pages/Saidas/RegistrarSaida";
import Projetos from "./pages/Projetos/Projetos";
import Auditoria from "./pages/Auditoria/Auditoria";
import Usuarios from "./pages/Usuarios/Usuarios";
import TrocarSenha from "./pages/Perfil/TrocarSenha";

function Sistema(){const {user}=useAuth();const [view,setView]=useState("estoque");if(!user)return <Login/>;const pages={estoque:<Estoque/>,solicitacoes:<Solicitacoes/>,gerenciar:<NovoMaterial/>,nova_saida:<RegistrarSaida/>,projetos_graficos:<Projetos/>,auditoria:<Auditoria/>,configs:<Usuarios/>,mudar_senha:<TrocarSenha/>};return <Layout view={view} onNavigate={setView}>{pages[view]||pages.estoque}</Layout>}
export default function App(){return <AuthProvider><SystemProvider><Sistema/></SystemProvider></AuthProvider>}
