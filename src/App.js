import React, { useState, useEffect } from 'react';

const CORES = {
  roxoEscuro: "#574591",
  roxoMedio: "#766aa7",
  roxoClaro: "#cec9dd",
  laranja: "#f4a521",
  marrom: "#bf8e62",
  branco: "#ffffff"
};

const styles = {
  input: { padding: '12px', borderRadius: '5px', border: `1px solid ${CORES.roxoClaro}`, marginBottom: '10px', fontSize: '16px' },
  btnPrincipal: { padding: '12px', backgroundColor: CORES.laranja, border: 'none', borderRadius: '5px', color: 'black', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s' },
  navBtn: { padding: '15px', backgroundColor: 'transparent', border: 'none', color: CORES.branco, textAlign: 'left', cursor: 'pointer', fontSize: '16px', marginBottom: '5px', borderRadius: '5px' },
  table: { width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }
};

function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('estoque');
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
      else alert("Erro ao logar! Verifique se digitou o usuário em letras minúsculas.");
    } catch (err) { 
      alert("Servidor offline ou erro de conexão!"); 
    }
  };

  useEffect(() => {
    if (user) {
      fetch(`${API_URL}/estoque`).then(res => res.json()).then(data => setItens(data));
    }
  }, [user, view]);

  if (!user) {
    return (
      <div style={{ backgroundColor: CORES.roxoClaro, height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
        <div style={{ backgroundColor: CORES.branco, padding: '40px', borderRadius: '15px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', textAlign: 'center', width: '350px' }}>
          <img src="/logo-territorio.png" alt="Logo Territorio" style={{ width: '150px', marginBottom: '20px' }} />
          <h2 style={{ color: CORES.roxoEscuro }}>Controle de Materiais</h2>
          <p style={{ color: CORES.roxoMedio, marginBottom: '20px' }}>Território do Fazer</p>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <input type="text" placeholder="Usuário" style={styles.input} onChange={e => setLoginForm({...loginForm, usuario: e.target.value})} />
            <input type="password" placeholder="Senha" style={styles.input} onChange={e => setLoginForm({...loginForm, senha: e.target.value})} />
            <button type="submit" style={styles.btnPrincipal}>ENTRAR</button>
          </form>
        </div>
        <img src="/logo-instituto.png" alt="Logo Instituto" style={{ width: '120px', marginTop: '30px' }} />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'Arial' }}>
      <div style={{ width: '250px', backgroundColor: CORES.roxoEscuro, color: CORES.branco, display: 'flex', flexDirection: 'column', padding: '20px' }}>
        <h3 style={{ fontSize: '18px', borderBottom: `1px solid ${CORES.roxoMedio}`, paddingBottom: '10px' }}>MENU</h3>
        <button onClick={() => setView('estoque')} style={styles.navBtn}>📦 Ver Estoque</button>
        <button onClick={() => setView('gerenciar')} style={styles.navBtn}>➕ Gerenciar Itens</button>
        <button onClick={() => setView('configs')} style={styles.navBtn}>⚙️ Configurações</button>
        <div style={{ marginTop: 'auto' }}>
          <p style={{ fontWeight: 'bold' }}>Olá, {user.nome}</p>
          <button onClick={() => setUser(null)} style={{ ...styles.navBtn, backgroundColor: CORES.laranja, color: 'black', width: '100%' }}>Sair</button>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#f9f9f9' }}>
        <div style={{ height: '80px', backgroundColor: CORES.branco, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 30px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
          <img src="/logo-territorio.png" alt="Logo Território" style={{ height: '50px' }} />
          <h2 style={{ color: CORES.roxoEscuro, fontSize: '20px' }}>Controle de Materiais</h2>
          <img src="/logo-instituto.png" alt="Logo Instituto" style={{ height: '40px' }} />
        </div>

        <div style={{ padding: '30px', overflowY: 'auto' }}>
          {view === 'estoque' && (
            <div>
              <h3 style={{ color: CORES.roxoEscuro, marginBottom: '15px' }}>Estoque Atual</h3>
              <table style={styles.table}>
                <thead>
                  <tr style={{ backgroundColor: CORES.roxoMedio, color: 'white' }}>
                    <th style={{ padding: '12px' }}>Item</th>
                    <th style={{ padding: '12px' }}>Categoria</th>
                    <th style={{ padding: '12px' }}>Qtd</th>
                    <th style={{ padding: '12px' }}>Localização</th>
                  </tr>
                </thead>
                <tbody>
                  {itens.map(i => (
                    <tr key={i.id} style={{ borderBottom: '1px solid #eee', textAlign: 'center' }}>
                      <td style={{ padding: '12px' }}>{i.nome}</td>
                      <td style={{ padding: '12px' }}>{i.categoria}</td>
                      <td style={{ padding: '12px' }}>{i.quantidade}</td>
                      <td style={{ padding: '12px' }}>{i.localizacao}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {view === 'gerenciar' && (
            <div style={{textAlign: 'center', color: CORES.roxoEscuro}}>
              <h3>Adicionar Novos Itens</h3>
              <p>Formulário em desenvolvimento...</p>
            </div>
          )}
          
          {view === 'configs' && (
            <div style={{backgroundColor: CORES.branco, padding: '20px', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)'}}>
              <h3 style={{ color: CORES.roxoEscuro, marginBottom: '15px' }}>Criar Novo Usuário</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '400px' }}>
                <input type="text" placeholder="Nome Completo" style={styles.input} />
                <input type="text" placeholder="Login" style={styles.input} />
                <input type="password" placeholder="Senha" style={styles.input} />
                <button style={styles.btnPrincipal}>Cadastrar Usuário</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
