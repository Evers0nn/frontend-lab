import React, { useEffect, useState } from 'react';

function App() {
  const [itens, setItens] = useState([]);

  useEffect(() => {
    fetch("https://gest-olab.onrender.com/estoque")
      .then(res => res.json())
      .then(data => setItens(data))
      .catch(err => console.error("Erro:", err));
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h1>Estoque do Laboratório</h1>
      <table border="1" cellPadding="10">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nome</th>
            <th>Categoria</th>
            <th>Quantidade</th>
          </tr>
        </thead>
        <tbody>
          {itens.map(item => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td>{item.nome}</td>
              <td>{item.categoria}</td>
              <td>{item.quantidade}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
