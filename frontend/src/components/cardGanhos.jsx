import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { MiniSparklineGreen } from "./MiniSparklineGreen";

export function GanhosCard({ valor }) {
  return (
    <Card className="rounded-xl border shadow-sm p-4 w-[320px]">
      <CardHeader className="pb-1">
        <CardTitle className="text-xl font-semibold text-[#1E3A5F]">
          Ganhos
        </CardTitle>

        <CardDescription className="text-gray-500 text-sm">
          DEZ, 2025
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col">
        <span className="text-3xl font-bold text-black mb-3">
          R$
          {Number(valor || 0).toLocaleString("pt-BR", {
            minimumFractionDigits: 0,
          })}
        </span>

        <div className="w-full -mt-1">
          <MiniSparklineGreen />
        </div>
      </CardContent>
    </Card>
  );
}
