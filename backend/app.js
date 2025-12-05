import express from 'express';
import cors from 'cors';
import session from 'express-session';
import dotenv from 'dotenv';
import cron from 'node-cron'

import authRotas from './routes/authRotas.js';
import usuarioRotas from './routes/usuarioRotas.js';
import vendasRotas from './routes/vendasRotas.js';
import tipoPagamentoRotas from './routes/tipoPagamentoRotas.js';
import itens_vendaRotas from './routes/itens_vendaRotas.js'
import abrirFechar_CaixaRotas from './routes/abrirFechar_CaixaRotas.js';
import categoriaRotas from './routes/categoriaRotas.js';
import filiadosRotas from './routes/filiadosRotas.js';
import tiposDescontosRotas from "./routes/tiposDescontosRotas.js";
import parceriaRotas from "./routes/parceriaRotas.js";
import descontosRotas from "./routes/descontosRotas.js";
import fornecedoresRotas from './routes/fornecedoresRoutes.js';
import contasFilialRotas from './routes/contasFilialRotas.js';
import produtosRotas from './routes/produtosRotas.js';
import salariosRotas from './routes/salariosFilialRotas.js';
import departamentosRotas from './routes/departamentoRotas.js';
import franquiaRotas from './routes/franquiasRotas.js';
import funcionariosRotas from './routes/funcionariosRotas.js';
import lotesMatrizRotas from './routes/lotesMatrizRotas.js';
import estoqueMatrizRotas from './routes/estoqueMatrizRotas.js';
import estoqueFranquiaRotas from './routes/estoqueFranquiaRotas.js';
import movimentacaoEstoqueRotas from './routes/movimentacaoEstoqueRotas.js';
import notificacoesRotas from './routes/notificacoesRotas.js';
import { downloadPDF } from './controllers/contasFilialController.js';
import UploadRotas from './middlewares/upload.js';
import vendasFilial from './routes/vendasFilialRotas.js'
import transacoesRotas from './routes/transacoesFilialRotas.js';
import {registrarPagamentoMensal} from './services/registrarPagamento.js';
import {transacaoPagamento} from './controllers/transaçãoPagamentoController.js';
import {atualizarStatusSalarios} from "./services/atualizarStatusSalarios.js";
import { pagarContasAutomaticamente } from "./services/pagarConta.js";
import './services/transacaoVendas.js';


dotenv.config();

const app = express();
const porta = process.env.PORT || 8080;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

try {
  app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
  }));
 

  app.use(session({
    secret: 'sJYMmuCB2Z187XneUuaOVYTVUlxEOb2K94tFZy370HjOY7T7aiCKvwhNQpQBYL9e',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
  }));


} catch (err) {
  console.error('Erro na configuração inicial:', err);
  process.exit(1);
}

app.use('/auth', authRotas);
app.use('/usuarios', usuarioRotas);
app.use('/vendas', vendasRotas);
app.use('/pagamento', tipoPagamentoRotas);
app.use('/itens', itens_vendaRotas);
app.use('/caixa', abrirFechar_CaixaRotas);
app.use('/categorias', categoriaRotas);
app.use('/api', filiadosRotas);
app.use("/api", tiposDescontosRotas);
app.use("/parcerias", parceriaRotas);
app.use("/api", descontosRotas);
app.use('/api', fornecedoresRotas);
app.use('/api', contasFilialRotas);
app.use ('/produtos', produtosRotas);
app.use('/api', salariosRotas);
app.use('/api', transacoesRotas);
app.use('/api/vendas', vendasFilial);
app.use('/departamento', departamentosRotas);
app.use('/unidade', franquiaRotas);
app.use('/funcionarios', funcionariosRotas);
app.use ('/lotesmatriz', lotesMatrizRotas);
app.use ('/estoquematriz', estoqueMatrizRotas);
app.use ('/estoqueFilial', estoqueFranquiaRotas);
app.use ('/movimentacoesestoque', movimentacaoEstoqueRotas);
app.get("/pdfs/:id", downloadPDF);
app.use("/uploads", express.static("uploads"));

app.use("/notificacoes", notificacoesRotas);


app.get('/health', (req, res) => {
  res.status(200).json({ status: 'online' });
});


process.on('unhandledRejection', (reason, promise) => {
  console.error('Rejeição não tratada em:', promise, 'motivo:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('Exceção não capturada:', err);
  process.exit(1);
});

const server = app.listen(porta, () => {
  console.log(`Servidor rodando na porta ${porta}`);
}).on('error', (err) => {
  console.error('Erro ao iniciar:', err);
});


cron.schedule("0 5 * * *", async () => {
  console.log("Verificando pagamentos do dia 5...");
  await registrarPagamentoMensal();
  await transacaoPagamento();
});

cron.schedule("0 7 * * *", async () => {
  console.log("Atualizando status dos salários...");
  await atualizarStatusSalarios();
});

cron.schedule("0 3 * * *", async () => {
  console.log("⏱ Executando pagamento automático de contas...");
  await pagarContasAutomaticamente();
});


process.on('SIGTERM', () => {
  server.close(() => {
    console.log('Servidor encerrado');
  });
});

app.get('/', (req, res) => {
  res.send('Backend funcionando!');
});
