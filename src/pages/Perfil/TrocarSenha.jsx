import React, { useState } from "react";
import { useSystem } from "../../context/SystemContext";

export default function TrocarSenha() {
  const {
    formSenha,
    setFormSenha,
    handleTrocarSenha,
    loading,
  } = useSystem();

  const [enviando, setEnviando] = useState(false);

  function atualizar(campo, valor) {
    setFormSenha((anterior) => ({
      ...anterior,
      [campo]: valor,
    }));
  }

  async function salvar(event) {
    event.preventDefault();

    if (
      formSenha?.nova_senha !==
      formSenha?.confirmar_senha
    ) {
      return;
    }

    try {
      setEnviando(true);
      await handleTrocarSenha();
    } finally {
      setEnviando(false);
    }
  }

  const senhasDiferentes =
    formSenha?.confirmar_senha &&
    formSenha?.nova_senha !==
      formSenha?.confirmar_senha;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <span className="eyebrow">
            PERFIL
          </span>

          <h1>Trocar Senha</h1>

          <p>
            Atualize a senha de acesso à sua conta.
          </p>
        </div>
      </div>

      <div className="form-layout">
        <div className="card form-card">
          <div className="card-header">
            <div>
              <h2>Alterar senha</h2>

              <p>
                Informe sua senha atual e escolha uma
                nova senha.
              </p>
            </div>
          </div>

          <form onSubmit={salvar}>
            <div className="form-grid single-column">
              <div className="form-group">
                <label>Senha atual *</label>

                <input
                  type="password"
                  value={
                    formSenha?.senha_atual || ""
                  }
                  onChange={(e) =>
                    atualizar(
                      "senha_atual",
                      e.target.value
                    )
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>Nova senha *</label>

                <input
                  type="password"
                  value={
                    formSenha?.nova_senha || ""
                  }
                  onChange={(e) =>
                    atualizar(
                      "nova_senha",
                      e.target.value
                    )
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>
                  Confirmar nova senha *
                </label>

                <input
                  type="password"
                  value={
                    formSenha?.confirmar_senha ||
                    ""
                  }
                  onChange={(e) =>
                    atualizar(
                      "confirmar_senha",
                      e.target.value
                    )
                  }
                  required
                />

                {senhasDiferentes && (
                  <small className="field-error">
                    As senhas não coincidem.
                  </small>
                )}
              </div>
            </div>

            <div className="form-info">
              <div className="info-icon">i</div>

              <div>
                <strong>Segurança</strong>

                <p>
                  Utilize uma senha forte e não
                  compartilhe seus dados de acesso.
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
                  Boolean(senhasDiferentes)
                }
              >
                {enviando
                  ? "Atualizando..."
                  : "Alterar senha"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}