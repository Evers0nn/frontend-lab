import React, { useEffect, useState } from 'react';

function App() {
  const [itens, setItens] = useState([]);
  const [loading, setLoading] = useState(true);

  // URL do seu backend no Render
  const API_URL = "https://gest-olab.onrender.com";

  useEffect(() => {
    fetch(`${API_URL}/estoque`)
      .then(res => res.json())
      .then(data => {
        setItens(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Erro ao buscar dados:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Estoque do Laboratório</h1>
      
      {loading ? (
        <p>Carregando dados do banco...</p>
      ) : (
        <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f4f4f4' }}>
              <th>ID</th>
              <th>Nome</th>
              <th>Categoria</th>
              <th>Quantidade</th>
              <th>Localização</th>
            </tr>
          </thead>
          <tbody>
            {itens.map(item => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.nome}</td>
                <td>{item.categoria}</td>
                <td>{item.quantidade}</td>
                <td>{item.localizacao}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default App;
