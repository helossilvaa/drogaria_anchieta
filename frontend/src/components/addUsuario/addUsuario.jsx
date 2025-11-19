"use client";

import React, { useEffect, useState } from "react";
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose,
} from "../ui/dialog";
import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectGroup,
    SelectLabel,
    SelectItem,
    SelectValue,
} from "../ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Plus } from "lucide-react";
import DropdownEstados from "@/components/dropdownEstados/dropdownEstados";
import DropdownCidades from "../dropdownCidades/cidades";
import InputTelefoneComPais from '../InputTelefone/telefone';
import { PatternFormat } from "react-number-format";
import { CalendarioConfig } from "../calendarioConfig/calendario";

export default function DialogNovoUsuario() {

    const [departamentos, setDepartamentos] = useState([]);
    const [unidades, setUnidades] = useState([]);
    const [estado, setEstado] = useState("");
    const [cidade, setCidade] = useState("");
    const [datanascimento, setDatanascimento] = useState("")
    const [rua, setRua] = useState("");
    const [cep, setCep] = useState("");
    const [telefone, setTelefone] = useState("");
    const [cpf, setCpf] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const API_URL = "http://localhost:8080";
        const token = localStorage.getItem("token") || "";

        const fetchData = async (endpoint, setter) => {
            try {
                const res = await fetch(`${API_URL}/${endpoint}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await res.json();
                setter(data);
            } catch (err) {
                console.error(`Erro ao buscar /${endpoint}:`, err);
            }
        };

        Promise.all([
            fetchData("unidade", setUnidades),
            fetchData("departamento", setDepartamentos),
        ]).finally(() => setIsLoading(false));
    }, []);


    const buscarCep = async (valor) => {
        const cep = valor.replace(/\D/g, "");

        if (cep.length !== 8) return;

        try {
            const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            const data = await res.json();

            if (data.erro) {
                console.log("CEP não encontrado");
                return;
            }

            setEstado(data.uf);
            setCidade(data.localidade);
            setRua(data.logradouro);
        } catch (err) {
            console.error("Erro ao buscar CEP:", err);
        }
    };


    return (
        <Dialog>
            <form>
                <DialogTrigger asChild>
                    <Button variant="verde" size="lg" className="flex">
                        <Plus size={16} className="mr-2" />
                        Adicionar novo usuário
                    </Button>
                </DialogTrigger>

                <DialogContent className="!max-w-[900px]">
                    <DialogHeader>
                        <DialogTitle>Adicionar novo usuário</DialogTitle>
                        <DialogDescription>
                            Preencha os dados do novo usuário e clique em salvar.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4">
                        {/* Nome + CPF */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Nome</Label>
                                <Input placeholder="Nome completo" />
                            </div>
                            <div className="grid gap-2">
                                <InputTelefoneComPais value={telefone} onChange={setTelefone} />
                            </div>


                        </div>

                        {/* Gênero + Email + Telefone */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="grid gap-2">
                                <Label>CPF</Label>
                                <PatternFormat
                                    format="###.###.###-##"
                                    mask="_"
                                    value={cpf}
                                    onValueChange={(values) => setCpf(values.value)}
                                    customInput={Input}
                                    placeholder="000.000.000-00"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>Data de nascimento</Label> 
                                <CalendarioConfig/>
                            </div>
                            <div className="grid gap-2">
                                <Label>Email</Label>
                                <Input placeholder="Email do usuário" />
                            </div>
                            
                           
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            <div className="grid gap-2">
                                <Label>Gênero</Label>
                                <Select>
                                    <SelectTrigger className="w-[275px]">
                                        <SelectValue placeholder="Selecione um gênero" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectLabel>Gêneros</SelectLabel>
                                            <SelectItem value="feminino">Feminino</SelectItem>
                                            <SelectItem value="masculino">Masculino</SelectItem>
                                            <SelectItem value="nao-binario">Não-binário</SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label>Unidade</Label>
                                <Select>
                                    <SelectTrigger className="w-[275px]">
                                        <SelectValue placeholder="Selecione a unidade" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectLabel>Unidades</SelectLabel>
                                            {unidades.map((unidade) => (
                                                <SelectItem
                                                    key={unidade.id}
                                                    value={unidade.nome}
                                                >
                                                    {unidade.nome}
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-2">
                                <Label>Departamento</Label>
                                <Select>
                                    <SelectTrigger className="w-[275px]">
                                        <SelectValue placeholder="Selecione um setor" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectLabel>Departamentos</SelectLabel>
                                            {departamentos.map((departamento) => (
                                                <SelectItem
                                                    key={departamento.id}
                                                    value={departamento.departamento}
                                                >
                                                    {departamento.departamento}
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        {/* CEP + Rua + Estado + Cidade */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="grid gap-2">
                                <Label>CEP</Label>

                                <PatternFormat
                                    format="#####-###"
                                    mask="_"
                                    value={cep}
                                    customInput={Input}
                                    placeholder="00000-000"
                                    onValueChange={(v) => {
                                        setCep(v.value);
                                        buscarCep(v.value);
                                    }}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label>Rua</Label>
                                <Input
                                    placeholder="Nome da rua"
                                    value={rua}
                                    onChange={(e) => setRua(e.target.value)}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label>Número</Label>
                                <Input placeholder="Número" />
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
                                <DropdownCidades
                                    estadoSigla={estado}
                                    value={cidade}
                                    onChange={setCidade}
                                />
                            </div>
                        </div>

                        {/* Unidade + Departamento */}

                    </div>

                    <DialogFooter className="pt-4">
                        <DialogClose asChild>
                            <Button variant="outline">Cancelar</Button>
                        </DialogClose>

                        <Button type="submit" variant="verde">
                            Criar usuário
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </form>
        </Dialog>
    );
}
