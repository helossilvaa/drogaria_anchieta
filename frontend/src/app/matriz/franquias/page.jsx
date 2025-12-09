"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import Layout from "@/components/layout/layout";
import DialogFranquia from "@/components/addFranquia/adicionarFranquia";
import TableFranquias from "@/components/tableFranquias/table";

export default function Franquia() {
    return (
        <Layout>
            <div className="w-full p-3 sm:p-5 overflow-x-hidden">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-6 ">
                <h1 className="text-2xl font-bold">Franquias</h1>
                <div className="w-full sm:w-auto">
                    <DialogFranquia />
                </div>
            </div>
            <TableFranquias />
            </div>
        </Layout>
    );
}