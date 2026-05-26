import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

const activeChartInstances: Map<string, Chart> = new Map();

export function clearAllCharts() {
  activeChartInstances.forEach(chart => chart.destroy());
  activeChartInstances.clear();
  console.log('[Chart] Cleared all active chart instances.');
}

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

export interface ChartDataset {
  label: string;
  data: number[];
}

export function renderMultiDatasetChart(
  canvasId: string,
  type: 'bar' | 'line' | 'pie',
  labels: string[],
  datasets: ChartDataset[],
  chartTitle: string
) {
  const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
  if (!canvas) {
    console.error(`[Chart] Canvas with id ${canvasId} not found.`);
    return;
  }

  // Destroy previous chart instance for this canvas if exists
  const existing = activeChartInstances.get(canvasId);
  if (existing) {
    existing.destroy();
    activeChartInstances.delete(canvasId);
  }

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const isPie = type === 'pie';

  // Map datasets to Chart.js format, assigning distinct colors from our F1 palette
  const formattedDatasets = datasets.map((ds, index) => {
    const colorIndex = index % CHART_PALETTE.length;
    const bgColor = CHART_PALETTE[colorIndex];
    const borderColor = CHART_BORDER_PALETTE[colorIndex];

    return {
      label: ds.label,
      data: ds.data,
      backgroundColor: bgColor,
      borderColor: borderColor,
      borderWidth: 2,
      hoverBackgroundColor: borderColor,
      tension: 0.35,
      fill: type === 'line' ? {
        target: 'origin',
        above: bgColor.replace('0.85', '0.05') // Subtle transparent glow
      } : false
    };
  });

  const chartData = {
    labels: labels,
    datasets: formattedDatasets
  };

  // Standard Dark Theme Chart Options
  const chartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true, // Always display legends when there are multiple datasets!
        position: 'top',
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
        displayColors: true
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

  const newInstance = new Chart(ctx, {
    type: type,
    data: chartData,
    options: chartOptions
  });

  activeChartInstances.set(canvasId, newInstance);
  console.log(`[Chart] Successfully rendered dynamic multi-dataset '${type}' chart: "${chartTitle}"`);
}

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

  // Destroy previous chart instance for this canvas if exists
  const existing = activeChartInstances.get(canvasId);
  if (existing) {
    existing.destroy();
    activeChartInstances.delete(canvasId);
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
  }

  // Create new chart instance
  const newInstance = new Chart(ctx, {
    type: type,
    data: chartData,
    options: chartOptions
  });

  activeChartInstances.set(canvasId, newInstance);

  console.log(`[Chart] Successfully rendered dynamic '${type}' chart for: "${chartLabel}"`);
}
