import React, { useMemo, useState } from "react";
import { useSystem } from "../../context/SystemContext";
import Modal from "../../components/ui/Modal";
import StatusBadge from "../../components/ui/StatusBadge";

export default function Solicitacoes() {
  const {
    solicitacoes,
    itens,
    responderSolicitacao,
    getNomeDepartamento,
    getNomeUsuario,
    user,
    loading,
  } = useSystem();

  const [filtro, setFiltro] = useState("todos");
  const [selecionada, setSelecionada] = useState(null);
  const [observacao, setObservacao] = useState("");

  const nivel = Number(
    user?.nivel_acesso ??
    user?.nivel ??
    2
  );

  const podeResponder = nivel <= 1;

  const filtradas = useMemo(() => {
    if (filtro === "todos") return solicitacoes || [];

    return (solicitacoes || []).filter(
      (solicitacao) =>
        String(solicitacao.status || "").toLowerCase() === filtro
    );
  }, [solicitacoes, filtro]);

  function getNomeItem(id) {
    const item = (itens || []).find(
      (item) => Number(item.id) === Number(id)
    );

    return item?.nome || `Item #${id}`;
  }

  function abrirResposta(solicitacao) {
    setSelecionada(solicitacao);
    setObservacao(solicitacao.observacao || "");
  }

  async function responder(status) {
    if (!selecionada) return;

    await responderSolicitacao(
      selecionada.id,
      status,
      observacao
    );

    setSelecionada(null);
    setObservacao("");
  }

  function quantidadeStatus(status) {
    return (solicitacoes || []).filter(
      (s) =>
        String(s.status || "").toLowerCase() === status
    ).length;
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <span className="eyebrow">GESTÃO</span>

          <h1>Solicitações</h1>

          <p>
            Acompanhe solicitações de materiais entre departamentos.
          </p>
        </div>

        <div className="page-header-actions">
          <button
            className={`filter-button ${
              filtro === "todos" ? "active" : ""
            }`}
            onClick={() => setFiltro("todos")}
          >
            Todas
          </button>

          <button
            className={`filter-button ${
              filtro === "pendente" ? "active" : ""
            }`}
            onClick={() => setFiltro("pendente")}
          >
            Pendentes
            <span>{quantidadeStatus("pendente")}</span>
          </button>

          <button
            className={`filter-button ${
              filtro === "aprovada" ? "active" : ""
            }`}
            onClick={() => setFiltro("aprovada")}
          >
            Aprovadas
          </button>

          <button
            className={`filter-button ${
              filtro === "recusada" ? "active" : ""
            }`}
            onClick={() => setFiltro("recusada")}
          >
            Recusadas
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <span>Total</span>
          <strong>{(solicitacoes || []).length}</strong>
        </div>

        <div className="stat-card">
          <span>Pendentes</span>
          <strong>{quantidadeStatus("pendente")}</strong>
        </div>

        <div className="stat-card">
          <span>Aprovadas</span>
          <strong>{quantidadeStatus("aprovada")}</strong>
        </div>

        <div className="stat-card">
          <span>Recusadas</span>
          <strong>{quantidadeStatus("recusada")}</strong>
        </div>
      </div>

      <div className="card table-card">
        <div className="card-header">
          <div>
            <h2>Solicitações recebidas</h2>
            <p>
              {filtradas.length} registro
              {filtradas.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="empty-state">
            <strong>Carregando solicitações...</strong>
          </div>
        ) : filtradas.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">✓</div>

            <strong>Nenhuma solicitação encontrada</strong>

            <p>
              Não existem solicitações para o filtro selecionado.
            </p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Material</th>
                  <th>Quantidade</th>
                  <th>Solicitante</th>
                  <th>Departamento</th>
                  <th>Data</th>
                  <th>Status</th>
                  {podeResponder && <th>Ações</th>}
                </tr>
              </thead>

              <tbody>
                {filtradas.map((solicitacao) => (
                  <tr key={solicitacao.id}>
                    <td>
                      <strong>
                        {getNomeItem(solicitacao.item_id)}
                      </strong>
                    </td>

                    <td>
                      {solicitacao.quantidade}
                    </td>

                    <td>
                      {getNomeUsuario(
                        solicitacao.usuario_solicitante_id
                      )}
                    </td>

                    <td>
                      {getNomeDepartamento(
                        solicitacao.dept_solicitante_id
                      )}
                    </td>

                    <td>
                      {solicitacao.data_solicitacao
                        ? new Date(
                            solicitacao.data_solicitacao
                          ).toLocaleDateString("pt-BR")
                        : "-"}
                    </td>

                    <td>
                      <StatusBadge
                        status={solicitacao.status}
                      />
                    </td>

                    {podeResponder && (
                      <td>
                        {String(
                          solicitacao.status || ""
                        ).toLowerCase() === "pendente" ? (
                          <button
                            className="button button-small"
                            onClick={() =>
                              abrirResposta(solicitacao)
                            }
                          >
                            Responder
                          </button>
                        ) : (
                          <span className="muted">
                            Respondida
                          </span>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        open={Boolean(selecionada)}
        title="Responder solicitação"
        onClose={() => setSelecionada(null)}
      >
        {selecionada && (
          <div className="modal-content">
            <div className="request-summary">
              <div>
                <span>Material</span>
                <strong>
                  {getNomeItem(selecionada.item_id)}
                </strong>
              </div>

              <div>
                <span>Quantidade</span>
                <strong>
                  {selecionada.quantidade}
                </strong>
              </div>

              <div>
                <span>Solicitante</span>
                <strong>
                  {getNomeUsuario(
                    selecionada.usuario_solicitante_id
                  )}
                </strong>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="observacao">
                Observação
              </label>

              <textarea
                id="observacao"
                value={observacao}
                onChange={(e) =>
                  setObservacao(e.target.value)
                }
                placeholder="Digite uma observação para o solicitante..."
                rows="4"
              />
            </div>

            <div className="modal-actions">
              <button
                className="button button-secondary"
                onClick={() => responder("recusada")}
              >
                Recusar
              </button>

              <button
                className="button button-primary"
                onClick={() => responder("aprovada")}
              >
                Aprovar
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}