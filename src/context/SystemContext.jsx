import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { API_URL, apiFetch, jsonHeaders } from "../config/api";
import { useAuth } from "./AuthContext";

const SystemContext = createContext(null);

const initialNovoItem = { nome: "", categoria: "", quantidade: "", quantidade_minima: "0", localizacao: "" };
const initialNovaSaida = { item_id: "", quantidade: "", projeto: "" };
const initialNovoUsuario = { nome: "", usuario: "", senha: "", cargo: "", departamento_nome: "", nivel_acesso: 2 };

export function SystemProvider({ children }) {
  const { user, token, logout } = useAuth();
  const [itens, setItens] = useState([]);
  const [saidas, setSaidas] = useState([]);
  const [solicitacoes, setSolicitacoes] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [usuariosList, setUsuariosList] = useState([]);
  const [auditoria, setAuditoria] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notificacao, setNotificacao] = useState({ visivel: false, texto: "", tipo: "sucesso" });

  const [novoItem, setNovoItem] = useState(initialNovoItem);
  const [novaSaida, setNovaSaida] = useState(initialNovaSaida);
  const [novoUsuario, setNovoUsuario] = useState(initialNovoUsuario);
  const [formSenha, setFormSenha] = useState({ atual: "", nova: "", confirmacao: "" });

  const mostrarNotificacao = useCallback((texto, tipo = "sucesso") => {
    setNotificacao({ visivel: true, texto: typeof texto === "string" ? texto : JSON.stringify(texto), tipo });
    window.setTimeout(() => setNotificacao({ visivel: false, texto: "", tipo: "sucesso" }), 3500);
  }, []);

  const getNomeNivel = (nivel) => {
    const n = Number(nivel);
    if (n === 0) return "Nível 0: Admin Geral";
    if (n === 1) return "Nível 1: Responsável";
    return "Nível 2: Monitor";
  };

  const getNomeDepartamento = useCallback((id) => {
    const dept = departamentos.find((item) => item.id === id);
    return dept ? dept.nome : `Dept. ${id}`;
  }, [departamentos]);

  const getNomeUsuario = useCallback((id) => {
    if (!id) return "Desconhecido";
    const found = usuariosList.find((item) => item.id === id);
    return found ? found.nome : `Usuário ID ${id}`;
  }, [usuariosList]);

  const carregarDados = useCallback(async () => {
    if (!token || !user) return;
    setLoading(true);
    try {
      const requests = await Promise.allSettled([
        apiFetch("/estoque", {}, token),
        apiFetch("/movimentacoes", {}, token),
        apiFetch("/departamentos", {}, token),
        apiFetch("/solicitacoes", {}, token),
        apiFetch("/usuarios", {}, token),
      ]);

      if (requests[0].status === "rejected" && requests[0].reason?.status === 401) {
        logout();
        return;
      }

      const setters = [setItens, setSaidas, setDepartamentos, setSolicitacoes, setUsuariosList];
      requests.forEach((result, index) => {
        if (result.status === "fulfilled") setters[index](result.value || []);
      });

      if (Number(user.nivel_acesso) <= 1) {
        try {
          const logs = await apiFetch("/auditoria", {}, token);
          setAuditoria(logs || []);
        } catch (error) {
          if (error.status === 401) logout();
        }
      }
    } finally {
      setLoading(false);
    }
  }, [token, user, logout]);

  useEffect(() => { carregarDados(); }, [carregarDados]);

  const handleCadastrarItem = async (event) => {
    event.preventDefault();
    try {
      await apiFetch("/estoque", {
        method: "POST",
        body: JSON.stringify({
          ...novoItem,
          quantidade: Number(novoItem.quantidade),
          quantidade_minima: Number(novoItem.quantidade_minima),
        }),
      }, token);
      setNovoItem(initialNovoItem);
      mostrarNotificacao("Item adicionado ao estoque!");
      await carregarDados();
    } catch (error) { mostrarNotificacao(error.message, "erro"); }
  };

  const handleSalvarEdicao = async (event, itemEditando) => {
    event.preventDefault();
    try {
      const payload = { ...itemEditando, quantidade: Number(itemEditando.quantidade), quantidade_minima: Number(itemEditando.quantidade_minima || 0) };
      delete payload.departamentos;
      await apiFetch(`/estoque/${itemEditando.id}`, { method: "PUT", body: JSON.stringify(payload) }, token);
      mostrarNotificacao("Material atualizado!");
      await carregarDados();
      return true;
    } catch (error) { mostrarNotificacao(error.message, "erro"); return false; }
  };

  const confirmarExclusao = async (item) => {
    try {
      await apiFetch(`/estoque/${item.id}`, { method: "DELETE" }, token);
      mostrarNotificacao("Item removido!");
      await carregarDados();
    } catch (error) { mostrarNotificacao(error.message, "erro"); }
  };

  const handleCadastrarSaida = async (event) => {
    event.preventDefault();
    const item = itens.find((i) => String(i.id) === String(novaSaida.item_id));
    if (!item) return mostrarNotificacao("Selecione um item.", "erro");
    if (Number(novaSaida.quantidade) > item.quantidade) return mostrarNotificacao("Estoque insuficiente.", "erro");
    try {
      await apiFetch("/movimentacoes", {
        method: "POST",
        body: JSON.stringify({ item_id: Number(novaSaida.item_id), quantidade: Number(novaSaida.quantidade), projeto: novaSaida.projeto, tipo: "saida", data: new Date().toISOString() }),
      }, token);
      setNovaSaida(initialNovaSaida);
      mostrarNotificacao("Saída registrada!");
      await carregarDados();
    } catch (error) { mostrarNotificacao(error.message, "erro"); }
  };

  const enviarSolicitacao = async (event, modalSolicitar) => {
    event.preventDefault();
    if (!modalSolicitar.item) return;
    if (Number(modalSolicitar.quantidade) > modalSolicitar.item.quantidade) return mostrarNotificacao("Quantidade maior que a disponível.", "erro");
    try {
      await apiFetch("/solicitacoes", {
        method: "POST",
        body: JSON.stringify({
          item_id: modalSolicitar.item.id,
          quantidade: Number(modalSolicitar.quantidade),
          dept_solicitado_id: modalSolicitar.item.departamento_id,
          observacao: modalSolicitar.observacao,
        }),
      }, token);
      mostrarNotificacao("Solicitação enviada com sucesso!");
      await carregarDados();
      return true;
    } catch (error) { mostrarNotificacao(error.message, "erro"); return false; }
  };

  const responderSolicitacao = async (id, status) => {
    try {
      await apiFetch(`/solicitacoes/${id}/responder`, { method: "PUT", body: JSON.stringify({ status }) }, token);
      mostrarNotificacao(`Solicitação ${status}!`);
      await carregarDados();
    } catch (error) { mostrarNotificacao(error.message, "erro"); }
  };

  const handleCadastrarUsuario = async (event) => {
    event.preventDefault();
    const deptAlvo = Number(user.nivel_acesso) === 1 ? getNomeDepartamento(user.departamento_id) : novoUsuario.departamento_nome;
    if (!deptAlvo) return mostrarNotificacao("Informe o departamento.", "erro");
    try {
      const data = await apiFetch("/usuarios", {
        method: "POST",
        body: JSON.stringify({ ...novoUsuario, departamento_nome: deptAlvo, nivel_acesso: Number(novoUsuario.nivel_acesso) }),
      }, token);
      setNovoUsuario(initialNovoUsuario);
      mostrarNotificacao(data?.mensagem || "Usuário cadastrado!");
      await carregarDados();
    } catch (error) { mostrarNotificacao(error.message, "erro"); }
  };

  const handleTrocarSenha = async (event) => {
    event.preventDefault();
    if (formSenha.nova !== formSenha.confirmacao) return mostrarNotificacao("A nova senha e a confirmação não batem!", "erro");
    try {
      await apiFetch("/usuarios/senha", {
        method: "PUT",
        body: JSON.stringify({ senha_atual: formSenha.atual, nova_senha: formSenha.nova }),
      }, token);
      setFormSenha({ atual: "", nova: "", confirmacao: "" });
      mostrarNotificacao("Senha alterada com sucesso!");
    } catch (error) { mostrarNotificacao(error.message, "erro"); }
  };

  const value = useMemo(() => ({
    itens, setItens, saidas, solicitacoes, departamentos, usuariosList, auditoria, loading,
    novoItem, setNovoItem, novaSaida, setNovaSaida, novoUsuario, setNovoUsuario, formSenha, setFormSenha,
    notificacao, mostrarNotificacao, carregarDados, getNomeNivel, getNomeDepartamento, getNomeUsuario,
    handleCadastrarItem, handleSalvarEdicao, confirmarExclusao, handleCadastrarSaida,
    enviarSolicitacao, responderSolicitacao, handleCadastrarUsuario, handleTrocarSenha,
    nivelUsuario: Number(user?.nivel_acesso ?? 2), user,
  }), [itens, saidas, solicitacoes, departamentos, usuariosList, auditoria, loading, novoItem, novaSaida, novoUsuario, formSenha, notificacao, carregarDados, getNomeDepartamento, getNomeUsuario, user, token]);

  return <SystemContext.Provider value={value}>{children}</SystemContext.Provider>;
}

export function useSystem() {
  const context = useContext(SystemContext);
  if (!context) throw new Error("useSystem deve ser usado dentro de SystemProvider.");
  return context;
}
