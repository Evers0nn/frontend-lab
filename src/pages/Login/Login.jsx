import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";

const CORES = {
  roxoEscuro: "#574591",
  roxoMedio: "#766AA7",
  roxoClaro: "#CEC9DD",
  laranja: "#F4A521",
  branco: "#FFFFFF",
};

export default function Login() {
  const { login } = useAuth();

  const [form, setForm] = useState({
    usuario: "",
    senha: "",
  });

  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setErro("");
    setCarregando(true);

    try {
      await login(form.usuario, form.senha);
    } catch (error) {
      setErro(error.message);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="login-page">

      <div className="login-background" />

      <div className="login-card">

        <div className="login-logo">
          <img
            src="/logo-territorio.png"
            alt="Território do Fazer"
          />
        </div>

        <h1>Acesso ao Sistema</h1>

        <p>
          Controle de Materiais
        </p>

        <form onSubmit={handleSubmit}>

          <div className="form-group">
            <label>Usuário</label>

            <input
              type="text"
              value={form.usuario}
              placeholder="Digite seu usuário"
              required
              onChange={(e) =>
                setForm({
                  ...form,
                  usuario: e.target.value,
                })
              }
            />
          </div>

          <div className="form-group">
            <label>Senha</label>

            <input
              type="password"
              value={form.senha}
              placeholder="Digite sua senha"
              required
              onChange={(e) =>
                setForm({
                  ...form,
                  senha: e.target.value,
                })
              }
            />
          </div>

          {erro && (
            <div className="login-error">
              {erro}
            </div>
          )}

          <button
            className="btn btn-primary login-button"
            type="submit"
            disabled={carregando}
          >
            {carregando ? "ENTRANDO..." : "ENTRAR"}
          </button>

        </form>

        <div className="login-footer">
          Território do Fazer
        </div>

      </div>
    </div>
  );
}