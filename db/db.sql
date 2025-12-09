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
 
CREATE TABLE funcionarios ( 
    id INT AUTO_INCREMENT PRIMARY KEY, 
    registro INT NOT NULL, 
    cpf VARCHAR(11) NOT NULL, 
    telefone VARCHAR(13) NOT NULL, 
    data_nascimento DATE NOT NULL, 
    genero enum('masculino', 'feminino', 'nao-binario') DEFAULT NULL, 
    nome VARCHAR(255) NOT NULL, 
    email VARCHAR(255) NOT NULL UNIQUE, 
    departamento_id INT NOT NULL, 
    logradouro VARCHAR(250) NOT NULL, 
    cidade VARCHAR(100) NOT NULL, 
    estado CHAR(2) NOT NULL, 
    cep VARCHAR(9) NOT NULL, 
    numero INT NOT NULL, 
    foto VARCHAR(500) NULL, 
    status ENUM('ativo', 'inativo', 'férias', 'licença', 'atestado') DEFAULT 'ativo', 
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, 
    FOREIGN KEY (departamento_id) REFERENCES departamento(id) 
); 
  
CREATE TABLE usuarios ( 
    id INT AUTO_INCREMENT PRIMARY KEY, 
    senha VARCHAR(255) NOT NULL, 
    departamento_id INT NOT NULL, 
    foto VARCHAR(500) NULL, 
    funcionario_id INT NOT NULL, 
    status ENUM('ativo', 'inativo') DEFAULT 'ativo', 
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, 
    FOREIGN KEY (departamento_id) REFERENCES departamento(id), 
    FOREIGN KEY (funcionario_id) REFERENCES funcionarios(id) 
); 
 
CREATE TABLE unidade ( 
	id INT AUTO_INCREMENT PRIMARY KEY, 
    tipo ENUM('matriz', 'franquia') DEFAULT NULL, 
    nome VARCHAR(250) NOT NULL, 
    cnpj VARCHAR(14) NOT NULL, 
    logradouro VARCHAR(250) NOT NULL, 
    cidade VARCHAR(100) NOT NULL, 
    estado CHAR(2) NOT NULL, 
    cep VARCHAR(9) NOT NULL, 
    latitude DECIMAL(10,7) DEFAULT NULL,
    longitude DECIMAL(10,7) DEFAULT NULL,
    numero INT NOT NULL, 
    telefone VARCHAR(13) NOT NULL, 
    email VARCHAR(100) NOT NULL, 
    data_abertura DATE NOT NULL, 
	status ENUM('ativa','inativa') DEFAULT 'ativa' 
); 
 
ALTER TABLE funcionarios ADD COLUMN unidade_id INT NULL; 
ALTER TABLE funcionarios ADD CONSTRAINT fk_usuario_unidade FOREIGN KEY (unidade_id) REFERENCES unidade(id); 
ALTER TABLE unidade ADD COLUMN dono_id INT NULL; 
ALTER TABLE unidade ADD CONSTRAINT fk_unidade_usuario FOREIGN KEY (dono_id) REFERENCES funcionarios(id); 
 
 
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
    tipo ENUM('Pix', 'Crédito', 'Débito', 'Dinheiro') DEFAULT NULL 
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
('medicamento'), ('cosmetico'), ('higiene'), ('alimentacao'), ('conveniencia'); 
 
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
    cnpj VARCHAR(14) NOT NULL, 
    logradouro VARCHAR(250) NOT NULL, 
    cidade VARCHAR(100), 
    estado CHAR(2), 
    cep VARCHAR(9), 
    telefone VARCHAR(13), 
    email VARCHAR(100), 
    status ENUM('ativa','inativa') DEFAULT 'ativa', 
    bairro VARCHAR(100) NOT NULL, 
    numero INT (5) NOT NULL 
); 
 
CREATE TABLE produtos ( 
    id INT AUTO_INCREMENT PRIMARY KEY, 
    registro_anvisa INT NOT NULL, 
    nome VARCHAR(400) NOT NULL, 
    foto VARCHAR(500) NULL, 
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
    produto_id INT NOT NULL, 
    numero_lote INT NOT NULL, 
    data_validade DATE NOT NULL, 
    quantidade INT NOT NULL, 
    data_entrada DATE NOT NULL, 
    fornecedor_id INT NOT NULL, 
    FOREIGN KEY (fornecedor_id) REFERENCES fornecedores(id), 
    FOREIGN KEY (produto_id) REFERENCES produtos(id) 
); 
 
CREATE TABLE estoque_matriz ( 
	id INT AUTO_INCREMENT PRIMARY KEY, 
    produto_id INT NOT NULL, 
    lote_id INT NOT NULL, 
    quantidade INT NOT NULL, 
    estoque_minimo INT NOT NULL, 
    estoque_maximo INT NOT NULL, 
    localizacao VARCHAR(200) NOT NULL, 
    data_atualizacao DATE NOT NULL, 
    FOREIGN KEY (produto_id) REFERENCES produtos(id), 
    FOREIGN KEY (lote_id) REFERENCES lotes_matriz(id) 
); 
 
CREATE TABLE estoque_franquia ( 
	id INT AUTO_INCREMENT PRIMARY KEY, 
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
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL, 
    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL, 
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
  valor DECIMAL(10,2) NOT NULL, 
  unidade_id INT NOT NULL, 
  FOREIGN KEY (unidade_id) REFERENCES unidade (id) 
); 
 
CREATE TABLE pagamentos_contas ( 
    id INT AUTO_INCREMENT PRIMARY KEY, 
    conta_id INT NOT NULL, 
    valor_pago DECIMAL(10,2) NOT NULL, 
    data_pagamento DATE NOT NULL, 
    status_pagamento ENUM('pendente','pago') DEFAULT 'pago', 
    unidade_id INT NOT NULL, 
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
    FOREIGN KEY (conta_id) REFERENCES contas(id), 
    FOREIGN KEY (unidade_id) REFERENCES unidade(id) 
); 
 
 
 
CREATE TABLE  salarios ( 
  id INT AUTO_INCREMENT PRIMARY KEY, 
  id_funcionario INT NOT NULL, 
  departamento_id INT NOT NULL, 
  unidade_id INT NOT NULL, 
  valor DECIMAL(10,2) NOT NULL, 
  status_pagamento ENUM('pendente', 'pago') DEFAULT 'pendente', 
  data_atualizado DATE NOT NULL, 
  FOREIGN KEY (id_funcionario) REFERENCES funcionarios(id), 
  FOREIGN KEY (departamento_id) REFERENCES departamento(id), 
  FOREIGN KEY (unidade_id) REFERENCES unidade(id) 
); 
 
CREATE TABLE pagamentos_salarios ( 
  id INT AUTO_INCREMENT PRIMARY KEY, 
  id_salario INT NOT NULL, 
  id_funcionario INT NOT NULL, 
  unidade_id INT NOT NULL, 
  departamento_id INT NOT NULL, 
  valor DECIMAL(10,2) NOT NULL, 
  status_pagamento ENUM('pago', 'pendente'), 
  data_pagamento DATE NOT NULL, 
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
  FOREIGN KEY (id_salario) REFERENCES salarios(id), 
  FOREIGN KEY (id_funcionario) REFERENCES funcionarios(id), 
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
 
 
CREATE TABLE vendas ( 
    id INT AUTO_INCREMENT PRIMARY KEY, 
    cliente_id INT NULL, 
    usuario_id INT NOT NULL, 
    unidade_id INT NOT NULL, 
    tipo_pagamento_id INT NULL, 
    desconto_id INT NULL, 
    total DECIMAL(10,2) NOT NULL, 
    desconto_valor DECIMAL(10,2) NOT NULL, 
    data TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
    FOREIGN KEY (cliente_id) REFERENCES filiados(id), 
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id), 
    FOREIGN KEY (unidade_id) REFERENCES unidade(id), 
    FOREIGN KEY (tipo_pagamento_id) REFERENCES tipos_pagamento(id), 
    FOREIGN KEY (desconto_id) REFERENCES descontos(id) 
); 
 
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
 
CREATE TABLE categoria_transacoes ( 
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, 
    categoria_transacao VARCHAR(100) NOT NULL, 
    tipo ENUM('Receita', 'Despesa', 'Transferencia') NOT NULL, 
    descricao VARCHAR(255) 
); 
 
CREATE TABLE transacoes ( 
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, 
    data_lancamento DATETIME NOT NULL, 
    tipo_movimento ENUM('ENTRADA', 'SAIDA') NOT NULL, 
    valor DECIMAL(10, 2) NOT NULL,  
    descricao VARCHAR(255) NOT NULL, 
    unidade_id INT NOT NULL, 
    categoria_transacao_id INT NOT NULL, 
    origem VARCHAR(50) NOT NULL,  
    FOREIGN KEY (unidade_id) REFERENCES unidade(id), 
    FOREIGN KEY (categoria_transacao_id) REFERENCES categoria_transacoes(id) 
); 
 
CREATE TABLE notificacao_tipos ( 
    id INT AUTO_INCREMENT PRIMARY KEY, 
    nome VARCHAR(50) NOT NULL UNIQUE,  
    icone VARCHAR(100), 
    cor VARCHAR(20) DEFAULT 'pink', 
    acao_texto_padrao VARCHAR(100), 
    extra_info_padrao VARCHAR(255) 
); 
  
CREATE TABLE notificacoes ( 
    id INT AUTO_INCREMENT PRIMARY KEY, 
    usuario_id INT NOT NULL, 
    unidade_id INT NOT NULL, 
    tipo_id INT NOT NULL, 
    titulo VARCHAR(255) NOT NULL, 
    mensagem TEXT NOT NULL, 
    extra_info VARCHAR(255),          
    acao_texto VARCHAR(100),        
    acao_url VARCHAR(255),    
    cor VARCHAR(50),        
    lida TINYINT(1) DEFAULT 0, 
    criada_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id), 
    FOREIGN KEY (unidade_id) REFERENCES unidade(id), 
    FOREIGN KEY (tipo_id) REFERENCES notificacao_tipos(id) 
); 
 
INSERT INTO tipos_pagamento (tipo) VALUES  
('debito'), ('credito'), ('pix'); 
 
INSERT INTO unidade_medida (sigla) VALUES  
('ml'), ('l'), ('g'), ('mg'), ('unidade');  
 
INSERT INTO tipoUnidade (tipoUnidade) VALUES  
('matriz'), ('filial');  
 
insert into tipo_medicamento (tarja) values 
("sem tarja"),("vermelha"),("amarela"), ("preta"); 
  
