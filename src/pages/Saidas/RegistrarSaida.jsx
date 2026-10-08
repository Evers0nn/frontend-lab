import React, { useMemo, useState } from "react";
import { useSystem } from "../../context/SystemContext";

export default function RegistrarSaida() {
  const {
    itens,
    novaSaida,
    setNovaSaida,
    handleCadastrarSaida,
    user,
    loading,
  } = useSystem();

  const [enviando, setEnviando] = useState(false);

  const nivel = Number(
    user?.nivel_acesso ??
    user?.nivel ??
    2
  );

  const departamentoUsuario =
    user?.departamento_id ??
    user?.departamento?.id;

  const itensDisponiveis = useMemo(() => {
    return (itens || []).filter((item) => {
      if (Number(item.quantidade || 0) <= 0) {
        return false;
      }

      if (nivel === 0) {
        return true;
      }

      if (!departamentoUsuario) {
        return true;
      }

      return (
        Number(item.departamento_id) ===
        Number(departamentoUsuario)
      );
    });
  }, [
    itens,
    nivel,
    departamentoUsuario,
  ]);

  function atualizarCampo(campo, valor) {
    setNovaSaida((anterior) => ({
      ...anterior,
      [campo]: valor,
    }));
  }

  const itemSelecionado = itensDisponiveis.find(
    (item) =>
      Number(item.id) ===
      Number(novaSaida?.item_id)
  );

  async function handleSubmit(event) {
    event.preventDefault();

    if (!novaSaida?.item_id) {
      return;
    }

    if (
      Number(novaSaida.quantidade || 0) <= 0
    ) {
      return;
    }

    if (
      itemSelecionado &&
      Number(novaSaida.quantidade) >
        Number(itemSelecionado.quantidade)
    ) {
      return;
    }

    try {
      setEnviando(true);
      await handleCadastrarSaida();
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <span className="eyebrow">
            MOVIMENTAÇÃO
          </span>

          <h1>Registrar Saída</h1>

          <p>
            Registre a retirada de materiais do estoque.
          </p>
        </div>
      </div>

      <div className="form-layout">
        <div className="card form-card">
          <div className="card-header">
            <div>
              <h2>Dados da saída</h2>

              <p>
                Informe o material, quantidade e destino da
                movimentação.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group form-group-full">
                <label htmlFor="item_id">
                  Material *
                </label>

                <select
                  id="item_id"
                  value={novaSaida?.item_id || ""}
                  onChange={(e) =>
                    atualizarCampo(
                      "item_id",
                      e.target.value
                    )
                  }
                  required
                >
                  <option value="">
                    Selecione um material
                  </option>

                  {itensDisponiveis.map((item) => (
                    <option
                      key={item.id}
                      value={item.id}
                    >
                      {item.nome} — disponível:{" "}
                      {item.quantidade}
                    </option>
                  ))}
                </select>
              </div>

              {itemSelecionado && (
                <div className="stock-highlight">
                  <span>Estoque disponível</span>

                  <strong>
                    {itemSelecionado.quantidade}
                  </strong>

                  <small>
                    {itemSelecionado.unidade ||
                      "unidades"}
                  </small>
                </div>
              )}

              <div className="form-group">
                <label htmlFor="quantidade">
                  Quantidade *
                </label>

                <input
                  id="quantidade"
                  type="number"
                  min="1"
                  max={
                    itemSelecionado?.quantidade ||
                    undefined
                  }
                  value={novaSaida?.quantidade ?? ""}
                  onChange={(e) =>
                    atualizarCampo(
                      "quantidade",
                      e.target.value
                    )
                  }
                  placeholder="Digite a quantidade"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="projeto">
                  Projeto / Destino
                </label>

                <input
                  id="projeto"
                  type="text"
                  value={novaSaida?.projeto || ""}
                  onChange={(e) =>
                    atualizarCampo(
                      "projeto",
                      e.target.value
                    )
                  }
                  placeholder="Ex.: Obra Centro"
                />
              </div>
            </div>

            {itemSelecionado &&
              Number(novaSaida?.quantidade || 0) >
                Number(itemSelecionado.quantidade) && (
                <div className="form-alert">
                  A quantidade informada é maior que o
                  estoque disponível.
                </div>
              )}

            <div className="form-info">
              <div className="info-icon">i</div>

              <div>
                <strong>Atenção</strong>

                <p>
                  A saída será registrada no histórico de
                  movimentações e descontada do estoque.
                </p>
              </div>
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="button button-primary"
                disabled={
                  enviando ||
                  loading ||
                  !novaSaida?.item_id ||
                  Number(novaSaida?.quantidade || 0) <= 0 ||
                  (itemSelecionado &&
                    Number(novaSaida.quantidade) >
                      Number(itemSelecionado.quantidade))
                }
              >
                {enviando
                  ? "Registrando..."
                  : "Registrar saída"}
              </button>
            </div>
          </form>
        </div>

        <div className="card side-info-card">
          <div className="side-info-icon">−</div>

          <h3>Controle de saídas</h3>

          <p>
            Toda retirada deve ser registrada para manter
            o estoque atualizado.
          </p>

          <div className="info-list">
            <div>
              <strong>Material</strong>
              <span>Selecione um item disponível</span>
            </div>

            <div>
              <strong>Quantidade</strong>
              <span>Não pode ultrapassar o estoque</span>
            </div>

            <div>
              <strong>Projeto</strong>
              <span>Informe o destino quando necessário</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}