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
  table: { width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', minWidth: '600px' },
  formCard: { backgroundColor: CORES.branco, padding: '25px', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', maxWidth: '500px', width: '100%', boxSizing: 'border-box' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }
};

function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('estoque');
  const [loginForm, setLoginForm] = useState({ usuario: '', senha: '' });
  
  // Dados Principais
  const [itens, setItens] = useState([]);
  const [saidas, setSaidas] = useState([]);

  // Estados de Busca e Filtro
  const [busca, setBusca] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [buscaSaida, setBuscaSaida] = useState('');
  const [filtroProjeto, setFiltroProjeto] = useState('');
  
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 50;

  // Formulários
  const [novoItem, setNovoItem] = useState({ nome: '', categoria: '', quantidade: '', localizacao: '' });
  const [novoUsuario, setNovoUsuario] = useState({ nome: '', usuario: '', senha: '', cargo: '' });
  const [novaSaida, setNovaSaida] = useState({ item_id: '', quantidade: '', projeto: '' });
  
  // Modais
  const [itemEditando, setItemEditando] = useState(null);
  const [itemParaExcluir, setItemParaExcluir] = useState(null);

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [menuAberto, setMenuAberto] = useState(false);

  // --- SISTEMA DE NOTIFICAÇÕES ---
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

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => { setPaginaAtual(1); }, [busca, filtroCategoria, buscaSaida, filtroProjeto, view]);

  const fetchEstoque = async () => {
    try {
      const res = await fetch(`${API_URL}/estoque`);
      if (res.ok) setItens(await res.json());
    } catch (err) { console.error("Erro ao carregar estoque."); }
  };

  const fetchSaidas = async () => {
    try {
      // Usa a rota movimentacoes baseada no banco de dados. 
      // Se não existir, avise o Backend para criá-la!
      const res = await fetch(`${API_URL}/movimentacoes`);
      if (res.ok) setSaidas(await res.json());
    } catch (err) { console.error("Erro ao carregar saídas."); }
  };

  useEffect(() => { 
    if (user) {
      fetchEstoque();
      fetchSaidas();
    }
  }, [user, view]);

  const mudarView = (novaView) => {
    setView(novaView);
    if (isMobile) setMenuAberto(false);
  };

  // --- FUNÇÕES DE EXPORTAÇÃO PDF ---
  const handleBaixarPDFEstoque = () => {
    mostrarNotificacao("Gerando relatório de estoque...", "info"); 
    const doc = new jsPDF();
    doc.setFont("Arial", "bold");
    doc.setFontSize(18);
    doc.setTextColor(87, 69, 145);
    doc.text("Controle de Materiais - Território do Fazer", 14, 20);
    doc.setFont("Arial", "normal");
    doc.setFontSize(10);
    doc.setTextColor(118, 106, 167);
    doc.text(`Relatório de Estoque Oficial — Emitido em: ${new Date().toLocaleDateString('pt-BR')}`, 14, 27);
    
    const txtFiltro = filtroCategoria ? `Categoria: ${filtroCategoria}` : "Todas as Categorias";
    doc.setFontSize(9);
    doc.text(`Filtros Ativos -> ${txtFiltro}`, 14, 33);
    doc.setDrawColor(244, 165, 33);
    doc.setLineWidth(1);
    doc.line(14, 36, 196, 36);
    
    const colunas = ["ID", "Nome do Material", "Categoria", "Qtd", "Localização"];
    const linhas = itensFiltrados.map(i => [i.id, i.nome, i.categoria, i.quantidade, i.localizacao || "-"]);
    
    doc.autoTable({ startY: 40, head: [colunas], body: linhas, headStyles: { fillColor: [87, 69, 145] } });
    doc.save(`relatorio_estoque_${new Date().toISOString().slice(0,10)}.pdf`);
    mostrarNotificacao("Download concluído!", "sucesso");
  };

  const handleBaixarPDFSaidas = () => {
    mostrarNotificacao("Gerando relatório de saídas...", "info"); 
    const doc = new jsPDF();
    doc.setFont("Arial", "bold");
    doc.setFontSize(18);
    doc.setTextColor(87, 69, 145);
    doc.text("Histórico de Saídas - Território do Fazer", 14, 20);
    doc.setFont("Arial", "normal");
    doc.setFontSize(10);
    doc.setTextColor(118, 106, 167);
    doc.text(`Emitido em: ${new Date().toLocaleDateString('pt-BR')}`, 14, 27);
    
    const txtFiltro = filtroProjeto ? `Projeto: ${filtroProjeto}` : "Todos os Projetos";
    doc.setFontSize(9);
    doc.text(`Filtros Ativos -> ${txtFiltro}`, 14, 33);
    doc.setDrawColor(244, 165, 33);
    doc.setLineWidth(1);
    doc.line(14, 36, 196, 36);
    
    const colunas = ["Item", "Projeto", "Qtd", "Data"];
    const linhas = saidasFiltradas.map(s => [
      obterNomeItem(s.item_id), 
      s.projeto, 
      s.quantidade, 
      s.data ? new Date(s.data).toLocaleDateString('pt-BR') : 'Recente'
    ]);
    
    doc.autoTable({ startY: 40, head: [colunas], body: linhas, headStyles: { fillColor: [244, 165, 33], textColor: [0,0,0] } });
    doc.save(`historico_saidas_${new Date().toISOString().slice(0,10)}.pdf`);
    mostrarNotificacao("Download concluído!", "sucesso");
  };

  // --- CRUD e REQUISIÇÕES ---
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(loginForm) });
      if (!res.ok && res.status !== 401) throw new Error("Erro no servidor");
      const data = await res.json();
      if (data.status === "sucesso") {
        setUser(data.usuario);
        mostrarNotificacao(`Bem-vindo(a), ${data.usuario.nome}!`, "sucesso");
      } else {
        mostrarNotificacao("Usuário ou senha incorretos!", "erro");
      }
    } catch (err) { mostrarNotificacao("Servidor iniciando. Tente novamente!", "erro"); }
  };

  const handleCadastrarItem = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/estoque`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...novoItem, quantidade: parseInt(novoItem.quantidade) }) });
      if (res.ok) {
        mostrarNotificacao("Item cadastrado com sucesso!", "sucesso");
        setNovoItem({ nome: '', categoria: '', quantidade: '', localizacao: '' });
        fetchEstoque();
      } else {
        const err = await res.json();
        mostrarNotificacao(`Erro: ${err.detail}`, "erro");
      }
    } catch (err) { mostrarNotificacao("Erro de conexão!", "erro"); }
  };

  const handleCadastrarSaida = async (e) => {
    e.preventDefault();
    
    // Validação de Estoque no Frontend
    const itemSelecionado = itens.find(i => i.id.toString() === novaSaida.item_id);
    if (!itemSelecionado) return mostrarNotificacao("Selecione um item válido.", "erro");
    if (parseInt(novaSaida.quantidade) > itemSelecionado.quantidade) {
      return mostrarNotificacao(`Estoque insuficiente! Temos apenas ${itemSelecionado.quantidade} unidades.`, "erro");
    }

    try {
      const payload = {
        item_id: parseInt(novaSaida.item_id),
        quantidade: parseInt(novaSaida.quantidade),
        projeto: novaSaida.projeto,
        tipo: 'saida',
        data: new Date().toISOString()
      };

      const res = await fetch(`${API_URL}/movimentacoes`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (res.ok) {
        mostrarNotificacao("Saída registrada com sucesso!", "sucesso");
        setNovaSaida({ item_id: '', quantidade: '', projeto: '' });
        fetchEstoque(); // Atualiza o estoque (o backend deve ter subtraído)
        fetchSaidas();  // Atualiza a lista de saídas
      } else {
        mostrarNotificacao(`Falha ao registrar saída. Verifique a API.`, "erro");
      }
    } catch (err) { mostrarNotificacao("Erro de conexão!", "erro"); }
  };

  const handleSalvarEdicao = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/estoque/${itemEditando.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...itemEditando, quantidade: parseInt(itemEditando.quantidade) }) });
      if (res.ok) {
        mostrarNotificacao("Material atualizado!", "sucesso");
        setItemEditando(null);
        fetchEstoque();
      }
    } catch (err) { mostrarNotificacao("Erro de conexão!", "erro"); }
  };

  const confirmarExclusao = async () => {
    if (!itemParaExcluir) return;
    try {
      await fetch(`${API_URL}/estoque/${itemParaExcluir.id}`, { method: 'DELETE' });
      mostrarNotificacao("Item removido do estoque!", "sucesso");
      fetchEstoque();
    } catch (err) { mostrarNotificacao("Erro ao excluir.", "erro"); }
    setItemParaExcluir(null);
  };

  const handleCadastrarUsuario = async (e) => {
    e.preventDefault();
    try {
      await fetch(`${API_URL}/usuarios`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(novoUsuario) });
      mostrarNotificacao("Novo usuário registrado!", "sucesso");
      setNovoUsuario({ nome: '', usuario: '', senha: '', cargo: '' });
    } catch (err) { mostrarNotificacao("Erro ao registrar.", "erro"); }
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

  // Paginação Genérica (usada no estoque)
  const itensAtuais = itensFiltrados.slice((paginaAtual - 1) * itensPorPagina, paginaAtual * itensPorPagina);
  const totalPaginas = Math.ceil(itensFiltrados.length / itensPorPagina);

  // Lógica do Gráfico de Projetos
  const calcularEstatisticasProjetos = () => {
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

  const estatisticasProjetos = calcularEstatisticasProjetos();

  // --- RENDERIZAÇÃO ---
  if (!user) {
    return (
      <>
        <NotificacaoUI />
        <div style={{ backgroundColor: CORES.roxoClaro, height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px', boxSizing: 'border-box' }}>
          <div style={{ backgroundColor: CORES.branco, padding: '40px 30px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.2)', textAlign: 'center', width: '100%', maxWidth: '380px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <img src="/logo-territorio.png" alt="Logo Territorio" style={{ width: '130px', marginBottom: '15px' }} />
            <h2 style={{ color: CORES.roxoEscuro, margin: '0 0 5px 0', fontSize: '22px' }}>Controle de Materiais</h2>
            <p style={{ color: CORES.roxoMedio, marginBottom: '25px', marginTop: 0, fontSize: '14px' }}>Território do Fazer</p>
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px', width: '100%' }}>
              <input type="text" placeholder="Usuário" style={{...styles.input, marginBottom: 0}} onChange={e => setLoginForm({...loginForm, usuario: e.target.value})} />
              <input type="password" placeholder="Senha" style={{...styles.input, marginBottom: 0}} onChange={e => setLoginForm({...loginForm, senha: e.target.value})} />
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
          
          <button onClick={() => mudarView('configs')} style={{...styles.navBtn, backgroundColor: view === 'configs' ? CORES.roxoMedio : 'transparent'}}>⚙️ Usuários</button>
          
          <div style={{ marginTop: 'auto' }}>
            <p style={{ fontWeight: 'bold' }}>Olá, {user.nome}</p>
            <p style={{ fontSize: '12px', color: CORES.roxoClaro }}>{user.cargo || 'Administrador'}</p>
            <button onClick={() => { setUser(null); mostrarNotificacao("Você saiu.", "info"); }} style={{ ...styles.navBtn, backgroundColor: CORES.laranja, color: 'black', width: '100%', marginTop: '10px' }}>Sair</button>
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
                    <button onClick={handleBaixarPDFEstoque} style={{...styles.btnPrincipal, width: 'auto', backgroundColor: CORES.roxoMedio, color: 'white'}}>📄 PDF</button>
                  </div>
                </div>

                <div style={{ overflowX: 'auto', backgroundColor: 'white', borderRadius: '5px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                  <table style={styles.table}>
                    <thead>
                      <tr style={{ backgroundColor: CORES.roxoMedio, color: 'white' }}>
                        <th style={{ padding: '12px' }}>ID</th><th style={{ padding: '12px' }}>Item</th><th style={{ padding: '12px' }}>Categoria</th>
                        <th style={{ padding: '12px' }}>Qtd</th><th style={{ padding: '12px' }}>Localização</th><th style={{ padding: '12px' }}>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {itensAtuais.length > 0 ? itensAtuais.map(i => (
                        <tr key={i.id} style={{ borderBottom: '1px solid #eee', textAlign: 'center' }}>
                          <td style={{ padding: '12px' }}>{i.id}</td><td style={{ padding: '12px', textAlign: 'left' }}>{i.nome}</td>
                          <td style={{ padding: '12px' }}>{i.categoria}</td><td style={{ padding: '12px', fontWeight: 'bold' }}>{i.quantidade}</td>
                          <td style={{ padding: '12px' }}>{i.localizacao}</td>
                          <td style={{ padding: '12px' }}>
                            <button style={styles.btnEditar} onClick={() => setItemEditando(i)}>✏️</button>
                            <button style={styles.btnExcluir} onClick={() => setItemParaExcluir(i)}>🗑️</button>
                          </td>
                        </tr>
                      )) : <tr><td colSpan="6" style={{ padding: '20px', textAlign: 'center' }}>Vazio.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TELA 2: CADASTRAR ITEM */}
            {view === 'gerenciar' && (
              <div>
                <h3 style={{ color: CORES.roxoEscuro, marginBottom: '20px' }}>Adicionar Novo Material</h3>
                <div style={styles.formCard}>
                  <form onSubmit={handleCadastrarItem}>
                    <label>Nome do Item</label><input type="text" required style={styles.input} value={novoItem.nome} onChange={e => setNovoItem({...novoItem, nome: e.target.value})} />
                    <label>Categoria</label>
                    <input type="text" required style={styles.input} list="cat-list" value={novoItem.categoria} onChange={e => setNovoItem({...novoItem, categoria: e.target.value})} />
                    <datalist id="cat-list">{categoriasUnicas.map(c => <option key={c} value={c} />)}</datalist>
                    <label>Quantidade Inicial</label><input type="number" required min="0" style={styles.input} value={novoItem.quantidade} onChange={e => setNovoItem({...novoItem, quantidade: e.target.value})} />
                    <label>Localização</label><input type="text" required style={styles.input} value={novoItem.localizacao} onChange={e => setNovoItem({...novoItem, localizacao: e.target.value})} />
                    <button type="submit" style={{...styles.btnPrincipal, marginTop: '10px'}}>Salvar no Estoque</button>
                  </form>
                </div>
              </div>
            )}

            {/* TELA 3: REGISTRAR SAÍDA */}
            {view === 'nova_saida' && (
              <div>
                <h3 style={{ color: CORES.roxoEscuro, marginBottom: '20px' }}>Registrar Saída de Material</h3>
                <div style={styles.formCard}>
                  <form onSubmit={handleCadastrarSaida}>
                    <label>Selecione o Material</label>
                    <select required style={styles.input} value={novaSaida.item_id} onChange={e => setNovaSaida({...novaSaida, item_id: e.target.value})}>
                      <option value="">-- Escolha um item do estoque --</option>
                      {itens.filter(i => i.quantidade > 0).map(i => (
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

            {/* TELA 4: HISTÓRICO E GRÁFICOS DE SAÍDA */}
            {view === 'historico_saidas' && (
              <div>
                <h3 style={{ color: CORES.roxoEscuro, marginBottom: '20px' }}>Dashboard de Projetos</h3>
                
                {/* GRÁFICO CSS PURO */}
                <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', marginBottom: '30px' }}>
                  <h4 style={{ margin: '0 0 15px 0', color: CORES.roxoMedio }}>Percentual de Uso por Projeto</h4>
                  {estatisticasProjetos.length > 0 ? estatisticasProjetos.map((est, idx) => (
                    <div key={idx} style={{ marginBottom: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 'bold', marginBottom: '4px' }}>
                        <span>{est.projeto}</span>
                        <span>{est.porcentagem}% ({est.quantidade} itens)</span>
                      </div>
                      <div style={{ width: '100%', backgroundColor: '#ecf0f1', borderRadius: '10px', height: '14px', overflow: 'hidden' }}>
                        <div style={{ width: `${est.porcentagem}%`, backgroundColor: CORES.laranja, height: '100%', transition: 'width 1s ease-in-out' }} />
                      </div>
                    </div>
                  )) : <p style={{ fontSize: '14px', color: '#7f8c8d' }}>Nenhuma saída registrada ainda.</p>}
                </div>

                <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', marginBottom: '15px', gap: '10px' }}>
                  <h4 style={{ margin: 0, color: CORES.roxoEscuro }}>Registros de Saída</h4>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', width: isMobile ? '100%' : 'auto' }}>
                    <input type="text" placeholder="Buscar material..." style={{...styles.input, marginBottom: 0, width: isMobile ? '100%' : '200px'}} value={buscaSaida} onChange={(e) => setBuscaSaida(e.target.value)} />
                    <select style={{...styles.input, marginBottom: 0, width: isMobile ? 'calc(100% - 110px)' : '200px'}} value={filtroProjeto} onChange={(e) => setFiltroProjeto(e.target.value)}>
                      <option value="">Todos os Projetos</option>
                      {projetosUnicos.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                    <button onClick={handleBaixarPDFSaidas} style={{...styles.btnPrincipal, width: 'auto', backgroundColor: CORES.roxoEscuro, color: 'white'}}>📄 PDF</button>
                  </div>
                </div>

                <div style={{ overflowX: 'auto', backgroundColor: 'white', borderRadius: '5px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                  <table style={styles.table}>
                    <thead>
                      <tr style={{ backgroundColor: CORES.laranja, color: 'black' }}>
                        <th style={{ padding: '12px' }}>Data</th>
                        <th style={{ padding: '12px' }}>Projeto Destino</th>
                        <th style={{ padding: '12px' }}>Material Retirado</th>
                        <th style={{ padding: '12px' }}>Qtd</th>
                      </tr>
                    </thead>
                    <tbody>
                      {saidasFiltradas.length > 0 ? saidasFiltradas.map((s, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #eee', textAlign: 'center' }}>
                          <td style={{ padding: '12px' }}>{s.data ? new Date(s.data).toLocaleDateString('pt-BR') : '-'}</td>
                          <td style={{ padding: '12px', fontWeight: 'bold', color: CORES.roxoEscuro }}>{s.projeto}</td>
                          <td style={{ padding: '12px', textAlign: 'left' }}>{obterNomeItem(s.item_id)}</td>
                          <td style={{ padding: '12px', fontWeight: 'bold', color: CORES.vermelho }}>- {s.quantidade}</td>
                        </tr>
                      )) : <tr><td colSpan="4" style={{ padding: '20px', textAlign: 'center' }}>Nenhum registro encontrado.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            {/* TELA 5: CONFIGURAÇÕES */}
            {view === 'configs' && (
              <div>
                <h3 style={{ color: CORES.roxoEscuro, marginBottom: '20px' }}>Criar Novo Acesso</h3>
                <div style={styles.formCard}>
                  <form onSubmit={handleCadastrarUsuario}>
                    <label>Nome Completo</label><input type="text" required style={styles.input} value={novoUsuario.nome} onChange={e => setNovoUsuario({...novoUsuario, nome: e.target.value})} />
                    <label>Cargo / Função</label><input type="text" placeholder="Ex: Professor" required style={styles.input} value={novoUsuario.cargo} onChange={e => setNovoUsuario({...novoUsuario, cargo: e.target.value})} />
                    <label>Usuário</label><input type="text" required style={styles.input} value={novoUsuario.usuario} onChange={e => setNovoUsuario({...novoUsuario, usuario: e.target.value})} />
                    <label>Senha</label><input type="password" required style={styles.input} value={novoUsuario.senha} onChange={e => setNovoUsuario({...novoUsuario, senha: e.target.value})} />
                    <button type="submit" style={{...styles.btnPrincipal, marginTop: '10px'}}>Registrar Usuário</button>
                  </form>
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
                <datalist id="cat-edit-list">{categoriasUnicas.map(c => <option key={c} value={c} />)}</datalist>
                <label>Quantidade</label><input type="number" required min="0" style={styles.input} value={itemEditando.quantidade} onChange={e => setItemEditando({...itemEditando, quantidade: e.target.value})} />
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
