drop database drogaria;
create database drogaria;
use drogaria;


CREATE TABLE tipoUnidade (
	id INT AUTO_INCREMENT PRIMARY KEY,
    tipoUnidade VARCHAR(250) NOT NULL
);

CREATE TABLE departamento (
    id INT AUTO_INCREMENT PRIMARY KEY,
	departamento VARCHAR(250) NOT NULL,
    tipoUnidade_id INT NOT NULL,
    FOREIGN KEY (tipoUnidade_id) REFERENCES tipoUnidade(id)
);




CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    registro INT NOT NULL,
    cpf VARCHAR(11) NOT NULL,
    telefone VARCHAR(9) NOT NULL, 
    data_nascimento DATE NOT NULL, 
    genero enum('masculino', 'feminino', 'nao-binario') DEFAULT NULL,
    nome VARCHAR(255) NOT NULL,
    senha VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    departamento_id INT NOT NULL,
    logradouro VARCHAR(250) NOT NULL,
    cidade VARCHAR(100) NOT NULL,
    estado CHAR(2) NOT NULL,
    cep VARCHAR(9) NOT NULL,
    numero INT NOT NULL,
    foto BLOB,
    status ENUM('ativo', 'inativo') DEFAULT 'ativo',
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (departamento_id) REFERENCES departamento(id)
);

CREATE TABLE unidade (
	id INT AUTO_INCREMENT PRIMARY KEY,
    tipo ENUM('matriz', 'franquia' ) DEFAULT NULL,
    nome VARCHAR(250) NOT NULL,
    cnpj VARCHAR(14) NOT NULL,
    logradouro VARCHAR(250) NOT NULL,
    cidade VARCHAR(100) NOT NULL,
    estado CHAR(2) NOT NULL,
    cep VARCHAR(9) NOT NULL,
    numero INT NOT NULL,
    telefone VARCHAR(9) NOT NULL,
    email VARCHAR(100) NOT NULL,
    data_abertura DATE NOT NULL,
	status ENUM('ativa','inativa') DEFAULT 'ativa'
);

ALTER TABLE usuarios ADD COLUMN unidade_id INT NULL;
ALTER TABLE usuarios ADD CONSTRAINT fk_usuario_unidade FOREIGN KEY (unidade_id) REFERENCES unidade(id);

ALTER TABLE unidade ADD COLUMN dono_usuario_id INT NULL;
ALTER TABLE unidade ADD CONSTRAINT fk_unidade_usuario FOREIGN KEY (dono_usuario_id) REFERENCES usuarios(id);


CREATE TABLE abrirFechar_caixa (
	id INT PRIMARY KEY AUTO_INCREMENT,
    status ENUM('aberto', 'fechado') DEFAULT 'fechado',
    usuario_id INT NOT NULL,
    saldo_inicial INT NULL, 
    unidade_id INT NOT NULL,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    FOREIGN KEY (unidade_id) REFERENCES unidade(id)
);

CREATE TABLE tipos_pagamento (
	id INT PRIMARY KEY AUTO_INCREMENT, 
    tipo ENUM('pix', 'credito', 'debito', 'dinheiro') DEFAULT NULL
);


CREATE TABLE tipo_medicamento (
	id INT PRIMARY KEY AUTO_INCREMENT,
    tarja ENUM('preta', 'vermelha', 'amarela', 'sem tarja') default 'sem tarja'
);

CREATE TABLE categorias (
	id INT PRIMARY KEY AUTO_INCREMENT,
    categoria VARCHAR(250) NOT NULL
);

insert into categorias (categoria) values
('medicamento'),
('cosmetico'),
('higiene'),
('alimentacao'),
('conveniencia');

CREATE TABLE marcas (
	id INT PRIMARY KEY AUTO_INCREMENT,
    marca VARCHAR(200) NOT NULL
);

CREATE TABLE unidade_medida (
	id INT PRIMARY KEY AUTO_INCREMENT NOT NULL,
    sigla VARCHAR(150) NOT NULL
);

CREATE TABLE fornecedores (
	id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    fornecedor VARCHAR(400) NOT NULL,
    cnpj INT (20) NOT NULL,
    logradouro VARCHAR(250) NOT NULL,
    cidade VARCHAR(100),
    estado CHAR(2),
    cep VARCHAR(9),
    telefone VARCHAR(15),
    email VARCHAR(100),
    status ENUM('ativa','inativa') DEFAULT 'ativa',
    bairro VARCHAR(100) NOT NULL,
    numero INT (5) NOT NULL
);

