import React from "react";
export default function StatusBadge({ status }) {
  const label = status === "aprovado" ? "Aprovado" : status === "rejeitado" ? "Rejeitado" : "Pendente";
  return <span className={`status-badge status-${status}`}>{label}</span>;
}
