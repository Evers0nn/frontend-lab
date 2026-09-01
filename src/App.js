import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import './index.css';

const CORES = {
  roxoEscuro: "#574591",
  roxoMedio: "#766aa7",
  roxoClaro: "#cec9dd",
  laranja: "#f4a521",
  marrom: "#bf8e62",
  branco: "#ffffff",
  verde: "#2ecc71",
  vermelho: "#e74c3c"
};

const styles = {
  input: { padding: '12px', borderRadius: '5px', border: `1px solid ${CORES.roxoClaro}`, marginBottom: '10px', fontSize: '16px', width: '100%', boxSizing: 'border-box' },
  btnPrincipal: { padding: '12px', backgroundColor: CORES.laranja, border: 'none', borderRadius: '5px', color: 'black', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s', width: '100%' },
  btnExcluir: { padding: '8px 12px', backgroundColor: CORES.vermelho, color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  btnEditar: { padding: '8px 12px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '5px' },
  navBtn: { padding: '15px', backgroundColor: 'transparent', border: 'none', color: CORES.branco, textAlign: 'left', cursor: 'pointer', fontSize: '15px', marginBottom: '5px', borderRadius: '5px' },
  table: { width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', minWidth: '700px' },
  formCard: { backgroundColor: CORES.branco, padding: '25px', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', maxWidth: '500px', width: '100%', boxSizing: 'border-box' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }
};

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null); // NOVO: Estado para guardar o JWT
  const [view, setView] = useState('estoque');
  
  const [modoLogin, setModoLogin] = useState(true); // NOVO: Alternar entre Login e Cadastro na tela inicial
  const [loginForm, setLoginForm] = useState({ usuario: '', senha: '' });
  const [novoUsuario, setNovoUsuario] = useState({ nome: '', usuario: '', senha: '', cargo: '' });
  
  const [itens, setItens] = useState([]);
  const [saidas, setSaidas] = useState([]);

  const [busca, setBusca] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [buscaSaida, setBuscaSaida] = useState('');
  const [filtroProjeto, setFiltroProjeto] = useState('');
  
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 50;

  // Atualizado: adicionado quantidade_minima
  const [novoItem, setNovoItem] = useState({ nome: '', categoria: '', quantidade: '', quantidade_minima: '0', localizacao: '' });
  const [novaSaida, setNovaSaida] = useState({ item_id: '', quantidade: '', projeto: '' });
  
  const [itemEditando, setItemEditando] = useState(null);
  const [itemParaExcluir, setItemParaExcluir] = useState(null);

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [menuAberto, setMenuAberto] = useState(false);

  const [notificacao, setNotificacao] = useState({ visivel: false, texto: '', tipo: '' });

  const mostrarNotificacao = (texto, tipo = 'sucesso') => {
    setNotificacao({ visivel: true, texto, tipo });
    setTimeout(() => setNotificacao({ visivel: false, texto: '', tipo: '' }), 3000);
  };

  const NotificacaoUI = () => {
    if (!notificacao.visivel) return null;
    const bg = notificacao.tipo === 'sucesso' ? CORES.verde : notificacao.tipo === 'erro' ? CORES.vermelho : '#3498db';
    return (
      <div style={{ position: 'fixed', top: '20px', right: '20px', backgroundColor: bg, color: 'white', padding: '15px 25px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 9999, fontWeight: 'bold', fontSize: '15px', transition: 'all 0.3s ease' }}>
        {notificacao.texto}
      </div>
    );
  };

  const API_URL = "https://gest-olab.onrender.com";

  // Função auxiliar para enviar o token em todas as rotas protegidas
  const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  });

  const deslogar = () => {
    setUser(null);
    setToken(null);
    mostrarNotificacao("Sessão encerrada.", "info");
  };

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => { setPaginaAtual(1); }, [busca, filtroCategoria, buscaSaida, filtroProjeto, view]);

  const fetchEstoque = async () => {
    try {
      const res = await fetch(`${API_URL}/estoque`, { headers: getHeaders() });
      if (res.status === 401) return deslogar();
      if (res.ok) setItens(await res.json());
    } catch (err) { console.error("Erro ao carregar estoque."); }
  };

  const fetchSaidas = async () => {
    try {
      const res = await fetch(`${API_URL}/movimentacoes`, { headers: getHeaders() });
      if (res.status === 401) return deslogar();
      if (res.ok) setSaidas(await res.json());
    } catch (err) { console.error("Erro ao carregar saídas."); }
  };

  useEffect(() => { 
    if (user && token) {
      fetchEstoque();
      fetchSaidas();
    }
  }, [user, token, view]);

  const mudarView = (novaView) => {
    setView(novaView);
    if (isMobile) setMenuAberto(false);
  };

  // --- AUTENTICAÇÃO E CADASTRO INICIAL ---
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(loginForm) });
      const data = await res.json();
      if (res.ok && data.status === "sucesso") {
        setToken(data.access_token);
        setUser(data.usuario);
        mostrarNotificacao(`Bem-vindo(a), ${data.usuario.nome}!`, "sucesso");
      } else {
        mostrarNotificacao(data.detail || "Usuário ou senha incorretos!", "erro");
      }
    } catch (err) { mostrarNotificacao("Erro de conexão. A API está rodando?", "erro"); }
  };

  const handleCadastrarUsuario = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/usuarios`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(novoUsuario) });
      if (res.ok) {
        mostrarNotificacao("Conta criada com sucesso! Faça login.", "sucesso");
        setNovoUsuario({ nome: '', usuario: '', senha: '', cargo: '' });
        setModoLogin(true); // Volta para a tela de login
      } else {
        const data = await res.json();
        mostrarNotificacao(`Erro: ${data.detail}`, "erro");
      }
    } catch (err) { mostrarNotificacao("Erro ao registrar.", "erro"); }
  };

  // --- CRUD (Enviando Token) ---
  const handleCadastrarItem = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...novoItem, quantidade: parseInt(novoItem.quantidade), quantidade_minima: parseInt(novoItem.quantidade_minima) };
      const res = await fetch(`${API_URL}/estoque`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(payload) });
      if (res.ok) {
        mostrarNotificacao("Item cadastrado com sucesso!", "sucesso");
        setNovoItem({ nome: '', categoria: '', quantidade: '', quantidade_minima: '0', localizacao: '' });
        fetchEstoque();
      } else {
        mostrarNotificacao("Erro ao cadastrar.", "erro");
      }
    } catch (err) { mostrarNotificacao("Erro de conexão!", "erro"); }
  };

  const handleCadastrarSaida = async (e) => {
    e.preventDefault();
    const itemSelecionado = itens.find(i => i.id.toString() === novaSaida.item_id);
    if (!itemSelecionado) return mostrarNotificacao("Selecione um item válido.", "erro");
    if (parseInt(novaSaida.quantidade) > itemSelecionado.quantidade) {
      return mostrarNotificacao(`Estoque insuficiente! Temos apenas ${itemSelecionado.quantidade}.`, "erro");
    }

    try {
      const payload = {
        item_id: parseInt(novaSaida.item_id),
        quantidade: parseInt(novaSaida.quantidade),
        projeto: novaSaida.projeto,
        tipo: 'saida',
        data: new Date().toISOString()
      };
      const res = await fetch(`${API_URL}/movimentacoes`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(payload) });
      if (res.ok) {
        mostrarNotificacao("Saída registrada!", "sucesso");
        setNovaSaida({ item_id: '', quantidade: '', projeto: '' });
        fetchEstoque(); 
        fetchSaidas();  
      } else {
        const err = await res.json();
        mostrarNotificacao(err.detail || "Erro ao registrar.", "erro");
      }
    } catch (err) { mostrarNotificacao("Erro de conexão!", "erro"); }
  };

  const handleSalvarEdicao = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...itemEditando, quantidade: parseInt(itemEditando.quantidade), quantidade_minima: parseInt(itemEditando.quantidade_minima) };
      // Removendo dados aninhados (join) antes de enviar para não quebrar o pydantic
      delete payload.departamentos; 
      
      const res = await fetch(`${API_URL}/estoque/${itemEditando.id}`, { method: 'PUT', headers: getHeaders(), body: JSON.stringify(payload) });
      if (res.ok) {
        mostrarNotificacao("Material atualizado!", "sucesso");
        setItemEditando(null);
        fetchEstoque();
      } else {
        const err = await res.json();
        mostrarNotificacao(err.detail, "erro");
      }
    } catch (err) { mostrarNotificacao("Erro de conexão!", "erro"); }
  };

  const confirmarExclusao = async () => {
    if (!itemParaExcluir) return;
    try {
      const res = await fetch(`${API_URL}/estoque/${itemParaExcluir.id}`, { method: 'DELETE', headers: getHeaders() });
      if(res.ok){
        mostrarNotificacao("Item removido do estoque!", "sucesso");
        fetchEstoque();
      } else {
        const err = await res.json();
        mostrarNotificacao(err.detail, "erro");
      }
    } catch (err) { mostrarNotificacao("Erro ao excluir.", "erro"); }
    setItemParaExcluir(null);
  };

  // --- FILTROS E LÓGICA DE EXIBIÇÃO ---
  const categoriasUnicas = [...new Set(itens.map(i => i.categoria))];
  const projetosUnicos = [...new Set(saidas.map(s => s.projeto).filter(Boolean))];

  const itensFiltrados = itens.filter(item => {
    return item.nome.toLowerCase().includes(busca.toLowerCase()) && (filtroCategoria === '' || item.categoria === filtroCategoria);
  });

  const obterNomeItem = (item_id) => {
    const it = itens.find(i => i.id === item_id);
    return it ? it.nome : `Item ID ${item_id}`;
  };

  const saidasFiltradas = saidas.filter(s => {
    const nomeItem = obterNomeItem(s.item_id).toLowerCase();
    return nomeItem.includes(buscaSaida.toLowerCase()) && (filtroProjeto === '' || s.projeto === filtroProjeto);
  });

  const itensAtuais = itensFiltrados.slice((paginaAtual - 1) * itensPorPagina, paginaAtual * itensPorPagina);
  const totalPaginas = Math.ceil(itensFiltrados.length / itensPorPagina);

  const estatisticasProjetos = () => {
    const totais = {};
    let totalGeral = 0;
    saidas.forEach(s => {
      const proj = s.projeto || 'Outros / Sem Projeto';
      totais[proj] = (totais[proj] || 0) + s.quantidade;
      totalGeral += s.quantidade;
    });
    return Object.keys(totais).map(p => ({
      projeto: p,
      quantidade: totais[p],
      porcentagem: totalGeral > 0 ? ((totais[p] / totalGeral) * 100).toFixed(1) : 0
    })).sort((a,b) => b.quantidade - a.quantidade);
  };


  // --- RENDERIZAÇÃO DA TELA DE LOGIN / CADASTRO ---
  if (!user) {
    return (
      <>
        <NotificacaoUI />
        <div style={{ backgroundColor: CORES.roxoClaro, height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px', boxSizing: 'border-box' }}>
          <div style={{ backgroundColor: CORES.branco, padding: '40px 30px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.2)', textAlign: 'center', width: '100%', maxWidth: '380px' }}>
            <img src="/logo-territorio.png" alt="Logo Territorio" style={{ width: '130px', marginBottom: '15px' }} />
            <h2 style={{ color: CORES.roxoEscuro, margin: '0 0 5px 0', fontSize: '22px' }}>Controle de Materiais</h2>
            <p style={{ color: CORES.roxoMedio, marginBottom: '25px', marginTop: 0, fontSize: '14px' }}>Território do Fazer</p>
            
            {modoLogin ? (
              <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <input type="text" placeholder="Usuário" style={{...styles.input, marginBottom: 0}} onChange={e => setLoginForm({...loginForm, usuario: e.target.value})} />
                <input type="password" placeholder="Senha" style={{...styles.input, marginBottom: 0}} onChange={e => setLoginForm({...loginForm, senha: e.target.value})} />
                <button type="submit" style={styles.btnPrincipal}>ENTRAR</button>
                <p style={{fontSize: '13px', color: '#7f8c8d', cursor: 'pointer', marginTop: '10px'}} onClick={() => setModoLogin(false)}>Não tem conta? Cadastre-se</p>
              </form>
            ) : (
              <form onSubmit={handleCadastrarUsuario} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <input type="text" required placeholder="Nome Completo" style={{...styles.input, marginBottom: 0}} onChange={e => setNovoUsuario({...novoUsuario, nome: e.target.value})} />
                <input type="text" required placeholder="Cargo/Função" style={{...styles.input, marginBottom: 0}} onChange={e => setNovoUsuario({...novoUsuario, cargo: e.target.value})} />
                <input type="text" required placeholder="Usuário (Login)" style={{...styles.input, marginBottom: 0}} onChange={e => setNovoUsuario({...novoUsuario, usuario: e.target.value})} />
                <input type="password" required placeholder="Senha Segura" style={{...styles.input, marginBottom: 0}} onChange={e => setNovoUsuario({...novoUsuario, senha: e.target.value})} />
                <button type="submit" style={{...styles.btnPrincipal, backgroundColor: CORES.roxoMedio, color: 'white'}}>CRIAR CONTA</button>
                <p style={{fontSize: '13px', color: '#7f8c8d', cursor: 'pointer', marginTop: '10px'}} onClick={() => setModoLogin(true)}>Já tenho conta. Voltar ao Login</p>
              </form>
            )}
          </div>
        </div>
      </>
    );
  }

  // --- RENDERIZAÇÃO DO SISTEMA INTERNO ---
  return (
    <>
      <NotificacaoUI />
      <div style={{ display: 'flex', height: '100vh', width: '100%', overflow: 'hidden' }}>
        
        {isMobile && menuAberto && (
          <div onClick={() => setMenuAberto(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 998 }} />
        )}

        <div style={{ width: '250px', backgroundColor: CORES.roxoEscuro, color: CORES.branco, display: 'flex', flexDirection: 'column', padding: '20px', position: isMobile ? 'fixed' : 'relative', height: '100%', top: 0, left: isMobile ? (menuAberto ? '0' : '-250px') : '0', transition: 'left 0.3s ease', zIndex: 999, boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${CORES.roxoMedio}`, paddingBottom: '10px', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '18px', margin: 0 }}>MENU</h3>
            {isMobile && <button onClick={() => setMenuAberto(false)} style={{ background: 'transparent', border: 'none', color: 'white', fontSize: '20px' }}>✖</button>}
          </div>
          
          <button onClick={() => mudarView('estoque')} style={{...styles.navBtn, backgroundColor: view === 'estoque' ? CORES.roxoMedio : 'transparent'}}>📦 Ver Estoque</button>
          <button onClick={() => mudarView('gerenciar')} style={{...styles.navBtn, backgroundColor: view === 'gerenciar' ? CORES.roxoMedio : 'transparent'}}>➕ Novo Material</button>
          
          <div style={{ height: '1px', backgroundColor: CORES.roxoMedio, margin: '10px 0' }} />
          
          <button onClick={() => mudarView('nova_saida')} style={{...styles.navBtn, backgroundColor: view === 'nova_saida' ? CORES.roxoMedio : 'transparent'}}>📤 Registrar Saída</button>
          <button onClick={() => mudarView('historico_saidas')} style={{...styles.navBtn, backgroundColor: view === 'historico_saidas' ? CORES.roxoMedio : 'transparent'}}>📊 Histórico / Projetos</button>
          
          <div style={{ height: '1px', backgroundColor: CORES.roxoMedio, margin: '10px 0' }} />
          
          {user.nivel_acesso === 'admin_geral' && (
            <button onClick={() => mudarView('configs')} style={{...styles.navBtn, backgroundColor: view === 'configs' ? CORES.roxoMedio : 'transparent'}}>⚙️ Usuários Avançado</button>
          )}
          
          <div style={{ marginTop: 'auto' }}>
            <p style={{ fontWeight: 'bold' }}>Olá, {user.nome}</p>
            <p style={{ fontSize: '12px', color: CORES.roxoClaro }}>Dept: {user.departamento_id} | {user.nivel_acesso}</p>
            <button onClick={deslogar} style={{ ...styles.navBtn, backgroundColor: CORES.laranja, color: 'black', width: '100%', marginTop: '10px' }}>Sair</button>
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#f9f9f9', overflow: 'hidden' }}>
          
          <div style={{ height: '80px', minHeight: '80px', backgroundColor: CORES.branco, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: isMobile ? '0 10px' : '0 30px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {isMobile && <button onClick={() => setMenuAberto(true)} style={{ background: 'transparent', border: 'none', fontSize: '26px', marginRight: '10px', color: CORES.roxoEscuro }}>☰</button>}
              <img src="/logo-territorio.png" alt="Logo Território" style={{ height: isMobile ? '35px' : '50px' }} />
            </div>
            <h2 style={{ color: CORES.roxoEscuro, fontSize: isMobile ? '14px' : '20px', textAlign: 'center', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Controle de Materiais
            </h2>
            <img src="/logo-instituto.png" alt="Logo Instituto" style={{ height: isMobile ? '25px' : '40px' }} />
          </div>

          <div style={{ padding: isMobile ? '15px' : '30px', overflowY: 'auto', height: 'calc(100vh - 80px)', boxSizing: 'border-box' }}>
            
            {/* TELA 1: ESTOQUE */}
            {view === 'estoque' && (
              <div>
                <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', marginBottom: '20px', gap: '15px' }}>
                  <h3 style={{ color: CORES.roxoEscuro, margin: 0 }}>Estoque Atual</h3>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', width: isMobile ? '100%' : 'auto' }}>
                    <input type="text" placeholder="Pesquisar..." style={{...styles.input, marginBottom: 0, width: isMobile ? '100%' : '220px'}} value={busca} onChange={(e) => setBusca(e.target.value)} />
                    <select style={{...styles.input, marginBottom: 0, width: isMobile ? 'calc(100% - 110px)' : '280px'}} value={filtroCategoria} onChange={(e) => setFiltroCategoria(e.target.value)}>
                      <option value="">Todas as Categorias</option>
                      {categoriasUnicas.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
                </div>

                <div style={{ overflowX: 'auto', backgroundColor: 'white', borderRadius: '5px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                  <table style={styles.table}>
                    <thead>
                      <tr style={{ backgroundColor: CORES.roxoMedio, color: 'white' }}>
                        <th style={{ padding: '12px' }}>ID</th>
                        <th style={{ padding: '12px' }}>Item</th>
                        <th style={{ padding: '12px' }}>Categoria</th>
                        <th style={{ padding: '12px' }}>Dept.</th>
                        <th style={{ padding: '12px' }}>Qtd</th>
                        <th style={{ padding: '12px' }}>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {itensAtuais.length > 0 ? itensAtuais.map(i => {
                        const isAlerta = i.quantidade <= i.quantidade_minima;
                        const podeEditar = i.departamento_id === user.departamento_id || user.nivel_acesso === 'admin_geral';
                        
                        return (
                        <tr key={i.id} style={{ borderBottom: '1px solid #eee', textAlign: 'center', backgroundColor: isAlerta ? '#fff9f9' : 'white' }}>
                          <td style={{ padding: '12px' }}>{i.id}</td>
                          <td style={{ padding: '12px', textAlign: 'left' }}>{i.nome}</td>
                          <td style={{ padding: '12px' }}>{i.categoria}</td>
                          <td style={{ padding: '12px', fontSize: '12px', color: '#7f8c8d' }}>{i.departamentos?.nome || `Dept ${i.departamento_id}`}</td>
                          <td style={{ padding: '12px', fontWeight: 'bold', color: isAlerta ? CORES.vermelho : 'black' }}>
                            {i.quantidade} {isAlerta && <span title="Estoque Mínimo Atingido!">⚠️</span>}
                          </td>
                          <td style={{ padding: '12px' }}>
                            {podeEditar ? (
                              <>
                                <button style={styles.btnEditar} onClick={() => setItemEditando(i)}>✏️</button>
                                <button style={styles.btnExcluir} onClick={() => setItemParaExcluir(i)}>🗑️</button>
                              </>
                            ) : (
                              <span style={{fontSize: '12px', color: '#bdc3c7'}}>Sem permissão</span>
                            )}
                          </td>
                        </tr>
                      )}) : <tr><td colSpan="6" style={{ padding: '20px', textAlign: 'center' }}>Vazio.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TELA 2: CADASTRAR ITEM */}
            {view === 'gerenciar' && (
              <div>
                <h3 style={{ color: CORES.roxoEscuro, marginBottom: '20px' }}>Adicionar Novo Material (Ao seu Dept.)</h3>
                <div style={styles.formCard}>
                  <form onSubmit={handleCadastrarItem}>
                    <label>Nome do Item</label><input type="text" required style={styles.input} value={novoItem.nome} onChange={e => setNovoItem({...novoItem, nome: e.target.value})} />
                    <label>Categoria</label>
                    <input type="text" required style={styles.input} list="cat-list" value={novoItem.categoria} onChange={e => setNovoItem({...novoItem, categoria: e.target.value})} />
                    <datalist id="cat-list">{categoriasUnicas.map(c => <option key={c} value={c} />)}</datalist>
                    
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <div style={{ flex: 1 }}>
                        <label>Qtd Inicial</label>
                        <input type="number" required min="0" style={styles.input} value={novoItem.quantidade} onChange={e => setNovoItem({...novoItem, quantidade: e.target.value})} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label>Alerta Mínimo</label>
                        <input type="number" required min="0" style={styles.input} value={novoItem.quantidade_minima} onChange={e => setNovoItem({...novoItem, quantidade_minima: e.target.value})} />
                      </div>
                    </div>
                    
                    <label>Localização Física</label><input type="text" required style={styles.input} value={novoItem.localizacao} onChange={e => setNovoItem({...novoItem, localizacao: e.target.value})} />
                    <button type="submit" style={{...styles.btnPrincipal, marginTop: '10px'}}>Salvar no Estoque</button>
                  </form>
                </div>
              </div>
            )}

            {/* TELA 3: REGISTRAR SAÍDA */}
            {view === 'nova_saida' && (
              <div>
                <h3 style={{ color: CORES.roxoEscuro, marginBottom: '20px' }}>Registrar Saída (Do seu Dept.)</h3>
                <div style={styles.formCard}>
                  <form onSubmit={handleCadastrarSaida}>
                    <label>Selecione o Material</label>
                    <select required style={styles.input} value={novaSaida.item_id} onChange={e => setNovaSaida({...novaSaida, item_id: e.target.value})}>
                      <option value="">-- Escolha um item --</option>
                      {itens.filter(i => i.quantidade > 0 && (i.departamento_id === user.departamento_id || user.nivel_acesso === 'admin_geral')).map(i => (
                        <option key={i.id} value={i.id}>{i.nome} (Disponível: {i.quantidade})</option>
                      ))}
                    </select>

                    <label>Quantidade a Retirar</label>
                    <input type="number" required min="1" style={styles.input} value={novaSaida.quantidade} onChange={e => setNovaSaida({...novaSaida, quantidade: e.target.value})} />
                    
                    <label>Nome do Projeto / Destino</label>
                    <input type="text" required style={styles.input} placeholder="Ex: Robô Seguidor de Linha" list="proj-list" value={novaSaida.projeto} onChange={e => setNovaSaida({...novaSaida, projeto: e.target.value})} />
                    <datalist id="proj-list">{projetosUnicos.map(p => <option key={p} value={p} />)}</datalist>

                    <button type="submit" style={{...styles.btnPrincipal, marginTop: '10px', backgroundColor: CORES.roxoMedio, color: 'white'}}>Confirmar Saída</button>
                  </form>
                </div>
              </div>
            )}

            {/* TELA 4: HISTÓRICO E GRÁFICOS */}
            {view === 'historico_saidas' && (
              <div>
                <h3 style={{ color: CORES.roxoEscuro, marginBottom: '20px' }}>Dashboard de Projetos</h3>
                
                <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', marginBottom: '15px', gap: '10px' }}>
                  <h4 style={{ margin: 0, color: CORES.roxoEscuro }}>Registros de Movimentação</h4>
                </div>

                <div style={{ overflowX: 'auto', backgroundColor: 'white', borderRadius: '5px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                  <table style={styles.table}>
                    <thead>
                      <tr style={{ backgroundColor: CORES.laranja, color: 'black' }}>
                        <th style={{ padding: '12px' }}>Data</th>
                        <th style={{ padding: '12px' }}>Projeto</th>
                        <th style={{ padding: '12px' }}>Material</th>
                        <th style={{ padding: '12px' }}>Usuário / Dept.</th>
                        <th style={{ padding: '12px' }}>Qtd</th>
                      </tr>
                    </thead>
                    <tbody>
                      {saidasFiltradas.length > 0 ? saidasFiltradas.map((s, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #eee', textAlign: 'center' }}>
                          <td style={{ padding: '12px' }}>{s.data ? new Date(s.data).toLocaleDateString('pt-BR') : '-'}</td>
                          <td style={{ padding: '12px', fontWeight: 'bold', color: CORES.roxoEscuro }}>{s.projeto}</td>
                          <td style={{ padding: '12px', textAlign: 'left' }}>{obterNomeItem(s.item_id)}</td>
                          <td style={{ padding: '12px', fontSize: '12px' }}>{s.usuarios?.nome || 'Admin'} <br/><span style={{color: '#7f8c8d'}}>({s.departamentos?.nome || 'Central'})</span></td>
                          <td style={{ padding: '12px', fontWeight: 'bold', color: CORES.vermelho }}>- {s.quantidade}</td>
                        </tr>
                      )) : <tr><td colSpan="5" style={{ padding: '20px', textAlign: 'center' }}>Nenhum registro encontrado.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
          </div>
        </div>

        {/* MODAIS (Editar e Excluir) */}
        {itemEditando && (
          <div style={styles.modalOverlay}>
            <div style={styles.formCard}>
              <h3 style={{ color: CORES.roxoEscuro, marginBottom: '20px' }}>Editar Material</h3>
              <form onSubmit={handleSalvarEdicao}>
                <label>Nome do Item</label><input type="text" required style={styles.input} value={itemEditando.nome} onChange={e => setItemEditando({...itemEditando, nome: e.target.value})} />
                <label>Categoria</label>
                <input type="text" required style={styles.input} list="cat-edit-list" value={itemEditando.categoria} onChange={e => setItemEditando({...itemEditando, categoria: e.target.value})} />
                
                <div style={{ display: 'flex', gap: '10px' }}>
                  <div style={{ flex: 1 }}>
                    <label>Quantidade</label>
                    <input type="number" required min="0" style={styles.input} value={itemEditando.quantidade} onChange={e => setItemEditando({...itemEditando, quantidade: e.target.value})} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label>Alerta Mínimo</label>
                    <input type="number" required min="0" style={styles.input} value={itemEditando.quantidade_minima || '0'} onChange={e => setItemEditando({...itemEditando, quantidade_minima: e.target.value})} />
                  </div>
                </div>

                <label>Localização</label><input type="text" required style={styles.input} value={itemEditando.localizacao} onChange={e => setItemEditando({...itemEditando, localizacao: e.target.value})} />
                
                <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                  <button type="submit" style={styles.btnPrincipal}>Salvar</button>
                  <button type="button" style={{...styles.btnPrincipal, backgroundColor: '#bdc3c7', color: 'black'}} onClick={() => setItemEditando(null)}>Cancelar</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {itemParaExcluir && (
          <div style={styles.modalOverlay}>
            <div style={{ ...styles.formCard, textAlign: 'center', padding: '30px' }}>
              <h3 style={{ color: CORES.vermelho, marginBottom: '15px', fontSize: '22px' }}>Atenção!</h3>
              <p style={{ color: '#333', marginBottom: '25px', fontSize: '16px' }}>
                Excluir o item <strong>{itemParaExcluir.nome}</strong> permanentemente?
              </p>
              <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                <button onClick={confirmarExclusao} style={{ ...styles.btnPrincipal, backgroundColor: CORES.vermelho, color: 'white', width: 'auto', padding: '12px 25px' }}>Sim, Excluir</button>
                <button onClick={() => setItemParaExcluir(null)} style={{ ...styles.btnPrincipal, backgroundColor: '#bdc3c7', color: 'black', width: 'auto', padding: '12px 25px' }}>Cancelar</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </>
  );
}

export default App;
