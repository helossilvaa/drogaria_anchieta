import { criarRelatorio, listarRelatorios, buscarRelatorioPorId } from "../models/relatorio.js";
import PDFDocument from "pdfkit";
import streamBuffers from "stream-buffers";

export const gerarRelatorio = async (req, res) => {
  try {
    const { tipoRelatorio_id, usuario_id } = req.body;

    const doc = new PDFDocument();
    const bufferStream = new streamBuffers.WritableStreamBuffer();
    doc.pipe(bufferStream);

    doc.fontSize(20).text("Relatório Simples", { align: "center" });
    doc.moveDown();
    doc.fontSize(12).text("Este é um relatório gerado automaticamente.");
    doc.end();

    await new Promise((resolve) => bufferStream.on("finish", resolve));
    const pdfBuffer = bufferStream.getContents();

    await criarRelatorio({
      nome: "relatorio_simples.pdf",
      tipoRelatorio_id,
      usuario_id,
      arquivo: pdfBuffer, // já salvo como base64 no model
    });

    res.json({ message: "Relatório gerado e salvo!" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao gerar relatório" });
  }
};

export const listar = async (req, res) => {
  try {
    const rows = await listarRelatorios();
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao listar relatórios" });
  }
};

export const download = async (req, res) => {
  try {
    const { id } = req.params;
    const relatorio = await buscarRelatorioPorId(id);

    if (!relatorio) {
      return res.status(404).json({ error: "Relatório não encontrado" });
    }

    const pdfBuffer = Buffer.from(relatorio.relatorio, "base64"); // ⬅ CORREÇÃO IMPORTANTE

    res.setHeader("Content-Disposition", `attachment; filename=${relatorio.nome}`);
    res.setHeader("Content-Type", "application/pdf");
    res.send(pdfBuffer);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao baixar relatório" });
  }
};
