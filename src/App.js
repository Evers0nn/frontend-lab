import React, { useState, useEffect } from 'react';

// Cores da paleta enviada
const CORES = {
  roxoEscuro: "#574591",
  roxoMedio: "#766aa7",
  roxoClaro: "#cec9dd",
  laranja: "#f4a521",
  marrom: "#bf8e62",
  branco: "#ffffff"
};

function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('estoque'); // views: estoque, gerenciar, configs
  const [loginForm, setLoginForm] = useState({ usuario: '', senha: '' });
  const [itens, setItens] = useState([]);

  const API_URL = "https://gest-olab.onrender.com";

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm)
      });
      const data = await res.json();
      if (data.status === "sucesso") setUser(data.usuario);
      else alert("Erro ao logar! Verifique se digitou o usuário todo em letras minúsculas.");
    } catch (err) { alert("Servidor offline ou erro de conexão!"); }
  };

  useEffect(() => {
    if (user) {
      fetch(`${API_URL}/estoque`).then(res => res.json()).then(data => setItens(data));
    }
  }, [user, view]);

  // --- TELA DE LOGIN ---
  if (!user) {
    return (
      <div style={{ backgroundColor: CORES.roxoClaro, height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center',
