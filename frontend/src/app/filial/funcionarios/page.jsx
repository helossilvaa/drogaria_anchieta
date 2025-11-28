"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import Layout  from "@/components/layout/layout";
import DialogNovoFuncionario from "@/components/addFuncionario/addFuncionario";
import TableFuncionarios from '@/components/tableFuncionarios/table'

export default function Funcionarios () {

    const [funcionario, setFuncionario] = useState([]);
    

    const router = useRouter();

   const API_URL = 'http://localhost:8080';
    return (
        <Layout>
           <DialogNovoFuncionario/>
           <TableFuncionarios/>
        </Layout>
    );
}