insert into marcas (marca) values  
('Neo Química'), 
('EMS'),  
('Hypera Pharma'), 
('Sanofi'),  
('Bayer'), 
('Novartis'), 
('Pfizer'),  
('Aché'),  
('Cimed'), 
('Eurofarma'), 
('Takeda'), 
('GlaxoSmithKline'), 
('GSK'), 
('Merck'),  
('Libbs'),  
('Biolab'),  
('Farmasa'), 
('Cristália'), 
('Supera Farma'), 
-- Laboratórios Focados em Genéricos  
('Medley'), ('Teuto'), ('Prati-Donaduzzi'),  
-- Dermocosméticos e Cuidados com a Pele 
('Vichy'), ('La Roche-Posay'), ('Neutrogena'), ('Bioderma'), ('Avène'), ('CeraVe'), ('Eucerin'), ('ROC'), ('Mantecorp Skincare'), ('Profuse'), ('Bepantol'), ('NIVEA Sun'), ('ISDIN'), ('Adcos'), 
-- Higiene Pessoal e Beleza  
('Colgate'), ('Oral-B'), ('Nivea'), ('Dove'), ('Rexona'), ('Pantene'), ('Head & Shoulders'), ('Seda'), ('Elseve'), ('Protex'), ('Gillette'), ('Always'), ('Intimus'), ('Sensodyne'), ('Close-Up'), ('Listerine'), ('Haskell'), ('Salon Line'),  
-- Produtos Infantis e Geriátricos  
('Huggies'), ('Pampers'), ('Tena'), ('Turma da Mônica'), ('Johnson & Johnson'), ('Pom Pom'), ('Geriamed'), 
-- Suplementos e Nutriçã0 
('Nutren'), ('Sustagen'), ('Pediasure'), ('Ensure'), ('Lavitan'), ('Sidney Oliveira'), ('Vitafor'), ('Maxinutri'), ('Growth Supplements'), ('Centrum'), ('Redoxon'), ('Sundown Naturals'),  
-- Outros Produtos Populares   
('Band-Aid'), ('Neosaldina'), ('Engov'), ('Dorfax'), ('Novalgina'), ('Coristina'), ('Caladryl'), ('Maalox'); 
 
insert into departamento (departamento, tipoUnidade_id) VALUES 
('caixa', 2 ),  
('gerente', 2 ), 
('diretor administrativo', 2 ),   
('diretor geral', 1 ); 

INSERT INTO unidade (tipo, nome, cnpj, logradouro, cidade, estado, cep, numero, telefone, email, data_abertura) VALUES 
('matriz', 'Drogaria Anchieta Matriz', '61270294000166', 'Via Anchieta', 'São Paulo', 'SP', '04246001', 1248, '5511953456564', 'matriz@anchieta.com.br', '2000-01-01'), 
('franquia', 'Drogaria Anchieta São Bernardo', '61279665478990', 'Rua Marechal Deodoro', 'São Bernardo do Campo', 'SP', '968877662', 1845, '551143352121', 'sbc@anchieta.com.br', '2005-05-10'), 
('franquia', 'Drogaria Anchieta BH', '32345678000133', 'Av. Afonso Pena', 'Belo Horizonte', 'MG', '30130000', 1200, '998877665', 'bh@techstore.com.br', '2019-05-20'), 
('franquia', 'Drogaria Anchieta Curitiba', '42345678000122', 'Rua XV de Novembro', 'Curitiba', 'PR', '80020310', 45, '987123456', 'curitiba@techstore.com.br', '2020-02-10'), 
('franquia', 'Drogaria Anchieta Porto Alegre', '52345678000111', 'Av. Ipiranga', 'Porto Alegre', 'RS', '90160092', 500, '912345678', 'poa@techstore.com.br', '2021-09-15'); 
 
INSERT INTO funcionarios (registro, cpf, telefone, data_nascimento, genero,  
nome, email, departamento_id, logradouro, cidade, estado, cep, numero, unidade_id) VALUES  
('123456', '54470306843', '5511967855691', '2007-09-12', 'feminino', 'Heloise Soares',  
'heloise@gmail.com', 1, 'Rua luís barbalho', 'São Bernardo do Campo', 'SP', '09820030', '22', 2), 
('123456', '47803671829', '5511934902005', '2008-05-20', 'feminino', 'Mariana Oliveira',  
'mariana@gmail.com', 2, 'Rua Ivaí', 'São Caetano do Sul', 'SP', '09560570', '19', 2), 
('123456', '47028350843', '5511971537650', '2008-03-30', 'feminino', 'Isabella Nunes',  
'isabella@gmail.com', 3, 'Rua Mogi Guassu', 'São Caetano do Sul', 'SP', '09540570', '37', 2), 
('123456', '15544650870', '5511996108022', '2008-09-11', 'masculino', 'Gerson Rodrigues',  
'gerson@gmail.com', 4, 'Rua Mogi Guassu', 'São Caetano do Sul', 'SP', '09540570', '37', 1); 
 
INSERT INTO usuarios ( 
 senha, departamento_id, funcionario_id) VALUES  
('$2b$10$dgYjcImDdSpbgQD/7BBRre.fGZohwfG24FwQW9jfg86MKCmnRSx5.', '1', '1'), 
('$2b$10$dgYjcImDdSpbgQD/7BBRre.fGZohwfG24FwQW9jfg86MKCmnRSx5.', '2', '2'), 
('$2b$10$dgYjcImDdSpbgQD/7BBRre.fGZohwfG24FwQW9jfg86MKCmnRSx5.', '3', '3'), 
('$2b$10$dgYjcImDdSpbgQD/7BBRre.fGZohwfG24FwQW9jfg86MKCmnRSx5.', '4', '4'); 
 
insert into tiposdescontos (tipo) values 
("Convênio"), 
("Cupom"), 
("Programa de Fidelidade"); 
 
INSERT INTO filiados (nome, cpf, data_nascimento, email, telefone, cep, cidade, estado, numero, logradouro, bairro, tipodesconto) VALUES 
('Juliana Paes', '11122233344', '1990-03-10', 'juliana.paes@email.com', '987654321', '01000000', 'São Paulo', 'SP', 150, 'Rua da Consolação', 'Centro', 1), 
('Roberto Carlos', '22233344455', '1985-07-25', 'roberto.carlos@email.com', '991234567', '20000000', 'Rio de Janeiro', 'RJ', 88, 'Avenida Atlântica', 'Copacabana', 2), 
('Ana Beatriz Lima', '33344455566', '1995-11-01', 'ana.lima@email.com', '955554444', '30000000', 'Belo Horizonte', 'MG', 45, 'Rua da Paz', 'Funcionários', 3), 
('Marcos Silva', '44455566677', '2000-01-20', 'marcos.silva@email.com', '933332222', '40000000', 'Salvador', 'BA', 203, 'Avenida Sete', 'Comércio', 1), 
('Patrícia Gomes', '55566677788', '1988-09-18', 'patricia.gomes@email.com', '977776666', '80000000', 'Curitiba', 'PR', 901, 'Rua XV de Novembro', 'Centro Cívico', 2); 
 
INSERT INTO categorias (categoria) VALUES 
('medicamento'), ('cosmetico'), ('higiene'), ('alimentacao'), ('conveniencia'); 
 
DELETE FROM categorias 
WHERE id BETWEEN 6 AND 10; 
 
INSERT INTO fornecedores  
(fornecedor, cnpj, logradouro, cidade, estado, cep, telefone, email, status, bairro, numero) VALUES 
('Alimentos Brasil Ltda', '12345678000190', 'Rua das Flores', 'São Paulo', 'SP', '01001-000', '551112345678', 'contato@alimentosbr.com', 'ativa', 'Centro', 101), 
('Tecnologia Max', '98765432000101', 'Avenida Paulista', 'São Paulo', 'SP', '01311-000', '551199887766', 'suporte@tecnomax.com', 'ativa', 'Bela Vista', 1500), 
('Construtora Alpha', '45678123000176', 'Rua dos Tijolos', 'Rio de Janeiro', 'RJ', '20040-020', '552133445566', 'comercial@alpha.com', 'ativa', 'Copacabana', 345), 
('Medic Pharma', '77456123000155', 'Rua Saúde', 'Belo Horizonte', 'MG', '30140-110', '553144556677', 'vendas@medicpharma.com', 'ativa', 'Savassi', 234), 
('Eco Produtos Verdes', '23987654000144', 'Rua do Meio Ambiente', 'Curitiba', 'PR', '80020-200', '5541988881234', 'eco@produtosverdes.com', 'ativa', 'Centro', 98), 
('Lopes Materiais', '56123890000133', 'Avenida das Indústrias', 'Porto Alegre', 'RS', '90010-300', '555132224455', 'lopes@materiais.com', 'ativa', 'Industrial', 500), 
('Fashion Moda', '19345876000111', 'Rua da Moda', 'Florianópolis', 'SC', '88010-400', '554833331122', 'sac@fashionmoda.com', 'ativa', 'Trindade', 78), 
('Tech Soluções', '34567123000199', 'Av. das Inovações', 'Campinas', 'SP', '13015-000', '551940028922', 'contato@techsolucoes.com', 'ativa', 'Cambuí', 900), 
('Bebidas Premium', '87654321000122', 'Rua das Águas', 'Recife', 'PE', '50010-020', '558132212211', 'vendas@bebidaspremium.com', 'ativa', 'Boa Vista', 210), 
('Móveis Conforto', '54321876000100', 'Av. do Lar', 'Fortaleza', 'CE', '60060-030', '558533445566', 'contato@moveisconforto.com', 'ativa', 'Aldeota', 145), 
('Pet Care Brasil', '98111222000133', 'Rua Animal', 'Salvador', 'BA', '40015-150', '557177778811', 'suporte@petcare.com', 'ativa', 'Centro', 45), 
('Auto Peças Turbo', '11222333000144', 'Avenida dos Motores', 'Goiânia', 'GO', '74015-060', '556232324545', 'vendas@autoturbo.com', 'ativa', 'Jardim Goiás', 800), 
('Granjas do Vale', '66777888000155', 'Estrada Rural', 'Londrina', 'PR', '86010-080', '5543988776655', 'contato@granjasvale.com', 'ativa', 'Zona Rural', 12), 
('Papel & Cia', '12222444000188', 'Rua dos Papéis', 'São Luís', 'MA', '65010-090', '559832337788', 'email@papelcia.com', 'ativa', 'Renascença', 123), 
('Luz Elétrica', '45333222000199', 'Av. da Energia', 'Manaus', 'AM', '69010-100', '559231112211', 'comercial@luzeletrica.com', 'ativa', 'Centro', 899), 
('SuperGelados', '33444555000166', 'Rua do Frio', 'Natal', 'RN', '59010-200', '558430010022', 'contato@supergelados.com', 'ativa', 'Petrópolis', 250), 
('Metalúrgica Forte', '22555666000177', 'Rua das Ferramentas', 'Cuiabá', 'MT', '78010-300', '556534445566', 'metal@forte.com', 'ativa', 'Centro Norte', 55), 
('Têxtil Brasil', '88999000000111', 'Rua da Seda', 'João Pessoa', 'PB', '58010-400', '558332220001', 'sac@textilbrasil.com', 'ativa', 'Centro', 190), 
('AgroVida', '55666777000122', 'Rodovia BR-101', 'Aracaju', 'SE', '49010-500', '557931112244', 'vendas@agrovida.com', 'ativa', 'Industrial', 1), 
('Importadora Global', '10101202000133', 'Rua do Comércio', 'Belém', 'PA', '66010-600', '559140028999', 'global@importadora.com', 'ativa', 'Campina', 72); 
 
