"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { LogOut, Settings, Check, ChevronsUpDown } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { DialogConfig } from "../dialogConfiguracoes/configuracoes";
import { useRouter } from "next/navigation";



export function ComboboxDemo({ usuario }) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [userImage, setUserImage] = useState(usuario?.foto || null);

  const router = useRouter();

  useEffect(() => {
    if (usuario?.foto) setUserImage(usuario.foto);
  }, [usuario]);


  const menuItems = [
    { value: "configuracoes", label: "Configurações", icon: Settings },
    { value: "sair", label: "Sair", icon: LogOut },
  ];

  function getInitials(name) {
    if (!name) return "";
    const parts = name.trim().split(" ");
    return parts
      .slice(0, 2)
      .map((p) => p[0].toUpperCase())
      .join("");
  }


  const userName = usuario?.nome || "Usuário";


  return (
    <>
      {/* Popover do combobox */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-[220px] justify-between"
          >
            <div className="flex items-center gap-2">
              {typeof userImage === "string" && userImage.trim() !== "" ? (
                <Image
                  src={userImage}
                  alt={userName}
                  width={24}
                  height={24}
                  className="rounded-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-xs font-medium uppercase">
                  {getInitials(userName)}
                </div>
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

                  // Se for CONFIGURAÇÕES
                  if (item.value === "configuracoes") {
                    return (
                      <CommandItem
                        key={item.value}
                        onSelect={() => {
                          setOpen(false);
                          setOpenDialog(true);
                        }}
                      >
                        <Icon className="mr-2 h-4 w-4" />
                        {item.label}
                      </CommandItem>
                    );
                  }

                  // Se for SAIR
                  return (
                    <CommandItem
                      key={item.value}
                      onSelect={() => {
                        setOpen(false);
                        localStorage.removeItem("token");
                        router.push("/");
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


      <DialogConfig open={openDialog} onOpenChange={setOpenDialog} onFotoAtualizada={setUserImage} />

    </>
  );
}
