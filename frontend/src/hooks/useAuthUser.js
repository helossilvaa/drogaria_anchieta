"use client";

import { useEffect, useState } from "react";

export function useAuthUser() {
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("usuario");
      if (storedUser) {
        setUsuario(JSON.parse(storedUser));
      }
    }
  }, []);

  return usuario;
}