INSERT INTO contas (nomeConta, categoria, dataPostada, dataVencimento, valor, conta_pdf, unidade_id) VALUES 
('Conta de energia elétrica outubro', 'Despesas Fixas', '2025-10-03', '2025-10-18', 980.75, '', 1), 
('Conta de água e esgoto outubro', 'Despesas Fixas', '2025-10-04', '2025-10-19', 410.20, '', 2), 
('Serviço de internet e telefonia', 'Despesas Fixas', '2025-10-06', '2025-10-21', 299.90, '', 3), 
('Aluguel da loja matriz', 'Despesas Fixas', '2025-10-01', '2025-10-10', 4500.00, '', 1), 
('IPTU loja matriz parcela 9', 'Tributos e Taxas', '2025-10-02', '2025-10-30', 830.00, '', 1), 
('Taxa de licença sanitária anual', 'Tributos e Taxas', '2025-10-10', '2025-10-31', 950.00, '', 2), 
('INSS - contribuição outubro', 'Tributos e Taxas', '2025-10-08', '2025-10-25', 1320.00, '', 3), 
('Compra de papel A4 e etiquetas', 'Materiais e Suprimentos', '2025-10-07', '2025-10-22', 220.00, '', 1), 
('Compra de sacolas personalizadas', 'Materiais e Suprimentos', '2025-10-09', '2025-10-24', 780.00, '', 2), 
('Compra de produtos de limpeza', 'Materiais e Suprimentos', '2025-10-11', '2025-10-26', 340.00, '', 3), 
('Serviço de dedetização', 'Manutenção', '2025-10-05', '2025-10-15', 600.00, '', 1), 
('Troca de lâmpadas e reparos elétricos', 'Manutenção', '2025-10-12', '2025-10-27', 480.00, '', 2), 
('Manutenção do ar-condicionado', 'Manutenção', '2025-10-14', '2025-10-30', 890.00, '', 3), 
('Tarifa bancária mensal', 'Financeiras / Bancárias', '2025-10-01', '2025-10-05', 45.90, '', 1), 
('Mensalidade do sistema de gestão', 'Financeiras / Bancárias', '2025-10-09', '2025-10-20', 250.00, '', 2), 
('Juros de antecipação de recebíveis', 'Financeiras / Bancárias', '2025-10-15', '2025-10-29', 370.00, '', 3), 
('Pagamento de boletos via banco', 'Financeiras / Bancárias', '2025-10-18', '2025-10-31', 100.00, '', 1); 
 
 
 
