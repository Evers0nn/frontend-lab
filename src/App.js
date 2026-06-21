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
      else alert("Erro ao logar!");
    } catch (err) { alert("Servidor offline!"); }
  };

  useEffect(() => {
    if (user) {
      fetch(`${API_URL}/estoque`).then(res => res.json()).then(data => setItens(data));
    }
  }, [user, view]);

  // --- TELA DE LOGIN ---
  if (!user) {
    return (
      <div style={{ backgroundColor: CORES.roxoClaro, height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
        <div style={{ backgroundColor: CORES.branco, padding: '40px', borderRadius: '15px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', textAlign: 'center', width: '350px' }}>
          <img src="https://i.imgur.com/vHRE03h.png" alt="Logo Territorio" style={{ width: '150px', marginBottom: '20px' }} />
          <h2 style={{ color: CORES.roxoEscuro }}>Controle de Materiais</h2>
          <p style={{ color: CORES.roxoMedio, marginBottom: '20px' }}>Território do Fazer</p>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <input type="text" placeholder="Usuário" style={styles.input} onChange={e => setLoginForm({...loginForm, usuario: e.target.value})} />
            <input type="password" placeholder="Senha" style={styles.input} onChange={e => setLoginForm({...loginForm, senha: e.target.value})} />
            <button type="submit" style={styles.btnPrincipal}>ENTRAR</button>
          </form>
        </div>
        <img src="https://i.imgur.com/rMvO9w0.png" alt="Logo Instituto" style={{ width: '120px', marginTop: '30px' }} />
      </div>
    );
  }

  // --- DASHBOARD ---
  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'Arial' }}>
      {/* MENU LATERAL */}
      <div style={{ width: '250px', backgroundColor: CORES.roxoEscuro, color: CORES.branco, display: 'flex', flexDirection: 'column', padding: '20px' }}>
        <h3 style={{ fontSize: '18px', borderBottom: `1px solid ${CORES.roxoMedio}`, paddingBottom: '10px' }}>MENU</h3>
        <button onClick={() => setView('estoque')} style={styles.navBtn}>📦 Ver Estoque</button>
        <button onClick={() => setView('gerenciar')} style={styles.navBtn}>➕ Gerenciar Itens</button>
        <button onClick={() => setView('configs')} style={styles.navBtn}>⚙️ Configurações</button>
        
        <div style={{ marginTop: 'auto' }}>
          <p>Olá, {user.nome}</p>
          <button onClick={() => setUser(null)} style={{ ...styles.navBtn, backgroundColor: CORES.laranja, color: 'black' }}>Sair</button>
        </div>
      </div>

      {/* ÁREA PRINCIPAL */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#f9f9f9' }}>
        {/* CABEÇALHO */}
        <div style={{ height: '80px', backgroundColor: CORES.branco, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 30px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
          <img src="https://i.imgur.com/vHRE03h.png" alt="Logo" style={{ height: '50px' }} />
          <h2 style={{ color: CORES.roxoEscuro, fontSize: '20px' }}>Controle de Materiais - Território do Fazer</h2>
          <img src="https://i.imgur.com/rMvO9w0.png" alt="Logo" style={{ height: '40px' }} />
        </div>

        {/* CONTEÚDO */}
        <div style={{ padding: '30px', overflowY: 'auto' }}>
          {view === 'estoque' && (
            <div>
              <h3>Estoque Atual</h3>
              <table style={styles.table}>
                <thead>
                  <tr style={{ backgroundColor: CORES.roxoMedio, color: 'white' }}>
                    <th>Item</th><th>Categoria</th><th>Qtd</th><th>Localização</th>
                  </tr>
                </thead>
                <tbody>
                  {itens.map(i => (
                    <tr key={i.id}><td>{i.nome}</td><td>{i.categoria}</td><td>{i.quantidade}</td><td>{i.localizacao}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {view === 'gerenciar' && <div style={{textAlign: 'center'}}><h3>Adicionar Novos Itens</h3><p>Formulário em desenvolvimento...</p></div>}
          
          {view === 'configs' && (
            <div style={{backgroundColor: CORES.branco, padding: '20px', borderRadius: '10px'}}>
              <h3>Criar Novo Usuário</h3>
              <input type="text" placeholder="Nome Completo" style={styles.input} />
              <input type="text" placeholder="Login" style={styles.input} />
              <input type="password" placeholder="Senha" style={styles.input} />
              <button style={styles.btnPrincipal}>Cadastrar Usuário</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  input: { padding: '12px', borderRadius: '5px', border: `1px solid ${CORES.roxoClaro}`, marginBottom: '10px', fontSize: '16px' },
  btnPrincipal: { padding: '12px', backgroundColor: CORES.laranja, border: 'none', borderRadius: '5px', color: 'black', fontWeight: 'bold', cursor: 'pointer' },
  navBtn: { padding: '15px', backgroundColor: 'transparent', border: 'none', color: CORES.branco, textAlign: 'left', cursor: 'pointer', fontSize: '16px', marginBottom: '5px', borderRadius: '5px' },
  table: { width: '100%', borderCollapse: 'collapse', backgroundColor: 'white' }
};

export default App;
