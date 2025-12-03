"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import Layout  from "@/components/layout/layout";
import DialogFranquia from "@/components/addFranquia/adicionarFranquia";
import TableFranquias from "@/components/tableFranquias/table";

export default function Franquia () {

    const [franquia, setFranquia] = useState([]);

    

    const router = useRouter();


    return (
        <Layout>
        <DialogFranquia/>
        <TableFranquias/>
        </Layout>
    );
}