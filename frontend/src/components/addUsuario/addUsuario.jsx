import React, { useEffect } from 'react';
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
import { Select, SelectTrigger, SelectContent, SelectGroup, SelectLabel, SelectItem, SelectValue} from '../ui/select';
import { Calendar } from '../ui/calendar';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import DropdownEstados from '@/components/dropdownEstados/dropdownEstados';
import { useState } from 'react';

export default function DialogNovoUsuario() {

    const [setor, setSetor] = useState([]);

    useEffect (() => {
        const fetchDate = async () => {
            try {
                const res = await fetch(`${API_URL}/departamento`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (!res.ok) throw new Error('Erro ao buscar ');

                const data = await res.json();
                setChamados(data);
                
            } catch (error) {
                
            }
        };
    },[]) 

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
                        {/* Nome + CNPJ */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Nome</Label>
                                <Input placeholder="Nome completo" />
                            </div>
                            <div className="grid gap-2">
                                <Label>CPF</Label>
                                <Input placeholder="CPF" />
                            </div>
                        </div>

                        {/* Email + Telefone */}
                        <div className="grid grid-cols-3 gap-2">
                        <div className="grid gap-2">
                                <Label>Gênero</Label>
                                <Select>
                                    <SelectTrigger className="w-[200px]">
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
                                <Label>Email</Label>
                                <Input placeholder="Email do usuário" />
                            </div>
                            <div className="grid gap-2">
                                <Label>Telefone</Label>
                                <Input placeholder="Telefone de contato" />
                            </div>
                        </div>

                        {/* Estado + Cidade */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Estado</Label>
                                <DropdownEstados />
                            </div>
                            <div className="grid gap-2">
                                <Label>Cidade</Label>
                                <Input placeholder="Cidade" />
                            </div>
                        </div>

                        {/* Rua + Número */}
                        <div className="grid grid-cols-3 gap-4">
                        <div className="grid gap-2">
                                <Label>CEP</Label>
                                <Input placeholder="CEP" />
                            </div>
                            <div className="grid gap-2">
                                <Label>Rua</Label>
                                <Input placeholder="Nome da rua" />
                            </div>
                            <div className="grid gap-2">
                                <Label>Número</Label>
                                <Input placeholder="Número" />
                            </div>
                        </div>

                        
                        <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                                <Label>Unidade</Label>
                                <Select>
                                    <SelectTrigger className="w-[200px]">
                                        <SelectValue placeholder="Selecione a unidade" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectLabel>Gêneros</SelectLabel>
                                            <SelectItem value="feminino">Unidade São Bernardo 123</SelectItem>
                                            <SelectItem value="masculino">Unidade São Bernardo 321</SelectItem>
                                            <SelectItem value="nao-binario">Unidade Santo André 222 </SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label>Setor</Label>
                                <Select>
                                    <SelectTrigger className="w-[200px]">
                                        <SelectValue placeholder="Selecione um setor" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectLabel>Setor</SelectLabel>
                                            <SelectItem value=""></SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>


                    <DialogFooter className="pt-4">
                        <DialogClose asChild>
                            <Button variant="outline">Cancelar</Button>
                        </DialogClose>
                        <Button type="submit" variant="verde">Criar unidade</Button>
                    </DialogFooter>
                </DialogContent>
            </form>
        </Dialog>
    );
};
