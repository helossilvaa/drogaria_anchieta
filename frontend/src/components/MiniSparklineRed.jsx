import { Sparklines, SparklinesCurve } from "react-sparklines";

export function MiniSparklineRed() {
  const data = [5, 8, 6, 10, 9, 14, 20, 30]; // tendência igual ao gráfico da imagem

  return (
    <Sparklines data={data} width={140} height={80} margin={5}>
      <SparklinesCurve
        color="#e74c3c"        // Vermelho igual da imagem
        style={{
          strokeWidth: 4,      // Linha grossa como na imagem
          fill: "none",        // Sem preenchimento
          strokeLinecap: "round"
        }}
      />
    </Sparklines>
  );
}