INSERT INTO produtos (registro_anvisa, nome, foto, medida_id, tarja_id, categoria_id, marca_id, codigo_barras, descricao, preco_unitario, validade, fornecedor_id, lote_id, armazenamento) values 
('102340125', 'Paracetamol', 'paracetamol.webp', 5, 2, 5, 31, '2147483641', 'Analgésico e antipirético para dores leves e febre: 500mg - 20 Comprimidos', '13', '2026-04-15', 18, 101, 'Ambiente natural'), 
('457891234', 'Dipirona Sódica', 'dipironaSodica.webp', 5, 1, 3, 14, '2147483642', 'Analgésico e antitérmico: 1g - 10 Comprimidos', '9', '2025-11-20', 1, 102, 'Local fresco e seco'), 
('203567891', 'Amoxicilina', 'amoxicilina.webp', 5, 3, 1, 51, '2147483643', 'Antibiótico de uso oral: 500mg - 21 Cápsulas', '69', '2027-02-01', 13, 103, 'Temperatura ambiente'), 
('897654321', 'Losartana Potássica', 'losartanaPotassica.webp', 5, 2, 2, 2, '2147483644', 'Medicamento para hipertensão: 50mg - 30 Comprimidos', '35', '2028-08-10', 5, 104, 'Ambiente natural'), 
('108765432', 'Clonazepam', 'clonazepam.webp', 5, 4, 1, 44, '2147483645', 'Medicamento de uso controlado (Tarja Preta): 2mg - 20 Comprimidos', '29', '2026-09-30', 2, 105, 'Local seguro e controlado'), 
('409172561', 'Vacina Rotavírus', null, 5, 3, 5, 1, '2147483646', 'Imunização contra rotavírus (Tarja Amarela).', '150', '2025-07-31', 19, 106, 'Refrigerado - Controle Especial'), 
('102340126', 'Ibuprofeno', 'ibuprofeno.webp', 5, 1, 4, 25, '2147483647', 'Anti-inflamatório e analgésico: 400mg - 10 Comprimidos', '16', '2026-06-01', 10, 107, 'Ambiente natural'), 
('203567892', 'Loratadina', 'loratadina.webp', 5, 2, 1, 3, '2147483622', 'Antialérgico não-sedante: 10mg - 12 Comprimidos', '33', '2027-10-25', 7, 108, 'Temperatura ambiente'), 
('897654322', 'Sertralina', 'sertralina.webp', 5, 3, 1, 16, '2147483623', 'Antidepressivo, venda sob prescrição: 50mg - 30 Comprimidos', '75', '2028-03-15', 14, 109, 'Ambiente natural'), 
('457891235', 'Clonazepam', 'clonazepam.webp', 5, 4, 5, 36, '2147483640', 'Uso controlado (tarja preta): 0.5mg - 30 Comprimidos', '38', '2025-12-10', 17, 110, 'Local seguro e controlado'), 
('256287192', 'Vacina Meningocócica', null, 5, 3, 4, 8, '2147483624', 'Imunização contra meningite.', '180', '2026-01-01', 9, 111, 'Refrigerado - Controle Especial'), 
('102340127', 'Omeprazol', 'omeprazol.webp', 5, 2, 1, 49, '2147483625', 'Inibidor de bomba de prótons para acidez: 20mg - 14 Cápsulas', '30', '2026-03-20', 16, 112, 'Ambiente natural'), 
('897654323', 'Butilbrometo de Escopolamina', 'butilbrometo.webp', 5, 1, 3, 11, '2147483626', 'Antiespasmódico e analgésico.', '15', '2027-05-05', 4, 113, 'Ambiente natural'), 
('203567893', 'Fluoxetina', 'fluoxetina.webp', 5, 2, 5, 21, '2147483627', 'Antidepressivo e ansiolítico:  20mg - 30 Cápsulas', '45', '2028-11-01', 12, 114, 'Temperatura ambiente'), 
('457891236', 'Captopril', 'captopril.webp', 5, 2, 2, 45, '2147483620', 'Anti-hipertensivo, venda sob prescrição: 25mg - 30 Comprimidos', '11', '2029-01-15', 6, 115, 'Ambiente natural'), 
('457891237', 'Neosaldina', 'neosaldina.webp', 5, 1, 1, 18, '2147483630', 'Para alívio rápido de dores de cabeça.', '10', '2026-07-01', 15, 116, 'Ambiente natural'), 
('102340128', 'Diclofenaco Sódico', 'diclofenacoSodico.webp', 5, 2, 4, 39, '2147483631', 'Anti-inflamatório genérico:  50mg - 20 Comprimidos', '9', '2025-10-30', 2, 117, 'Ambiente natural'), 
('897654324', 'Metformina', 'metformina.webp', 5, 2, 3, 9, '2147483632', 'Hipoglicemiante oral: 850mg - 30 Comprimidos', '15', '2027-09-01', 10, 118, 'Ambiente natural'), 
('309817456', 'Colírio Lubrificante', 'colirioLubrificante.webp', 1, 1, 1, 4, '2147483633', 'Solução para olhos secos: 10ml', '28', '2025-08-30', 14, 119, 'Ambiente natural'), 
('203567894', 'Dramin B6', 'dramin.webp', 5, 1, 5, 28, '2147483634', 'Para prevenção de náuseas e vômitos: 10 Comprimidos', '15', '2026-12-12', 17, 120, 'Ambiente natural'), 
('102340129', 'Protetor Solar FPS 50', 'protetorSolar50.webp', 1, 1, 2, 41, '2147483635', 'Protetor solar de uso farmacêutico para pele sensível: 50 - 200ml (farmacêutico)', '80', '2026-04-01', 11, 121, 'Temperatura ambiente'), 
('102340130', 'Loção Hidratante Corporal', 'locaoHidratanteCorporal.webp', 1, 1, 2, 17, '2147483636', 'Hidratação intensiva indicada por dermatologista: 400ml (Dermocosmético)', '30', '2026-05-20', 8, 122, 'Temperatura ambiente'), 
('203567895', 'Gel Oral Antisséptico', 'gelOralAntisseptico.webp', 5, 1, 3, 5, '2147483637', 'Antisséptico bucal para feridas e gengivite: 120ml', '35', '2027-11-10', 2, 123, 'Temperatura ambiente'), 
('897654325', 'Vitamina C', 'vitaminaC.webp', 5, 1, 4, 33, '2147483444', 'Suplemento antioxidante: 500mg - 30 Comprimidos', '25', '2028-05-01', 15, 124, 'Ambiente natural'), 
('457891238', 'Máscara Hidratação Capilar', 'mascaraHidratacaoCapilar.webp', 3, 1, 2, 23, '2147483333', 'Tratamento intensivo para couro cabeludo sensível.', '55', '2025-09-15', 1, 125, 'Temperatura ambiente'), 
('102340131', 'Desodorante Roll-on', 'desodoranteRollOn.webp', 1, 1, 3, 47, '2147483640', 'Antitranspirante com controle bacteriano: 50ml', '12', '2026-08-01', 6, 126, 'Temperatura ambiente'), 
('897654326', 'Tintura Capilar', 'tinturaCapilar.webp', 1, 1, 2, 19, '2147483111', 'Tintura com baixo teor de alergênicos: 50ml', '10', '2028-12-31', 10, 127, 'Temperatura ambiente'), 
('203567896', 'Fragrância Neutra Atóxica', 'fragranciaNeutraAtoxica.webp', 1, 1, 2, 10, '2147483222', 'Fragrância testada dermatologicamente: 50ml', '45', '2027-04-20', 19, 128, 'Temperatura ambiente'), 
('457891239', 'Bálsamo Labial FPS', 'balsamoLabial.webp', 5, 1, 2, 42, '2147483555', 'Proteção e hidratação para os lábios: 30 unidades', '20', '2025-11-01', 13, 129, 'Temperatura ambiente'), 
('415673802', 'Delineador para olhos', 'delineadorParaOlhos.webp', 5, 1, 2, 29, '1147483647', 'Produto oftálmico testado para sensibilidade ocular: 2ml', '30', '2027-07-20', 17, 130, 'Temperatura ambiente'), 
('102340132', 'Creme Anti-idade Noturno', 'cremeAntiIdadeNoturno.webp', 3, 1, 2, 15, '1247483645', 'Creme com retinol e controle dermatológico: 50g', '180', '2026-07-10', 8, 131, 'Temperatura ambiente'), 
('897654327', 'Óleo Corporal', 'oleoCorporalTerapeuticoCastanhaBrasil.webp', 1, 1, 2, 27, '1347483646', 'Hidratação profunda com ação regeneradora: 200ml', '45', '2028-06-01', 5, 132, 'Temperatura ambiente'), 
('203567897', 'Shampoo Terapêutico Anticaspa', 'shampooAnticaspa.webp', 1, 1, 3, 40, '1447483647', 'Shampoo com ação antifúngica: 150ml', '40', '2027-03-01', 14, 133, 'Temperatura ambiente'), 
('457891240', 'Tônico Facial Adstringente', 'tonicoFacialAdstringente.webp', 1, 1, 2, 37, '1547483647', 'Controle de oleosidade e limpeza profunda: 200ml', '48', '2025-10-28', 19, 134, 'Temperatura ambiente'), 
('503459183', 'Base Líquida Medicinal', 'baseLiquida.webp', 1, 1, 2, 6, '1647483647', 'Base com ação cicatrizante leve: 30ml', '65', '2027-05-01', 3, 135, 'Temperatura ambiente'), 
('102340133', 'Corretivo Clínico', 'corretivoClinico.webp', 1, 1, 2, 20, '1747483647', 'Corretivo com ação calmante: 10g', '35', '2026-01-25', 18, 136, 'Temperatura ambiente'), 
('897654328', 'Máscara de Cílios', 'mascaraCiliosHipoalergenica.webp', 5, 1, 2, 12, '1847483647', 'Rímel dermatologicamente testado.', '50', '2028-10-01', 1, 137, 'Temperatura ambiente'), 
('203567898', 'Sombra Paleta Neutra', 'sombraPaletaNeutra.webp', 5, 1, 2, 46, '1947483647', 'Paleta indicada para olhos sensíveis.', '55', '2027-08-01', 13, 138, 'Temperatura ambiente'), 
('457891241', 'Gloss', 'glossLabialHipoalergenico.webp', 5, 1, 2, 34, '1047483647', 'Brilho labial testado dermatologicamente.', '22', '2026-02-01', 5, 139, 'Temperatura ambiente'), 
('654782901', 'Primer', 'primerMedicoMaquiagem.webp', 1, 1, 2, 48, '2047483647', 'Prepara a pele e diminui irritações.', '59', '2027-04-01', 2, 140, 'Temperatura ambiente'), 
('102340134', 'Sabonete Líquido Antibacteriano', 'saboneteLiquido.webp', 1, 1, 3, 26, '2140483647', 'Sabonete antibacteriano: 500ml', '16', '2026-09-01', 12, 141, 'Ambiente natural'), 
('897654329', 'Creme Dental Terapêutico', 'cremeDental.webp', 3, 1, 3, 50, '2141483647', 'Proteção contra cáries e sensibilidade.', '9', '2028-05-01', 6, 142, 'Prateleira'), 
('203567899', 'Shampoo Anticaspa', 'shampooAnticaspa.webp', 1, 1, 3, 22, '2142483647', 'Limpeza profunda e controle da caspa.', '22', '2027-12-01', 15, 143, 'Ambiente natural'), 
('457891242', 'Enxaguante Bucal', 'enxaguanteBucal.webp', 1, 1, 3, 7, '2143483647', 'Complemento para higiene bucal com flúor.', '15', '2026-03-01', 11, 144, 'Prateleira'), 
('798267536', 'Fralda Descartável Hipoalergênica', 'fraldaDescartavel.webp', 5, 1, 5, 43, '2144483647', 'Fralda indicada para pele sensível (Tam M)', '50', '2029-05-01', 8, 145, 'Local seco e arejado'), 
('102340135', 'Escova de Dente Ergonômica', 'escovaDenteErgonomica.webp', 5, 1, 3, 4, '2145483647', 'Cerdas macias para gengiva sensível.', '7', '2028-09-01', 19, 146, 'Prateleira'), 
('897654330', 'Toalhas Umedecidas Hipoalergênicas', 'toalhasUmedecidas.webp', 5, 1, 5, 38, '2146483647', 'Toalhas para higiene sensível (50 unid)', '20', '2028-09-01', 3, 147, 'Prateleira'), 
('203567900', 'Fio Dental Encerado com Flúor', 'fioDental.webp', 5, 1, 3, 13, '2145083647', 'Fio dental para proteção adicional.', '11', '2027-06-15', 18, 148, 'Prateleira'), 
('457891243', 'Cotonetes Higiênicos Esterilizados', 'cotonetes.webp', 5, 1, 5, 49, '2145183647', 'Cotonetes esterilizados (75 unid.)', '6', '2025-12-01', 1, 149, 'Prateleira'), 
('876234561', 'Lenço de Papel Caixa', 'lencoPapelCaixa.webp', 5, 1, 5, 3, '2145283647', 'Lenços sem perfume (100 folhas)', '8', '2028-05-01', 13, 150, 'Prateleira'), 
('102340136', 'Condicionador Terapêutico', 'condicionador.webp', 1, 1, 3, 24, '2145383647', 'Condicionador para cabelos sensíveis.', '23', '2026-11-20', 5, 151, 'Prateleira'), 
('897654331', 'Papel Higiênico Folha Dupla', 'papelHigienico.webp', 5, 1, 5, 41, '2145483647', 'Produto dermatologicamente testado (12 rolos)', '25', '2027-10-01', 10, 152, 'Local seco'), 
('203567901', 'Álcool em Gel', 'alcoolGel70.webp', 1, 1, 3, 51, '2145583647', 'Álcool 70% – 500ml', '15', '2028-04-01', 7, 153, 'Prateleira'), 
('457891244', 'Desinfetante Clínico', 'desinfetante.webp', 2, 1, 5, 14, '2145683647', 'Desinfetante para superfícies clínicas.', '12', '2026-01-01', 14, 154, 'Prateleira'), 
('954987622', 'Absorvente Diário', 'absorventeDiario.webp', 5, 1, 5, 32, '2145783647', 'Absorvente diário hipoalergênico (40 unid.)', '10', '2029-05-01', 17, 155, 'Prateleira'), 
('102340137', 'Gel Lubrificante para Barbear', 'gelBarbear.webp', 3, 1, 3, 2, '2143083647', 'Facilita o deslize da lâmina: 150g', '18', '2026-12-01', 9, 156, 'Temperatura ambiente'), 
('897654332', 'Absorvente Noturno', 'absorventeNoturno.webp', 5, 1, 5, 25, '2143183647', 'Absorvente noturno sem perfume (8 unid.)', '9', '2029-02-01', 16, 157, 'Prateleira'), 
('203567902', 'Removedor de Esmalte', 'removedorEsmalte.webp', 1, 1, 2, 1, '2143283647', 'Remoção suave ideal para unhas frágeis.', '7', '2027-07-20', 4, 158, 'Prateleira'), 
('457891245', 'Sabonete em Barra Glicerina', 'saboneteBarraGlicerina.webp', 3, 1, 3, 44, '2143383647', 'Sabonete suave dermatológico 90g', '5', '2026-04-01', 12, 159, 'Prateleira'), 
('107643973', 'Spray Antisséptico', 'sprayAntissepticoFerida.webp', 1, 1, 1, 35, '2143483647', 'Limpa e desinfeta pequenas feridas.', '21', '2027-09-01', 6, 160, 'Prateleira'), 
('102340138', 'AAS 100mg', 'AAS100mg.webp', 5, 1, 1, 17, '2143583647', 'Antiagregante plaquetário: 30 comprimidos', '6', '2026-10-01', 15, 161, 'Ambiente natural'), 
('457891246', 'Sinvastatina', 'sinvastatina.webp', 5, 2, 1, 30, '2143683647', 'Para controle do colesterol: 20mg', '45', '2028-01-20', 11, 162, 'Local fresco e seco'), 
('203567903', 'Fenilefrina', 'fenilefrina.webp', 1, 1, 1, 46, '2143783647', 'Descongestionante nasal: 30ml', '19', '2025-11-15', 8, 163, 'Temperatura ambiente'), 
('897654333', 'Prednisona', 'prednisona.webp', 5, 2, 1, 19, '2143883647', 'Corticosteroide 5mg - 20 comprimidos', '12', '2027-04-10', 1, 164, 'Ambiente natural'), 
('102340139', 'Óleo Capilar', 'oleoCapilarReparadorPontas.webp', 1, 1, 2, 9, '2143983647', 'Reparação de pontas duplas.', '42', '2026-06-01', 19, 165, 'Temperatura ambiente'), 
('102340140', 'Demaquilante Bifásico', 'demaquilante.webp', 1, 1, 2, 45, '2146083647', 'Remove maquiagem à prova d’água: 150ml', '32', '2027-09-10', 3, 166, 'Temperatura ambiente'), 
('203567904', 'Creme para Pentear', 'cremePentear.webp', 3, 1, 3, 28, '2146183647', 'Controla frizz: 300g', '25', '2028-03-01', 18, 167, 'Temperatura ambiente'), 
('102340141', 'Pós-Barba Refrescante Gel', 'pósBarba.webp', 1, 1, 3, 11, '2146283647', 'Acalma a pele após o barbear.', '20', '2026-10-15', 13, 168, 'Ambiente natural'), 
('897654334', 'Escova Interdental', 'escovaInterdental.webp', 5, 1, 5, 36, '2146383647', 'Limpeza de espaços interdentais.', '15', '2029-01-01', 5, 169, 'Prateleira'), 
('203567905', 'Absorvente Interno Regular', 'absorventeInterno.webp', 5, 1, 5, 47, '2146483647', 'Absorvente interno: 10 unid.', '17', '2027-11-01', 10, 170, 'Prateleira'), 
('118763456', 'Termômetro', 'termometro.webp', 5, 1, 5, 23, '2146583647', 'Medição precisa de temperatura.', '40', '2030-12-31', 7, 171, 'Prateleira'), 
('127863452', 'Curativo', 'curativo.webp', 5, 1, 5, 16, '2146683647', 'Curativos hipoalergênicos estéreis.', '9', '2028-05-01', 14, 172, 'Local seco'), 
('130987345', 'Bolsa de Água Quente', 'bolsaAguaQuente.webp', 5, 1, 5, 43, '2146783647', 'Para dores musculares: 2L', '25', '2035-01-01', 17, 173, 'Prateleira'), 
('147653534', 'Máscara Protetora Descartável', 'mascaraProtetora.webp', 5, 1, 5, 40, '2146883647', 'Máscara facial tripla camada.', '20', '2026-03-01', 9, 174, 'Prateleira'), 
('150984357', 'Pilhas Alcalinas', 'pilhasAlcalinas.webp', 5, 1, 5, 33, '2146983647', 'Pilhas AA (4 unid.).', '16', '2029-10-01', 16, 175, 'Prateleira'), 
('102340142', 'Dipirona', 'dipirona.webp', 5, 1, 1, 24, '2147083647', 'Dorflex similar: 36 comprimidos', '20', '2026-05-10', 4, 176, 'Ambiente natural'), 
('457891247', 'Sinvastatina', 'sinvastatina.webp', 5, 2, 1, 48, '2147183647', 'Para colesterol: 10mg', '22', '2027-08-01', 12, 177, 'Local fresco e seco'), 
('203567906', 'Lágrimas Artificiais', 'lagrimasArtificiais.webp', 1, 1, 1, 26, '2147283647', 'Lubrificante ocular.', '35', '2025-10-20', 6, 178, 'Temperatura ambiente'), 
('897654335', 'Creme para Assaduras', 'cremeAssaduras.webp', 3, 1, 3, 50, '2147383647', 'Proteção e tratamento de assaduras.', '19', '2028-04-15', 15, 179, 'Prateleira'), 
('108765433', 'Probiótico Infantil', 'probioticoInfantil.webp', 5, 1, 4, 22, '2147303647', 'Probiótico infantil.', '50', '2026-09-01', 11, 180, 'Refrigerado - Controle Especial'), 
('167345974', 'Máscara Facial de Argila Verde', 'mascaraFacial.webp', 3, 1, 2, 7, '2147313647', 'Controle de oleosidade.', '38', '2027-07-01', 8, 181, 'Temperatura ambiente'), 
('102340143', 'Esfoliante Corporal', 'esfolianteCorporal.webp', 3, 1, 2, 42, '2147323647', 'Remove células mortas.', '45', '2026-06-20', 1, 182, 'Temperatura ambiente'), 
('203567907', 'Shampoo a Seco Dark', 'shampooSeco.webp', 1, 1, 2, 34, '2147333647', 'Shampoo a seco.', '42', '2027-10-05', 19, 183, 'Temperatura ambiente'), 
('897654336', 'Sabonete Íntimo Suave', 'saboneteIntimo.webp', 1, 1, 3, 29, '2147343647', 'Higiene íntima com pH balanceado.', '17', '2028-03-30', 3, 184, 'Prateleira'), 
('457891248', 'Fita Micropore', 'fitaMicropore.webp', 5, 1, 5, 15, '2147353647', 'Fita hipoalergênica.', '12', '2030-12-31', 18, 185, 'Local seco'), 
('178734256', 'Gel Massageador ', 'gelMassageador.webp', 3, 1, 5, 27, '2147363647', 'Alívio para dores musculares.', '30', '2026-01-05', 13, 186, 'Ambiente natural'), 
('102340144', 'Compressas de Gaze Estéril', 'gazeEsteril.webp', 5, 1, 5, 41, '2147373647', 'Para limpeza de feridas.', '8', '2027-03-25', 5, 187, 'Local seco'), 
('897654337', 'Protetor Auditivo de Silicone', 'protetorAuditivo.webp', 5, 1, 5, 17, '2147383647', 'Atenuação de ruídos.', '15', '2035-01-01', 10, 188, 'Prateleira'), 
('203567908', 'Preservativo Lubrificado', 'preservativoLubrificado.webp', 5, 1, 5, 30, '2147393647', 'Contraceptivo.', '12', '2028-11-20', 7, 189, 'Prateleira'), 
('457891249', 'Spray Bucal Refrescante', 'sprayBucal.webp', 1, 1, 3, 44, '2147430647', 'Hálito fresco.', '15', '2029-01-15', 14, 190, 'Prateleira'), 
('457891250', 'Pastilha', 'pastilha.webp', 5, 1, 4, 39, '2147431647', 'Alívio da dor de garganta.', '10', '2026-07-15', 17, 191, 'Ambiente natural'), 
('102340145', 'Kit de Viagem Farmacêutico', 'kitViagem.webp', 5, 1, 3, 6, '2147432647', 'Miniaturas de higiene.', '30', '2025-10-01', 9, 192, 'Prateleira'), 
('897654338', 'Protetor Solar', 'protetorSolar.webp', 1, 1, 2, 21, '2147433647', 'FPS 30 - 120ml', '55', '2027-09-25', 16, 193, 'Temperatura ambiente'), 
('185982134', 'Band-Aid', 'bandAid.webp', 5, 1, 5, 45, '2147434647', 'Curativo transparente estéril.', '15', '2025-08-20', 4, 194, 'Prateleira'), 
('203567909', 'Pó Translúcido HD para Maquiagem', 'poTranslucido.webp', 3, 1, 2, 43, '2147435647', 'Sela a maquiagem.', '49', '2026-12-01', 12, 195, 'Temperatura ambiente'), 
('102340146', 'Propranolol Cloridrato', 'propranololCloridrato.webp', 5, 2, 1, 18, '2147436647', 'Betabloqueador para hipertensão e angina.', '18', '2028-02-01', 6, 196, 'Temperatura controlada'), 
('457891251', 'Xarope', 'xarope.webp', 1, 1, 1, 38, '2147437647', 'Antitussígeno para tosse irritativa.', '22', '2026-03-10', 15, 197, 'Ambiente natural'), 
('203567910', 'Melatonina', 'melatonina.webp', 5, 1, 4, 5, '2147438647', 'Suplemento para auxiliar o sono.', '50', '2027-11-25', 11, 198, 'Local fresco e seco'), 
('897654339', 'Dipropionato de Betametasona Creme', 'dipropionatoBetametasona.webp', 3, 2, 1, 31, '2147439647', 'Corticosteroide tópico anti-inflamatório.', '16', '2025-12-05', 8, 199, 'Temperatura ambiente'), 
('102340147', 'Ivermectina', 'ivermectina.webp', 5, 2, 1, 23, '2147483307', 'Antiparasitário oral conforme prescrição.', '18', '2027-06-30', 1, 200, 'Ambiente natural'), 
('102340148', 'Insulina', 'insulina.webp', 4, 4, 1, 47, '2147483317', 'Insulina para controle glicêmico, refrigerar antes do uso.', '120', '2026-12-31', 19, 201, 'Refrigerado - Controle Especial'), 
('102340149', 'Sulfato de Magnésio', 'sulfatoMagnesio.webp', 4, 4, 1, 19, '2147483327', 'Uso hospitalar para reposição de magnésio.', '25', '2028-07-01', 3, 202, 'Temperatura controlada'), 
('102340150', 'Vacina Influenza Trivalente', null, 5, 4, 1, 10, '2147483337', 'Vacina sazonal contra influenza.', '80', '2026-05-31', 18, 203, 'Refrigerado - Controle Especial'), 
('102340151', 'Cloreto de Sódio', 'cloretoSodio.webp', 4, 1, 1, 12, '2147483347', 'Solução isotônica para hidratação e limpeza.', '8', '2029-01-01', 13, 204, 'Prateleira'), 
('102340152', 'Naproxeno', 'naproxeno.webp', 5, 2, 1, 46, '2147483357', 'Anti-inflamatório não esteroide.', '22', '2027-08-15', 5, 205, 'Ambiente natural'), 
('102340153', 'Cetirizina', 'cetirizina.webp', 5, 1, 1, 34, '2147483367', 'Antialérgico oral de longa duração.', '13', '2028-03-20', 10, 206, 'Temperatura ambiente'), 
('102340154', 'Clotrimazol Creme', 'clotrimazolCreme.webp', 3, 1, 1, 48, '2147483377', 'Antifúngico tópico para micoses cutâneas.', '14', '2026-10-10', 7, 207, 'Temperatura ambiente'), 
('102340155', 'Ranitidina', 'ranitidina.webp', 5, 2, 1, 26, '2147483387', 'Antagonista H2 para acidez gástrica.', '16', '2027-11-11', 14, 208, 'Ambiente natural'), 
('102340156', 'Clindamicina', 'clindamicina.webp', 5, 2, 1, 50, '2147483397', 'Antibiótico para infecções diversas.', '48', '2028-09-01', 17, 209, 'Temperatura ambiente'), 
('102340157', 'Cefalexina', 'cefalexina.webp', 5, 2, 1, 16, '2147483407', 'Antibiótico betalactâmico oral.', '35', '2026-04-10', 9, 210, 'Temperatura ambiente'), 
('102340158', 'Loratadina Xarope', 'loratadinaXarope.webp', 1, 1, 1, 41, '2147483417', 'Antialérgico em suspensão oral pediátrica.', '19', '2027-01-01', 16, 211, 'Ambiente natural'), 
('102340159', 'Clorexidina Solução', 'clorexidinaSolucao.webp', 1, 1, 1, 32, '2147483427', 'Antisséptico para pele e mucosas.', '13', '2028-06-01', 4, 212, 'Prateleira'), 
('102340160', 'Salmeterol', 'salmeterol.webp', 4, 2, 1, 2, '2147483437', 'Broncodilatador combinado para asma crônica.', '185', '2029-03-01', 12, 213, 'Temperatura controlada'), 
('102340161', 'Bromoprida', 'bromoprida.webp', 4, 1, 1, 25, '2147483447', 'Antiemético para uso parenteral.', '28', '2027-05-05', 6, 214, 'Temperatura ambiente'), 
('102340162', 'Valerato de Betametasona Creme', 'valeratoBetametasonaCreme.webp', 3, 2, 1, 1, '2147483457', 'Corticosteroide tópico para inflamação cutânea.', '15', '2026-08-08', 15, 215, 'Temperatura ambiente'), 
('102340163', 'Sulfonato de Neomicina Ointment', 'sulfonatoNeomicinaOintment.webp', 3, 1, 1, 43, '2147483467', 'Pomada antibacteriana tópica.', '23', '2027-09-09', 11, 216, 'Prateleira'), 
('102340164', 'Atenolol', 'atenolol.webp', 5, 2, 1, 38, '2147483477', 'Betabloqueador para hipertensão.', '17', '2028-12-12', 8, 217, 'Temperatura ambiente'), 
('102340165', 'Epinefrina', 'epinefrina.webp', 4, 4, 1, 13, '2147483487', 'Uso emergencial para anafilaxia.', '28', '2026-02-28', 1, 218, 'Refrigerado - Controle Especial'), 
('102340166', 'Claritromicina', 'claritromicina.webp', 5, 2, 1, 36, '2147483497', 'Antibiótico macrolídeo.', '52', '2027-02-14', 19, 219, 'Temperatura ambiente'), 
('102340167', 'Rifaximina', 'rifaximina.webp', 5, 2, 1, 47, '2147483507', 'Antibiótico para infecções entéricas.', '100', '2028-11-11', 3, 220, 'Ambiente natural'), 
('102340168', 'Benzetacil', 'benzetacil.webp', 4, 4, 1, 24, '2147483517', 'Penicilina benzilpenicilina benzatina para uso IM.', '65', '2029-05-05', 18, 221, 'Temperatura controlada'), 
('102340169', 'Nistatina Creme', 'nistatinaCreme.webp', 3, 1, 1, 40, '2147483527', 'Antifúngico tópico para candidíase cutânea.', '18', '2027-07-07', 13, 222, 'Temperatura ambiente'), 
('102340170', 'Naproxeno Gel', 'naproxenoGel.webp', 3, 1, 1, 29, '2147483537', 'Gel anti-inflamatório para uso tópico.', '27', '2026-11-11', 5, 223, 'Temperatura ambiente'), 
('102340171', 'Sulfametoxazol', 'sulfametoxazol.webp', 5, 2, 1, 15, '2147483547', 'Antibiótico para infecções bacterianas.', '30', '2027-03-03', 10, 224, 'Temperatura ambiente'), 
('102340172', 'Ipratropio Brometo Aerossol', 'ipratropioBrometoAerossol.webp', 4, 1, 1, 32, '2147483557', 'Broncodilatador de ação anticolinérgica.', '135', '2028-08-08', 7, 225, 'Temperatura controlada'), 
('102340173', 'Vitaminas B Complex', 'vitaminasBComplex.webp', 5, 1, 4, 49, '2147483567', 'Complexo vitamínico do complexo B.', '35', '2029-01-01', 14, 226, 'Ambiente natural'), 
('102340174', 'Colecalciferol', 'colecalciferol.webp', 5, 1, 4, 28, '2147483577', 'Suplemento de vitamina D para reposição.', '27', '2027-12-12', 17, 227, 'Temperatura ambiente'), 
('102340175', 'Ondansetrona', 'ondansetrona.webp', 5, 1, 1, 11, '2147483587', 'Antiemético para náuseas e vômitos.', '19', '2026-06-06', 9, 228, 'Ambiente natural'), 
('102340176', 'Solução Ringer Lactato', 'solucaoRingerLactato.webp', 4, 1, 1, 20, '2147483597', 'Sol. para reposição hidroeletrolítica (uso hospitalar).', '23', '2028-04-04', 16, 229, 'Temperatura controlada'), 
('102340177', 'Clonidina', 'clonidina.webp', 5, 2, 1, 10, '2147483207', 'Anti-hipertensivo com ação central.', '21', '2027-09-09', 4, 230, 'Temperatura ambiente'), 
('102340178', 'Bacitracina Pomada', 'bacitracinaPomada.webp', 3, 1, 1, 42, '2147483217', 'Pomada antibacteriana para uso tópico.', '10', '2029-02-02', 12, 231, 'Prateleira'); 
 
