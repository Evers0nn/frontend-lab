import React from "react";
import { useSystem } from "../../context/SystemContext";
const titles={estoque:"Estoque Geral",solicitacoes:"Solicitações",gerenciar:"Novo Material",nova_saida:"Registrar Saída",projetos_graficos:"Dashboard de Projetos",auditoria:"Log de Auditoria",configs:"Controle de Usuários",mudar_senha:"Trocar Senha"};
export default function Header({view,onMenu}){const {user}=useSystem();return <header className="topbar"><button className="menu-toggle" onClick={onMenu}>☰</button><div className="topbar-title"><img src="/logo-territorio.png" alt="Território do Fazer"/><div><span>Controle de Materiais</span><strong>{titles[view]||"Sistema"}</strong></div></div><div className="topbar-user"><span>{user?.nome}</span><small>acesso ativo</small></div></header>}
