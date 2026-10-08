import React, { useMemo, useState } from "react";
import { useSystem } from "../../context/SystemContext";
import Modal from "../../components/ui/Modal";
import StatusBadge from "../../components/ui/StatusBadge";
import { exportarEstoquePDF } from "../../services/reportService";

const POR_PAGINA = 50;

export default function Estoque() {
  const {
    itens = [],
    departamentos = [],
    user,
    nivelUsuario,
    getNomeDepartamento,
    handleSalvarEdicao,
    confirmarExclusao,
    enviarSolicitacao,
    loading,
  } = useSystem();

  const [busca, setBusca] = useState("");
  const [categoria, setCategoria] = useState("todas");
  const [pagina, setPagina] = useState(1);

  const [itemSelecionado, setItemSelecionado] = useState(null);
  const [modalEdicao, setModalEdicao] = useState(false);
  const [modalExclusao, setModalExclusao] = useState(false);
  const [modalSolicitacao, setModalSolicitacao] = useState(false);

  const [formEdicao, setFormEdicao] = useState({});
  const [quantidadeSolicitada, setQuantidadeSolicitada] = useState(1);
  const [observacao, setObservacao] = useState("");

  const categorias = useMemo(() => {
    const valores = itens
      .map((item) => item.categoria)
      .filter(Boolean);

    return [...new Set(valores)].sort((a, b) =>
      String(a).localeCompare(String(b))
    );
  }, [itens]);

  const itensFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    return itens.filter((item) => {
      const correspondeBusca =
        !termo ||
        String(item.nome || "").toLowerCase().includes(termo) ||
        String(item.categoria || "").toLowerCase().includes(termo) ||
        String(item.localizacao || "").toLowerCase().includes(termo);

      const correspondeCategoria =
        categoria === "todas" ||
        String(item.categoria || "") === categoria;

      return correspondeBusca && correspondeCategoria;
    });
  }, [itens, busca, categoria]);

  const totalPaginas = Math.max(
    1,
    Math.ceil(itensFiltrados.length / POR_PAGINA)
  );

  const itensPagina = useMemo(() => {
    const inicio = (pagina - 1) * POR_PAGINA;

    return itensFiltrados.slice(
      inicio,
      inicio + POR_PAGINA
    );
  }, [itensFiltrados, pagina]);

  const estoqueBaixo = itens.filter(
    (item) =>
      Number(item.quantidade || 0) <=
      Number(item.quantidade_minima || 0)
  ).length;

  const podeEditar = nivelUsuario <= 1;
  const podeExcluir = nivelUsuario === 0;

  function atualizarBusca(valor) {
    setBusca(valor);
    setPagina(1);
  }

  function atualizarCategoria(valor) {
    setCategoria(valor);
    setPagina(1);
  }

  function abrirEdicao(item) {
    setItemSelecionado(item);

    setFormEdicao({
      id: item.id,
      nome: item.nome || "",
      categoria: item.categoria || "",
      quantidade: item.quantidade ?? 0,
      quantidade_minima: item.quantidade_minima ?? 0,
      localizacao: item.localizacao || "",
      departamento_id: item.departamento_id ?? "",
    });

    setModalEdicao(true);
  }

  function abrirExclusao(item) {
    setItemSelecionado(item);
    setModalExclusao(true);
  }

  function abrirSolicitacao(item) {
    setItemSelecionado(item);
    setQuantidadeSolicitada(1);
    setObservacao("");
    setModalSolicitacao(true);
  }

  async function salvarEdicao(event) {
    event.preventDefault();

    await handleSalvarEdicao(formEdicao);

    setModalEdicao(false);
    setItemSelecionado(null);
  }

  async function excluirItem() {
    if (!itemSelecionado) return;

    await confirmarExclusao(itemSelecionado.id);

    setModalExclusao(false);
    setItemSelecionado(null);
  }

  async function solicitarMaterial(event) {
    event.preventDefault();

    if (!itemSelecionado) return;

    await enviarSolicitacao({
      item_id: itemSelecionado.id,
      quantidade: Number(quantidadeSolicitada),
      dept_solicitado_id: itemSelecionado.departamento_id,
      observacao,
    });

    setModalSolicitacao(false);
    setItemSelecionado(null);
  }

  function exportarPDF() {
    exportarEstoquePDF(itensFiltrados);
  }

  function departamentoNome(departamentoId) {
    return getNomeDepartamento
      ? getNomeDepartamento(departamentoId)
      : "—";
  }

  function itemPertenceAoDepartamento(item) {
    if (!user?.departamento_id) return false;

    return (
      Number(item.departamento_id) ===
      Number(user.departamento_id)
    );
  }

  return (
    <section className="page-section">
      <div className="page-heading">
        <div>
          <span className="eyebrow">Materiais</span>

          <h2>Estoque Geral</h2>

          <p>
            Consulte os materiais disponíveis e acompanhe os níveis
            de estoque.
          </p>
        </div>

        <div className="page-header-actions">
          <button
            className="btn btn-outline"
            onClick={exportarPDF}
            disabled={!itensFiltrados.length}
          >
            📄 Exportar PDF
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <span>Total de materiais</span>
          <strong>{itens.length}</strong>
          <small>Itens cadastrados no sistema</small>
        </div>

        <div className="stat-card">
          <span>Materiais exibidos</span>
          <strong>{itensFiltrados.length}</strong>
          <small>Resultado dos filtros atuais</small>
        </div>

        <div className="stat-card">
          <span>Estoque baixo</span>
          <strong className={estoqueBaixo > 0 ? "qty-danger" : ""}>
            {estoqueBaixo}
          </strong>
          <small>
            {estoqueBaixo > 0
              ? "Materiais precisam de atenção"
              : "Nenhum material abaixo do mínimo"}
          </small>
        </div>
      </div>

      <div className="toolbar">
        <input
          type="search"
          value={busca}
          onChange={(event) =>
            atualizarBusca(event.target.value)
          }
          placeholder="Buscar por material, categoria ou localização..."
        />

        <select
          value={categoria}
          onChange={(event) =>
            atualizarCategoria(event.target.value)
          }
        >
          <option value="todas">
            Todas as categorias
          </option>

          {categorias.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <span className="result-count">
          {itensFiltrados.length} material(is)
        </span>
      </div>

      <div className="table-card">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Material</th>
                <th>Categoria</th>
                <th>Quantidade</th>
                <th>Mínimo</th>
                <th>Localização</th>
                <th>Departamento</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan="8"
                    className="empty-state"
                  >
                    Carregando estoque...
                  </td>
                </tr>
              ) : itensPagina.length === 0 ? (
                <tr>
                  <td
                    colSpan="8"
                    className="empty-state"
                  >
                    <div className="empty-icon">
                      📦
                    </div>

                    <strong>
                      Nenhum material encontrado
                    </strong>

                    <span>
                      Tente alterar os filtros ou a busca.
                    </span>
                  </td>
                </tr>
              ) : (
                itensPagina.map((item) => {
                  const quantidade =
                    Number(item.quantidade || 0);

                  const minimo =
                    Number(item.quantidade_minima || 0);

                  const baixo =
                    quantidade <= minimo;

                  const pertence =
                    itemPertenceAoDepartamento(item);

                  return (
                    <tr
                      key={item.id}
                      className={
                        baixo ? "row-alert" : ""
                      }
                    >
                      <td>
                        <strong className="strong">
                          {item.nome}
                        </strong>

                        <small>
                          ID #{item.id}
                        </small>
                      </td>

                      <td>
                        {item.categoria || "—"}
                      </td>

                      <td>
                        <span
                          className={
                            baixo
                              ? "qty-danger"
                              : "qty"
                          }
                        >
                          {quantidade}
                        </span>
                      </td>

                      <td>
                        {minimo}
                      </td>

                      <td>
                        {item.localizacao || "—"}
                      </td>

                      <td>
                        {departamentoNome(
                          item.departamento_id
                        )}
                      </td>

                      <td>
                        {baixo ? (
                          <StatusBadge
                            status="baixo"
                            label="Estoque baixo"
                          />
                        ) : (
                          <StatusBadge
                            status="aprovado"
                            label="Disponível"
                          />
                        )}
                      </td>

                      <td>
                        <div className="action-row">
                          {podeEditar && pertence && (
                            <button
                              className="btn btn-edit btn-small"
                              onClick={() =>
                                abrirEdicao(item)
                              }
                            >
                              Editar
                            </button>
                          )}

                          {podeExcluir && pertence && (
                            <button
                              className="btn btn-danger btn-small"
                              onClick={() =>
                                abrirExclusao(item)
                              }
                            >
                              Excluir
                            </button>
                          )}

                          {!pertence && (
                            <button
                              className="btn btn-primary btn-small"
                              onClick={() =>
                                abrirSolicitacao(item)
                              }
                            >
                              Solicitar
                            </button>
                          )}

                          {pertence && !podeEditar && (
                            <span className="muted">
                              —
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {totalPaginas > 1 && (
          <div className="pagination">
            <button
              className="btn btn-outline btn-small"
              disabled={pagina <= 1}
              onClick={() =>
                setPagina((p) => Math.max(1, p - 1))
              }
            >
              ← Anterior
            </button>

            <span>
              Página {pagina} de {totalPaginas}
            </span>

            <button
              className="btn btn-outline btn-small"
              disabled={pagina >= totalPaginas}
              onClick={() =>
                setPagina((p) =>
                  Math.min(totalPaginas, p + 1)
                )
              }
            >
              Próxima →
            </button>
          </div>
        )}
      </div>

      {/* =====================================================
          MODAL — EDITAR
          ===================================================== */}

      {modalEdicao && (
        <Modal
          title="Editar material"
          onClose={() => setModalEdicao(false)}
        >
          <form
            className="form-stack"
            onSubmit={salvarEdicao}
          >
            <div className="form-grid">
              <div className="form-group">
                <label>Nome do material</label>

                <input
                  value={formEdicao.nome || ""}
                  onChange={(event) =>
                    setFormEdicao({
                      ...formEdicao,
                      nome: event.target.value,
                    })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>Categoria</label>

                <input
                  value={formEdicao.categoria || ""}
                  onChange={(event) =>
                    setFormEdicao({
                      ...formEdicao,
                      categoria: event.target.value,
                    })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>Quantidade</label>

                <input
                  type="number"
                  min="0"
                  value={formEdicao.quantidade}
                  onChange={(event) =>
                    setFormEdicao({
                      ...formEdicao,
                      quantidade: Number(
                        event.target.value
                      ),
                    })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>Quantidade mínima</label>

                <input
                  type="number"
                  min="0"
                  value={formEdicao.quantidade_minima}
                  onChange={(event) =>
                    setFormEdicao({
                      ...formEdicao,
                      quantidade_minima: Number(
                        event.target.value
                      ),
                    })
                  }
                  required
                />
              </div>

              <div className="form-group form-group-full">
                <label>Localização</label>

                <input
                  value={formEdicao.localizacao || ""}
                  onChange={(event) =>
                    setFormEdicao({
                      ...formEdicao,
                      localizacao: event.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() =>
                  setModalEdicao(false)
                }
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="btn btn-primary"
              >
                Salvar alterações
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* =====================================================
          MODAL — EXCLUSÃO
          ===================================================== */}

      {modalExclusao && itemSelecionado && (
        <Modal
          title="Excluir material"
          onClose={() =>
            setModalExclusao(false)
          }
        >
          <div className="form-stack">
            <div className="form-alert">
              Esta ação irá excluir o material
              <strong>
                {" "}
                {itemSelecionado.nome}
              </strong>
              . Confirme somente se realmente deseja
              continuar.
            </div>

            <div className="modal-actions">
              <button
                className="btn btn-outline"
                onClick={() =>
                  setModalExclusao(false)
                }
              >
                Cancelar
              </button>

              <button
                className="btn btn-danger"
                onClick={excluirItem}
              >
                Excluir material
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* =====================================================
          MODAL — SOLICITAÇÃO
          ===================================================== */}

      {modalSolicitacao && itemSelecionado && (
        <Modal
          title="Solicitar material"
          onClose={() =>
            setModalSolicitacao(false)
          }
        >
          <form
            className="form-stack"
            onSubmit={solicitarMaterial}
          >
            <div className="request-summary">
              <div>
                <span>Material</span>
                <strong>
                  {itemSelecionado.nome}
                </strong>
              </div>

              <div>
                <span>Disponível</span>
                <strong>
                  {itemSelecionado.quantidade}
                </strong>
              </div>

              <div>
                <span>Departamento</span>
                <strong>
                  {departamentoNome(
                    itemSelecionado.departamento_id
                  )}
                </strong>
              </div>
            </div>

            <div className="form-group">
              <label>
                Quantidade solicitada
              </label>

              <input
                type="number"
                min="1"
                max={Number(
                  itemSelecionado.quantidade || 1
                )}
                value={quantidadeSolicitada}
                onChange={(event) =>
                  setQuantidadeSolicitada(
                    Number(event.target.value)
                  )
                }
                required
              />
            </div>

            <div className="form-group">
              <label>Observação</label>

              <textarea
                value={observacao}
                onChange={(event) =>
                  setObservacao(
                    event.target.value
                  )
                }
                placeholder="Informe alguma observação, se necessário..."
              />
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() =>
                  setModalSolicitacao(false)
                }
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="btn btn-primary"
              >
                Enviar solicitação
              </button>
            </div>
          </form>
        </Modal>
      )}
    </section>
  );
}