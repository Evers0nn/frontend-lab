import React, { useMemo, useState } from "react";
import { useSystem } from "../../context/SystemContext";

export default function Auditoria() {
  const {
    auditoria,
    loading,
    getNomeDepartamento,
  } = useSystem();

  const [busca, setBusca] = useState("");

  const registros = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    if (!termo) {
      return auditoria || [];
    }

    return (auditoria || []).filter((registro) =>
      [
        registro.usuario,
        registro.acao,
        registro.departamento,
        String(registro.data || ""),
      ]
        .join(" ")
        .toLowerCase()
        .includes(termo)
    );
  }, [auditoria, busca]);

  function formatarData(data) {
    if (!data) return "-";

    const valor = new Date(data);

    if (Number.isNaN(valor.getTime())) {
      return data;
    }

    return valor.toLocaleString("pt-BR");
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <span className="eyebrow">
            SEGURANÇA
          </span>

          <h1>Log de Auditoria</h1>

          <p>
            Consulte o histórico de ações realizadas
            no sistema.
          </p>
        </div>
      </div>

      <div className="card table-card">
        <div className="card-header">
          <div>
            <h2>Histórico</h2>

            <p>
              {registros.length} registro
              {registros.length !== 1 ? "s" : ""}
            </p>
          </div>

          <div className="table-toolbar">
            <input
              type="search"
              value={busca}
              onChange={(e) =>
                setBusca(e.target.value)
              }
              placeholder="Pesquisar no histórico..."
            />
          </div>
        </div>

        {loading ? (
          <div className="empty-state">
            Carregando histórico...
          </div>
        ) : registros.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              —
            </div>

            <strong>
              Nenhum registro encontrado
            </strong>

            <p>
              Não existem registros correspondentes
              à pesquisa.
            </p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Usuário</th>
                  <th>Departamento</th>
                  <th>Ação</th>
                  <th>Data</th>
                </tr>
              </thead>

              <tbody>
                {registros.map((registro, index) => (
                  <tr
                    key={
                      registro.id ||
                      `${registro.usuario}-${index}`
                    }
                  >
                    <td>
                      <strong>
                        {registro.usuario ||
                          "Sistema"}
                      </strong>
                    </td>

                    <td>
                      {registro.departamento ||
                        getNomeDepartamento(
                          registro.departamento_id
                        ) ||
                        "-"}
                    </td>

                    <td>
                      <span className="audit-action">
                        {registro.acao ||
                          "Ação não informada"}
                      </span>
                    </td>

                    <td>
                      {formatarData(
                        registro.data
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