"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FloatingInput } from "./ui/floatinglabel";
import { useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Image from "next/image";

export function LoginForm() {

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const API_URL = "http://localhost:8080";

  const login = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErro("");

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha }),
      });

      const data = await res.json();

      if (res.ok && data.token) {
        localStorage.setItem("token", data.token);
        toast.success("Login realizado com sucesso!");
        const departamento = data.usuario?.departamento; 
    
        setTimeout(() => {
          if (departamento === "diretor geral") router.push("/matriz");
          else if (departamento === "diretor administrativo") router.push("/filial");
          else if (departamento === "gerente") router.push("/filial");
          else router.push("/pdv");
        }, 1000);
      } else {
        setErro(data.error || "Credenciais inválidas");
        toast.error(data.error || "Credenciais inválidas");
      }
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      setErro("Erro na requisição. Verifique sua conexão.");
      toast.error("Erro na requisição. Verifique sua conexão.");
    } finally {
      setLoading(false);
    }
    
   

  };

  return (
    <div className="flex flex-col md:flex-row h-screen">
      <ToastContainer position="top-right" autoClose={2000} pauseOnHover={false} theme="light" />
      <div className="hidden md:flex w-1/2 bg-gradient-to-r from-teal-300 to-red-300 items-center">
        <div className="container flex justify-end items-center">
          <h2 className="bg-white w-50 p-4 rounded-l-full font-bold text-center">LOGIN</h2>
        </div>
      </div>

      
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-6 md:p-10">
        <Image
          src="/logo.png"
          width={250}
          height={150}
          alt="Logo Drogaria Anchieta"
          className="mb-6"
        />

        <form
          onSubmit={login}
          className="w-full max-w-md space-y-6 flex flex-col justify-center items-center"
        >
          <div className="w-full space-y-6">
            <FloatingInput
              id="email"
              type="email"
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <FloatingInput
              id="senha"
              type="password"
              label="Senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />
          </div>

          <Button
            type="submit"
            variant="verde"
            size="verde"
            className="w-full mt-4"
            disabled={loading}
          >
            {loading ? "Entrando..." : "Entrar"}
          </Button>
        </form>
      </div>
    </div>
  );
}