INSERT INTO lotes_matriz (produto_id, numero_lote, data_validade, quantidade, data_entrada, fornecedor_id) VALUES 
(1, 1001, '2026-02-15', 270, '2024-01-12', 1), 
(2, 1002, '2027-04-03', 190, '2024-01-28', 2), 
(3, 1003, '2026-09-20', 460, '2024-02-10', 3), 
(4, 1004, '2028-01-11', 310, '2024-02-22', 4), 
(5, 1005, '2026-12-09', 250, '2024-03-05', 5), 
(6, 1006, '2027-08-18', 400, '2024-03-18', 6), 
(7, 1007, '2026-05-30', 120, '2024-03-29', 7), 
(8, 1008, '2028-03-02', 330, '2024-04-12', 8), 
(9, 1009, '2027-10-25', 200, '2024-04-25', 9), 
(10, 1010, '2026-07-07', 480, '2024-05-03', 10), 
(11, 1011, '2028-05-14', 210, '2024-05-17', 11), 
(12, 1012, '2027-03-10', 300, '2024-05-30', 12), 
(13, 1013, '2026-11-20', 390, '2024-06-08', 13), 
(14, 1014, '2028-02-05', 260, '2024-06-22', 14), 
(15, 1015, '2027-06-14', 490, '2024-07-05', 15), 
(16, 1016, '2026-08-30', 180, '2024-07-19', 16), 
(17, 1017, '2027-11-25', 280, '2024-08-01', 17), 
(18, 1018, '2028-06-09', 340, '2024-08-16', 18), 
(19, 1019, '2026-09-12', 230, '2024-08-30', 19), 
(20, 1020, '2027-12-01', 360, '2024-09-14', 20), 
(21, 1021, '2026-06-10', 170, '2024-09-26', 1), 
(22, 1022, '2027-04-19', 410, '2024-10-05', 2), 
(23, 1023, '2028-01-27', 120, '2024-10-19', 3), 
(24, 1024, '2026-10-03', 470, '2024-10-30', 4), 
(25, 1025, '2028-04-20', 310, '2024-11-11', 5), 
(26, 1026, '2027-09-18', 250, '2024-11-27', 6), 
(27, 1027, '2026-05-04', 180, '2024-12-06', 7), 
(28, 1028, '2028-02-25', 290, '2024-12-21', 8), 
(29, 1029, '2027-08-01', 480, '2025-01-04', 9), 
(30, 1030, '2026-11-16', 150, '2025-01-19', 10), 
(31, 1031, '2028-03-07', 320, '2025-02-03', 11), 
(32, 1032, '2027-10-28', 250, '2025-02-17', 12), 
(33, 1033, '2026-06-22', 130, '2025-03-02', 13), 
(34, 1034, '2027-07-19', 450, '2025-03-18', 14), 
(35, 1035, '2028-01-05', 200, '2025-03-31', 15), 
(36, 1036, '2026-09-25', 390, '2025-04-13', 16), 
(37, 1037, '2027-03-14', 470, '2025-04-27', 17), 
(38, 1038, '2028-02-18', 230, '2025-05-10', 18), 
(39, 1039, '2026-08-05', 160, '2025-05-25', 19), 
(40, 1040, '2027-12-19', 280, '2025-06-09', 20), 
(41, 1041, '2026-05-30', 340, '2025-06-22', 1), 
(42, 1042, '2027-08-11', 410, '2025-07-05', 2), 
(43, 1043, '2028-04-09', 270, '2025-07-20', 3), 
(44, 1044, '2026-10-14', 490, '2025-08-02', 4), 
(45, 1045, '2028-03-25', 120, '2025-08-18', 5), 
(46, 1046, '2027-09-02', 350, '2025-08-30', 6), 
(47, 1047, '2026-12-11', 420, '2025-09-12', 7), 
(48, 1048, '2028-02-07', 230, '2025-09-27', 8), 
(49, 1049, '2027-07-01', 480, '2025-10-10', 9), 
(50, 1050, '2026-09-15', 300, '2025-10-25', 10), 
(51, 1051, '2028-04-05', 270, '2024-01-10', 11), 
(52, 1052, '2027-11-21', 380, '2024-01-25', 12), 
(53, 1053, '2026-07-28', 230, '2024-02-09', 13), 
(54, 1054, '2028-01-30', 410, '2024-02-23', 14), 
(55, 1055, '2027-09-19', 190, '2024-03-09', 15), 
(56, 1056, '2026-10-27', 260, '2024-03-23', 16), 
(57, 1057, '2028-03-15', 320, '2024-04-05', 17), 
(58, 1058, '2027-08-18', 440, '2024-04-20', 18), 
(59, 1059, '2026-05-12', 170, '2024-05-03', 19), 
(60, 1060, '2028-06-22', 280, '2024-05-18', 20), 
(61, 1061, '2026-08-28', 310, '2024-06-02', 1), 
(62, 1062, '2027-12-10', 260, '2024-06-17', 2), 
(63, 1063, '2028-03-25', 420, '2024-07-01', 3), 
(64, 1064, '2026-10-07', 190, '2024-07-16', 4), 
(65, 1065, '2028-05-11', 370, '2024-07-30', 5), 
(66, 1066, '2027-06-14', 480, '2024-08-14', 6), 
(67, 1067, '2026-09-03', 160, '2024-08-29', 7), 
(68, 1068, '2027-08-22', 340, '2024-09-11', 8), 
(69, 1069, '2028-01-18', 200, '2024-09-27', 9), 
(70, 1070, '2026-11-02', 390, '2024-10-10', 10), 
(71, 1071, '2027-09-29', 270, '2024-10-25', 11), 
(72, 1072, '2028-02-08', 320, '2024-11-08', 12), 
(73, 1073, '2026-12-20', 110, '2024-11-23', 13), 
(74, 1074, '2027-05-27', 490, '2024-12-05', 14), 
(75, 1075, '2028-03-12', 300, '2024-12-21', 15), 
(76, 1076, '2026-09-28', 240, '2025-01-06', 16), 
(77, 1077, '2027-10-03', 420, '2025-01-19', 17), 
(78, 1078, '2028-04-14', 250, '2025-02-01', 18), 
(79, 1079, '2026-07-17', 480, '2025-02-16', 19), 
(80, 1080, '2027-12-22', 350, '2025-03-02', 20), 
(81, 1081, '2028-03-25', 290, '2025-03-17', 1), 
(82, 1082, '2027-09-06', 370, '2025-03-31', 2), 
(83, 1083, '2026-08-12', 180, '2025-04-14', 3), 
(84, 1084, '2028-06-29', 330, '2025-04-28', 4), 
(85, 1085, '2027-02-10', 400, '2025-05-12', 5), 
(86, 1086, '2026-09-22', 270, '2025-05-26', 6), 
(87, 1087, '2028-02-07', 310, '2025-06-10', 7), 
(88, 1088, '2027-07-15', 460, '2025-06-24', 8), 
(89, 1089, '2026-11-27', 230, '2025-07-08', 9), 
(90, 1090, '2028-04-09', 410, '2025-07-22', 10), 
(91, 1091, '2027-05-19', 490, '2025-08-04', 11), 
(92, 1092, '2026-10-25', 220, '2025-08-18', 12), 
(93, 1093, '2028-01-14', 330, '2025-09-02', 13), 
(94, 1094, '2027-09-18', 370, '2025-09-16', 14), 
(95, 1095, '2026-07-21', 190, '2025-09-29', 15), 
(96, 1096, '2028-03-30', 250, '2025-10-13', 16), 
(97, 1097, '2027-08-27', 480, '2025-10-27', 17), 
(98, 1098, '2026-10-08', 140, '2024-01-11', 18), 
(99, 1099, '2028-02-22', 420, '2024-01-26', 19), 
(100, 1100, '2027-04-05', 310, '2024-02-09', 20), 
(101, 1101, '2026-09-10', 170, '2024-02-23', 1), 
(102, 1102, '2027-07-15', 250, '2024-03-07', 2), 
(103, 1103, '2028-01-31', 330, '2024-03-20', 3), 
(104, 1104, '2026-10-25', 490, '2024-04-04', 4), 
(105, 1105, '2027-03-13', 220, '2024-04-17', 5), 
(106, 1106, '2028-02-28', 400, '2024-05-02', 6), 
(107, 1107, '2026-05-19', 290, '2024-05-15', 7), 
(108, 1108, '2027-09-04', 360, '2024-05-30', 8), 
(109, 1109, '2028-04-26', 470, '2024-06-12', 9), 
(110, 1110, '2026-12-21', 200, '2024-06-26', 10), 
(111, 1111, '2028-03-07', 310, '2024-07-09', 11), 
(112, 1112, '2027-08-24', 240, '2024-07-23', 12), 
(113, 1113, '2026-09-30', 430, '2024-08-05', 13), 
(114, 1114, '2028-02-15', 350, '2024-08-20', 14), 
(115, 1115, '2027-06-08', 260, '2024-09-03', 15), 
(116, 1116, '2026-11-14', 480, '2024-09-17', 16), 
(117, 1117, '2028-05-19', 200, '2024-10-01', 17), 
(118, 1118, '2027-03-27', 390, '2024-10-15', 18), 
(119, 1119, '2026-08-30', 180, '2024-10-29', 19), 
(120, 1120, '2028-01-09', 320, '2024-11-11', 20), 
(121, 1121, '2026-09-25', 340, '2024-11-25', 1), 
(122, 1122, '2027-12-18', 270, '2024-12-09', 2), 
(123, 1123, '2028-03-29', 420, '2024-12-23', 3), 
(124, 1124, '2026-10-07', 200, '2025-01-06', 4), 
(125, 1125, '2027-11-13', 380, '2025-01-20', 5), 
(126, 1126, '2028-04-02', 310, '2025-02-03', 6), 
(127, 1127, '2026-08-21', 250, '2025-02-17', 7), 
(128, 1128, '2027-10-29', 490, '2025-03-03', 8), 
(129, 1129, '2028-02-16', 150, '2025-03-17', 9), 
(130, 1130, '2026-11-10', 370, '2025-03-31', 10), 
(131, 1131, '2027-09-21', 290, '2025-04-14', 11); 
 
