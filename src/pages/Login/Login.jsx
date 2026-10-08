import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useSystem } from "../../context/SystemContext";

export default function Login() {
  const { login } = useAuth();
  const { mostrarNotificacao } = useSystem();
  const [form, setForm] = useState({ usuario: "", senha: "" });
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault(); setLoading(true);
    try { const logged = await login(form.usuario, form.senha); mostrarNotificacao(`Bem-vindo(a), ${logged.nome}!`); }
    catch (error) { mostrarNotificacao(error.message, "erro"); }
    finally { setLoading(false); }
  }

  return <main className="login-page">
    <section className="login-card">
      <img src="/logo-territorio.png" alt="Território do Fazer" className="login-logo" />
      <span className="eyebrow">GESTÃO INTERNA</span>
      <h1>Acesso ao Sistema</h1>
      <p>Controle de materiais e movimentações</p>
      <form onSubmit={submit} className="form-stack">
        <label>Usuário<input required value={form.usuario} onChange={e => setForm({ ...form, usuario: e.target.value })} placeholder="Seu usuário" /></label>
        <label>Senha<input required type="password" value={form.senha} onChange={e => setForm({ ...form, senha: e.target.value })} placeholder="Sua senha" /></label>
        <button className="btn btn-primary" disabled={loading}>{loading ? "Entrando..." : "Entrar no sistema"}</button>
      </form>
    </section>
  </main>;
}
