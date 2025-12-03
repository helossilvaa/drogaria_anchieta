import React, { useState } from 'react';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose
} from '../ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import DropdownEstados from '@/components/dropdownEstados/dropdownEstados';
import { PatternFormat } from "react-number-format";

export default function DialogFranquia() {
  const [nome, setNome] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [estado, setEstado] = useState("");
  const [cidade, setCidade] = useState("");
  const [rua, setRua] = useState("");
  const [numero, setNumero] = useState("");
  const [cep, setCep] = useState("");
  const [data_abertura, setDataAbertura] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const API_URL = 'http://localhost:8080';

  const buscarCep = async (valor) => {
    const onlyNumbers = valor.replace(/\D/g, "");
    if (onlyNumbers.length !== 8) return;

    const res = await fetch(`https://viacep.com.br/ws/${onlyNumbers}/json/`);
    const data = await res.json();

    if (!data.erro) {
      setEstado(data.uf);
      setCidade(data.localidade);
      setRua(data.logradouro);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const token = localStorage.getItem("token");

    const dados = {
      nome,
      cnpj,
      email,
      telefone,
      estado,
      cidade,
      logradouro: rua,
      numero,
      cep,
      data_abertura,
      tipo: "franquia"
    };

    try {
      const res = await fetch(`${API_URL}/unidade`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(dados)
      });

      const data = await res.json();

      if (res.ok) {
        alert("Unidade criada com sucesso!");
        // Limpar campos
        setNome("");
        setCnpj("");
        setEmail("");
        setTelefone("");
        setEstado("");
        setCidade("");
        setRua("");
        setNumero("");
        setCep("");
        setDataAbertura("");
      } else {
        alert("Erro: " + data.mensagem);
      }
    } catch (error) {
      console.error("Erro ao criar unidade:", error);
      alert("Erro ao criar unidade! Veja o console.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog>
      {/* Botão que abre o modal */}
      <DialogTrigger asChild>
        <Button variant="verde" size="lg" className="flex">
          <Plus size={16} className="mr-2" />
          Nova Franquia
        </Button>
      </DialogTrigger>

      {/* Conteúdo do modal */}
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Adicionar nova franquia</DialogTitle>
            <DialogDescription>
              Preencha os dados da nova unidade e clique em salvar.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">

            {/* Nome + CNPJ */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Nome</Label>
                <Input
                  placeholder="Nome da unidade"
                  value={nome}
                  onChange={e => setNome(e.target.value)}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label>CNPJ</Label>
                <PatternFormat
                  format="##.###.###/####-##"
                  mask="_"
                  value={cnpj}
                  customInput={Input}
                  onValueChange={(v) => setCnpj(v.value)}
                  placeholder="00.000.000/0000-00"
                  required
                />
              </div>
            </div>

            {/* Email + Telefone */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Email</Label>
                <Input
                  placeholder="Email da unidade"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>

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
            </div>

            {/* Estado + Cidade */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Estado</Label>
                <DropdownEstados value={estado} onChange={setEstado} />
              </div>

              <div className="grid gap-2">
                <Label>Cidade</Label>
                <Input
                  placeholder="Cidade"
                  value={cidade}
                  onChange={e => setCidade(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Rua + Número */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Rua</Label>
                <Input
                  placeholder="Nome da rua"
                  value={rua}
                  onChange={e => setRua(e.target.value)}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label>Número</Label>
                <Input
                  placeholder="Número"
                  value={numero}
                  onChange={e => setNumero(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* CEP + Data de abertura */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>CEP</Label>
                <PatternFormat
                  format="#####-###"
                  mask="_"
                  value={cep}
                  customInput={Input}
                  onValueChange={(v) => {
                    setCep(v.value);
                    buscarCep(v.value);
                  }}
                  placeholder="00000-000"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label>Data de abertura</Label>
                <Input
                  type="date"
                  value={data_abertura}
                  onChange={e => setDataAbertura(e.target.value)}
                  required
                />
              </div>
            </div>

          </div>

          <DialogFooter className="pt-4">
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button type="submit" variant="verde">
              {isSubmitting ? "Salvando..." : "Criar unidade"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