INSERT INTO estoque_matriz (produto_id, lote_id, quantidade, estoque_minimo, estoque_maximo, localizacao, data_atualizacao) VALUES 
(1, 1, 50, 10, 100, 'Corredor A - Estante 1', '2025-03-15'), 
(2, 2, 30, 5, 80, 'Corredor A - Estante 2', '2025-06-20'), 
(3, 3, 25, 5, 60, 'Corredor A - Estante 3', '2024-12-05'), 
(4, 4, 40, 10, 90, 'Corredor A - Estante 4', '2025-02-28'), 
(5, 5, 20, 5, 50, 'Corredor A - Estante 5', '2024-11-12'), 
(6, 6, 35, 10, 70, 'Corredor A - Estante 6', '2025-01-20'), 
(7, 7, 60, 15, 120, 'Corredor A - Estante 7', '2025-07-08'), 
(8, 8, 45, 10, 90, 'Corredor A - Estante 8', '2025-09-14'), 
(9, 9, 25, 5, 60, 'Corredor A - Estante 9', '2024-08-22'), 
(10, 10, 30, 5, 70, 'Corredor A - Estante 10', '2025-10-03'), 
(11, 11, 40, 10, 80, 'Corredor B - Estante 1', '2025-01-15'), 
(12, 12, 50, 10, 100, 'Corredor B - Estante 2', '2025-04-21'), 
(13, 13, 30, 5, 60, 'Corredor B - Estante 3', '2025-06-30'), 
(14, 14, 35, 10, 80, 'Corredor B - Estante 4', '2025-09-05'), 
(15, 15, 20, 5, 50, 'Corredor B - Estante 5', '2024-12-18'), 
(16, 16, 45, 10, 90, 'Corredor B - Estante 6', '2025-02-14'), 
(17, 17, 55, 15, 110, 'Corredor B - Estante 7', '2025-03-10'), 
(18, 18, 40, 10, 80, 'Corredor B - Estante 8', '2025-08-12'), 
(19, 19, 25, 5, 60, 'Corredor B - Estante 9', '2024-09-01'), 
(20, 20, 30, 5, 70, 'Corredor B - Estante 10', '2025-05-05'), 
(21, 21, 50, 10, 100, 'Corredor C - Estante 1', '2025-03-22'), 
(22, 22, 35, 10, 80, 'Corredor C - Estante 2', '2025-06-12'), 
(23, 23, 25, 5, 60, 'Corredor C - Estante 3', '2024-11-28'), 
(24, 24, 40, 10, 90, 'Corredor C - Estante 4', '2025-01-09'), 
(25, 25, 20, 5, 50, 'Corredor C - Estante 5', '2024-12-02'), 
(26, 26, 45, 10, 90, 'Corredor C - Estante 6', '2025-03-18'), 
(27, 27, 55, 15, 110, 'Corredor C - Estante 7', '2025-05-30'), 
(28, 28, 40, 10, 80, 'Corredor C - Estante 8', '2025-08-22'), 
(29, 29, 25, 5, 60, 'Corredor C - Estante 9', '2024-10-15'), 
(30, 30, 30, 5, 70, 'Corredor C - Estante 10', '2025-06-05'), 
(31, 31, 50, 10, 100, 'Corredor D - Estante 1', '2025-02-12'), 
(32, 32, 35, 10, 80, 'Corredor D - Estante 2', '2025-04-01'), 
(33, 33, 25, 5, 60, 'Corredor D - Estante 3', '2024-12-25'), 
(34, 34, 40, 10, 90, 'Corredor D - Estante 4', '2025-01-30'), 
(35, 35, 20, 5, 50, 'Corredor D - Estante 5', '2024-11-05'), 
(36, 36, 45, 10, 90, 'Corredor D - Estante 6', '2025-03-08'), 
(37, 37, 55, 15, 110, 'Corredor D - Estante 7', '2025-07-20'), 
(38, 38, 40, 10, 80, 'Corredor D - Estante 8', '2025-08-30'), 
(39, 39, 25, 5, 60, 'Corredor D - Estante 9', '2024-09-12'), 
(40, 40, 30, 5, 70, 'Corredor D - Estante 10', '2025-05-22'), 
(41, 41, 35, 10, 90, 'Corredor E - Estante 1', '2025-03-10'), 
(42, 42, 50, 10, 100, 'Corredor E - Estante 2', '2025-04-12'), 
(43, 43, 30, 5, 60, 'Corredor E - Estante 3', '2025-06-15'), 
(44, 44, 40, 10, 80, 'Corredor E - Estante 4', '2025-07-20'), 
(45, 45, 25, 5, 50, 'Corredor E - Estante 5', '2025-08-18'), 
(46, 46, 45, 10, 90, 'Corredor E - Estante 6', '2025-09-05'), 
(47, 47, 55, 15, 110, 'Corredor E - Estante 7', '2025-10-10'), 
(48, 48, 40, 10, 80, 'Corredor E - Estante 8', '2025-11-12'), 
(49, 49, 25, 5, 60, 'Corredor E - Estante 9', '2025-12-01'), 
(50, 50, 30, 5, 70, 'Corredor E - Estante 10', '2026-01-15'), 
(51, 51, 50, 10, 100, 'Corredor A - Estante 1', '2026-02-12'), 
(52, 52, 35, 10, 80, 'Corredor A - Estante 2', '2026-03-05'), 
(53, 53, 25, 5, 60, 'Corredor A - Estante 3', '2026-04-18'), 
(54, 54, 40, 10, 90, 'Corredor A - Estante 4', '2026-05-22'), 
(55, 55, 20, 5, 50, 'Corredor A - Estante 5', '2026-06-30'), 
(56, 56, 45, 10, 90, 'Corredor A - Estante 6', '2026-07-15'), 
(57, 57, 55, 15, 110, 'Corredor A - Estante 7', '2026-08-20'), 
(58, 58, 40, 10, 80, 'Corredor A - Estante 8', '2026-09-12'), 
(59, 59, 25, 5, 60, 'Corredor A - Estante 9', '2026-10-05'), 
(60, 60, 30, 5, 70, 'Corredor A - Estante 10', '2026-11-22'), 
(61, 61, 50, 10, 100, 'Corredor B - Estante 1', '2026-12-10'), 
(62, 62, 35, 10, 80, 'Corredor B - Estante 2', '2027-01-08'), 
(63, 63, 25, 5, 60, 'Corredor B - Estante 3', '2027-02-14'), 
(64, 64, 40, 10, 90, 'Corredor B - Estante 4', '2027-03-22'), 
(65, 65, 20, 5, 50, 'Corredor B - Estante 5', '2027-04-30'), 
(66, 66, 45, 10, 90, 'Corredor B - Estante 6', '2027-05-15'), 
(67, 67, 55, 15, 110, 'Corredor B - Estante 7', '2027-06-20'), 
(68, 68, 40, 10, 80, 'Corredor B - Estante 8', '2027-07-12'), 
(69, 69, 25, 5, 60, 'Corredor B - Estante 9', '2027-08-05'), 
(70, 70, 30, 5, 70, 'Corredor B - Estante 10', '2027-09-18'), 
(71, 71, 50, 10, 100, 'Corredor C - Estante 1', '2027-10-10'), 
(72, 72, 35, 10, 80, 'Corredor C - Estante 2', '2027-11-12'), 
(73, 73, 25, 5, 60, 'Corredor C - Estante 3', '2027-12-05'), 
(74, 74, 40, 10, 90, 'Corredor C - Estante 4', '2028-01-15'), 
(75, 75, 20, 5, 50, 'Corredor C - Estante 5', '2028-02-20'), 
(76, 76, 45, 10, 90, 'Corredor C - Estante 6', '2028-03-18'), 
(77, 77, 55, 15, 110, 'Corredor C - Estante 7', '2028-04-25'), 
(78, 78, 40, 10, 80, 'Corredor C - Estante 8', '2028-05-12'), 
(79, 79, 25, 5, 60, 'Corredor C - Estante 9', '2028-06-05'), 
(80, 80, 30, 5, 70, 'Corredor C - Estante 10', '2028-07-10'), 
(81, 81, 50, 10, 100, 'Corredor D - Estante 1', '2028-08-18'), 
(82, 82, 35, 10, 80, 'Corredor D - Estante 2', '2028-09-12'), 
(83, 83, 25, 5, 60, 'Corredor D - Estante 3', '2028-10-05'), 
(84, 84, 40, 10, 90, 'Corredor D - Estante 4', '2028-11-18'), 
(85, 85, 20, 5, 50, 'Corredor D - Estante 5', '2028-12-10'), 
(86, 86, 45, 10, 90, 'Corredor D - Estante 6', '2029-01-15'), 
(87, 87, 55, 15, 110, 'Corredor D - Estante 7', '2029-02-20'), 
(88, 88, 40, 10, 80, 'Corredor D - Estante 8', '2029-03-12'), 
(89, 89, 25, 5, 60, 'Corredor D - Estante 9', '2029-04-05'), 
(90, 90, 30, 5, 70, 'Corredor D - Estante 10', '2029-05-15'), 
(91, 91, 50, 10, 100, 'Corredor E - Estante 1', '2029-06-12'), 
(92, 92, 35, 10, 80, 'Corredor E - Estante 2', '2029-07-10'), 
(93, 93, 25, 5, 60, 'Corredor E - Estante 3', '2029-08-05'), 
(94, 94, 40, 10, 90, 'Corredor E - Estante 4', '2029-09-18'), 
(95, 95, 20, 5, 50, 'Corredor E - Estante 5', '2029-10-12'), 
(96, 96, 45, 10, 90, 'Corredor E - Estante 6', '2029-11-15'), 
(97, 97, 55, 15, 110, 'Corredor E - Estante 7', '2030-01-05'), 
(98, 98, 40, 10, 80, 'Corredor E - Estante 8', '2030-02-10'), 
(99, 99, 25, 5, 60, 'Corredor E - Estante 9', '2030-03-12'), 
(100, 100, 30, 5, 70, 'Corredor E - Estante 10', '2030-04-15'), 
(101, 101, 50, 10, 100, 'Corredor A - Estante 1', '2030-05-12'), 
(102, 102, 35, 10, 80, 'Corredor A - Estante 2', '2030-06-10'), 
(103, 103, 25, 5, 60, 'Corredor A - Estante 3', '2030-07-05'), 
(104, 104, 40, 10, 90, 'Corredor A - Estante 4', '2030-08-18'), 
(105, 105, 20, 5, 50, 'Corredor A - Estante 5', '2030-09-12'), 
(106, 106, 45, 10, 90, 'Corredor A - Estante 6', '2030-10-15'), 
(107, 107, 55, 15, 110, 'Corredor A - Estante 7', '2030-11-20'), 
(108, 108, 40, 10, 80, 'Corredor A - Estante 8', '2030-12-12'), 
(109, 109, 25, 5, 60, 'Corredor A - Estante 9', '2031-01-05'), 
(110, 110, 30, 5, 70, 'Corredor A - Estante 10', '2031-02-18'), 
(111, 111, 50, 10, 100, 'Corredor B - Estante 1', '2031-03-12'), 
(112, 112, 35, 10, 80, 'Corredor B - Estante 2', '2031-04-10'), 
(113, 113, 25, 5, 60, 'Corredor B - Estante 3', '2031-05-05'), 
(114, 114, 40, 10, 90, 'Corredor B - Estante 4', '2031-06-18'), 
(115, 115, 20, 5, 50, 'Corredor B - Estante 5', '2031-07-12'), 
(116, 116, 45, 10, 90, 'Corredor B - Estante 6', '2031-08-15'), 
(117, 117, 55, 15, 110, 'Corredor B - Estante 7', '2031-09-20'), 
(118, 118, 40, 10, 80, 'Corredor B - Estante 8', '2031-10-12'), 
(119, 119, 25, 5, 60, 'Corredor B - Estante 9', '2031-11-05'), 
(120, 120, 30, 5, 70, 'Corredor B - Estante 10', '2031-12-18'), 
(121, 121, 50, 10, 100, 'Corredor C - Estante 1', '2032-01-12'), 
(122, 122, 35, 10, 80, 'Corredor C - Estante 2', '2032-02-10'), 
(123, 123, 25, 5, 60, 'Corredor C - Estante 3', '2032-03-05'), 
(124, 124, 40, 10, 90, 'Corredor C - Estante 4', '2032-04-18'), 
(125, 125, 20, 5, 50, 'Corredor C - Estante 5', '2032-05-12'), 
(126, 126, 45, 10, 90, 'Corredor C - Estante 6', '2032-06-15'), 
(127, 127, 55, 15, 110, 'Corredor C - Estante 7', '2032-07-20'), 
(128, 128, 40, 10, 80, 'Corredor C - Estante 8', '2032-08-12'), 
(129, 129, 25, 5, 60, 'Corredor C - Estante 9', '2032-09-05'), 
(130, 130, 30, 5, 70, 'Corredor C - Estante 10', '2032-10-18'); 
 
 
INSERT INTO estoque_franquia (quantidade, produto_id, estoque_minimo, estoque_maximo, estoque_matriz_id) VALUES  
(15, 1, 5, 35, 1),
(20, 2, 5, 40, 2),
(18, 3, 5, 30, 3),
(22, 4, 5, 45, 4),
(10, 5, 2, 25, 5),
(25, 6, 5, 45, 6),
(30, 7, 7, 55, 7),
(20, 8, 5, 40, 8),
(12, 9, 2, 30, 9),
(15, 10, 2, 35, 10),
(25, 11, 5, 50, 11),
(20, 12, 5, 40, 12),
(12, 13, 2, 30, 13),
(20, 14, 5, 45, 14),
(10, 15, 2, 25, 15),
(22, 16, 5, 40, 16),
(28, 17, 7, 55, 17),
(20, 18, 5, 40, 18),
(12, 19, 2, 30, 19),
(15, 20, 2, 35, 20),
(25, 21, 5, 50, 21),
(20, 22, 5, 40, 22),
(12, 23, 2, 30, 23),
(20, 24, 5, 45, 24),
(10, 25, 2, 25, 25),
(22, 26, 5, 40, 26),
(28, 27, 7, 55, 27),
(20, 28, 5, 40, 28),
(12, 29, 2, 30, 29),
(15, 30, 2, 35, 30),
(25, 31, 5, 50, 31),
(20, 32, 5, 40, 32),
(12, 33, 2, 30, 33),
(20, 34, 5, 45, 34),
(10, 35, 2, 25, 35),
(22, 36, 5, 40, 36),
(28, 37, 7, 55, 37),
(20, 38, 5, 40, 38),
(12, 39, 2, 30, 39),
(15, 40, 2, 35, 40),
(15, 41, 5, 35, 41), 
(20, 42, 5, 40, 42), 
(15, 43, 5, 30, 43), 
(20, 44, 5, 45, 44), 
(10, 45, 2, 25, 45), 
(25, 46, 5, 45, 46),  
(30, 47, 7, 55, 47),  
(20, 48, 5, 40, 48),  
(12, 49, 2, 30, 49), 
(15, 50, 2, 35, 50), 
(25, 51, 5, 50, 51), 
(20, 52, 5, 40, 52),  
(12, 53, 2, 30, 53),  
(20, 54, 5, 45, 54),  
(10, 55, 2, 25, 55),  
(22, 56, 5, 40, 56),  
(28, 57, 7, 55, 57),  
(20, 58, 5, 40, 58),  
(12, 59, 2, 30, 59),  
(15, 60, 2, 35, 60),  
(25, 61, 5, 50, 61),  
(20, 62, 5, 40, 62),  
(12, 63, 2, 30, 63),  
(20, 64, 5, 45, 64),  
(10, 65, 2, 25, 65),  
(22, 66, 5, 40, 66),  
(28, 67, 7, 55, 67), 
(20, 68, 5, 40, 68),  
(12, 69, 2, 30, 69),  
(15, 70, 2, 35, 70),  
(25, 71, 5, 50, 71),  
(20, 72, 5, 40, 72),  
(12, 73, 2, 30, 73),  
(20, 74, 5, 45, 74),  
(10, 75, 2, 25, 75),  
(22, 76, 5, 40, 76),  
(28, 77, 7, 55, 77),  
(20, 78, 5, 40, 78), 
(12, 79, 2, 30, 79), 
(15, 80, 2, 35, 80), 
(25, 81, 5, 50, 81), 
(20, 82, 5, 40, 82),  
(12, 83, 2, 30, 83),  
(20, 84, 5, 45, 84),  
(10, 85, 2, 25, 85),  
(22, 86, 5, 40, 86),  
(28, 87, 7, 55, 87),  
(20, 88, 5, 40, 88),  
(12, 89, 2, 30, 89),  
(15, 90, 2, 35, 90),  
(25, 91, 5, 50, 91),  
(20, 92, 5, 40, 92),  
(12, 93, 2, 30, 93),  
(20, 94, 5, 45, 94),  
(10, 95, 2, 25, 95),  
(22, 96, 5, 40, 96),  
(28, 97, 7, 55, 97),  
(20, 98, 5, 40, 98),  
(12, 99, 2, 30, 99),  
(15, 100, 2, 35, 100),  
(25, 101, 5, 50, 101),  
(20, 102, 5, 40, 102),  
(12, 103, 2, 30, 103),  
(20, 104, 5, 45, 104),  
(10, 105, 2, 25, 105),  
(22, 106, 5, 40, 106),  
(28, 107, 7, 55, 107),  
(20, 108, 5, 40, 108),  
(12, 109, 2, 30, 109),  
(15, 110, 2, 35, 110),  
(25, 111, 5, 50, 111),  
(20, 112, 5, 40, 112),  
(12, 113, 2, 30, 113),  
(20, 114, 5, 45, 114),  
(10, 115, 2, 25, 115),  
(22, 116, 5, 40, 116),  
(28, 117, 7, 55, 117),  
(20, 118, 5, 40, 118),  
(12, 119, 2, 30, 119),  
(15, 120, 2, 35, 120),  
(25, 121, 5, 50, 121),  
(20, 122, 5, 40, 122),  
(12, 123, 2, 30, 123),  
(20, 124, 5, 45, 124),  
(10, 125, 2, 25, 125),  
(22, 126, 5, 40, 126),  
(28, 127, 7, 55, 127),  
(20, 128, 5, 40, 128),  
(12, 129, 2, 30, 129),  
(15, 130, 2, 35, 130); 
 
