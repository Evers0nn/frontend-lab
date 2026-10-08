import React, { useState } from "react";
import { useSystem } from "../../context/SystemContext";

export default function Usuarios() {
  const {
    usuariosList,
    departamentos,
    novoUsuario,
    setNovoUsuario,
    handleCadastrarUsuario,
    loading,
  } = useSystem();

  const [enviando, setEnviando] = useState(false);

  function atualizar(campo, valor) {
    setNovoUsuario((anterior) => ({
      ...anterior,
      [campo]: valor,
    }));
  }

  async function cadastrar(event) {
    event.preventDefault();

    try {
      setEnviando(true);
      await handleCadastrarUsuario();
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <span className="eyebrow">
            ADMINISTRAÇÃO
          </span>

          <h1>Controle de Usuários</h1>

          <p>
            Cadastre e acompanhe os usuários do sistema.
          </p>
        </div>
      </div>

      <div className="form-layout">
        <div className="card form-card">
          <div className="card-header">
            <div>
              <h2>Novo usuário</h2>

              <p>
                Crie um novo acesso ao sistema.
              </p>
            </div>
          </div>

          <form onSubmit={cadastrar}>
            <div className="form-grid">
              <div className="form-group">
                <label>Usuário *</label>

                <input
                  type="text"
                  value={novoUsuario?.usuario || ""}
                  onChange={(e) =>
                    atualizar(
                      "usuario",
                      e.target.value
                    )
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>Nome completo *</label>

                <input
                  type="text"
                  value={novoUsuario?.nome || ""}
                  onChange={(e) =>
                    atualizar(
                      "nome",
                      e.target.value
                    )
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>Senha *</label>

                <input
                  type="password"
                  value={novoUsuario?.senha || ""}
                  onChange={(e) =>
                    atualizar(
                      "senha",
                      e.target.value
                    )
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>Cargo</label>

                <input
                  type="text"
                  value={novoUsuario?.cargo || ""}
                  onChange={(e) =>
                    atualizar(
                      "cargo",
                      e.target.value
                    )
                  }
                />
              </div>

              <div className="form-group">
                <label>Departamento</label>

                <select
                  value={
                    novoUsuario?.departamento_id || ""
                  }
                  onChange={(e) =>
                    atualizar(
                      "departamento_id",
                      e.target.value
                    )
                  }
                >
                  <option value="">
                    Selecione
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

              <div className="form-group">
                <label>Nível de acesso</label>

                <select
                  value={
                    novoUsuario?.nivel_acesso ??
                    2
                  }
                  onChange={(e) =>
                    atualizar(
                      "nivel_acesso",
                      Number(e.target.value)
                    )
                  }
                >
                  <option value={0}>
                    Administrador geral
                  </option>

                  <option value={1}>
                    Responsável
                  </option>

                  <option value={2}>
                    Usuário
                  </option>
                </select>
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
                  : "Cadastrar usuário"}
              </button>
            </div>
          </form>
        </div>

        <div className="card">
          <div className="card-header">
            <div>
              <h2>Usuários cadastrados</h2>

              <p>
                {usuariosList?.length || 0} usuário
                {(usuariosList?.length || 0) !== 1
                  ? "s"
                  : ""}
              </p>
            </div>
          </div>

          <div className="user-list">
            {(usuariosList || []).map((usuario) => (
              <div
                className="user-list-item"
                key={usuario.id}
              >
                <div className="user-avatar">
                  {(usuario.nome ||
                    usuario.usuario ||
                    "?")
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div>
                  <strong>
                    {usuario.nome ||
                      usuario.usuario}
                  </strong>

                  <span>
                    @{usuario.usuario}
                  </span>
                </div>

                <div className="user-level">
                  Nível{" "}
                  {usuario.nivel_acesso ??
                    "-"}
                </div>
              </div>
            ))}

            {(!usuariosList ||
              usuariosList.length === 0) && (
              <div className="empty-state">
                Nenhum usuário cadastrado.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}