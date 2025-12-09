"use client"
import { Separator } from "@/components/ui/separator";

export default function DashboardFinanceiro(){
    return(
<>
<header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="p-4 flex flex-col">
          <span className="text-gray-900 font-semibold">Saldo</span>
          <span className= "font-bold text-3xl" >
          </span>
        </div>

        <div className="grid auto-rows-min gap-4 md:grid-cols-3">
          <div className="bg-muted/50 aspect-video rounded-xl">
            <span className="text-gray-700 font-semibold">Entradas</span>
            <span className="text-green-700 font-bold text-2xl">

            </span>
          </div>
          <div className="bg-muted/50 aspect-video rounded-xl">
            <span className="text-gray-700 font-semibold">Saídas</span>
            <span className="text-red-700 font-bold text-2xl">
            </span>
          </div>
          <div className="bg-muted/50 aspect-video rounded-xl">
            <span className="text-gray-700 font-semibold">Lucro Líquido Total</span>
            <span className="text-blue-700 font-bold text-2xl">
            </span>
          </div>
        </div>
</div>
</>
    );
}