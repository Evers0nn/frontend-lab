import React, { useState, useEffect } from 'react';
import './index.css'; // Importando o CSS para remover as margens

const CORES = {
  roxoEscuro: "#574591",
  roxoMedio: "#766aa7",
  roxoClaro: "#cec9dd",
  laranja: "#f4a521",
  marrom: "#bf8e62",
  branco: "#ffffff"
};

const styles = {
  input: { padding: '12px', borderRadius: '5px', border: `1px solid ${CORES.roxoClaro}`, marginBottom: '10px', fontSize: '16px', width: '100%', boxSizing: 'border-box' },
  btnPrincipal: { padding: '12px', backgroundColor: CORES.laranja, border: 'none', borderRadius: '5px', color: 'black', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s', width: '100%' },
  btnExcluir: { padding: '8px 12px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  navBtn: { padding: '15px', backgroundColor: 'transparent', border: 'none', color: CORES.branco, textAlign: 'left', cursor: 'pointer', fontSize: '16px', marginBottom: '5px', borderRadius: '5px' },
  table: { width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' },
  formCard: { backgroundColor: CORES.branco, padding: '25px', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', maxWidth: '500px' }
};

function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('estoque');
  const [loginForm, setLoginForm] = useState({ usuario: '', senha: '' });
  const [itens, setItens] = useState([]);

  // Estados de Busca, Filtro e Paginação
  const [busca, setBusca] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 50;

  // Estados dos Formulários
  const [novoItem, setNovoItem] = useState({ nome: '', categoria: '', quantidade: '', localizacao: '' });
  const [novoUsuario, setNovoUsuario] = useState({ nome: '', usuario: '', senha: '', cargo: '' });

  const API_URL = "https://gest-olab.onrender.com";

  useEffect(() => {
    setPaginaAtual(1);
  }, [busca, filtroCategoria]);

  const fetchEstoque = async () => {
    try {
      const res = await fetch(`${API_URL}/estoque`);
      const data = await res.json();
      setItens(data);
    } catch (err) { console.error("Erro ao carregar estoque."); }
  };

  useEffect(() => {
    if (user) fetchEstoque();
  }, [user, view]);

  // --- FUNÇÕES DE AÇÃO ---
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
      else alert("Erro ao logar! Verifique usuário e senha.");
    } catch (err) { alert("Servidor offline!"); }
  };

  const handleCadastrarItem = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/estoque`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...novoItem, quantidade: parseInt(novoItem.quantidade) })
      });
      
      if (res.ok) {
        alert("Item cadastrado com sucesso!");
        setNovoItem({ nome: '', categoria: '', quantidade: '', localizacao: '' });
        fetchEstoque();
      } else {
        const errorData = await res.json();
        alert(`Erro ao cadastrar: ${errorData.detail || "Falha no servidor"}`);
      }
    } catch (err) { alert("Erro de conexão com o servidor!"); }
  };

  const handleExcluirItem = async (id) => {
    if (window.confirm("Tem certeza que deseja excluir este item permanentemente?")) {
      await fetch(`${API_URL}/estoque/${id}`, { method: 'DELETE' });
      fetchEstoque();
    }
  };

  const handleCadastrarUsuario = async (e) => {
    e.preventDefault();
    await fetch(`${API_URL}/usuarios`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(novoUsuario)
    });
    alert("Novo usuário registrado com sucesso!");
    setNovoUsuario({ nome: '', usuario: '', senha: '', cargo: '' });
  };

  // --- LÓGICA DE FILTROS E PAGINAÇÃO ---
  const itensFiltrados = itens.filter(item => {
    const matchBusca = item.nome.toLowerCase().includes(busca.toLowerCase());
    const matchCategoria = filtroCategoria === '' || item.categoria === filtroCategoria;
    return matchBusca && matchCategoria;
  });

  const indexOfLastItem = paginaAtual * itensPorPagina;
  const indexOfFirstItem = indexOfLastItem - itensPorPagina;
  const itensAtuais = itensFiltrados.slice(indexOfFirstItem, indexOfLastItem);
  const totalPaginas = Math.ceil(itensFiltrados.length / itensPorPagina);

  const mudarPagina = (novaPagina) => {
    if (novaPagina >= 1 && novaPagina <= totalPaginas) {
      setPaginaAtual(novaPagina);
    }
  };

  const categoriasUnicas = [...new Set(itens.map(i => i.categoria))];

  // --- TELA DE LOGIN ---
  if (!user) {
    return (
      <div style={{ backgroundColor: CORES.roxoClaro, height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ backgroundColor: CORES.branco, padding: '40px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.2)', textAlign: 'center', width: '350px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          
          <img src="/logo-territorio.png" alt="Logo Territorio" style={{ width: '150px', marginBottom: '15px' }} />
          
          <h2 style={{ color: CORES.roxoEscuro, margin: '0 0 5px 0' }}>Controle de Materiais</h2>
          <p style={{ color: CORES.roxoMedio, marginBottom: '25px', marginTop: 0 }}>Território do Fazer</p>
          
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px', width: '100%' }}>
            <input type="text" placeholder="Usuário" style={{...styles.input, marginBottom: 0}} onChange={e => setLoginForm({...loginForm, usuario: e.target.value})} />
            <input type="password" placeholder="Senha" style={{...styles.input, marginBottom: 0}} onChange={e => setLoginForm({...loginForm, senha: e.target.value})} />
            <button type="submit" style={styles.btnPrincipal}>ENTRAR</button>
          </form>

          {/* Logo Instituto integrada no cartão */}
          <div style={{ marginTop: '30px', borderTop: `1px solid ${CORES.roxoClaro}`, paddingTop: '20px', width: '100%' }}>
            <img src="/logo-instituto.png" alt="Logo Instituto" style={{ width: '110px' }} />
          </div>

        </div>
      </div>
    );
  }

  // --- TELA PRINCIPAL (DASHBOARD) ---
  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      
      {/* MENU LATERAL */}
      <div style={{ width: '250px', backgroundColor: CORES.roxoEscuro, color: CORES.branco, display: 'flex', flexDirection: 'column', padding: '20px' }}>
        <h3 style={{ fontSize: '18px', borderBottom: `1px solid ${CORES.roxoMedio}`, paddingBottom: '10px' }}>MENU</h3>
        <button onClick={() => setView('estoque')} style={styles.navBtn}>📦 Ver Estoque</button>
        <button onClick={() => setView('gerenciar')} style={styles.navBtn}>➕ Cadastrar Itens</button>
        <button onClick={() => setView('configs')} style={styles.navBtn}>⚙️ Cadastrar Usuários</button>
        <div style={{ marginTop: 'auto' }}>
          <p style={{ fontWeight: 'bold' }}>Olá, {user.nome}</p>
          <p style={{ fontSize: '12px', color: CORES.roxoClaro }}>{user.cargo || 'Administrador'}</p>
          <button onClick={() => setUser(null)} style={{ ...styles.navBtn, backgroundColor: CORES.laranja, color: 'black', width: '100%', marginTop: '10px' }}>Sair</button>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#f9f9f9', overflow: 'hidden' }}>
        
        {/* CABEÇALHO */}
        <div style={{ height: '80px', backgroundColor: CORES.branco, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 30px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
          <img src="/logo-territorio.png" alt="Logo Território" style={{ height: '50px' }} />
          <h2 style={{ color: CORES.roxoEscuro, fontSize: '20px' }}>Controle de Materiais</h2>
          <img src="/logo-instituto.png" alt="Logo Instituto" style={{ height: '40px' }} />
        </div>

        {/* CONTEÚDO DINÂMICO */}
        <div style={{ padding: '30px', overflowY: 'auto', height: 'calc(100vh - 80px)' }}>
          
          {/* VIEW: VER ESTOQUE */}
          {view === 'estoque' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ color: CORES.roxoEscuro, margin: 0 }}>Estoque Atual</h3>
                
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input 
                    type="text" 
                    placeholder="Pesquisar por nome..." 
                    style={{...styles.input, marginBottom: 0, width: '250px'}} 
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                  />
                  <select 
                    style={{...styles.input, marginBottom: 0, width: '200px'}}
                    value={filtroCategoria}
                    onChange={(e) => setFiltroCategoria(e.target.value)}
                  >
                    <option value="">Todas as Categorias</option>
                    {categoriasUnicas.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
              </div>

              <table style={styles.table}>
                <thead>
                  <tr style={{ backgroundColor: CORES.roxoMedio, color: 'white' }}>
                    <th style={{ padding: '12px' }}>Item</th>
                    <th style={{ padding: '12px' }}>Categoria</th>
                    <th style={{ padding: '12px' }}>Qtd</th>
                    <th style={{ padding: '12px' }}>Localização</th>
                    <th style={{ padding: '12px' }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {itensAtuais.length > 0 ? (
                    itensAtuais.map(i => (
                      <tr key={i.id} style={{ borderBottom: '1px solid #eee', textAlign: 'center' }}>
                        <td style={{ padding: '12px' }}>{i.nome}</td>
                        <td style={{ padding: '12px' }}>{i.categoria}</td>
                        <td style={{ padding: '12px' }}>{i.quantidade}</td>
                        <td style={{ padding: '12px' }}>{i.localizacao}</td>
                        <td style={{ padding: '12px' }}>
                          <button style={styles.btnExcluir} onClick={() => handleExcluirItem(i.id)}>Excluir</button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="5" style={{ padding: '20px', textAlign: 'center' }}>Nenhum item encontrado.</td></tr>
                  )}
                </tbody>
              </table>

              {/* CONTROLES DE PAGINAÇÃO */}
              {totalPaginas > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '20px', gap: '15px' }}>
                  <button 
                    onClick={() => mudarPagina(paginaAtual - 1)} 
                    disabled={paginaAtual === 1}
                    style={{ ...styles.btnPrincipal, width: '100px', backgroundColor: paginaAtual === 1 ? CORES.roxoClaro : CORES.roxoMedio, color: CORES.branco }}
                  >
                    Anterior
                  </button>
                  <span style={{ color: CORES.roxoEscuro, fontWeight: 'bold' }}>
                    Página {paginaAtual} de {totalPaginas}
                  </span>
                  <button 
                    onClick={() => mudarPagina(paginaAtual + 1)} 
                    disabled={paginaAtual === totalPaginas}
                    style={{ ...styles.btnPrincipal, width: '100px', backgroundColor: paginaAtual === totalPaginas ? CORES.roxoClaro : CORES.roxoMedio, color: CORES.branco }}
                  >
                    Próxima
                  </button>
                </div>
              )}
            </div>
          )}

          {/* VIEW: CADASTRAR ITENS */}
          {view === 'gerenciar' && (
            <div>
              <h3 style={{ color: CORES.roxoEscuro, marginBottom: '20px' }}>Adicionar Novo Material</h3>
              <div style={styles.formCard}>
                <form onSubmit={handleCadastrarItem}>
                  <label>Nome do Item</label>
                  <input type="text" required style={styles.input} value={novoItem.nome} onChange={e => setNovoItem({...novoItem, nome: e.target.value})} />
                  
                  <label>Categoria (ex: Sensores, Motores)</label>
                  <input type="text" required style={styles.input} value={novoItem.categoria} onChange={e => setNovoItem({...novoItem, categoria: e.target.value})} />
                  
                  <label>Quantidade</label>
                  <input type="number" required min="0" style={styles.input} value={novoItem.quantidade} onChange={e => setNovoItem({...novoItem, quantidade: e.target.value})} />
                  
                  <label>Localização (Gaveta, Estante, etc)</label>
                  <input type="text" required style={styles.input} value={novoItem.localizacao} onChange={e => setNovoItem({...novoItem, localizacao: e.target.value})} />
                  
                  <button type="submit" style={{...styles.btnPrincipal, marginTop: '10px'}}>Salvar Item no Estoque</button>
                </form>
              </div>
            </div>
          )}
          
          {/* VIEW: CADASTRAR USUÁRIOS */}
          {view === 'configs' && (
            <div>
              <h3 style={{ color: CORES.roxoEscuro, marginBottom: '20px' }}>Criar Novo Acesso</h3>
              <div style={styles.formCard}>
                <form onSubmit={handleCadastrarUsuario}>
                  <label>Nome Completo</label>
                  <input type="text" required style={styles.input} value={novoUsuario.nome} onChange={e => setNovoUsuario({...novoUsuario, nome: e.target.value})} />
                  
                  <label>Cargo / Função</label>
                  <input type="text" placeholder="Ex: Professor, Monitor" required style={styles.input} value={novoUsuario.cargo} onChange={e => setNovoUsuario({...novoUsuario, cargo: e.target.value})} />
                  
                  <label>Nome de Usuário (Login)</label>
                  <input type="text" required style={styles.input} value={novoUsuario.usuario} onChange={e => setNovoUsuario({...novoUsuario, usuario: e.target.value})} />
                  
                  <label>Senha</label>
                  <input type="password" required style={styles.input} value={novoUsuario.senha} onChange={e => setNovoUsuario({...novoUsuario, senha: e.target.value})} />
                  
                  <button type="submit" style={{...styles.btnPrincipal, marginTop: '10px'}}>Registrar Usuário</button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
