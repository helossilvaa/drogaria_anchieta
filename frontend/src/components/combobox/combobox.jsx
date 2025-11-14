"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { LogOut, Settings, ChevronsUpDown } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DialogConfig } from "../dialogConfiguracoes/configuracoes";
import { useRouter } from "next/navigation";

export function ComboboxDemo({ usuario, onFotoAtualizada }) {
  const [open, setOpen] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [userImage, setUserImage] = useState(usuario?.funcionario?.foto || usuario?.foto || null);

  const router = useRouter();

  useEffect(() => {
    setUserImage(usuario?.funcionario?.foto || usuario?.foto || null);
  }, [usuario]);

  const menuItems = [
    { value: "configuracoes", label: "Configurações", icon: Settings },
    { value: "sair", label: "Sair", icon: LogOut },
  ];

  const getInitials = (name) => {
    if (!name) return "";
    const parts = name.trim().split(" ");
    return parts.slice(0, 2).map(p => p[0].toUpperCase()).join("");
  };

  const userName = usuario?.funcionario?.nome || usuario?.nome || "Usuário";

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" role="combobox" aria-expanded={open} className="w-[220px] justify-between">
            <div className="flex items-center gap-2">
              {typeof userImage === "string" && userImage.includes("base64") ? (
                <Image
                  src={userImage}
                  alt={userName}
                  width={24}
                  height={24}
                  className="rounded-full"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-gray-300" />
              )}


              <span className="font-medium">{userName}</span>
            </div>
            <ChevronsUpDown className="opacity-50 h-4 w-4" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-[220px] p-0">
          <Command>
            <CommandList>
              <CommandGroup>
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <CommandItem
                      key={item.value}
                      onSelect={() => {
                        setOpen(false);
                        if (item.value === "configuracoes") {
                          setOpenDialog(true);
                        } else if (item.value === "sair") {
                          localStorage.removeItem("token");
                          router.push("/");
                        }
                      }}
                    >
                      <Icon className="mr-2 h-4 w-4" />
                      {item.label}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <DialogConfig
        open={openDialog}
        usuario={usuario}
        onOpenChange={setOpenDialog}
        onFotoAtualizada={(novaFoto, isFuncionario = false) => {
          setUserImage(novaFoto);
          if (onFotoAtualizada) onFotoAtualizada(novaFoto, isFuncionario);
        }}
      />
    </>
  );
}