CREATE TABLE produtos (
	id INT AUTO_INCREMENT PRIMARY KEY,
    registro_anvisa INT NOT NULL,
    nome VARCHAR(400) NOT NULL,
    foto LONGBLOB NULL,
    medida_id INT NOT NULL,
    tarja_id INT NOT NULL,
    categoria_id INT NOT NULL,
    marca_id INT NOT NULL,
    codigo_barras INT NOT NULL,
	descricao VARCHAR(400) NOT NULL,
    preco_unitario INT NOT NULL,
    validade DATE NOT NULL,
    fornecedor_id INT NOT NULL,
    lote_id INT NOT NULL,
    armazenamento VARCHAR(250) NOT NULL,
	 FOREIGN KEY (medida_id) REFERENCES unidade_medida(id),
     FOREIGN KEY (tarja_id) REFERENCES tipo_medicamento(id),
     FOREIGN KEY (categoria_id) REFERENCES categorias(id),
     FOREIGN KEY (marca_id) REFERENCES marcas(id),
     FOREIGN KEY (fornecedor_id) REFERENCES fornecedores(id)
);

CREATE TABLE lotes_matriz (
	id INT AUTO_INCREMENT PRIMARY KEY,
    numero_lote INT NOT NULL,
    data_validade DATE NOT NULL,
    quantidade INT NOT NULL,
    data_entrada DATE NOT NULL,
    fornecedor_id INT NOT NULL,
    FOREIGN KEY (fornecedor_id) REFERENCES fornecedores(id)
);

CREATE TABLE estoque_matriz (
	id INT PRIMARY KEY NOT NULL,
    produto_id INT NOT NULL,
    quantidade INT NOT NULL,
    estoque_minimo INT NOT NULL,
    estoque_maximo INT NOT NULL,
    localizacao VARCHAR(200) NOT NULL,
	lote_id INT NOT NULL,
    data_atualizacao DATE NOT NULL,
    FOREIGN KEY (produto_id) REFERENCES produtos(id),
    FOREIGN KEY (lote_id) REFERENCES lotes_matriz(id)
);


CREATE TABLE estoque_franquia (
	id INT PRIMARY KEY NOT NULL,
    quantidade INT NOT NULL,
	produto_id INT NOT NULL,
    estoque_minimo INT NOT NULL,
    estoque_maximo INT NOT NULL,
    estoque_matriz_id INT NOT NULL,
    FOREIGN KEY (produto_id) REFERENCES produtos(id),
    FOREIGN KEY (estoque_matriz_id) REFERENCES estoque_matriz(id)
);

CREATE TABLE parcerias (
	id INT NOT NULL PRIMARY KEY auto_increment,
    parceiro VARCHAR(250) NOT NULL,
    porcentagem decimal (2, 2),
    CHECK (porcentagem >= 0 AND porcentagem <= 100 )
);

CREATE TABLE tiposdescontos (
	id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    tipo VARCHAR(250) NOT NULL
);

CREATE TABLE descontos (
	id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    tipodesconto_id INT NOT NULL,
    nome VARCHAR(50) NOT NULL,
	desconto DECIMAL(5,2) NOT NULL,
    FOREIGN KEY (tipodesconto_id) REFERENCES tiposdescontos (id)
);

CREATE TABLE filiados (
	id INT NOT NULL PRIMARY KEY auto_increment,
    nome VARCHAR(250) NOT NULL,
    cpf VARCHAR(11)  NOT NULL,
    data_nascimento DATE NOT NULL,
    email VARCHAR(250) NOT NULL,
    telefone VARCHAR(9) NOT NULL,
    cep VARCHAR(9) NOT NULL,
    cidade VARCHAR(100) NOT NULL,
    estado CHAR(2) NOT NULL,
    numero INT NOT NULL,
    logradouro VARCHAR(200) NOT NULL,
    bairro VARCHAR(200) NOT NULL,
    tipodesconto INT NOT NULL,
    FOREIGN KEY (tipodesconto) REFERENCES tiposdescontos (id)
);

CREATE TABLE servicos (
	id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    servico VARCHAR(250) NOT NULL
);

CREATE TABLE contas (
  id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
  nomeConta VARCHAR(200) NOT NULL UNIQUE,
  categoria VARCHAR(100) NOT NULL,
  conta_pdf LONGBLOB NOT NULL,
  status ENUM('paga', 'pendente') DEFAULT 'pendente',
  dataVencimento DATE NOT NULL,
  dataPostada DATE NOT NULL,
  valor DECIMAL(10,2) NOT NULL
);


