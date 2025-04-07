"use client"

import { Line, Bar, Pie } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  type ChartOptions,
} from "chart.js"

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
)

interface ChartData {
  name: string
  value: number
}

const defaultLineOptions: ChartOptions<"line"> = {
  responsive: true,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      mode: "index",
      intersect: false,
    },
  },
  hover: {
    mode: "nearest",
    intersect: true,
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        callback: (value) => `$${value}`,
      },
    },
  },
}

const defaultBarOptions: ChartOptions<"bar"> = {
  responsive: true,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      mode: "index",
      intersect: false,
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        callback: (value) => `$${value}`,
      },
    },
  },
}

const colors = [
  "rgba(75, 85, 99, 0.5)",
  "rgba(59, 130, 246, 0.5)",
  "rgba(16, 185, 129, 0.5)",
  "rgba(245, 158, 11, 0.5)",
  "rgba(239, 68, 68, 0.5)",
  "rgba(139, 92, 246, 0.5)",
]

export function LineChart({ data }: { data: ChartData[] }) {
  const chartData = {
    labels: data.map((item) => item.name),
    datasets: [
      {
        data: data.map((item) => item.value),
        borderColor: "rgb(75, 85, 99)",
        backgroundColor: "rgba(75, 85, 99, 0.5)",
        tension: 0.4,
        fill: true,
      },
    ],
  }

  return <Line options={defaultLineOptions} data={chartData} />
}

export function BarChart({ data }: { data: ChartData[] }) {
  const chartData = {
    labels: data.map((item) => item.name),
    datasets: [
      {
        data: data.map((item) => item.value),
        backgroundColor: data.map((_, i) => colors[i % colors.length]),
        borderColor: data.map((_, i) => colors[i % colors.length].replace("0.5", "1")),
        borderWidth: 1,
      },
    ],
  }

  return <Bar options={defaultBarOptions} data={chartData} />
}

export function PieChart({ data }: { data: ChartData[] }) {
  const chartData = {
    labels: data.map((item) => item.name),
    datasets: [
      {
        data: data.map((item) => item.value),
        backgroundColor: data.map((_, i) => colors[i % colors.length]),
        borderColor: data.map((_, i) => colors[i % colors.length].replace("0.5", "1")),
        borderWidth: 1,
      },
    ],
  }

  const pieOptions: ChartOptions<"pie"> = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: "right",
      },
      tooltip: {
        mode: "index",
        intersect: false,
      },
    },
  }

  return <Pie options={pieOptions} data={chartData} />
}
