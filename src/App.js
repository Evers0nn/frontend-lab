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
  branco: "#ffffff"
};

const styles = {
  input: { padding: '12px', borderRadius: '5px', border: `1px solid ${CORES.roxoClaro}`, marginBottom: '10px', fontSize: '16px', width: '100%', boxSizing: 'border-box' },
  btnPrincipal: { padding: '12px', backgroundColor: CORES.laranja, border: 'none', borderRadius: '5px', color: 'black', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s', width: '100%' },
  btnExcluir: { padding: '8px 12px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  btnEditar: { padding: '8px 12px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '5px' },
  navBtn: { padding: '15px', backgroundColor: 'transparent', border: 'none', color: CORES.branco, textAlign: 'left', cursor: 'pointer', fontSize: '16px', marginBottom: '5px', borderRadius: '5px' },
  table: { width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' },
  formCard: { backgroundColor: CORES.branco, padding: '25px', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', maxWidth: '500px', width: '100%' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }
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
  const [itemEditando, setItemEditando] = useState(null);

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

  // --- FUNÇÃO PARA GERAR O PDF ---
  const handleBaixarPDF = () => {
    const doc = new jsPDF();
    
    // Configuração do Cabeçalho do PDF
    doc.setFont("Arial", "bold");
    doc.setFontSize(18);
    doc.setTextColor(87, 69, 145); // Roxo Escuro (#574591)
    doc.text("Controle de Materiais - Território do Fazer", 14, 20);
    
    doc.setFont("Arial", "normal");
    doc.setFontSize(10);
    doc.setTextColor(118, 106, 167); // Roxo Médio (#766aa7)
    doc.text(`Relatório de Estoque Oficial — Emitido em: ${new Date().toLocaleDateString('pt-BR')}`, 14, 27);
    
    // Informação dos Filtros Aplicados no PDF
    const txtFiltro = filtroCategoria ? `Categoria: ${filtroCategoria}` : "Todas as Categorias";
    const txtBusca = busca ? `Busca: "${busca}"` : "Nenhum termo";
    doc.setFontSize(9);
    doc.text(`Filtros Ativos -> ${txtFiltro} | Pesquisa: ${txtBusca}`, 14, 33);

    // Linha divisória decorativa (Laranja #f4a521)
    doc.setDrawColor(244, 165, 33);
    doc.setLineWidth(1);
    doc.line(14, 36, 196, 36);
    
    // Mapeando as colunas e linhas baseadas nos ITENS FILTRADOS
    const colunas = ["ID", "Nome do Material", "Categoria", "Qtd", "Localização"];
    const linhas = itensFiltrados.map(i => [
      i.id, 
      i.nome, 
      i.categoria, 
      i.quantidade, 
      i.localizacao || "Não informada"
    ]);
    
    // Criando a tabela estilizada dentro do PDF
    doc.autoTable({
      startY: 40,
      head: [colunas],
      body: linhas,
      headStyles: { fillColor: [87, 69, 145], textColor: [255, 255, 255], halign: 'center', fontStyle: 'bold' },
      bodyStyles: { halign: 'center' },
      columnStyles: {
        1: { halign: 'left' } // Alinha o nome do item à esquerda para ficar mais legível
      },
      theme: 'striped',
      margin: { top: 40, bottom: 20 }
    });
    
    // Faz o download do arquivo no navegador do usuário
    doc.save(`relatorio_estoque_${new Date().toISOString().slice(0,10)}.pdf`);
  };

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

  const handleSalvarEdicao = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/estoque/${itemEditando.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: itemEditando.nome,
          categoria: itemEditando.categoria,
          quantidade: parseInt(itemEditando.quantidade),
          localizacao: itemEditando.localizacao
        })
      });

      if (res.ok) {
        alert("Item atualizado com sucesso!");
        setItemEditando(null);
        fetchEstoque();
      } else {
        const errorData = await res.json();
        alert(`Erro ao atualizar: ${errorData.detail || "Falha no servidor"}`);
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
          {view === 'estoque' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ color: CORES.roxoEscuro, margin: 0 }}>Estoque Atual</h3>
                
                {/* FILTROS E BOTÃO DO PDF */}
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <input type="text" placeholder="Pesquisar por nome..." style={{...styles.input, marginBottom: 0, width: '220px'}} value={busca} onChange={(e) => setBusca(e.target.value)} />
                  <select style={{...styles.input, marginBottom: 0, width: '180px'}} value={filtroCategoria} onChange={(e) => setFiltroCategoria(e.target.value)}>
                    <option value="">Todas as Categorias</option>
                    {categoriasUnicas.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                  {/* NOVO BOTÃO DE EXPORTAÇÃO */}
                  <button onClick={handleBaixarPDF} style={{...styles.btnPrincipal, width: 'auto', backgroundColor: CORES.roxoMedio, color: 'white', display: 'flex', alignItems: 'center', gap: '5px'}}>
                    📄 PDF
                  </button>
                </div>
              </div>

              <table style={styles.table}>
                <thead>
                  <tr style={{ backgroundColor: CORES.roxoMedio, color: 'white' }}>
                    <th style={{ padding: '12px' }}>ID</th><th style={{ padding: '12px' }}>Item</th><th style={{ padding: '12px' }}>Categoria</th><th style={{ padding: '12px' }}>Qtd</th><th style={{ padding: '12px' }}>Localização</th><th style={{ padding: '12px' }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {itensAtuais.length > 0 ? (
                    itensAtuais.map(i => (
                      <tr key={i.id} style={{ borderBottom: '1px solid #eee', textAlign: 'center' }}>
                        <td style={{ padding: '12px' }}>{i.id}</td>
                        <td style={{ padding: '12px', textAlign: 'left' }}>{i.nome}</td>
                        <td style={{ padding: '12px' }}>{i.categoria}</td>
                        <td style={{ padding: '12px' }}>{i.quantidade}</td>
                        <td style={{ padding: '12px' }}>{i.localizacao}</td>
                        <td style={{ padding: '12px' }}>
                          <button style={styles.btnEditar} onClick={() => setItemEditando(i)}>✏️</button>
                          <button style={styles.btnExcluir} onClick={() => handleExcluirItem(i.id)}>Excluir</button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="6" style={{ padding: '20px', textAlign: 'center' }}>Nenhum item encontrado.</td></tr>
                  )}
                </tbody>
              </table>

              {totalPaginas > 1 && (
                <div style={{ display: 'flex', center: 'center', alignItems: 'center', marginTop: '20px', gap: '15px', justifyContent: 'center' }}>
                  <button onClick={() => mudarPagina(paginaAtual - 1)} disabled={paginaAtual === 1} style={{ ...styles.btnPrincipal, width: '100px', backgroundColor: paginaAtual === 1 ? CORES.roxoClaro : CORES.roxoMedio, color: CORES.branco }}>Anterior</button>
                  <span style={{ color: CORES.roxoEscuro, fontWeight: 'bold' }}>Página {paginaAtual} de {totalPaginas}</span>
                  <button onClick={() => mudarPagina(paginaAtual + 1)} disabled={paginaAtual === totalPaginas} style={{ ...styles.btnPrincipal, width: '100px', backgroundColor: paginaAtual === totalPaginas ? CORES.roxoClaro : CORES.roxoMedio, color: CORES.branco }}>Próxima</button>
                </div>
              )}
            </div>
          )}

          {view === 'gerenciar' && (
            <div>
              <h3 style={{ color: CORES.roxoEscuro, marginBottom: '20px' }}>Adicionar Novo Material</h3>
              <div style={styles.formCard}>
                <form onSubmit={handleCadastrarItem}>
                  <label>Nome do Item</label><input type="text" required style={styles.input} value={novoItem.nome} onChange={e => setNovoItem({...novoItem, nome: e.target.value})} />
                  <label>Categoria</label><input type="text" required style={styles.input} value={novoItem.categoria} onChange={e => setNovoItem({...novoItem, categoria: e.target.value})} />
                  <label>Quantidade</label><input type="number" required min="0" style={styles.input} value={novoItem.quantidade} onChange={e => setNovoItem({...novoItem, quantidade: e.target.value})} />
                  <label>Localização</label><input type="text" required style={styles.input} value={novoItem.localizacao} onChange={e => setNovoItem({...novoItem, localizacao: e.target.value})} />
                  <button type="submit" style={{...styles.btnPrincipal, marginTop: '10px'}}>Salvar Item no Estoque</button>
                </form>
              </div>
            </div>
          )}
          
          {view === 'configs' && (
            <div>
              <h3 style={{ color: CORES.roxoEscuro, marginBottom: '20px' }}>Criar Novo Acesso</h3>
              <div style={styles.formCard}>
                <form onSubmit={handleCadastrarUsuario}>
                  <label>Nome Completo</label><input type="text" required style={styles.input} value={novoUsuario.nome} onChange={e => setNovoUsuario({...novoUsuario, nome: e.target.value})} />
                  <label>Cargo / Função</label><input type="text" placeholder="Ex: Professor, Monitor" required style={styles.input} value={novoUsuario.cargo} onChange={e => setNovoUsuario({...novoUsuario, cargo: e.target.value})} />
                  <label>Nome de Usuário (Login)</label><input type="text" required style={styles.input} value={novoUsuario.usuario} onChange={e => setNovoUsuario({...novoUsuario, usuario: e.target.value})} />
                  <label>Senha</label><input type="password" required style={styles.input} value={novoUsuario.senha} onChange={e => setNovoUsuario({...novoUsuario, senha: e.target.value})} />
                  <button type="submit" style={{...styles.btnPrincipal, marginTop: '10px'}}>Registrar Usuário</button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* JANELA SUSPENSA (MODAL) DE EDIÇÃO */}
      {itemEditando && (
        <div style={styles.modalOverlay}>
          <div style={styles.formCard}>
            <h3 style={{ color: CORES.roxoEscuro, marginBottom: '20px' }}>Editar Material</h3>
            <form onSubmit={handleSalvarEdicao}>
              <label>Nome do Item</label><input type="text" required style={styles.input} value={itemEditando.nome} onChange={e => setItemEditando({...itemEditando, nome: e.target.value})} />
              <label>Categoria</label><input type="text" required style={styles.input} value={itemEditando.categoria} onChange={e => setItemEditando({...itemEditando, categoria: e.target.value})} />
              <label>Quantidade</label><input type="number" required min="0" style={styles.input} value={itemEditando.quantidade} onChange={e => setItemEditando({...itemEditando, quantidade: e.target.value})} />
              <label>Localização</label><input type="text" required style={styles.input} value={itemEditando.localizacao} onChange={e => setItemEditando({...itemEditando, localizacao: e.target.value})} />
              <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                <button type="submit" style={styles.btnPrincipal}>Salvar Alterações</button>
                <button type="button" style={{...styles.btnPrincipal, backgroundColor: '#bdc3c7', color: 'black'}} onClick={() => setItemEditando(null)}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
