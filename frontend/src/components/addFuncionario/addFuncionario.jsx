"use client";

import { useState, useEffect } from "react";
import {
  Dialog, DialogTrigger, DialogContent, DialogHeader,
  DialogTitle, DialogFooter, DialogClose
} from "../ui/dialog"; // Componente de modal

import {
  Select, SelectTrigger, SelectContent,
  SelectItem, SelectValue
} from "../ui/select"; // Dropdown estilizado

import { Button } from "@/components/ui/button"; // Botão estilizado
import { Label } from "../ui/label"; // Label do input
import { Input } from "../ui/input"; // Input estilizado
import { Plus } from "lucide-react"; // Ícone de +
import DropdownEstados from "@/components/dropdownEstados/dropdownEstados"; // Dropdown de estados
import DropdownCidades from "../dropdownCidades/cidades"; // Dropdown de cidades
import { PatternFormat } from "react-number-format"; // Input com máscara
import { CalendarioConfig } from "../calendarioConfig/calendario"; // Calendário customizado
import { useUser } from "@/components/context/userContext"; // Contexto do usuário logado
import { toast } from 'react-toastify';

export default function DialogNovoFuncionario() {
  const API_URL = "http://localhost:8080";
  const usuario = useUser(); // Usuário logado

  // Estados do formulário
  const [nome, setNome] = useState("");
  const [foto, setFoto] = useState(null);
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");
  const [genero, setGenero] = useState("");
  const [unidadeId, setUnidadeId] = useState("");
  const [departamentoId, setDepartamentoId] = useState("");
  const [numero, setNumero] = useState("");
  const [data_nascimento, setData_nascimento] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cep, setCep] = useState("");
  const [rua, setRua] = useState("");
  const [estado, setEstado] = useState("");
  const [cidade, setCidade] = useState("");
  const [departamentos, setDepartamentos] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Determina se é diretor geral
  const isDiretorGeral = usuario?.funcionario?.departamentoNome?.toLowerCase() === "diretor geral";

  // Preenche automaticamente a unidade para não-diretores gerais
  useEffect(() => {
    if (!isDiretorGeral && usuario?.funcionario?.unidade_id) {
      setUnidadeId(usuario.funcionario.unidade_id);
    }
  }, [usuario, isDiretorGeral]);

  // Carrega departamentos e unidades da API
  useEffect(() => {
    const token = localStorage.getItem("token") || "";
    Promise.all([
      fetch(`${API_URL}/unidade`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      fetch(`${API_URL}/departamento`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json())
    ]).then(([uni, dep]) => {
      setUnidades(uni);
      setDepartamentos(dep);
    });
  }, []);

  // Busca endereço pelo CEP usando API ViaCEP
  const buscarCep = async (valor) => {
    const onlyNumbers = valor.replace(/\D/g, "");
    if (onlyNumbers.length !== 8) return; // CEP inválido

    const res = await fetch(`https://viacep.com.br/ws/${onlyNumbers}/json/`);
    const data = await res.json();

    if (!data.erro) {
      setEstado(data.uf);
      setCidade(data.localidade);
      setRua(data.logradouro);
    }
  };

  // Envio do formulário
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token');

      if (!unidadeId) {
        toast.error("Unidade inválida!");
        setIsSubmitting(false);
        return;
      }

      const formData = new FormData();

      // Dados principais
      const dados = {
        nome,
        email,
        telefone,
        cpf,
        cep,
        logradouro: rua,
        numero,
        estado,
        cidade,
        genero,
        unidade_id: unidadeId,
        departamento_id: departamentoId,
        data_nascimento
      };

      formData.append("data", JSON.stringify(dados));

      // Foto do funcionário
      if (foto) formData.append("foto", foto);

      const res = await fetch(`${API_URL}/funcionarios`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      if (!res.ok) throw new Error("Erro ao criar usuário");

      toast.success("Usuário criado com sucesso!");

      // Limpa formulário
      setNome(""); setEmail(""); setTelefone(""); setCpf("");
      setCep(""); setRua(""); setEstado(""); setCidade("");
      setNumero(""); setGenero(""); setUnidadeId(""); setDepartamentoId("");
      setData_nascimento(""); setFoto(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog>
      {/* Botão que abre o modal */}
      <DialogTrigger asChild>
        <Button variant="verde" size="lg" className="flex items-center justify-center">
          <Plus size={16} className="mr-2" />
          Adicionar novo funcionário
        </Button>
      </DialogTrigger>

      {/* Conteúdo do modal */}
      <DialogContent className="!max-w-[950px] w-full max-h-[90vh] flex flex-col">
  <DialogHeader>
    <DialogTitle>Adicionar novo funcionário</DialogTitle>
  </DialogHeader>

  {/* Corpo do formulário com scroll */}
  <div className="overflow-y-auto pr-2 flex-1">
    <form onSubmit={handleSubmit} className="grid gap-4">

      {/* FOTO E NOME */}
      <div className="grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-4 items-center">
        <div className="flex justify-center sm:justify-start">
          <label htmlFor="foto-input" className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border border-gray-300 flex items-center justify-center cursor-pointer overflow-hidden">
            {foto ? (
              <img src={URL.createObjectURL(foto)} alt="Preview" className="w-full h-full object-cover" />
            ) : <span className="text-sm sm:text-base text-gray-500">Escolher</span>}
          </label>
          <input id="foto-input" type="file" accept="image/*" className="hidden" onChange={(e) => setFoto(e.target.files[0])} />
        </div>

        <div className="grid gap-2 w-full">
          <Label>Nome</Label>
          <Input placeholder="Nome completo" value={nome} onChange={(e) => setNome(e.target.value)} required className="w-full" />
        </div>
      </div>

          {/* TELEFONE, CPF, DATA NASCIMENTO, EMAIL */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="grid gap-2">
              <Label>Telefone</Label>
              <PatternFormat
                format="+## (##) #####-####"
                mask="_"
                allowEmptyFormatting
                value={telefone}
                customInput={Input}
                onValueChange={(v) => setTelefone(v.value)}
                placeholder="+55 (11) 99999-9999"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label>CPF</Label>
              <PatternFormat
                format="###.###.###-##"
                mask="_"
                value={cpf}
                onValueChange={(v) => setCpf(v.value)}
                customInput={Input}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label>Data de nascimento</Label>
              <CalendarioConfig value={data_nascimento} onChange={setData_nascimento} required />
            </div>
            <div className="grid gap-2">
              <Label>Email</Label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
          </div>

          {/* GÊNERO, DEPARTAMENTO, UNIDADE */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div className="grid gap-2">
              <Label>Gênero</Label>
              <Select onValueChange={setGenero} value={genero}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="feminino">Feminino</SelectItem>
                  <SelectItem value="masculino">Masculino</SelectItem>
                  <SelectItem value="nao-binario">Não-binário</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Departamento</Label>
              <Select onValueChange={setDepartamentoId} value={String(departamentoId || "")}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {departamentos.map(d => (
                    <SelectItem key={d.id} value={String(d.id)}>{d.departamento}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {isDiretorGeral && (
              <div className="grid gap-2">
                <Label>Unidade</Label>
                <Select onValueChange={setUnidadeId} value={String(unidadeId || "")}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {unidades.map(u => (
                      <SelectItem key={u.id} value={String(u.id)}>{u.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* ENDEREÇO */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="grid gap-2">
              <Label>CEP</Label>
              <PatternFormat
                format="#####-###"
                mask="_"
                value={cep}
                customInput={Input}
                onValueChange={(v) => { setCep(v.value); buscarCep(v.value); }}
                placeholder="00000-000"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label>Rua</Label>
              <Input value={rua} onChange={(e) => setRua(e.target.value)} required />
            </div>
            <div className="grid gap-2">
              <Label>Número</Label>
              <Input value={numero} onChange={(e) => setNumero(e.target.value)} required />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Estado</Label>
              <DropdownEstados value={estado} onChange={setEstado} required />
            </div>
            <div className="grid gap-2">
              <Label>Cidade</Label>
              <DropdownCidades estadoSigla={estado} value={cidade} onChange={setCidade} required />
            </div>
          </div>

          {/* FOOTER */}
          <DialogFooter className="flex flex-col sm:flex-row gap-2 justify-end">
            <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose>
            <Button type="submit" variant="verde" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : "Criar usuário"}
            </Button>
          </DialogFooter>
        </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
