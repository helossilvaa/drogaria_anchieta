import Layout from "@/components/layout/layout";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";

export default function Page() {
  return (
    <Layout>

      <main className="flex flex-1 flex-col gap-4 p-4">
        {/* Top stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4 rounded-xl shadow-sm">
            <CardContent>
              <p className="text-sm text-gray-500">Vendas de hoje</p>
              <p className="text-2xl font-bold">R$200,00</p>
              <p className="text-xs text-gray-400">7 vendas realizadas</p>
            </CardContent>
          </Card>

          <Card className="p-4 rounded-xl shadow-sm">
            <CardContent>
              <p className="text-sm text-gray-500">Produtos vendidos</p>
              <p className="text-2xl font-bold">10</p>
              <p className="text-xs text-gray-400">7 vendas realizadas</p>
            </CardContent>
          </Card>

          <Card className="p-4 rounded-xl shadow-sm">
            <CardContent>
              <p className="text-sm text-gray-500">Vendas de hoje</p>
              <p className="text-2xl font-bold">R$200,00</p>
              <p className="text-xs text-gray-400">7 vendas realizadas</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Sales funnel */}
          <Card className="p-4 rounded-xl shadow-sm col-span-2">
            <CardContent>
              <h2 className="font-semibold mb-2">Funil de vendas</h2>
              <div className="w-full h-40 bg-gray-100 rounded-xl" />
            </CardContent>
          </Card>

          {/* Top categories */}
          <Card className="p-4 rounded-xl shadow-sm">
            <CardContent>
              <h2 className="font-semibold mb-4">Top categorias</h2>
              <div className="w-full h-40 bg-gray-100 rounded-xl mb-4" />
              <ul className="text-sm space-y-1">
                <li>🟣 Cosméticos — 21,4%</li>
                <li>🟡 Remédios — 20%</li>
                <li>🟢 Conveniência — 17,8%</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Best sellers */}
          <Card className="p-4 rounded-xl shadow-sm col-span-2">
            <CardContent>
              <h2 className="font-semibold mb-4">Produtos mais vendidos</h2>
              <div className="w-full h-48 bg-gray-100 rounded-xl" />
            </CardContent>
          </Card>

          {/* Stock alerts */}
          <Card className="p-4 rounded-xl shadow-sm">
            <CardContent>
              <h2 className="font-semibold mb-4">Alertas de estoque</h2>
              <div className="space-y-3">
                <div className="p-3 bg-red-50 border rounded-xl">Buscopam 250g — Baixo</div>
                <div className="p-3 bg-red-50 border rounded-xl">Buscopam 250g — Baixo</div>
                <div className="p-3 bg-yellow-50 border rounded-xl">Buscopam 250g — Alerta</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sales peak time */}
        <Card className="p-4 rounded-xl shadow-sm">
          <CardContent>
            <h2 className="font-semibold mb-4">Quantidade de vendas por dia</h2>
            <div className="w-full h-48 bg-gray-100 rounded-xl" />
          </CardContent>
        </Card>
      </main>
    </Layout>
  );
}