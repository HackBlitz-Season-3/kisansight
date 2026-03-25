import { useEffect, useRef } from "react";
import { Chart, registerables } from "chart.js";
Chart.register(...registerables);

export default function ForecastChart({ forecast }) {
  const ref = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!forecast || !ref.current) return;
    if (chartRef.current) chartRef.current.destroy();

    const hist = forecast.historical || [];
    const fut  = forecast.forecast  || [];

    const histLabels = hist.map(d => d.date?.slice(0, 7));
    const histPrices = hist.map(d => d.price);
    const futLabels  = fut.map(d => d.date?.slice(0, 7));
    const futPrices  = fut.map(d => d.price);
    const futUpper   = fut.map(d => d.upper);
    const futLower   = fut.map(d => d.lower);
    const allLabels  = [...histLabels, ...futLabels];

    chartRef.current = new Chart(ref.current, {
      type: "line",
      data: {
        labels: allLabels,
        datasets: [
          {
            label: "Historical Price",
            data: [...histPrices, ...new Array(futLabels.length).fill(null)],
            borderColor: "#2d8a47", backgroundColor: "rgba(45,138,71,0.08)",
            borderWidth: 2, pointRadius: 3, tension: 0.4, fill: true,
          },
          {
            label: "Forecast",
            data: [...new Array(histLabels.length).fill(null), ...futPrices],
            borderColor: "#f97316", borderDash: [6, 4],
            borderWidth: 2.5, pointRadius: 5, tension: 0.3,
          },
          {
            label: "Upper",
            data: [...new Array(histLabels.length).fill(null), ...futUpper],
            borderColor: "rgba(249,115,22,0.2)", backgroundColor: "rgba(249,115,22,0.07)",
            borderWidth: 1, pointRadius: 0, fill: "+1",
          },
          {
            label: "Lower",
            data: [...new Array(histLabels.length).fill(null), ...futLower],
            borderColor: "rgba(249,115,22,0.2)", borderWidth: 1, pointRadius: 0, fill: false,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: "top", labels: { usePointStyle: true, font: { size: 12 } } },
          tooltip: { callbacks: { label: ctx => `₹${ctx.parsed.y?.toFixed(0)} / qtl` } },
        },
        scales: {
          y: { title: { display: true, text: "₹ / quintal" }, grid: { color: "rgba(0,0,0,0.04)" } },
          x: { grid: { display: false } },
        },
      },
    });
  }, [forecast]);

  return <canvas ref={ref} height={110} />;
}
