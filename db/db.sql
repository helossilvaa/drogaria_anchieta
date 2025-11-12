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

INSERT INTO produtos (registro_anvisa, nome, medida_id, tarja_id, categoria_id, marca_id, codigo_barras, descricao, preco_unitario, validade, fornecedor_id, lote_id, armazenamento) values
('102340125', 'Paracetamol 500mg - 20 Comprimidos', '5', '2', '5', '31', '2147483641', 'Analgésico e antipirético para dores leves e febre.', '13', '2026-04-15', '18', '101', 'Ambiente natural'),
('457891234', 'Dipirona Sódica 1g - 10 Comprimidos', '5', '1', '3', '14', '2147483642', 'Analgésico e antitérmico.', '9', '2025-11-20', '1', '102', 'Local fresco e seco'),
('203567891', 'Amoxicilina 500mg - 21 Cápsulas', '5', '3', '1', '51', '2147483643', 'Antibiótico de uso oral.', '69', '2027-02-01', '13', '103', 'Temperatura ambiente'),
('897654321', 'Losartana Potássica 50mg - 30 Comprimidos', '5', '2', '2', '2', '2147483644', 'Medicamento para hipertensão.', '35', '2028-08-10', '5', '104', 'Ambiente natural'),
('108765432', 'Clonazepam 2mg - 20 Comprimidos', '5', '4', '1', '44', '2147483645', 'Medicamento de uso controlado (Tarja Preta).', '29', '2026-09-30', '2', '105', 'Local seguro e controlado'),
('409172561', 'Vacina Rotavírus (Dose Única)', '5', '3', '5', '1', '2147483646', 'Imunização contra rotavírus (Tarja Amarela).', '150', '2025-07-31', '19', '106', 'Refrigerado - Controle Especial'),
('102340126', 'Ibuprofeno 400mg - 10 Comprimidos', '5', '1', '4', '25', '2147483647', 'Anti-inflamatório e analgésico.', '16', '2026-06-01', '10', '107', 'Ambiente natural'),
('203567892', 'Loratadina 10mg - 12 Comprimidos', '5', '2', '1', '3', '2147483622', 'Antialérgico não-sedante.', '33', '2027-10-25', '7', '108', 'Temperatura ambiente'),
('897654322', 'Sertralina 50mg - 30 Comprimidos', '5', '3', '1', '16', '2147483623', 'Antidepressivo, venda sob prescrição.', '75', '2028-03-15', '14', '109', 'Ambiente natural'),
('457891235', 'Clonazepam 0.5mg - 30 Comprimidos', '5', '4', '5', '36', '2147483640', 'Uso controlado (tarja preta).', '38', '2025-12-10', '17', '110', 'Local seguro e controlado'),
('256287192', 'Vacina Meningocócica (Dose Única)', '5', '3', '4', '8', '2147483624', 'Imunização contra meningite.', '180', '2026-01-01', '9', '111', 'Refrigerado - Controle Especial'),
('102340127', 'Omeprazol 20mg - 14 Cápsulas', '5', '2', '1', '49', '2147483625', 'Inibidor de bomba de prótons para acidez.', '30', '2026-03-20', '16', '112', 'Ambiente natural'),
('897654323', 'Butilbrometo de Escopolamina (Buscopan) - 20 Drágeas', '5', '1', '3', '11', '2147483626', 'Antiespasmódico e analgésico.', '15', '2027-05-05', '4', '113', 'Ambiente natural'),
('203567893', 'Fluoxetina 20mg - 30 Cápsulas', '5', '2', '5', '21', '2147483627', 'Antidepressivo e ansiolítico.', '45', '2028-11-01', '12', '114', 'Temperatura ambiente'),
('457891236', 'Captopril 25mg - 30 Comprimidos', '5', '2', '2', '45', '2147483620', 'Anti-hipertensivo, venda sob prescrição.', '11', '2029-01-15', '6', '115', 'Ambiente natural'),
('457891237', 'Neosaldina - 20 Drágeas', '5', '1', '1', '18', '2147483630', 'Para alívio rápido de dores de cabeça.', '10', '2026-07-01', '15', '116', 'Ambiente natural'),
('102340128', 'Diclofenaco Sódico 50mg - 20 Comprimidos', '5', '2', '4', '39', '2147483631', 'Anti-inflamatório genérico.', '9', '2025-10-30', '2', '117', 'Ambiente natural'),
('897654324', 'Metformina 850mg - 30 Comprimidos', '5', '2', '3', '9', '2147483632', 'Hipoglicemiante oral.', '15', '2027-09-01', '10', '118', 'Ambiente natural'),
('309817456', 'Colírio Lubrificante 10ml', '1', '1', '1', '4', '2147483633', 'Solução para olhos secos.', '28', '2025-08-30', '14', '119', 'Ambiente natural'),
('203567894', 'Dramin B6 - 10 Comprimidos', '5', '1', '5', '28', '2147483634', 'Para prevenção de náuseas e vômitos.', '15', '2026-12-12', '17', '120', 'Ambiente natural'),
('102340129', 'Protetor Solar FPS 50 - 200ml (farmacêutico)', '1', '1', '2', '41', '2147483635', 'Protetor solar de uso farmacêutico para pele sensível.', '80', '2026-04-01', '11', '121', 'Temperatura ambiente'),
('102340130', 'Loção Hidratante Corporal 400ml (Dermocosmético)', '1', '1', '2', '17', '2147483636', 'Hidratação intensiva indicada por dermatologista.', '30', '2026-05-20', '8', '122', 'Temperatura ambiente'),
('203567895', 'Gel Oral Antisséptico 120ml', '5', '1', '3', '5', '2147483637', 'Antisséptico bucal para feridas e gengivite.', '35', '2027-11-10', '2', '123', 'Temperatura ambiente'),
('897654325', 'Vitamina C 500mg - 30 Comprimidos', '5', '1', '4', '33', '2147483444', 'Suplemento antioxidante.', '25', '2028-05-01', '15', '124', 'Ambiente natural'),
('457891238', 'Máscara Hidratação Capilar (Tratamento) 500g (farmacêutico)', '3', '1', '2', '23', '2147483333', 'Tratamento intensivo para couro cabeludo sensível.', '55', '2025-09-15', '1', '125', 'Temperatura ambiente'),
('102340131', 'Desodorante Roll-on com ação dermatológica 50ml', '1', '1', '3', '47', '2147483640', 'Antitranspirante com controle bacteriano.', '12', '2026-08-01', '6', '126', 'Temperatura ambiente'),
('897654326', 'Tintura Capilar (Uso controlado por farmaceutico) 50ml', '1', '1', '2', '19', '2147483111', 'Tintura com baixo teor de alergênicos.', '10', '2028-12-31', '10', '127', 'Temperatura ambiente'),
('203567896', 'Fragrância Neutra Atóxica 50ml (produto farmacêutico)', '1', '1', '2', '10', '2147483222', 'Fragrância testada dermatologicamente.', '45', '2027-04-20', '19', '128', 'Temperatura ambiente'),
('457891239', 'Bálsamo Labial FPS 30 - (Unidade)', '5', '1', '2', '42', '2147483555', 'Proteção e hidratação para os lábios.', '20', '2025-11-01', '13', '129', 'Temperatura ambiente'),
('415673802', 'Delineador para olhos (prod. oftálmico) 2ml', '5', '1', '2', '29', '1147483647', 'Produto oftálmico testado para sensibilidade ocular.', '30', '2027-07-20', '17', '130', 'Temperatura ambiente'),
('102340132', 'Creme Anti-idade Noturno 50g (Dermocosmético)', '3', '1', '2', '15', '1247483645', 'Creme com retinol e controle dermatológico.', '180', '2026-07-10', '8', '131', 'Temperatura ambiente'),
('897654327', 'Óleo Corporal Terapêutico Amêndoas 200ml', '1', '1', '2', '27', '1347483646', 'Hidratação profunda com ação regeneradora.', '45', '2028-06-01', '5', '132', 'Temperatura ambiente'),
('203567897', 'Shampoo Terapêutico Anticaspa 150ml', '1', '1', '3', '40', '1447483647', 'Shampoo com ação antifúngica.', '40', '2027-03-01', '14', '133', 'Temperatura ambiente'),
('457891240', 'Tônico Facial Adstringente 200ml (Dermato)', '1', '1', '2', '37', '1547483647', 'Controle de oleosidade e limpeza profunda.', '48', '2025-10-28', '19', '134', 'Temperatura ambiente'),
('503459183', 'Base Líquida Medicinal (Cicatrizante) 30ml', '1', '1', '2', '6', '1647483647', 'Base com ação cicatrizante leve.', '65', '2027-05-01', '3', '135', 'Temperatura ambiente'),
('102340133', 'Corretivo Clínico 10g', '1', '1', '2', '20', '1747483647', 'Corretivo com cobertura e ação calmante.', '35', '2026-01-25', '18', '136', 'Temperatura ambiente'),
('897654328', 'Máscara de Cílios Hipoalergênica', '5', '1', '2', '12', '1847483647', 'Rímel dermatologicamente testado.', '50', '2028-10-01', '1', '137', 'Temperatura ambiente'),
('203567898', 'Sombra Paleta Neutra (oftalmologicamente testada)', '5', '1', '2', '46', '1947483647', 'Paleta indicada para olhos sensíveis.', '55', '2027-08-01', '13', '138', 'Temperatura ambiente'),
('457891241', 'Gloss Labial Hipoalergênico - (Unidade)', '5', '1', '2', '34', '1047483647', 'Brilho labial testado dermatologicamente.', '22', '2026-02-01', '5', '139', 'Temperatura ambiente'),
('654782901', 'Primer Médico para Maquiagem 30ml', '1', '1', '2', '48', '2047483647', 'Prepara a pele e diminui irritações.', '59', '2027-04-01', '2', '140', 'Temperatura ambiente'),
('102340134', 'Sabonete Líquido Antibacteriano 500ml', '1', '1', '3', '26', '2140483647', 'Sabonete com proteção antibacteriana comprovada.', '16', '2026-09-01', '12', '141', 'Ambiente natural'),
('897654329', 'Creme Dental Terapêutico 90g', '3', '1', '3', '50', '2141483647', 'Proteção contra cáries e sensibilidade.', '9', '2028-05-01', '6', '142', 'Prateleira'),
('203567899', 'Shampoo Anticaspa 300ml (farmacêutico)', '1', '1', '3', '22', '2142483647', 'Limpeza profunda e controle da caspa.', '22', '2027-12-01', '15', '143', 'Ambiente natural'),
('457891242', 'Enxaguante Bucal 500ml (fluoreto)', '1', '1', '3', '7', '2143483647', 'Complemento para higiene bucal com flúor.', '15', '2026-03-01', '11', '144', 'Prateleira'),
('798267536', 'Fralda Descartável Hipoalergênica (Tam M)', '5', '1', '5', '43', '2144483647', 'Fralda indicada para pele sensível de bebês.', '50', '2029-05-01', '8', '145', 'Local seco e arejado'),
('102340135', 'Escova de Dente Ergonômica - (Unidade)', '5', '1', '3', '4', '2145483647', 'Escova com cerdas macias para gengiva sensível.', '7', '2028-09-01', '19', '146', 'Prateleira'),
('897654330', 'Toalhas Umedecidas Hipoalergênicas (50 Unid.)', '5', '1', '5', '38', '2146483647', 'Toalhas para higiene sensível.', '20', '2028-09-01', '3', '147', 'Prateleira'),
('203567900', 'Fio Dental Encerado com Flúor (50m)', '5', '1', '3', '13', '2145083647', 'Fio dental para proteção adicional.', '11', '2027-06-15', '18', '148', 'Prateleira'),
('457891243', 'Cotonetes Higiênicos Esterilizados (75 Unid.)', '5', '1', '5', '49', '2145183647', 'Cotonetes para uso médico e higiene.', '6', '2025-12-01', '1', '149', 'Prateleira'),
('876234561', 'Lenço de Papel Caixa (100 Folhas) - Hipoalergênico', '5', '1', '5', '3', '2145283647', 'Lenços de papel dupla face, sem perfume.', '8', '2028-05-01', '13', '150', 'Prateleira'),
('102340136', 'Condicionador Terapêutico 300ml', '1', '1', '3', '24', '2145383647', 'Condicionador para cabelos sensíveis e tratados.', '23', '2026-11-20', '5', '151', 'Prateleira'),
('897654331', 'Papel Higiênico Folha Dupla (12 Rolos) - Hipoalergênico', '5', '1', '5', '41', '2145483647', 'Produto dermatologicamente testado.', '25', '2027-10-01', '10', '152', 'Local seco'),
('203567901', 'Álcool em Gel 70% 500ml (antisséptico)', '1', '1', '3', '51', '2145583647', 'Álcool para higienização das mãos.', '15', '2028-04-01', '7', '153', 'Prateleira'),
('457891244', 'Desinfetante Clínico 1L', '2', '1', '5', '14', '2145683647', 'Desinfetante para limpeza de superfícies clínicas.', '12', '2026-01-01', '14', '154', 'Prateleira'),
('954987622', 'Absorvente Diário Hipoalergênico (40 Unid.)', '5', '1', '5', '32', '2145783647', 'Absorvente diário para peles sensíveis.', '10', '2029-05-01', '17', '155', 'Prateleira'),
('102340137', 'Gel Lubrificante para Barbear 150g (farmacêutico)', '3', '1', '3', '2', '2143083647', 'Facilita o deslize da lâmina e acalma a pele.', '18', '2026-12-01', '9', '156', 'Temperatura ambiente'),
('897654332', 'Absorvente Noturno (8 Unid.) - Hipoalergênico', '5', '1', '5', '25', '2143183647', 'Absorvente para uso noturno, sem perfume.', '9', '2029-02-01', '16', '157', 'Prateleira'),
('203567902', 'Removedor de Esmalte Sem Acetona 100ml', '1', '1', '2', '1', '2143283647', 'Remoção suave ideal para unhas frágeis.', '7', '2027-07-20', '4', '158', 'Prateleira'),
('457891245', 'Sabonete em Barra Glicerina (90g) - Dermatológico', ?'3''1', '3', '44', '2143383647', 'Sabonete suave para pele sensível.', '5', '2026-04-01', '12', '159', 'Prateleira'),
('107643973', 'Spray Antisséptico para Feridas 50ml', '1', '1', '1', '35', '2143483647', 'Limpa e desinfeta pequenas feridas.', '21', '2027-09-01', '6', '160', 'Prateleira'),
('102340138', 'AAS 100mg - 30 Comprimidos', '5', '1', '1', '17', '2143583647', 'Antiagregante plaquetário e analgésico.', '6', '2026-10-01', '15', '161', 'Ambiente natural'),
('457891246', 'Sinvastatina 20mg - 30 Comprimidos', '5', '2', '1', '30', '2143683647', 'Medicamento para controle do colesterol.', '45', '2028-01-20', '11', '162', 'Local fresco e seco'),
('203567903', 'Fenilefrina 0.5% Gotas Nasais 30ml', '1', '1', '1', '46', '2143783647', 'Descongestionante nasal de uso tópico.', '19', '2025-11-15', '8', '163', 'Temperatura ambiente'),
('897654333', 'Prednisona 5mg - 20 Comprimidos', '5', '2', '1', '19', '2143883647', 'Corticosteroide anti-inflamatório.', '12', '2027-04-10', '1', '164', 'Ambiente natural'),
('102340139', 'Óleo Capilar Reparador de Pontas 50ml', '1', '1', '2', '9', '2143983647', 'Tratamento intensivo para pontas duplas.', '42', '2026-06-01', '19', '165', 'Temperatura ambiente'),
('102340140', 'Demaquilante Bifásico 150ml (oftálmico)', '1', '1', '2', '45', '2146083647', 'Remove maquiagem à prova de água com ação suave.', '32', '2027-09-10', '3', '166', 'Temperatura ambiente'),
('203567904', 'Creme para Pentear Antifrizz 300g (terapêutico)', '3', '1', '3', '28', '2146183647', 'Define e controla o frizz com ação condicionante.', '25', '2028-03-01', '18', '167', 'Temperatura ambiente'),
('102340141', 'Pós-Barba Refrescante Gel 100ml (calmante)', '1', '1', '3', '11', '2146283647', 'Acalma e hidrata a pele após o barbear.', '20', '2026-10-15', '13', '168', 'Ambiente natural'),
('897654334', 'Escova Interdental - Kit (5 unidades)', '5', '1', '5', '36', '2146383647', 'Limpeza de espaços interdentais.', '15', '2029-01-01', '5', '169', 'Prateleira'),
('203567905', 'Absorvente Interno Regular (10 Unidades)', '5', '1', '5', '47', '2146483647', 'Proteção discreta e confortável.', '17', '2027-11-01', '10', '170', 'Prateleira'),
('118763456', 'Termômetro Digital Ponta Flexível', '5', '1', '5', '23', '2146583647', 'Medição precisa de temperatura corporal.', '40', '2030-12-31', '7', '171', 'Prateleira'),
('127863452', 'Curativo Adesivo Caixa c/10 - Estéril', '5', '1', '5', '16', '2146683647', 'Curativos hipoalergênicos estéreis.', '9', '2028-05-01', '14', '172', 'Local seco'),
('130987345', 'Bolsa de Água Quente 2L (uso terapêutico)', '5', '1', '5', '43', '2146783647', 'Para alívio de dores musculares.', '25', '2035-01-01', '17', '173', 'Prateleira'),
('147653534', 'Máscara Protetora Descartável (Caixa c/50)', '5', '1', '5', '40', '2146883647', 'Máscara facial de tripla camada.', '20', '2026-03-01', '9', '174', 'Prateleira'),
('150984357', 'Pilhas Alcalinas AA (Embalagem c/4) - uso hospitalar', '5', '1', '5', '33', '2146983647', 'Pilhas de longa duração para aparelhos médicos.', '16', '2029-10-01', '16', '175', 'Prateleira'),
('102340142', 'Dipirona + Cafeína (Dorflex similar) - 36 Comprimidos', '5', '1', '1', '24', '2147083647', 'Analgésico e relaxante muscular.', '20', '2026-05-10', '4', '176', 'Ambiente natural'),
('457891247', 'Sinvastatina 10mg - 30 Comprimidos', '5', '2', '1', '48', '2147183647', 'Para controle do colesterol.', '22', '2027-08-01', '12', '177', 'Local fresco e seco'),
('203567906', 'Lágrimas Artificiais 15ml', '1', '1', '1', '26', '2147283647', 'Alívio da irritação e olho seco.', '35', '2025-10-20', '6', '178', 'Temperatura ambiente'),
('897654335', 'Creme para Assaduras 60g (pediátrico)', '3', '1', '3', '50', '2147383647', 'Proteção e tratamento de assaduras em bebês.', '19', '2028-04-15', '15', '179', 'Prateleira'),
('108765433', 'Probiótico Infantil (10 Sachês)', '5', '1', '4', '22', '2147303647', 'Suplemento para saúde intestinal infantil.', '50', '2026-09-01', '11', '180', 'Refrigerado - Controle Especial'),
('167345974', 'Máscara Facial de Argila Verde 150g (uso terapêutico)', '3', '1', '2', '7', '2147313647', 'Limpeza profunda e controle de oleosidade.', '38', '2027-07-01', '8', '181', 'Temperatura ambiente'),
('102340143', 'Esfoliante Corporal 250g (farmacêutico)', '3', '1', '2', '42', '2147323647', 'Remove células mortas com formulação suave.', '45', '2026-06-20', '1', '182', 'Temperatura ambiente'),
('203567907', 'Shampoo a Seco Dark 200ml (farmacêutico)', '1', '1', '2', '34', '2147333647', 'Absorve a oleosidade sem resíduos visíveis.', '42', '2027-10-05', '19', '183', 'Temperatura ambiente'),
('897654336', 'Sabonete Íntimo Suave 200ml (pH balanceado)', '1', '1', '3', '29', '2147343647', 'Higiene íntima com pH balanceado.', '17', '2028-03-30', '3', '184', 'Prateleira'),
('457891248', 'Fita Micropore 10m x 25mm (uso clínico)', '5', '1', '5', '15', '2147353647', 'Fita hipoalergênica para curativos.', '12', '2030-12-31', '18', '185', 'Local seco'),
('178734256', 'Gel Massageador Dores Musculares 150g (tópico)', '3', '1', '5', '27', '2147363647', 'Alívio para cansaço e dores musculares.', '30', '2026-01-05', '13', '186', 'Ambiente natural'),
('102340144', 'Compressas de Gaze Estéril (10 Unidades)', '5', '1', '5', '41', '2147373647', 'Para limpeza e cobertura de feridas.', '8', '2027-03-25', '5', '187', 'Local seco'),
('897654337', 'Protetor Auditivo de Silicone (Par)', '5', '1', '5', '17', '2147383647', 'Para dormir ou nadar, atenua ruídos.', '15', '2035-01-01', '10', '188', 'Prateleira'),
('203567908', 'Preservativo Lubrificado (3 Unidades)', '5', '1', '5', '30', '2147393647', 'Contraceptivo e prevenção de ISTs.', '12', '2028-11-20', '7', '189', 'Prateleira'),
('457891249', 'Spray Bucal Refrescante 20ml', '1', '1', '3', '44', '2147430647', 'Hálito fresco instantâneo.', '15', '2029-01-15', '14', '190', 'Prateleira'),
('457891250', 'Pastilha para Garganta Menta e Mel (12 Unid.)', '5', '1', '4', '39', '2147431647', 'Alívio temporário da dor de garganta.', '10', '2026-07-15', '17', '191', 'Ambiente natural'),
('102340145', 'Kit de Viagem Farmacêutico (shampoo/cond./sabonete)', '5', '1', '3', '6', '2147432647', 'Miniaturas de itens de higiene com controle clínico.', '30', '2025-10-01', '9', '192', 'Prateleira'),
('897654338', 'Protetor Solar Corporal FPS 30 - 120ml', '1', '1', '2', '21', '2147433647', 'Proteção solar para o corpo com controle dermatológico.', '55', '2027-09-25', '16', '193', 'Temperatura ambiente'),
('185982134', 'Band-Aid Transparente (20 Unidades)', '5', '1', '5', '45', '2147434647', 'Curativo adesivo transparente estéril.', '15', '2025-08-20', '4', '194', 'Prateleira'),
('203567909', 'Pó Translúcido HD para Maquiagem 10g (farmacêutico)', '3', '1', '2', '43', '2147435647', 'Sela a maquiagem com formulação não comedogênica.', '49', '2026-12-01', '12', '195', 'Temperatura ambiente'),
('102340146', 'Propranolol Cloridrato 40mg - 30 Comprimidos', '5', '2', '1', '18', '2147436647', 'Betabloqueador para hipertensão e angina.', '18', '2028-02-01', '6', '196', 'Temperatura controlada'),
('457891251', 'Xarope para Tosse Seca 100ml (sem sedação)', '1', '1', '1', '38', '2147437647', 'Antitussígeno para tosse irritativa.', '22', '2026-03-10', '15', '197', 'Ambiente natural'),
('203567910', 'Melatonina 3mg - 60 Cápsulas', '5', '1', '4', '5', '2147438647', 'Suplemento para auxiliar o sono.', '50', '2027-11-25', '11', '198', 'Local fresco e seco'),
('897654339', 'Dipropionato de Betametasona Creme 30g', '3', '2', '1', '31', '2147439647', 'Corticosteroide tópico anti-inflamatório.', '16', '2025-12-05', '8', '199', 'Temperatura ambiente'),
('102340147', 'Ivermectina 6mg - 6 Comprimidos', '5', '2', '1', '23', '2147483307', 'Antiparasitário oral conforme prescrição.', '18', '2027-06-30', '1', '200', 'Ambiente natural'),
('102340148', 'Insulina Humana Regular 100UI/mL 10mL', '4', '4', '1', '47', '2147483317', 'Insulina para controle glicêmico, refrigerar antes do uso.', '120', '2026-12-31', '19', '201', 'Refrigerado - Controle Especial'),
('102340149', 'Sulfato de Magnésio Ampola 20% 10mL', '4', '4', '1', '19', '2147483327', 'Uso hospitalar para reposição de magnésio.', '25', '2028-07-01', '3', '202', 'Temperatura controlada'),
('102340150', 'Vacina Influenza Trivalente (Dose Única)', '5', '4', '1', '10', '2147483337', 'Vacina sazonal contra influenza.', '80', '2026-05-31', '18', '203', 'Refrigerado - Controle Especial'),
('102340151', 'Cloreto de Sódio 0,9% Solução 100mL', '4', '1', '1', '12', '2147483347', 'Solução isotônica para hidratação e limpeza.', '8', '2029-01-01', '13', '204', 'Prateleira'),
('102340152', 'Naproxeno 500mg - 20 Comprimidos', '5', '2', '1', '46', '2147483357', 'Anti-inflamatório não esteroide.', '22', '2027-08-15', '5', '205', 'Ambiente natural'),
('102340153', 'Cetirizina 10mg - 10 Comprimidos', '5', '1', '1', '34', '2147483367', 'Antialérgico oral de longa duração.', '13', '2028-03-20', '10', '206', 'Temperatura ambiente'),
('102340154', 'Clotrimazol Creme 20g 1%', '3', '1', '1', '48', '2147483377', 'Antifúngico tópico para micoses cutâneas.', '14', '2026-10-10', '7', '207', 'Temperatura ambiente'),
('102340155', 'Ranitidina 150mg - 30 Comprimidos (se disponível)', '5', '2', '1', '26', '2147483387', 'Antagonista H2 para acidez gástrica.', '16', '2027-11-11', '14', '208', 'Ambiente natural'),
('102340156', 'Clindamicina 300mg - 20 Cápsulas', '5', '2', '1', '50', '2147483397', 'Antibiótico para infecções diversas.', '48', '2028-09-01', '17', '209', 'Temperatura ambiente'),
('102340157', 'Cefalexina 500mg - 10 Cápsulas', '5', '2', '1', '16', '2147483407', 'Antibiótico betalactâmico oral.', '35', '2026-04-10', '9', '210', 'Temperatura ambiente'),
('102340158', 'Loratadina Xarope 5mg/5mL 100mL', '1', '1', '1', '41', '2147483417', 'Antialérgico em suspensão oral pediátrica.', '19', '2027-01-01', '16', '211', 'Ambiente natural'),
('102340159', 'Clorexidina Solução 2% 100mL', '1', '1', '1', '32', '2147483427', 'Antisséptico para pele e mucosas.', '13', '2028-06-01', '4', '212', 'Prateleira'),
('102340160', 'Salmeterol + Fluticasona Aerossol (100/50mcg)', '4', '2', '1', '2', '2147483437', 'Broncodilatador combinado para asma crônica.', '185', '2029-03-01', '12', '213', 'Temperatura controlada'),
('102340161', 'Bromoprida 10mg/ml Solução 10mL', '4', '1', '1', '25', '2147483447', 'Antiemético para uso parenteral.', '28', '2027-05-05', '6', '214', 'Temperatura ambiente'),
('102340162', 'Valerato de Betametasona Creme 20g', '3', '2', '1', '1', '2147483457', 'Corticosteroide tópico para inflamação cutânea.', '15', '2026-08-08', '15', '215', 'Temperatura ambiente'),
('102340163', 'Sulfonato de Neomicina Ointment 15g', '3', '1', '1', '43', '2147483467', 'Pomada antibacteriana tópica.', '23', '2027-09-09', '11', '216', 'Prateleira'),
('102340164', 'Atenolol 50mg - 30 Comprimidos', '5', '2', '1', '38', '2147483477', 'Betabloqueador para hipertensão.', '17', '2028-12-12', '8', '217', 'Temperatura ambiente'),
('102340165', 'Epinefrina Injetável 1mg/mL 1mL', '4', '4', '1', '13', '2147483487', 'Uso emergencial para anafilaxia.', '28', '2026-02-28', '1', '218', 'Refrigerado - Controle Especial'),
('102340166', 'Claritromicina 500mg - 7 Comprimidos', '5', '2', '1', '36', '2147483497', 'Antibiótico macrolídeo.', '52', '2027-02-14', '19', '219', 'Temperatura ambiente'),
('102340167', 'Rifaximina 200mg - 12 Comprimidos', '5', '2', '1', '47', '2147483507', 'Antibiótico para infecções entéricas.', '100', '2028-11-11', '3', '220', 'Ambiente natural'),
('102340168', 'Benzetacil 1.200.000 UI - Frasco Ampola', '4', '4', '1', '24', '2147483517', 'Penicilina benzilpenicilina benzatina para uso IM.', '65', '2029-05-05', '18', '221', 'Temperatura controlada'),
('102340169', 'Nistatina Creme 30g 100.000 UI/g', '3', '1', '1', '40', '2147483527', 'Antifúngico tópico para candidíase cutânea.', '18', '2027-07-07', '13', '222', 'Temperatura ambiente'),
('102340170', 'Naproxeno Gel 10% 50g', '3', '1', '1', '29', '2147483537', 'Gel anti-inflamatório para uso tópico.', '27', '2026-11-11', '5', '223', 'Temperatura ambiente'),
('102340171', 'Sulfametoxazol + Trimetoprim 800/160mg - 10 Comprimidos', '5', '2', '1', '15', '2147483547', 'Antibiótico para infecções bacterianas.', '30', '2027-03-03', '10', '224', 'Temperatura ambiente'),
('102340172', 'Ipratropio Brometo Aerossol 20mcg/dose (200 doses)', '4', '1', '1', '32', '2147483557', 'Broncodilatador de ação anticolinérgica.', '135', '2028-08-08', '7', '225', 'Temperatura controlada'),
('102340173', 'Vitaminas B Complex - 30 Comprimidos', '5', '1', '4', '49', '2147483567', 'Complexo vitamínico do complexo B.', '35', '2029-01-01', '14', '226', 'Ambiente natural'),
('102340174', 'Colecalciferol 1000UI - 30 Comprimidos', '5', '1', '4', '28', '2147483577', 'Suplemento de vitamina D para reposição.', '27', '2027-12-12', '17', '227', 'Temperatura ambiente'),
('102340175', 'Ondansetrona 4mg - 10 Comprimidos Orais', '5', '1', '1', '11', '2147483587', 'Antiemético para náuseas e vômitos.', '19', '2026-06-06', '9', '228', 'Ambiente natural'),
('102340176', 'Solução Ringer Lactato 500mL', '4', '1', '1', '20', '2147483597', 'Sol. para reposição hidroeletrolítica (uso hospitalar).', '23', '2028-04-04', '16', '229', 'Temperatura controlada'),
('102340177', 'Clonidina 150mcg - 30 Comprimidos', '5', '2', '1', '10', '2147483207', 'Anti-hipertensivo com ação central.', '21', '2027-09-09', '4', '230', 'Temperatura ambiente'),
('102340178', 'Bacitracina Pomada 20g', '3', '1', '1', '42', '2147483217', 'Pomada antibacteriana para uso tópico.', '10', '2029-02-02', '12', '231', 'Prateleira');


