export default function Forbidden() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-6xl font-bold text-teal-300">403</h1>
      <p className="text-xl mt-4">Acesso negado. Você não tem permissão para acessar esta página.</p>
    </div>
  );
}