INSERT INTO descontos (tipodesconto_id, nome, desconto) VALUES  
   (2, "CUPOM55", 0.55), 
   (2, "CUPOM60", 0.60), 
   (2, "CUPOM65", 0.65), 
   (2, "CUPOM70", 0.70), 
   (2, "CUPOM75", 0.75), 
   (2, "CUPOM80", 0.80), 
   (2, "CUPOM10", 0.10), 
   (2, "CUPOM05", 0.05), 
   (2, "CUPOM15", 0.15), 
   (2, "CUPOM20", 0.20), 
   (2, "CUPOM25", 0.25), 
   (2, "CUPOM30", 0.30), 
   (2, "CUPOM35", 0.35), 
   (2, "CUPOM40", 0.40), 
   (2, "CUPOM45", 0.45), 
   (2, "CUPOM5", 0.50); 
 
   INSERT INTO vendas (cliente_id, usuario_id, unidade_id, tipo_pagamento_id, desconto_id, total, data) 
VALUES 
-- Hoje 
(1, 1, 1, 1, NULL, 150.50, NOW()), 
(2, 1, 1, 2, 1, 200.00, NOW()), 
(3, 2, 1, 1, NULL, 75.00, NOW()), 
  
-- Ontem 
(1, 1, 1, 1, 1, 120.00, DATE_SUB(NOW(), INTERVAL 1 DAY)), 
(2, 2, 1, 2, NULL, 180.75, DATE_SUB(NOW(), INTERVAL 1 DAY)), 
  
