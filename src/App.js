import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import './index.css';

const CORES = {
  roxoEscuro: "#574591", roxoMedio: "#766aa7", roxoClaro: "#cec9dd",
  laranja: "#f4a521", marrom: "#bf8e62", branco: "#ffffff",
  verde: "#2ecc71", vermelho: "#e74c3c"
};

const styles = {
  input: { padding: '12px', borderRadius: '5px', border: `1px solid ${CORES.roxoClaro}`, marginBottom: '10px', fontSize: '16px', width: '100%', boxSizing: 'border-box' },
  btnPrincipal: { padding: '12px', backgroundColor: CORES.laranja, border: 'none', borderRadius: '5px', color: 'black', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s', width: '100%' },
  btnExcluir: { padding: '8px 12px', backgroundColor: CORES.vermelho, color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  btnEditar: { padding: '8px 12px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '5px' },
  navBtn: { padding: '15px', backgroundColor: 'transparent', border: 'none', color: CORES.branco, textAlign: 'left', cursor: 'pointer', fontSize: '15px', marginBottom: '5px', borderRadius: '5px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  table: { width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', minWidth: '850px' },
  formCard: { backgroundColor: CORES.branco, padding: '25px', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', maxWidth: '500px', width: '100%', boxSizing: 'border-box' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }
};

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [view, setView] = useState('estoque');
  
  const [loginForm, setLoginForm] = useState({ usuario: '', senha: '' });
  const [novoUsuario, setNovoUsuario] = useState({ nome: '', usuario: '', senha: '', cargo: '', departamento_nome: '', nivel_acesso: 2 });
  
  const [itens, setItens] = useState([]);
  const [saidas, setSaidas] = useState([]);
  const [solicitacoes, setSolicitacoes] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [usuariosList, setUsuariosList] = useState([]);
  const [auditoria, setAuditoria] = useState([]);

  const [busca, setBusca] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [buscaSaida, setBuscaSaida] = useState('');
  const [filtroProjeto, setFiltroProjeto] = useState('');
  
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 50;

  const [novoItem, setNovoItem] = useState({ nome: '', categoria: '', quantidade: '', quantidade_minima: '0', localizacao: '' });
  const [novaSaida, setNovaSaida] = useState({ item_id: '', quantidade: '', projeto: '' });
  
  const [itemEditando, setItemEditando] = useState(null);
  const [itemParaExcluir, setItemParaExcluir] = useState(null);
  const [modalSolicitar, setModalSolicitar] = useState({ visivel: false, item: null, quantidade: 1, observacao: '' });

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [menuAberto, setMenuAberto] = useState(false);
  const [notificacao, setNotificacao] = useState({ visivel: false, texto: '', tipo: '' });

  const mostrarNotificacao = (texto, tipo = 'sucesso') => {
    const msgFormatada = typeof texto === 'string' ? texto : JSON.stringify(texto);
    setNotificacao({ visivel: true, texto: msgFormatada, tipo });
    setTimeout(() => setNotificacao({ visivel: false, texto: '', tipo: '' }), 3500);
  };

  const NotificacaoUI = () => {
    if (!notificacao.visivel) return null;
    const bg = notificacao.tipo === 'sucesso' ? CORES.verde : notificacao.tipo === 'erro' ? CORES.vermelho : '#3498db';
    return (
      <div style={{ position: 'fixed', top: '20px', right: '20px', backgroundColor: bg, color: 'white', padding: '15px 25px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 9999, fontWeight: 'bold', fontSize: '15px' }}>
        {notificacao.texto}
      </div>
    );
  };

  const API_URL = "https://gest-olab.onrender.com";

  const getHeaders = () => ({ 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` });

  const deslogar = () => { setUser(null); setToken(null); mostrarNotificacao("Sessão encerrada.", "info"); };

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => { setPaginaAtual(1); }, [busca, filtroCategoria, buscaSaida, filtroProjeto, view]);

  const carregarDados = async () => {
    if (!token) return;
    try {
      const [resEstoque, resSaidas, resDepts, resSolic] = await Promise.all([
        fetch(`${API_URL}/estoque`, { headers: getHeaders() }),
        fetch(`${API_URL}/movimentacoes`, { headers: getHeaders() }),
        fetch(`${API_URL}/departamentos`, { headers: getHeaders() }),
        fetch(`${API_URL}/solicitacoes`, { headers: getHeaders() })
      ]);
      
      if (resEstoque.status === 401) return deslogar();
      if (resEstoque.ok) setItens(await resEstoque.json());
      if (resSaidas.ok) setSaidas(await resSaidas.json());
      if (resDepts.ok) setDepartamentos(await resDepts.json());
      if (resSolic.ok) setSolicitacoes(await resSolic.json());

      if (user && parseInt(user.nivel_acesso) <= 1) {
        const resAud = await fetch(`${API_URL}/auditoria`, { headers: getHeaders() });
        if (resAud.ok) setAuditoria(await resAud.json());
        
        const resUsr = await fetch(`${API_URL}/usuarios`, { headers: getHeaders() });
        if (resUsr.ok) setUsuariosList(await resUsr.json());
      }
    } catch (err) { console.error("Erro ao carregar dados."); }
  };

  useEffect(() => { if (user && token) carregarDados(); }, [user, token, view]);

  const mudarView = (novaView) => { setView(novaView); if (isMobile) setMenuAberto(false); setPaginaAtual(1); };

  const getNomeNivel = (nivel) => {
    const n = parseInt(nivel);
    if (n === 0) return "Nível 0: Admin Geral";
    if (n === 1) return "Nível 1: Responsável";
    return "Nível 2: Monitor";
  };

  const getNomeDepartamento = (id) => departamentos.find(dept => dept.id === id)?.nome || `Dept. ${id}`;
  const getNomeUsuario = (id) => usuariosList.find(u => u.id === id)?.nome || `Admin/Sistema`;

  // --- FILTROS E LÓGICA DE EXIBIÇÃO ---
  const categoriasUnicas = [...new Set(itens.map(i => i.categoria))];
  const projetosUnicos = [...new Set(saidas.map(s => s.projeto).filter(Boolean))];

  const itensFiltrados = itens.filter(item => item.nome.toLowerCase().includes(busca.toLowerCase()) && (filtroCategoria === '' || item.categoria === filtroCategoria));
  const obterNomeItem = (id) => { const it = itens.find(i => i.id === id); return it ? it.nome : `Item ID ${id}`; };
  
  // CORREÇÃO: Dashboard agora filtra para exibir EXCLUSIVAMENTE o tipo "saida" (projetos de consumo) e ignora "transferencia"
  const saidasParaProjetos = saidas.filter(s => s.tipo === 'saida' && obterNomeItem(s.item_id).toLowerCase().includes(buscaSaida.toLowerCase()) && (filtroProjeto === '' || s.projeto === filtroProjeto));
  
  const itensAtuais = itensFiltrados.slice((paginaAtual - 1) * itensPorPagina, paginaAtual * itensPorPagina);
  const totalPaginas = Math.ceil(itensFiltrados.length / itensPorPagina);

  const estatisticasProjetos = () => {
    const totais = {}; let totalGeral = 0;
    saidasParaProjetos.forEach(s => { const proj = s.projeto || 'Diversos'; totais[proj] = (totais[proj] || 0) + s.quantidade; totalGeral += s.quantidade; });
    return Object.keys(totais).map(p => ({ projeto: p, quantidade: totais[p], porcentagem: totalGeral > 0 ? ((totais[p] / totalGeral) * 100).toFixed(1) : 0 })).sort((a,b) => b.quantidade - a.quantidade);
  };

  const nivelUsuario = user ? parseInt(user.nivel_acesso) : 2;
  const qtdSolicitacoesPendentes = solicitacoes.filter(s => s.dept_solicitado_id === user?.departamento_id && s.status === 'pendente').length;

  // --- PDF ---
  const handleBaixarPDFEstoque = () => {
    mostrarNotificacao("Gerando relatório em PDF...", "info"); 
    const doc = new jsPDF();
    doc.setFont("Arial", "bold"); doc.setFontSize(18); doc.setTextColor(87, 69, 145); doc.text("Controle de Materiais - Estoque Geral", 14, 20);
    doc.setFontSize(10); doc.setTextColor(118, 106, 167); doc.text(`Emitido em: ${new Date().toLocaleDateString('pt-BR')}`, 14, 27);
    doc.autoTable({ startY: 35, head: [["ID", "Material", "Categoria", "Dept.", "Qtd", "Local"]], body: itensFiltrados.map(i => [i.id, i.nome, i.categoria, i.departamentos?.nome || getNomeDepartamento(i.departamento_id), i.quantidade, i.localizacao || "-"]), headStyles: { fillColor: [87, 69, 145] } });
    doc.save(`relatorio_estoque_${new Date().toISOString().slice(0,10)}.pdf`);
    mostrarNotificacao("Download do PDF concluído!", "sucesso");
  };

  const handleBaixarPDFSaidas = () => {
    mostrarNotificacao("Gerando relatório em PDF...", "info"); 
    const doc = new jsPDF();
    doc.setFont("Arial", "bold"); doc.setFontSize(18); doc.setTextColor(87, 69, 145); doc.text("Histórico de Consumo (Projetos)", 14, 20);
    doc.setFontSize(10); doc.setTextColor(118, 106, 167); doc.text(`Emitido em: ${new Date().toLocaleDateString('pt-BR')}`, 14, 27);
    doc.autoTable({ startY: 35, head: [["Item", "Projeto", "Dept.", "Qtd", "Data"]], body: saidasParaProjetos.map(s => [obterNomeItem(s.item_id), s.projeto, s.departamentos?.nome || getNomeDepartamento(s.departamento_id), s.quantidade, s.data ? new Date(s.data).toLocaleDateString('pt-BR') : '-']), headStyles: { fillColor: [244, 165, 33], textColor: [0,0,0] } });
    doc.save(`consumo_projetos_${new Date().toISOString().slice(0,10)}.pdf`);
    mostrarNotificacao("Download do PDF concluído!", "sucesso");
  };

  // --- REQUISIÇÕES DA API ---
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(loginForm) });
      const data = await res.json();
      if (res.ok && data.status === "sucesso") { setToken(data.access_token); setUser(data.usuario); mostrarNotificacao(`Bem-vindo(a), ${data.usuario.nome}!`); } 
      else { mostrarNotificacao(data.detail || "Credenciais inválidas!", "erro"); }
    } catch (err) { mostrarNotificacao("Erro de conexão.", "erro"); }
  };

  const handleCadastrarUsuario = async (e) => {
    e.preventDefault();
    const deptAlvo = parseInt(user.nivel_acesso) === 1 ? getNomeDepartamento(user.departamento_id) : novoUsuario.departamento_nome;
    if (!deptAlvo) return mostrarNotificacao("Informe o departamento.", "erro");
    try {
      const payload = { ...novoUsuario, departamento_nome: deptAlvo, nivel_acesso: parseInt(novoUsuario.nivel_acesso) };
      const res = await fetch(`${API_URL}/usuarios`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(payload) });
      const data = await res.json();
      if (res.ok) { mostrarNotificacao(data.mensagem || "Usuário cadastrado!"); setNovoUsuario({ nome: '', usuario: '', senha: '', cargo: '', departamento_nome: '', nivel_acesso: 2 }); carregarDados(); } 
      else { mostrarNotificacao(data.detail, "erro"); }
    } catch (err) { mostrarNotificacao("Erro ao registrar.", "erro"); }
  };

  const handleCadastrarItem = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/estoque`, { method: 'POST', headers: getHeaders(), body: JSON.stringify({ ...novoItem, quantidade: parseInt(novoItem.quantidade), quantidade_minima: parseInt(novoItem.quantidade_minima) }) });
      if (res.ok) { mostrarNotificacao("Item adicionado ao estoque!"); setNovoItem({ nome: '', categoria: '', quantidade: '', quantidade_minima: '0', localizacao: '' }); carregarDados(); } 
      else { mostrarNotificacao("Erro ao cadastrar.", "erro"); }
    } catch (err) { mostrarNotificacao("Erro de conexão!", "erro"); }
  };

  const handleCadastrarSaida = async (e) => {
    e.preventDefault();
    const item = itens.find(i => i.id.toString() === novaSaida.item_id);
    if (!item) return mostrarNotificacao("Selecione um item.", "erro");
    if (parseInt(novaSaida.quantidade) > item.quantidade) return mostrarNotificacao("Estoque insuficiente.", "erro");
    try {
      const payload = { item_id: parseInt(novaSaida.item_id), quantidade: parseInt(novaSaida.quantidade), projeto: novaSaida.projeto, tipo: 'saida', data: new Date().toISOString() };
      const res = await fetch(`${API_URL}/movimentacoes`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(payload) });
      if (res.ok) { mostrarNotificacao("Saída registrada!"); setNovaSaida({ item_id: '', quantidade: '', projeto: '' }); carregarDados(); } 
      else { const err = await res.json(); mostrarNotificacao(err.detail, "erro"); }
    } catch (err) { mostrarNotificacao("Erro!", "erro"); }
  };

  const handleSalvarEdicao = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...itemEditando, quantidade: parseInt(itemEditando.quantidade), quantidade_minima: parseInt(itemEditando.quantidade_minima) };
      delete payload.departamentos; 
      const res = await fetch(`${API_URL}/estoque/${itemEditando.id}`, { method: 'PUT', headers: getHeaders(), body: JSON.stringify(payload) });
      if (res.ok) { mostrarNotificacao("Material atualizado!"); setItemEditando(null); carregarDados(); } 
      else { const err = await res.json(); mostrarNotificacao(err.detail, "erro"); }
    } catch (err) { mostrarNotificacao("Erro!", "erro"); }
  };

  const confirmarExclusao = async () => {
    if (!itemParaExcluir) return;
    try {
      const res = await fetch(`${API_URL}/estoque/${itemParaExcluir.id}`, { method: 'DELETE', headers: getHeaders() });
      if (res.ok) { mostrarNotificacao("Item removido!"); carregarDados(); } 
      else { const err = await res.json(); mostrarNotificacao(err.detail, "erro"); }
    } catch (err) { mostrarNotificacao("Erro.", "erro"); }
    setItemParaExcluir(null);
  };

  const enviarSolicitacao = async (e) => {
    e.preventDefault();
    if (modalSolicitar.quantidade > modalSolicitar.item.quantidade) return mostrarNotificacao("Quantidade maior que a disponível.", "erro");
    try {
      const payload = { item_id: modalSolicitar.item.id, quantidade: parseInt(modalSolicitar.quantidade), dept_solicitado_id: modalSolicitar.item.departamento_id, observacao: modalSolicitar.observacao };
      const res = await fetch(`${API_URL}/solicitacoes`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(payload) });
      if (res.ok) { mostrarNotificacao("Solicitação enviada com sucesso!"); setModalSolicitar({ visivel: false, item: null, quantidade: 1, observacao: '' }); carregarDados(); } 
      else { const err = await res.json(); mostrarNotificacao(err.detail, "erro"); }
    } catch (err) { mostrarNotificacao("Erro!", "erro"); }
  };

  const responderSolicitacao = async (id, status) => {
    try {
      const res = await fetch(`${API_URL}/solicitacoes/${id}/responder`, { method: 'PUT', headers: getHeaders(), body: JSON.stringify({ status }) });
      if (res.ok) { mostrarNotificacao(`Solicitação ${status}!`); carregarDados(); } 
      else { const err = await res.json(); mostrarNotificacao(err.detail, "erro"); }
    } catch (err) { mostrarNotificacao("Erro!", "erro"); }
  };

  // --- RENDERIZAÇÃO ---
  if (!user) {
    return (
      <>
        <NotificacaoUI />
        <div style={{ backgroundColor: CORES.roxoClaro, height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
          <div style={{ backgroundColor: CORES.branco, padding: '40px 30px', borderRadius: '15px', textAlign: 'center', width: '100%', maxWidth: '380px', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}>
            <img src="/logo-territorio.png" alt="Logo" style={{ width: '130px', marginBottom: '15px' }} />
            <h2 style={{ color: CORES.roxoEscuro, margin: '0 0 5px 0' }}>Acesso ao Sistema</h2>
            <p style={{ color: CORES.roxoMedio, marginBottom: '25px', marginTop: 0 }}>Território do Fazer</p>
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <input type="text" required placeholder="Usuário" style={styles.input} onChange={e => setLoginForm({...loginForm, usuario: e.target.value})} />
              <input type="password" required placeholder="Senha" style={styles.input} onChange={e => setLoginForm({...loginForm, senha: e.target.value})} />
              <button type="submit" style={styles.btnPrincipal}>ENTRAR</button>
            </form>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <NotificacaoUI />
      <div style={{ display: 'flex', height: '100vh', width: '100%', overflow: 'hidden' }}>
        
        {isMobile && menuAberto && <div onClick={() => setMenuAberto(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 998 }} />}

        <div style={{ width: '260px', backgroundColor: CORES.roxoEscuro, color: CORES.branco, display: 'flex', flexDirection: 'column', padding: '20px', position: isMobile ? 'fixed' : 'relative', height: '100%', top: 0, left: isMobile ? (menuAberto ? '0' : '-260px') : '0', transition: 'left 0.3s ease', zIndex: 999 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${CORES.roxoMedio}`, paddingBottom: '10px', marginBottom: '20px' }}>
            <h3 style={{ margin: 0 }}>MENU</h3>
            {isMobile && <button onClick={() => setMenuAberto(false)} style={{ background: 'transparent', border: 'none', color: 'white', fontSize: '20px' }}>✖</button>}
          </div>
          
          <button onClick={() => mudarView('estoque')} style={{...styles.navBtn, backgroundColor: view === 'estoque' ? CORES.roxoMedio : 'transparent'}}>📦 Estoque Geral</button>
          
          <button onClick={() => mudarView('solicitacoes')} style={{...styles.navBtn, backgroundColor: view === 'solicitacoes' ? CORES.roxoMedio : 'transparent', position: 'relative'}}>
            <span>📥 Solicitações</span>
            {qtdSolicitacoesPendentes > 0 && (
              <span style={{background: 'red', color: 'white', borderRadius: '50%', padding: '2px 6px', fontSize: '11px', marginLeft: '8px'}}>{qtdSolicitacoesPendentes}</span>
            )}
          </button>
          
          <button onClick={() => mudarView('gerenciar')} style={{...styles.navBtn, backgroundColor: view === 'gerenciar' ? CORES.roxoMedio : 'transparent'}}>➕ Novo Material</button>
          <button onClick={() => mudarView('nova_saida')} style={{...styles.navBtn, backgroundColor: view === 'nova_saida' ? CORES.roxoMedio : 'transparent'}}>📤 Registrar Saída</button>
          <button onClick={() => mudarView('projetos_graficos')} style={{...styles.navBtn, backgroundColor: view === 'projetos_graficos' ? CORES.roxoMedio : 'transparent'}}>📊 Dashboard Projetos</button>
          
          <div style={{ height: '1px', backgroundColor: CORES.roxoMedio, margin: '10px 0' }} />
          
          {nivelUsuario <= 1 && <button onClick={() => mudarView('auditoria')} style={{...styles.navBtn, backgroundColor: view === 'auditoria' ? CORES.roxoMedio : 'transparent'}}>📜 Histórico Atividades</button>}
          {(nivelUsuario <= 1) && <button onClick={() => mudarView('configs')} style={{...styles.navBtn, backgroundColor: view === 'configs' ? CORES.roxoMedio : 'transparent'}}>👥 Controle Usuários</button>}
          
          <div style={{ marginTop: 'auto', borderTop: `1px solid ${CORES.roxoMedio}`, paddingTop: '10px' }}>
            <p style={{ fontWeight: 'bold', margin: '0 0 4px 0' }}>{user.nome}</p>
            <p style={{ fontSize: '12px', color: CORES.roxoClaro, margin: '0 0 4px 0' }}>{getNomeNivel(nivelUsuario)}</p>
            <p style={{ fontSize: '11px', color: '#ddd', margin: 0 }}>Dept: {getNomeDepartamento(user.departamento_id)}</p>
            <button onClick={deslogar} style={{ ...styles.btnPrincipal, backgroundColor: CORES.laranja, marginTop: '10px' }}>Sair</button>
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#f9f9f9', overflow: 'hidden' }}>
          <div style={{ height: '80px', minHeight: '80px', backgroundColor: CORES.branco, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: isMobile ? '0 10px' : '0 30px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {isMobile && <button onClick={() => setMenuAberto(true)} style={{ background: 'transparent', border: 'none', fontSize: '26px', marginRight: '10px' }}>☰</button>}
              <img src="/logo-territorio.png" alt="Logo" style={{ height: isMobile ? '35px' : '50px' }} />
            </div>
            <h2 style={{ color: CORES.roxoEscuro, fontSize: isMobile ? '14px' : '20px', textAlign: 'center', flex: 1 }}>Controle de Materiais</h2>
            <img src="/logo-instituto.png" alt="Logo" style={{ height: isMobile ? '25px' : '40px' }} />
          </div>

          <div style={{ padding: isMobile ? '15px' : '30px', overflowY: 'auto', height: 'calc(100vh - 80px)' }}>
            
            {/* TELA DE ESTOQUE */}
            {view === 'estoque' && (
              <div>
                <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', marginBottom: '20px', gap: '15px' }}>
                  <h3 style={{ color: CORES.roxoEscuro, margin: 0 }}>Estoque Geral</h3>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', width: isMobile ? '100%' : 'auto' }}>
                    <input type="text" placeholder="Pesquisar..." style={{...styles.input, marginBottom: 0, width: isMobile ? '100%' : '220px'}} value={busca} onChange={(e) => setBusca(e.target.value)} />
                    <select style={{...styles.input, marginBottom: 0, width: isMobile ? 'calc(100% - 110px)' : '280px'}} value={filtroCategoria} onChange={(e) => setFiltroCategoria(e.target.value)}>
                      <option value="">Todas as Categorias</option>
                      {categoriasUnicas.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                    <button onClick={handleBaixarPDFEstoque} style={{...styles.btnPrincipal, width: 'auto', backgroundColor: CORES.roxoMedio, color: 'white'}}>📄 PDF</button>
                  </div>
                </div>

                <div style={{ overflowX: 'auto', backgroundColor: 'white', borderRadius: '5px' }}>
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
                        const meuDept = i.departamento_id === user.departamento_id;
                        const podeEditar = meuDept || nivelUsuario === 0;
                        const podeExcluir = (meuDept && nivelUsuario <= 1) || nivelUsuario === 0;
                        const isAlerta = i.quantidade <= i.quantidade_minima;

                        return (
                        <tr key={i.id} style={{ textAlign: 'center', borderBottom: '1px solid #eee', backgroundColor: isAlerta ? '#fff9f9' : 'white' }}>
                          <td style={{ padding: '12px' }}>{i.id}</td>
                          <td style={{ padding: '12px', textAlign: 'left' }}>{i.nome}</td>
                          <td style={{ padding: '12px' }}>{i.categoria}</td>
                          <td style={{ padding: '12px' }}>{i.departamentos?.nome || getNomeDepartamento(i.departamento_id)}</td>
                          <td style={{ padding: '12px', color: isAlerta ? 'red' : 'black', fontWeight: 'bold' }}>
                            {i.quantidade} {isAlerta && <span title="Estoque Mínimo Atingido!">⚠️</span>}
                          </td>
                          <td style={{ padding: '12px' }}>
                            {podeEditar ? (
                              <>
                                <button style={styles.btnEditar} onClick={() => setItemEditando(i)} title="Editar">✏️</button>
                                {podeExcluir && <button style={styles.btnExcluir} onClick={() => setItemParaExcluir(i)} title="Excluir">🗑️</button>}
                              </>
                            ) : (
                              <button style={{...styles.btnEditar, backgroundColor: CORES.roxoEscuro}} onClick={()=>setModalSolicitar({visivel: true, item: i, quantidade: 1, observacao: ''})}>🤝 Solicitar</button>
                            )}
                          </td>
                        </tr>
                      )}) : <tr><td colSpan="6" style={{ padding: '20px', textAlign: 'center' }}>Vazio.</td></tr>}
                    </tbody>
                  </table>
                </div>

                {totalPaginas > 1 && (
                  <div style={{ display: 'flex', alignItems: 'center', marginTop: '20px', gap: '10px', justifyContent: 'center' }}>
                    <button onClick={() => setPaginaAtual(paginaAtual - 1)} disabled={paginaAtual === 1} style={{ ...styles.btnPrincipal, width: 'auto', padding: '10px 15px' }}>Anterior</button>
                    <span style={{ color: CORES.roxoEscuro, fontWeight: 'bold' }}>Pág. {paginaAtual} de {totalPaginas}</span>
                    <button onClick={() => setPaginaAtual(paginaAtual + 1)} disabled={paginaAtual === totalPaginas} style={{ ...styles.btnPrincipal, width: 'auto', padding: '10px 15px' }}>Próxima</button>
                  </div>
                )}
              </div>
            )}

            {/* TELA DE SOLICITAÇÕES */}
            {view === 'solicitacoes' && (
              <div>
                <h3 style={{ color: CORES.roxoEscuro, marginBottom: '20px' }}>Caixa de Solicitações entre Departamentos</h3>
                <div style={{ overflowX: 'auto', backgroundColor: 'white', borderRadius: '5px' }}>
                  <table style={styles.table}>
                    <thead>
                      <tr style={{ background: CORES.marrom, color: 'white' }}>
                        <th style={{ padding: '12px' }}>Material</th>
                        <th style={{ padding: '12px' }}>De (Origem)</th>
                        <th style={{ padding: '12px' }}>Para (Destino)</th>
                        <th style={{ padding: '12px' }}>Qtd</th>
                        <th style={{ padding: '12px' }}>Observação</th>
                        <th style={{ padding: '12px' }}>Status</th>
                        <th style={{ padding: '12px' }}>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {solicitacoes.length > 0 ? solicitacoes.map(s => {
                        const recebida = s.dept_solicitado_id === user.departamento_id;
                        const podeAprovar = (nivelUsuario === 0 || (nivelUsuario === 1 && recebida)) && s.status === 'pendente';
                        return (
                          <tr key={s.id} style={{ textAlign: 'center', borderBottom: '1px solid #eee' }}>
                            <td style={{ padding: '12px', fontWeight: 'bold', color: CORES.roxoEscuro }}>{obterNomeItem(s.item_id)}<br/><span style={{fontSize:'11px', color:'#7f8c8d'}}>Pediu: {s.usuarios?.nome}</span></td>
                            <td style={{ padding: '12px' }}>{getNomeDepartamento(s.dept_solicitado_id)}</td>
                            <td style={{ padding: '12px' }}>{getNomeDepartamento(s.dept_solicitante_id)}</td>
                            <td style={{ padding: '12px', fontWeight: 'bold' }}>{s.quantidade} un.</td>
                            <td style={{ padding: '12px', fontSize: '13px', fontStyle: 'italic', maxWidth: '150px' }}>{s.observacao || '-'}</td>
                            <td style={{ padding: '12px' }}>
                              <span style={{ fontWeight: 'bold', color: s.status === 'pendente' ? 'orange' : s.status === 'aprovado' ? 'green' : 'red' }}>{s.status.toUpperCase()}</span>
                              {s.status !== 'pendente' && s.usuario_respondedor_id && (
                                <div style={{fontSize: '11px', color: '#7f8c8d', marginTop: '4px'}}>Por: {getNomeUsuario(s.usuario_respondedor_id)}</div>
                              )}
                            </td>
                            <td style={{ padding: '12px' }}>
                              {podeAprovar ? (
                                <><button style={{...styles.btnEditar, backgroundColor: CORES.verde}} onClick={() => responderSolicitacao(s.id, 'aprovado')}>Aprovar</button><button style={{...styles.btnExcluir, backgroundColor: CORES.vermelho}} onClick={() => responderSolicitacao(s.id, 'rejeitado')}>Rejeitar</button></>
                              ) : (<span style={{ fontSize: '12px', color: '#999' }}>{s.status !== 'pendente' ? 'Finalizado' : 'Aguardando'}</span>)}
                            </td>
                          </tr>
                        )
                      }) : <tr><td colSpan="7" style={{ padding: '20px', textAlign: 'center' }}>Nenhuma solicitação encontrada.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* DASHBOARD E CONSUMO */}
            {view === 'projetos_graficos' && (
              <div>
                <h3 style={{ color: CORES.roxoEscuro, marginBottom: '20px' }}>Dashboard de Projetos e Consumo Real</h3>
                <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', marginBottom: '30px' }}>
                  <h4 style={{ margin: '0 0 15px 0', color: CORES.roxoMedio }}>Percentual de Consumo por Projeto</h4>
                  {estatisticasProjetos().length > 0 ? estatisticasProjetos().map((est, idx) => (
                    <div key={idx} style={{ marginBottom: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 'bold', marginBottom: '4px' }}>
                        <span>{est.projeto}</span>
                        <span>{est.porcentagem}% ({est.quantidade} itens)</span>
                      </div>
                      <div style={{ width: '100%', backgroundColor: '#ecf0f1', borderRadius: '10px', height: '14px', overflow: 'hidden' }}>
                        <div style={{ width: `${est.porcentagem}%`, backgroundColor: CORES.laranja, height: '100%' }} />
                      </div>
                    </div>
                  )) : <p style={{ fontSize: '14px', color: '#7f8c8d' }}>Nenhum material consumido em projetos ainda.</p>}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                  <h4 style={{ margin: 0, color: CORES.roxoEscuro }}>Tabela de Registros de Saída (Projetos)</h4>
                  <button onClick={handleBaixarPDFSaidas} style={{...styles.btnPrincipal, width: 'auto', backgroundColor: CORES.roxoEscuro, color: 'white'}}>📄 Exportar PDF</button>
                </div>

                <div style={{ overflowX: 'auto', backgroundColor: 'white', borderRadius: '5px' }}>
                  <table style={styles.table}>
                    <thead>
                      <tr style={{ backgroundColor: CORES.laranja, color: 'black' }}>
                        <th style={{ padding: '12px' }}>Data</th><th style={{ padding: '12px' }}>Projeto</th><th style={{ padding: '12px' }}>Material</th><th style={{ padding: '12px' }}>Usuário / Dept.</th><th style={{ padding: '12px' }}>Qtd</th>
                      </tr>
                    </thead>
                    <tbody>
                      {saidasParaProjetos.length > 0 ? saidasParaProjetos.map((s, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #eee', textAlign: 'center' }}>
                          <td style={{ padding: '12px' }}>{s.data ? new Date(s.data).toLocaleDateString('pt-BR') : '-'}</td>
                          <td style={{ padding: '12px', fontWeight: 'bold', color: CORES.roxoEscuro }}>{s.projeto}</td>
                          <td style={{ padding: '12px', textAlign: 'left' }}>{obterNomeItem(s.item_id)}</td>
                          <td style={{ padding: '12px', fontSize: '12px' }}>{s.usuarios?.nome} <br/><span style={{color: '#7f8c8d'}}>({s.departamentos?.nome})</span></td>
                          <td style={{ padding: '12px', fontWeight: 'bold', color: CORES.vermelho }}>- {s.quantidade}</td>
                        </tr>
                      )) : <tr><td colSpan="5" style={{ padding: '20px', textAlign: 'center' }}>Nenhum registro encontrado.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TELA DE AUDITORIA */}
            {view === 'auditoria' && nivelUsuario <= 1 && (
              <div>
                <h3 style={{ color: CORES.roxoEscuro, marginBottom: '10px' }}>Histórico de Atividades {nivelUsuario === 0 ? '(Log Global)' : '(Meu Departamento)'}</h3>
                <p style={{ color: '#7f8c8d', marginBottom: '20px', fontSize: '14px' }}>Rastreamento de todas as ações no sistema.</p>
                <div style={{ overflowX: 'auto', backgroundColor: 'white', borderRadius: '5px' }}>
                  <table style={styles.table}>
                    <thead>
                      <tr style={{ backgroundColor: '#2c3e50', color: 'white' }}>
                        <th style={{ padding: '12px' }}>Data / Hora</th>
                        <th style={{ padding: '12px' }}>Usuário</th>
                        {nivelUsuario === 0 && <th style={{ padding: '12px' }}>Departamento</th>}
                        <th style={{ padding: '12px' }}>Ação Executada</th>
                      </tr>
                    </thead>
                    <tbody>
                      {auditoria.length > 0 ? auditoria.map(a => (
                        <tr key={a.id} style={{ borderBottom: '1px solid #eee', textAlign: 'center', fontSize: '14px' }}>
                          <td style={{ padding: '12px' }}>{new Date(a.data).toLocaleString('pt-BR')}</td>
                          <td style={{ padding: '12px', fontWeight: 'bold' }}>{a.usuario}</td>
                          {nivelUsuario === 0 && <td style={{ padding: '12px', color: '#7f8c8d' }}>{a.departamento}</td>}
                          <td style={{ padding: '12px', textAlign: 'left' }}>{a.acao}</td>
                        </tr>
                      )) : <tr><td colSpan={nivelUsuario === 0 ? 4 : 3} style={{ padding: '20px', textAlign: 'center' }}>Nenhuma atividade registrada no log.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ADICIONAR NOVO MATERIAL */}
            {view === 'gerenciar' && (
              <div style={styles.formCard}>
                <h3 style={{ color: CORES.roxoEscuro, marginBottom: '20px' }}>Adicionar Material</h3>
                <form onSubmit={handleCadastrarItem}>
                  <input type="text" required placeholder="Nome do Item" style={styles.input} onChange={e => setNovoItem({...novoItem, nome: e.target.value})} />
                  <input type="text" required placeholder="Categoria" style={styles.input} list="cat-list" onChange={e => setNovoItem({...novoItem, categoria: e.target.value})} />
                  <datalist id="cat-list">{categoriasUnicas.map(c => <option key={c} value={c} />)}</datalist>
                  <div style={{display:'flex', gap:'10px'}}>
                    <input type="number" required placeholder="Qtd Inicial" style={styles.input} onChange={e => setNovoItem({...novoItem, quantidade: e.target.value})} />
                    <input type="number" required placeholder="Alerta Mínimo" style={styles.input} onChange={e => setNovoItem({...novoItem, quantidade_minima: e.target.value})} />
                  </div>
                  <input type="text" required placeholder="Localização" style={styles.input} onChange={e => setNovoItem({...novoItem, localizacao: e.target.value})} />
                  <button type="submit" style={styles.btnPrincipal}>Salvar no Estoque</button>
                </form>
              </div>
            )}

            {/* REGISTRAR SAÍDA */}
            {view === 'nova_saida' && (
              <div style={styles.formCard}>
                <h3 style={{ color: CORES.roxoEscuro, marginBottom: '20px' }}>Registrar Consumo (Saída)</h3>
                <form onSubmit={handleCadastrarSaida}>
                  <select required style={styles.input} onChange={e => setNovaSaida({...novaSaida, item_id: e.target.value})}>
                    <option value="">Selecione o Material</option>
                    {itens.filter(i => i.quantidade > 0 && (i.departamento_id === user.departamento_id || nivelUsuario === 0)).map(i => <option key={i.id} value={i.id}>{i.nome}</option>)}
                  </select>
                  <input type="number" required placeholder="Qtd a Retirar" style={styles.input} onChange={e => setNovaSaida({...novaSaida, quantidade: e.target.value})} />
                  <input type="text" required placeholder="Projeto Destino" style={styles.input} list="proj-list" onChange={e => setNovaSaida({...novaSaida, projeto: e.target.value})} />
                  <datalist id="proj-list">{projetosUnicos.map(p => <option key={p} value={p} />)}</datalist>
                  <button type="submit" style={styles.btnPrincipal}>Confirmar Saída</button>
                </form>
              </div>
            )}

            {/* GERENCIAR USUÁRIOS */}
            {view === 'configs' && nivelUsuario <= 1 && (
              <div style={styles.formCard}>
                <h3 style={{ color: CORES.roxoEscuro, marginBottom: '20px' }}>Cadastrar Usuário {nivelUsuario === 0 ? '(Geral)' : '(Meu Dept)'}</h3>
                <form onSubmit={handleCadastrarUsuario}>
                  <input type="text" required placeholder="Nome Completo" style={styles.input} onChange={e => setNovoUsuario({...novoUsuario, nome: e.target.value})} />
                  <input type="text" required placeholder="Cargo/Função" style={styles.input} onChange={e => setNovoUsuario({...novoUsuario, cargo: e.target.value})} />
                  {nivelUsuario === 0 && <input type="text" required placeholder="Departamento" list="depts-list" style={styles.input} onChange={e => setNovoUsuario({...novoUsuario, departamento_nome: e.target.value})} />}
                  <datalist id="depts-list">{departamentos.map(d => <option key={d.id} value={d.nome} />)}</datalist>
                  <select style={styles.input} onChange={e => setNovoUsuario({...novoUsuario, nivel_acesso: e.target.value})}>
                    {nivelUsuario === 0 && <option value="0">Nível 0: Admin Geral</option>}
                    <option value="1">Nível 1: Responsável</option><option value="2">Nível 2: Monitor</option>
                  </select>
                  <input type="text" required placeholder="Login" style={styles.input} onChange={e => setNovoUsuario({...novoUsuario, usuario: e.target.value})} />
                  <input type="password" required placeholder="Senha" style={styles.input} onChange={e => setNovoUsuario({...novoUsuario, senha: e.target.value})} />
                  <button type="submit" style={styles.btnPrincipal}>Salvar Usuário</button>
                </form>
              </div>
            )}

          </div>
        </div>

        {/* MODAL DE SOLICITAÇÃO DE MATERIAL */}
        {modalSolicitar.visivel && (
          <div style={styles.modalOverlay}>
            <div style={styles.formCard}>
              <h3 style={{color: CORES.roxoEscuro, marginBottom: '20px'}}>Solicitar Material</h3>
              <p style={{ marginBottom: '15px' }}>Pedindo <b>{modalSolicitar.item.nome}</b> para o <b>{getNomeDepartamento(modalSolicitar.item.departamento_id)}</b></p>
              <form onSubmit={enviarSolicitacao}>
                <label>Quantidade a pedir (Máx: {modalSolicitar.item.quantidade})</label>
                <input type="number" required min="1" max={modalSolicitar.item.quantidade} style={styles.input} value={modalSolicitar.quantidade} onChange={e => setModalSolicitar({...modalSolicitar, quantidade: e.target.value})} />
                
                <label>Observação / Justificativa (Máx: 500 caract.)</label>
                <textarea maxLength="500" placeholder="Motivo do pedido..." style={{...styles.input, height: '80px', resize: 'none'}} value={modalSolicitar.observacao} onChange={e => setModalSolicitar({...modalSolicitar, observacao: e.target.value})} />
                
                <div style={{display: 'flex', gap: '10px', marginTop: '15px'}}>
                  <button type="submit" style={{...styles.btnPrincipal, background: CORES.verde, color: 'white'}}>Enviar Pedido</button>
                  <button type="button" onClick={() => setModalSolicitar({visivel: false, item: null, quantidade: 1, observacao: ''})} style={{...styles.btnPrincipal, background: '#bdc3c7'}}>Cancelar</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL DE EDIÇÃO */}
        {itemEditando && (
          <div style={styles.modalOverlay}>
            <div style={styles.formCard}>
              <h3 style={{ color: CORES.roxoEscuro, marginBottom: '20px' }}>Editar Material</h3>
              <form onSubmit={handleSalvarEdicao}>
                <label>Nome do Item</label><input type="text" required style={styles.input} value={itemEditando.nome} onChange={e => setItemEditando({...itemEditando, nome: e.target.value})} />
                <label>Categoria</label><input type="text" required style={styles.input} list="cat-edit-list" value={itemEditando.categoria} onChange={e => setItemEditando({...itemEditando, categoria: e.target.value})} />
                <div style={{ display: 'flex', gap: '10px' }}>
                  <div style={{ flex: 1 }}><label>Quantidade</label><input type="number" required min="0" style={styles.input} value={itemEditando.quantidade} onChange={e => setItemEditando({...itemEditando, quantidade: e.target.value})} /></div>
                  <div style={{ flex: 1 }}><label>Alerta Mínimo</label><input type="number" required min="0" style={styles.input} value={itemEditando.quantidade_minima || '0'} onChange={e => setItemEditando({...itemEditando, quantidade_minima: e.target.value})} /></div>
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

        {/* MODAL DE EXCLUSÃO */}
        {itemParaExcluir && (
          <div style={styles.modalOverlay}>
            <div style={{ ...styles.formCard, textAlign: 'center', padding: '30px' }}>
              <h3 style={{ color: CORES.vermelho, marginBottom: '15px', fontSize: '22px' }}>Atenção!</h3>
              <p style={{ color: '#333', marginBottom: '25px', fontSize: '16px' }}>Excluir o item <strong>{itemParaExcluir.nome}</strong> permanentemente?</p>
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
