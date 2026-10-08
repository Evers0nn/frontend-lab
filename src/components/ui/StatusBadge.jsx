import React from "react";

export default function StatusBadge({ status }) {
  const valor = String(status || "").toLowerCase();

  let classe = "status-default";
  let texto = status || "—";

  if (
    valor === "pendente" ||
    valor === "pending"
  ) {
    classe = "status-warning";
    texto = "Pendente";
  }

  if (
    valor === "aprovada" ||
    valor === "aprovado" ||
    valor === "aceita"
  ) {
    classe = "status-success";
    texto = "Aprovada";
  }

  if (
    valor === "recusada" ||
    valor === "recusado" ||
    valor === "rejeitada"
  ) {
    classe = "status-danger";
    texto = "Recusada";
  }

  return (
    <span className={`status-badge ${classe}`}>
      {texto}
    </span>
  );
}