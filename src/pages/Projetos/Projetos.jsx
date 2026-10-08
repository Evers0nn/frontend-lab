import React, { useMemo } from "react";
import { useSystem } from "../../context/SystemContext";
import { exportarSaidasPDF } from "../../services/reportService";

export default function Projetos() {
  const {
    itens,
    saidas,
    loading,
  } = useSystem();

  const totalItens = (itens || []).length;

  const totalEstoque = (itens || []).reduce(
    (total, item) =>
      total + Number(item.quantidade || 0),
    0
  );

  const totalSaidas = (saidas || []).reduce(
    (total, saida) =>
      total + Number(saida.quantidade || 0),
    0
  );

  const estoqueBaixo = (itens || []).filter(
    (item) =>
      Number(item.quantidade || 0) <=
      Number(item.quantidade_minima || 0)
  ).length;

  const projetos = useMemo(() => {
    const agrupados = {};

    (saidas || []).forEach((saida) => {
      const projeto =
        saida.projeto?.trim() ||
        "Sem projeto informado";

      if (!agrupados[projeto]) {
        agrupados[projeto] = {
          nome: projeto,
          quantidade: 0,
          movimentacoes: 0,
        };
      }

      agrupados[projeto].quantidade += Number(
        saida.quantidade || 0
      );

      agrupados[projeto].movimentacoes += 1;
    });

    return Object.values(agrupados).sort(
      (a, b) => b.quantidade - a.quantidade
    );
  }, [saidas]);

  const maiorConsumo =
    projetos.length > 0
      ? projetos[0].quantidade
      : 0;

  const ultimasSaidas = [...(saidas || [])]
    .sort((a, b) => {
      const dataA = new Date(
        a.data || a.data_movimentacao || 0
      );

      const dataB = new Date(
        b.data || b.data_movimentacao || 0
      );

      return dataB - dataA;
    })
    .slice(0, 10);

  function nomeItem(id) {
    return (
      (itens || []).find(
        (item) => Number(item.id) === Number(id)
      )?.nome || `Item #${id}`
    );
  }

  function formatarData(data) {
    if (!data) return "-";

    const valor = new Date(data);

    if (Number.isNaN(valor.getTime())) {
      return "-";
    }

    return valor.toLocaleDateString("pt-BR");
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <span className="eyebrow">
            ANÁLISE
          </span>

          <h1>Dashboard de Projetos</h1>

          <p>
            Acompanhe o consumo de materiais e as
            movimentações do estoque.
          </p>
        </div>

        <div className="page-header-actions">
          <button
            className="button button-secondary"
            onClick={() =>
              exportarSaidasPDF(saidas || [], itens || [])
            }
            disabled={!saidas?.length}
          >
            Exportar PDF
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <span>Materiais cadastrados</span>
          <strong>{totalItens}</strong>
          <small>
            Itens no estoque
          </small>
        </div>

        <div className="stat-card">
          <span>Estoque atual</span>
          <strong>{totalEstoque}</strong>
          <small>
            Quantidade total disponível
          </small>
        </div>

        <div className="stat-card">
          <span>Total de saídas</span>
          <strong>{totalSaidas}</strong>
          <small>
            Materiais movimentados
          </small>
        </div>

        <div className="stat-card">
          <span>Estoque baixo</span>
          <strong>{estoqueBaixo}</strong>
          <small>
            Materiais abaixo do mínimo
          </small>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <div className="card-header">
            <div>
              <h2>Consumo por projeto</h2>

              <p>
                Quantidade de materiais retirados
                por projeto.
              </p>
            </div>
          </div>

          {loading ? (
            <div className="empty-state">
              Carregando dados...
            </div>
          ) : projetos.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                —
              </div>

              <strong>
                Nenhum projeto encontrado
              </strong>

              <p>
                Registre saídas vinculadas a
                projetos para visualizar os dados.
              </p>
            </div>
          ) : (
            <div className="project-list">
              {projetos.map((projeto) => {
                const percentual =
                  maiorConsumo > 0
                    ? (projeto.quantidade /
                        maiorConsumo) *
                      100
                    : 0;

                return (
                  <div
                    className="project-item"
                    key={projeto.nome}
                  >
                    <div className="project-item-header">
                      <div>
                        <strong>
                          {projeto.nome}
                        </strong>

                        <span>
                          {projeto.movimentacoes}{" "}
                          movimentaç
                          {projeto.movimentacoes === 1
                            ? "ão"
                            : "ões"}
                        </span>
                      </div>

                      <strong>
                        {projeto.quantidade}
                      </strong>
                    </div>

                    <div className="progress-bar">
                      <div
                        className="progress-bar-fill"
                        style={{
                          width: `${percentual}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <h2>Resumo</h2>

              <p>
                Visão geral das movimentações.
              </p>
            </div>
          </div>

          <div className="summary-list">
            <div className="summary-row">
              <span>Projetos movimentados</span>
              <strong>
                {projetos.length}
              </strong>
            </div>

            <div className="summary-row">
              <span>Maior consumo</span>
              <strong>
                {maiorConsumo}
              </strong>
            </div>

            <div className="summary-row">
              <span>Saídas registradas</span>
              <strong>
                {(saidas || []).length}
              </strong>
            </div>

            <div className="summary-row">
              <span>Materiais em estoque</span>
              <strong>
                {totalItens}
              </strong>
            </div>
          </div>
        </div>
      </div>

      <div className="card table-card">
        <div className="card-header">
          <div>
            <h2>Últimas saídas</h2>

            <p>
              As 10 movimentações mais recentes.
            </p>
          </div>
        </div>

        {ultimasSaidas.length === 0 ? (
          <div className="empty-state">
            <strong>
              Nenhuma saída registrada
            </strong>

            <p>
              As movimentações aparecerão aqui.
            </p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Material</th>
                  <th>Quantidade</th>
                  <th>Projeto</th>
                  <th>Data</th>
                </tr>
              </thead>

              <tbody>
                {ultimasSaidas.map((saida) => (
                  <tr key={saida.id}>
                    <td>
                      <strong>
                        {nomeItem(saida.item_id)}
                      </strong>
                    </td>

                    <td>
                      {saida.quantidade}
                    </td>

                    <td>
                      {saida.projeto ||
                        "Sem projeto"}
                    </td>

                    <td>
                      {formatarData(
                        saida.data ||
                          saida.data_movimentacao
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}