-- Semana passada 
(3, 1, 1, 1, NULL, 90.00, DATE_SUB(NOW(), INTERVAL 3 DAY)), 
(4, 2, 1, 2, 2, 300.00, DATE_SUB(NOW(), INTERVAL 5 DAY)), 
  
-- Mês passado 
(1, 1, 1, 1, NULL, 250.00, DATE_SUB(NOW(), INTERVAL 30 DAY)), 
(2, 2, 1, 2, 1, 400.00, DATE_SUB(NOW(), INTERVAL 35 DAY)), 
(3, 1, 1, 1, NULL, 180.00, DATE_SUB(NOW(), INTERVAL 40 DAY)); 
 
INSERT INTO parcerias (parceiro, porcentagem) VALUES 
    ("MedSênior", 0.13), 
    ("Blue Saúde", 0.10), 
    ("Cabesp", 0.19), 
    ("Climed", 0.19), 
    ("Allianz", 0.17), 
    ("OAB", 0.30), 
    ("HapVida", 0.20), 
    ("Amil", 0.70), 
    ("Notre Dame Intermediária", 0.03), 
    ("Unimed", 0.05), 
    ("Bradesco Saúde", 0.05), 
    ("SulAmérica", 0.45); 
 
INSERT INTO categoria_transacoes (categoria_transacao, tipo, descricao) 
VALUES  
  ('Salários', 'Despesa', 'Pagamento de salários'), 
  ('Vendas', 'Receita', 'Receita de vendas'), 
  ('Contas', 'Despesa', 'Pagamentos de contas da unidade'); 
 
insert into notificacao_tipos (nome, icone, cor, acao_texto_padrao) values 
('Adicionado', 'Plus', 'pink', NULL), 
('Lote enviado', 'Truck', 'pink', 'Acompanhar carregamento'), 
('Estoque baixo', 'TriangleAlert', 'pink', 'Pedir mais'), 
('Contas pendentes', 'DollarSign', 'pink', 'Pagar agora'), 
('Editado', 'Trash', 'pink', NULL), 
('Excluído', 'Pencil', 'pink', NULL); 