CREATE TABLE  salarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_funcionario INT NOT NULL,
  departamento_id INT NOT NULL,
  unidade_id INT NOT NULL,
  valor DECIMAL(10,2) NOT NULL,
  status_pagamento ENUM('pendente', 'pago') DEFAULT 'pendente',
  data_atualizado TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (id_funcionario) REFERENCES usuarios(id),
  FOREIGN KEY (departamento_id) REFERENCES departamento(id),
  FOREIGN KEY (unidade_id) REFERENCES unidade(id)
);


CREATE TABLE tiporelatorio (
	id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    tiporelatorio VARCHAR(250) NOT NULL
);

CREATE TABLE relatorios (
	id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    tipoRelatorio_id INT NOT NULL,
    relatorio LONGBLOB not null,
    FOREIGN KEY (tipoRelatorio_id) REFERENCES tiporelatorio(id)
);


-- Tabela de Vendas 
CREATE TABLE vendas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cliente_id INT NULL,
    usuario_id INT NOT NULL,
    unidade_id INT NOT NULL,
    tipo_pagamento_id INT NULL,
    desconto_id INT NULL,
    total DECIMAL(10,2) NOT NULL,
    data TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES filiados(id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    FOREIGN KEY (unidade_id) REFERENCES unidade(id),
    FOREIGN KEY (tipo_pagamento_id) REFERENCES tipos_pagamento(id),
    FOREIGN KEY (desconto_id) REFERENCES descontos(id)
);

-- Tabela de Itens de Venda (um registro por produto da venda)
CREATE TABLE itens_venda (
    id INT AUTO_INCREMENT PRIMARY KEY,
    venda_id INT NOT NULL,
    produto_id INT NOT NULL,
    lote_id INT NULL,
    quantidade INT NOT NULL,
    preco_unitario DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) AS (quantidade * preco_unitario) STORED,
    FOREIGN KEY (venda_id) REFERENCES vendas(id),
    FOREIGN KEY (produto_id) REFERENCES produtos(id),
    FOREIGN KEY (lote_id) REFERENCES lotes_matriz(id)
);

