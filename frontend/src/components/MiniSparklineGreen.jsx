import { Sparklines, SparklinesCurve } from "react-sparklines";

export function MiniSparklineGreen() {
  // --- Mesma tendência crescente da imagem ---
  const data = [5, 9, 8, 14, 13, 18, 25, 30];

  return (
    <Sparklines data={data} width={140} height={80} margin={5}>
      <SparklinesCurve
        color="#27ae60"        // Verde mais intenso e igual ao da imagem
        style={{
          strokeWidth: 4,      // Linha mais grossa
          fill: "none",        // Sem preenchimento
          strokeLinecap: "round"
        }}
      />
    </Sparklines>
  );
}
