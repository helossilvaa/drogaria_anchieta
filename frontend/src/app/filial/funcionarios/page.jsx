"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Layout from "@/components/layout/layout";
import DialogNovoFuncionario from "@/components/addFuncionario/addFuncionario";
import TableFuncionarios from "@/components/tableFuncionarios/table";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Funcionarios({ usuario }) {
  const [funcionario, setFuncionario] = useState([]);
  const [totalFuncionarios, setTotalFuncionarios] = useState(0);
  const [ativos, setAtivos] = useState(0);
  const [novos, setNovos] = useState(0);


  const router = useRouter();
  const API_URL = 'http://localhost:8080';

  useEffect(() => {
    const fetchFuncionarios = async () => {
      try {
        const API_URL = "http://localhost:8080";
        const token = localStorage.getItem("token");

        const res = await fetch(`${API_URL}/funcionarios/unidade`, {
          method: "GET",
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await res.json();

        setTotalFuncionarios(data.length);

        // Funcionários com status "Ativo"
        const ativosCount = data.filter(f => f.status === "ativo").length;
        setAtivos(ativosCount);

        // Novos funcionários (contratados neste mês)
        const hoje = new Date();
        const novosCount = data.filter(f => {
          const dataContratacao = new Date(f.dataContratacao);
          return dataContratacao.getMonth() === hoje.getMonth() &&
            dataContratacao.getFullYear() === hoje.getFullYear();
        }).length;
        setNovos(novosCount);

      } catch (err) {
        console.error("Erro ao buscar funcionários:", err);
      }
    };

    fetchFuncionarios();
  }, []);


  return (
    <Layout>
      <div className="w-full p-5">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Funcionários</h1>
          <DialogNovoFuncionario usuario={usuario} />
        </div>

        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="novo">Funcionários</TabsTrigger>
          </TabsList>


          <TabsContent value="dashboard" className="w-full mt-6">

            <div className="grid grid-cols-3 gap-4 mb-4">
              <Card>
                <CardHeader>
                  <CardTitle>FUNCIONÁRIOS TOTAIS</CardTitle>
                </CardHeader>
                <CardContent>{totalFuncionarios}</CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>FUNCIONÁRIOS ATIVOS</CardTitle>
                </CardHeader>
                <CardContent>{ativos}</CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>NOVOS FUNCIONÁRIOS</CardTitle>
                </CardHeader>
                <CardContent>{novos}</CardContent>
              </Card>

            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Produtividade</CardTitle>
                </CardHeader>
                <CardContent>10000</CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Gerenciamento de funcionários</CardTitle>
                </CardHeader>
                <CardContent>10000</CardContent>
              </Card>
            </div>
          </TabsContent>


          <TabsContent value="novo" className="w-full mt-6">
            <TableFuncionarios usuario={usuario} />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