-- Tabela de Movimentações de Estoque (entradas, saídas, perdas, transferências)
CREATE TABLE movimentacoes_estoque (
    id INT AUTO_INCREMENT PRIMARY KEY,
    produto_id INT NOT NULL,
    lote_id INT NULL,
    unidade_id INT NOT NULL,
    tipo_movimento ENUM('entrada','saida','transferencia','perda','roubo') NOT NULL,
    quantidade INT NOT NULL,
    data_movimentacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    usuario_id INT NOT NULL,
    FOREIGN KEY (produto_id) REFERENCES produtos(id),
    FOREIGN KEY (lote_id) REFERENCES lotes_matriz(id),
    FOREIGN KEY (unidade_id) REFERENCES unidade(id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

INSERT INTO tipos_pagamento (tipo) VALUES 
('debito'), ('credito'), ('pix');

INSERT INTO unidade_medida (sigla) VALUES 
('ml'), ('l'), ('g'), ('mg'), ('unidade'); 

INSERT INTO tipoUnidade (tipoUnidade) VALUES 
('matriz'), ('filial'); 

INSERT INTO usuarios (registro, cpf, telefone, data_nascimento, genero, nome,
 senha, email, departamento_id, unidade_id, logradouro, cidade, estado, cep, numero) VALUES 
('12345678', '54470206941', '1192222222', '09-12-2007', 'feminino', 
'Isabella', '$2b$10$dgYjcImDdSpbgQD/7BBRre.fGZohwfG24FwQW9jfg86MKCmnRSx5.', 'isabella@gmail.com', '2', '2', 'rua joao bosco', 
'sao bernardo do campo', 'sp', '09730480', '12'),
('12345678', '54470206941', '1192222222', '09-12-2008', 'feminino', 
'Giovanna', '$2b$10$dgYjcImDdSpbgQD/7BBRre.fGZohwfG24FwQW9jfg86MKCmnRSx5.', 'giovanna@gmail.com', '1', '1', 'rua joao bosco', 
'sao bernardo do campo', 'sp', '09730480', '12');
('12345678', '54470206941', '1192222222', '09-12-2007', 'feminino', 
'heloise', '$2b$10$dgYjcImDdSpbgQD/7BBRre.fGZohwfG24FwQW9jfg86MKCmnRSx5.', 'heloise@gmail.com', '1', '3', 'rua joao bosco', 
'sao bernardo do campo', 'sp', '09730480', '12');

insert into tiposdescontos (tipo) values
("Convênio"),
("Cupom"),
("Programa de Fidelidade");

ALTER TABLE filiados ADD COLUMN unidade_id INT NULL;
ALTER TABLE filiados ADD CONSTRAINT fk_usuario_unidade FOREIGN KEY (unidade_id) REFERENCES unidade(id);

INSERT INTO contas (nomeConta, categoria, dataPostada, dataVencimento, valor, status, conta_pdf) VALUES
('Compra de medicamentos Genéricos SA', 'Fornecedores', '2025-10-01', '2025-10-15', 12480.00, true, ''),
('Compra de cosméticos Dermavida', 'Fornecedores', '2025-10-02', '2025-10-20', 8600.00, true, ''),
('Reabastecimento de vitaminas NutriMais', 'Fornecedores', '2025-10-05', '2025-10-19', 5320.00, false, ''),
('Conta de energia elétrica outubro', 'Despesas Fixas', '2025-10-03', '2025-10-18', 980.75, true, ''),
('Conta de água e esgoto outubro', 'Despesas Fixas', '2025-10-04', '2025-10-19', 410.20, true, ''),
('Serviço de internet e telefonia', 'Despesas Fixas', '2025-10-06', '2025-10-21', 299.90, true, ''),
('Aluguel da loja matriz', 'Despesas Fixas', '2025-10-01', '2025-10-10', 4500.00, false, ''),
('IPTU loja matriz parcela 9', 'Tributos e Taxas', '2025-10-02', '2025-10-30', 830.00, true, ''),
('Taxa de licença sanitária anual', 'Tributos e Taxas', '2025-10-10', '2025-10-31', 950.00, true, ''),
('INSS - contribuição outubro', 'Tributos e Taxas', '2025-10-08', '2025-10-25', 1320.00, true, ''),
('Compra de papel A4 e etiquetas', 'Materiais e Suprimentos', '2025-10-07', '2025-10-22', 220.00, true, ''),
('Compra de sacolas personalizadas', 'Materiais e Suprimentos', '2025-10-09', '2025-10-24', 780.00, false, ''),
('Compra de produtos de limpeza', 'Materiais e Suprimentos', '2025-10-11', '2025-10-26', 340.00, true, ''),
('Serviço de dedetização', 'Manutenção', '2025-10-05', '2025-10-15', 600.00, true, ''),
('Troca de lâmpadas e reparos elétricos', 'Manutenção', '2025-10-12', '2025-10-27', 480.00, true, ''),
('Manutenção do ar-condicionado', 'Manutenção', '2025-10-14', '2025-10-30', 890.00, false, ''),
('Tarifa bancária mensal', 'Financeiras / Bancárias', '2025-10-01', '2025-10-05', 45.90, true, ''),
('Mensalidade do sistema de gestão', 'Financeiras / Bancárias', '2025-10-09', '2025-10-20', 250.00, true, ''),
('Juros de antecipação de recebíveis', 'Financeiras / Bancárias', '2025-10-15', '2025-10-29', 370.00, false, ''),
('Pagamento de boletos via banco', 'Financeiras / Bancárias', '2025-10-18', '2025-10-31', 100.00, true, '');

 INSERT INTO fornecedores (fornecedor, cnpj, logradouro, cidade, estado, cep, telefone, email, status, bairro, numero) VALUES
('Alimentos Brasil Ltda', '12.345.678/0001-90', 'Rua das Flores', 'São Paulo', 'SP', '01001-000', '(11)1234-5678', 'contato@alimentosbr.com', 'ativa', 'Centro', 101),
('Tecnologia Max', '98.765.432/0001-01', 'Avenida Paulista', 'São Paulo', 'SP', '01311-000', '(11)9988-7766', 'suporte@tecnomax.com', 'ativa', 'Bela Vista', 1500),
('Construtora Alpha', '45.678.123/0001-76', 'Rua dos Tijolos', 'Rio de Janeiro', 'RJ', '20040-020', '(21)3344-5566', 'comercial@alpha.com', 'ativa', 'Copacabana', 345),
('Medic Pharma', '77.456.123/0001-55', 'Rua Saúde', 'Belo Horizonte', 'MG', '30140-110', '(31)4455-6677', 'vendas@medicpharma.com', 'ativa', 'Savassi', 234),
('Eco Produtos Verdes', '23.987.654/0001-44', 'Rua do Meio Ambiente', 'Curitiba', 'PR', '80020-200', '(41)98888-1234', 'eco@produtosverdes.com', 'ativa', 'Centro', 98),
('Lopes Materiais', '56.123.890/0001-33', 'Avenida das Indústrias', 'Porto Alegre', 'RS', '90010-300', '(51)3222-4455', 'lopes@materiais.com', 'ativa', 'Industrial', 500),
('Fashion Moda', '19.345.876/0001-11', 'Rua da Moda', 'Florianópolis', 'SC', '88010-400', '(48)3333-1122', 'sac@fashionmoda.com', 'ativa', 'Trindade', 78),
('Tech Soluções', '34.567.123/0001-99', 'Av. das Inovações', 'Campinas', 'SP', '13015-000', '(19)4002-8922', 'contato@techsolucoes.com', 'ativa', 'Cambuí', 900),
('Bebidas Premium', '87.654.321/0001-22', 'Rua das Águas', 'Recife', 'PE', '50010-020', '(81)3221-2211', 'vendas@bebidaspremium.com', 'ativa', 'Boa Vista', 210),
('Móveis Conforto', '54.321.876/0001-00', 'Av. do Lar', 'Fortaleza', 'CE', '60060-030', '(85)3344-5566', 'contato@moveisconforto.com', 'ativa', 'Aldeota', 145),
('Pet Care Brasil', '98.111.222/0001-33', 'Rua Animal', 'Salvador', 'BA', '40015-150', '(71)7777-8811', 'suporte@petcare.com', 'ativa', 'Centro', 45),
('Auto Peças Turbo', '11.222.333/0001-44', 'Avenida dos Motores', 'Goiânia', 'GO', '74015-060', '(62)3232-4545', 'vendas@autoturbo.com', 'ativa', 'Jardim Goiás', 800),
('Granjas do Vale', '66.777.888/0001-55', 'Estrada Rural', 'Londrina', 'PR', '86010-080', '(43)98877-6655', 'contato@granjasvale.com', 'ativa', 'Zona Rural', 12),
('Papel & Cia', '12.222.444/0001-88', 'Rua dos Papéis', 'São Luís', 'MA', '65010-090', '(98)3233-7788', 'email@papelcia.com', 'ativa', 'Renascença', 123),
('Luz Elétrica', '45.333.222/0001-99', 'Av. da Energia', 'Manaus', 'AM', '69010-100', '(92)3111-2211', 'comercial@luzeletrica.com', 'ativa', 'Centro', 899),
('SuperGelados', '33.444.555/0001-66', 'Rua do Frio', 'Natal', 'RN', '59010-200', '(84)3001-0022', 'contato@supergelados.com', 'ativa', 'Petrópolis', 250),
('Metalúrgica Forte', '22.555.666/0001-77', 'Rua das Ferramentas', 'Cuiabá', 'MT', '78010-300', '(65)3444-5566', 'metal@forte.com', 'ativa', 'Centro Norte', 55),
('Têxtil Brasil', '88.999.000/0001-11', 'Rua da Seda', 'João Pessoa', 'PB', '58010-400', '(83)3222-0001', 'sac@textilbrasil.com', 'ativa', 'Centro', 190),
('AgroVida', '55.666.777/0001-22', 'Rodovia BR-101', 'Aracaju', 'SE', '49010-500', '(79)3111-2244', 'vendas@agrovida.com', 'ativa', 'Industrial', 1),
('Importadora Global', '10.101.202/0001-33', 'Rua do Comércio', 'Belém', 'PA', '66010-600', '(91)4002-8999', 'global@importadora.com', 'ativa', 'Campina', 72);

insert into departamento (departamento, tipoUnidade_id) VALUES
('Caixa', 2 ), 
('Gerente', 2 ),
('Diretor Administrativo', 2 ),  
('Diretor Geral', 1 )

INSERT INTO unidade 

(tipo, nome, cnpj, logradouro, cidade, estado, cep, numero, telefone, email, data_abertura, status)

VALUES
('matriz', 'TechStore Matriz', '12345678000199', 'Av. Paulista', 'São Paulo', 'SP', '01310-000', 1000, '345678901', 'contato@techstore.com.br', '2015-03-12', 'ativa'),
('franquia', 'TechStore Rio', '22345678000155', 'Rua das Laranjeiras', 'Rio de Janeiro', 'RJ', '22240-000', 250, '987654321', 'rio@techstore.com.br', '2018-07-01', 'ativa'),
('franquia', 'TechStore BH', '32345678000133', 'Av. Afonso Pena', 'Belo Horizonte', 'MG', '30130-000', 1200, '998877665', 'bh@techstore.com.br', '2019-05-20', 'ativa'),
('franquia', 'TechStore Curitiba', '42345678000122', 'Rua XV de Novembro', 'Curitiba', 'PR', '80020-310', 45, '987123456', 'curitiba@techstore.com.br', '2020-02-10', 'inativa'),
('franquia', 'TechStore Porto Alegre', '52345678000111', 'Av. Ipiranga', 'Porto Alegre', 'RS', '90160-092', 500, '912345678', 'poa@techstore.com.br', '2021-09-15', 'ativa');

 
