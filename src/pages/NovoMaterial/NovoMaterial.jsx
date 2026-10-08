import React, { useState } from "react";
import { useSystem } from "../../context/SystemContext";

export default function NovoMaterial() {
  const {
    novoItem,
    setNovoItem,
    handleCadastrarItem,
    itens,
    departamentos,
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

  async function handleSubmit(event) {
    event.preventDefault();

    if (!novoItem.nome?.trim()) {
      return;
    }

    try {
      setEnviando(true);
      await handleCadastrarItem();
    } finally {
      setEnviando(false);
    }
  }

  function atualizarCampo(campo, valor) {
    setNovoItem((anterior) => ({
      ...anterior,
      [campo]: valor,
    }));
  }

  const categorias = [
    ...new Set(
      (itens || [])
        .map((item) => item.categoria)
        .filter(Boolean)
    ),
  ];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <span className="eyebrow">ESTOQUE</span>

          <h1>Novo Material</h1>

          <p>
            Cadastre um novo material no estoque.
          </p>
        </div>
      </div>

      <div className="form-layout">
        <div className="card form-card">
          <div className="card-header">
            <div>
              <h2>Dados do material</h2>

              <p>
                Preencha as informações abaixo para cadastrar
                o material.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group form-group-full">
                <label htmlFor="nome">
                  Nome do material *
                </label>

                <input
                  id="nome"
                  type="text"
                  value={novoItem?.nome || ""}
                  onChange={(e) =>
                    atualizarCampo(
                      "nome",
                      e.target.value
                    )
                  }
                  placeholder="Ex.: Cimento, papel A4, cabo elétrico..."
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="categoria">
                  Categoria
                </label>

                <input
                  id="categoria"
                  type="text"
                  list="categorias"
                  value={novoItem?.categoria || ""}
                  onChange={(e) =>
                    atualizarCampo(
                      "categoria",
                      e.target.value
                    )
                  }
                  placeholder="Selecione ou digite"
                />

                <datalist id="categorias">
                  {categorias.map((categoria) => (
                    <option
                      key={categoria}
                      value={categoria}
                    />
                  ))}
                </datalist>
              </div>

              <div className="form-group">
                <label htmlFor="quantidade">
                  Quantidade inicial *
                </label>

                <input
                  id="quantidade"
                  type="number"
                  min="0"
                  value={novoItem?.quantidade ?? ""}
                  onChange={(e) =>
                    atualizarCampo(
                      "quantidade",
                      e.target.value
                    )
                  }
                  placeholder="0"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="quantidade_minima">
                  Estoque mínimo
                </label>

                <input
                  id="quantidade_minima"
                  type="number"
                  min="0"
                  value={
                    novoItem?.quantidade_minima ?? ""
                  }
                  onChange={(e) =>
                    atualizarCampo(
                      "quantidade_minima",
                      e.target.value
                    )
                  }
                  placeholder="0"
                />
              </div>

              <div className="form-group">
                <label htmlFor="localizacao">
                  Localização
                </label>

                <input
                  id="localizacao"
                  type="text"
                  value={novoItem?.localizacao || ""}
                  onChange={(e) =>
                    atualizarCampo(
                      "localizacao",
                      e.target.value
                    )
                  }
                  placeholder="Ex.: Almoxarifado A"
                />
              </div>

              {nivel === 0 && (
                <div className="form-group">
                  <label htmlFor="departamento_id">
                    Departamento
                  </label>

                  <select
                    id="departamento_id"
                    value={
                      novoItem?.departamento_id || ""
                    }
                    onChange={(e) =>
                      atualizarCampo(
                        "departamento_id",
                        e.target.value
                      )
                    }
                  >
                    <option value="">
                      Selecione um departamento
                    </option>

                    {(departamentos || []).map(
                      (departamento) => (
                        <option
                          key={departamento.id}
                          value={departamento.id}
                        >
                          {departamento.nome}
                        </option>
                      )
                    )}
                  </select>
                </div>
              )}

              {nivel !== 0 && departamentoUsuario && (
                <div className="form-group">
                  <label>Departamento</label>

                  <div className="readonly-field">
                    {(
                      departamentos || []
                    ).find(
                      (departamento) =>
                        Number(departamento.id) ===
                        Number(departamentoUsuario)
                    )?.nome ||
                      user?.departamento ||
                      "Departamento atual"}
                  </div>
                </div>
              )}
            </div>

            <div className="form-info">
              <div className="info-icon">i</div>

              <div>
                <strong>Estoque mínimo</strong>

                <p>
                  Quando a quantidade do material atingir
                  esse valor, ele será destacado como estoque
                  baixo.
                </p>
              </div>
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="button button-primary"
                disabled={enviando || loading}
              >
                {enviando
                  ? "Cadastrando..."
                  : "Cadastrar material"}
              </button>
            </div>
          </form>
        </div>

        <div className="card side-info-card">
          <div className="side-info-icon">+</div>

          <h3>Novo cadastro</h3>

          <p>
            Cadastre materiais com informações suficientes
            para facilitar o controle e a localização no
            estoque.
          </p>

          <div className="info-list">
            <div>
              <strong>Nome</strong>
              <span>Identificação do material</span>
            </div>

            <div>
              <strong>Categoria</strong>
              <span>Organização do estoque</span>
            </div>

            <div>
              <strong>Localização</strong>
              <span>Onde o material está armazenado</span>
            </div>

            <div>
              <strong>Estoque mínimo</strong>
              <span>Limite para alerta de estoque baixo</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}