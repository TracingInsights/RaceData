import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

let activeChartInstance: Chart | null = null;

const F1_COLORS = {
  red: 'rgba(225, 6, 0, 0.85)',
  redSolid: '#e10600',
  cyan: 'rgba(6, 182, 212, 0.85)',
  cyanSolid: '#06b6d4',
  green: 'rgba(16, 185, 129, 0.85)',
  greenSolid: '#10b981',
  yellow: 'rgba(245, 158, 11, 0.85)',
  yellowSolid: '#f59e0b',
  purple: 'rgba(139, 92, 246, 0.85)',
  purpleSolid: '#8b5cf6',
  white: 'rgba(255, 255, 255, 0.9)',
  whiteSolid: '#ffffff'
};

const CHART_PALETTE = [
  F1_COLORS.red,
  F1_COLORS.cyan,
  F1_COLORS.green,
  F1_COLORS.yellow,
  F1_COLORS.purple,
  F1_COLORS.white
];

const CHART_BORDER_PALETTE = [
  F1_COLORS.redSolid,
  F1_COLORS.cyanSolid,
  F1_COLORS.greenSolid,
  F1_COLORS.yellowSolid,
  F1_COLORS.purpleSolid,
  F1_COLORS.whiteSolid
];

export function renderChart(
  canvasId: string,
  type: 'bar' | 'line' | 'pie',
  labels: string[],
  values: number[],
  chartLabel: string
) {
  const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
  if (!canvas) {
    console.error(`[Chart] Canvas with id ${canvasId} not found.`);
    return;
  }

  // Destroy previous chart instance if exists
  if (activeChartInstance) {
    activeChartInstance.destroy();
    activeChartInstance = null;
  }

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const isPie = type === 'pie';
  
  // Set up chart data configurations
  const chartData = {
    labels: labels,
    datasets: [{
      label: chartLabel,
      data: values,
      backgroundColor: isPie ? CHART_PALETTE.slice(0, labels.length) : F1_COLORS.red,
      borderColor: isPie ? CHART_BORDER_PALETTE.slice(0, labels.length) : F1_COLORS.redSolid,
      borderWidth: 1.5,
      hoverBackgroundColor: isPie ? CHART_BORDER_PALETTE.slice(0, labels.length) : 'rgba(225, 6, 0, 1)',
      tension: 0.35, // Smooth curve for line charts
      fill: type === 'line' ? {
        target: 'origin',
        above: 'rgba(225, 6, 0, 0.05)' // Subtle glow under line chart
      } : false
    }]
  };

  // Standard Dark Theme Chart Options
  const chartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: isPie, // Only show legends for Pie charts
        position: 'right',
        labels: {
          color: '#cbd5e1', // Slate 300
          font: {
            family: 'Inter',
            size: 11
          }
        }
      },
      tooltip: {
        backgroundColor: '#15151e',
        titleColor: '#ffffff',
        titleFont: {
          family: 'Outfit',
          weight: 'bold'
        },
        bodyColor: '#cbd5e1',
        bodyFont: {
          family: 'Inter'
        },
        borderColor: 'rgba(255,255,255,0.08)',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 6,
        displayColors: isPie
      }
    },
    scales: isPie ? {} : {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.04)',
          drawBorder: false
        },
        ticks: {
          color: '#94a3b8', // Slate 400
          font: {
            family: 'Inter',
            size: 11
          },
          maxRotation: 45,
          minRotation: 0
        }
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.04)',
          drawBorder: false
        },
        ticks: {
          color: '#94a3b8',
          font: {
            family: 'Inter',
            size: 11
          }
        }
      }
    }
  };

  // Adjust Line Chart styling specifically
  if (type === 'line') {
    chartData.datasets[0].backgroundColor = F1_COLORS.cyan;
    chartData.datasets[0].borderColor = F1_COLORS.cyanSolid;
    chartData.datasets[0].hoverBackgroundColor = F1_COLORS.cyanSolid;
    chartData.datasets[0].fill = {
      target: 'origin',
      above: 'rgba(6, 182, 212, 0.05)'
    };
    if (chartOptions.scales && chartOptions.scales.y) {
      // Line charts look great with grid lines
    }
  }

  // Create new chart instance
  activeChartInstance = new Chart(ctx, {
    type: type,
    data: chartData,
    options: chartOptions
  });

  console.log(`[Chart] Successfully rendered dynamic '${type}' chart for: "${chartLabel}"`);
}
