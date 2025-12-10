import { criarRelatorio, listarRelatorios, buscarRelatorioPorId } from "../models/relatorio.js";
import PDFDocument from "pdfkit";
import streamBuffers from "stream-buffers";
 
// -------------------------------------------
// GERAR RELATÓRIO
// -------------------------------------------
export const gerarRelatorio = async (req, res) => {
  try {
    const {
      vendasResumo,
      financeiro,
      produtosMaisVendidos,
      unidadesDestaque,
      graficoFaturamento
    } = req.body;
 
    const doc = new PDFDocument();
    const bufferStream = new streamBuffers.WritableStreamBuffer();
    doc.pipe(bufferStream);
 
    // CONTEÚDO DO PDF
    doc.fontSize(20).text("Relatório Geral", { align: "center" });
    doc.moveDown();
 
    doc.fontSize(14).text("📌 Resumo de Vendas", { underline: true });
    doc.text(`Total de vendas: ${vendasResumo.totalVendas}`);
    doc.text(`Vendas hoje: ${vendasResumo.vendasHoje}`);
    doc.text(`Ticket médio: R$ ${vendasResumo.ticketMedio.toFixed(2)}`);
    doc.moveDown();
 
    doc.fontSize(14).text("📌 Financeiro", { underline: true });
    doc.text(`Faturamento: R$ ${financeiro.faturamento.toFixed(2)}`);
    doc.text(`Despesas: R$ ${financeiro.despesas.toFixed(2)}`);
    doc.text(`Lucro: R$ ${financeiro.lucro.toFixed(2)}`);
    doc.moveDown();
 
    doc.fontSize(14).text("📌 Produtos Mais Vendidos", { underline: true });
    produtosMaisVendidos.forEach((p) => {
      doc.text(`${p.produto}: ${p.qtd} vendas`);
    });
    doc.moveDown();
 
    doc.fontSize(14).text("📌 Unidades em Destaque", { underline: true });
    unidadesDestaque.forEach((u) => {
      doc.text(`${u.unidade}: ${u.vendas} vendas`);
    });
    doc.moveDown();
 
    doc.fontSize(14).text("📌 Faturamento Mensal", { underline: true });
    graficoFaturamento.forEach((m) => {
      doc.text(`${m.mes}: R$ ${m.valor.toFixed(2)}`);
    });
 
    doc.end();
 
    bufferStream.on("finish", async () => {
      const pdfBuffer = bufferStream.getContents();
 
      // SALVA NO BANCO
      await criarRelatorio({
        nome: "relatorio.pdf",
        tipoRelatorio_id: 1,
        arquivo: pdfBuffer
      });
 
      res.json({ message: "Relatório gerado!" });
    });
 
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao gerar relatório" });
  }
};
 
// -------------------------------------------
// LISTAR RELATÓRIOS
// -------------------------------------------
export const listar = async (req, res) => {
  try {
    const rows = await listarRelatorios();
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao listar relatórios" });
  }
};
 
// -------------------------------------------
// DOWNLOAD DO RELATÓRIO
// -------------------------------------------
export const download = async (req, res) => {
  try {
    const { id } = req.params;
    const relatorio = await buscarRelatorioPorId(id);
 
    if (!relatorio) {
      return res.status(404).json({ error: "Relatório não encontrado" });
    }
 
    const pdfBuffer = Buffer.from(relatorio.relatorio, "base64");
 
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=${relatorio.nome}`);
    res.send(pdfBuffer);
 
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao baixar relatório" });
  }
};