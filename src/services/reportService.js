import { jsPDF } from "jspdf";
import "jspdf-autotable";

export function exportarEstoquePDF(itens, getNomeDepartamento) {
  const doc = new jsPDF();
  doc.setFont("Arial", "bold"); doc.setFontSize(18); doc.setTextColor(87, 69, 145);
  doc.text("Controle de Materiais - Território do Fazer", 14, 20);
  doc.setFontSize(10); doc.setTextColor(118, 106, 167);
  doc.text(`Relatório de Estoque Oficial — Emitido em: ${new Date().toLocaleDateString("pt-BR")}`, 14, 27);
  doc.autoTable({ startY: 35, head: [["ID", "Material", "Categoria", "Dept.", "Qtd", "Local"]], body: itens.map(i => [i.id, i.nome, i.categoria, i.departamentos?.nome || getNomeDepartamento(i.departamento_id), i.quantidade, i.localizacao || "-"]), headStyles: { fillColor: [87, 69, 145] } });
  doc.save(`relatorio_estoque_${new Date().toISOString().slice(0, 10)}.pdf`);
}

export function exportarSaidasPDF(saidas, obterNomeItem, getNomeDepartamento) {
  const doc = new jsPDF();
  doc.setFont("Arial", "bold"); doc.setFontSize(18); doc.setTextColor(87, 69, 145);
  doc.text("Histórico de Saídas - Território do Fazer", 14, 20);
  doc.setFontSize(10); doc.setTextColor(118, 106, 167);
  doc.text(`Emitido em: ${new Date().toLocaleDateString("pt-BR")}`, 14, 27);
  doc.autoTable({ startY: 35, head: [["Item", "Projeto", "Dept.", "Qtd", "Data"]], body: saidas.map(s => [obterNomeItem(s.item_id), s.projeto, s.departamentos?.nome || getNomeDepartamento(s.departamento_id), s.quantidade, s.data ? new Date(s.data).toLocaleDateString("pt-BR") : "-" ]), headStyles: { fillColor: [244, 165, 33], textColor: [0, 0, 0] } });
  doc.save(`historico_saidas_${new Date().toISOString().slice(0, 10)}.pdf`);
}
