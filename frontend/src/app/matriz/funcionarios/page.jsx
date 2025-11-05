"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import DialogNovoUsuario from "@/components/addUsuario/addUsuario";
import Layout  from "@/components/layout/layout";


export default function Funcionarios () {

    const [funcionario, setFuncionario] = useState([]);
    

    const router = useRouter();

   const API_URL = 'http://localhost:8080';

    


    return (
        <Layout>
           <DialogNovoUsuario/>
        </Layout>
    );
}