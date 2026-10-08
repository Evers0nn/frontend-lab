import React from "react";
import { useSystem } from "../../context/SystemContext";

export default function Notification() {
  const { notificacao } = useSystem();
  if (!notificacao.visivel) return null;
  return <div className={`notification notification-${notificacao.tipo}`}>{notificacao.texto}</div>;
}
