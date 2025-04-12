"use client";

import { useEffect, useRef } from "react";
import Chart from "chart.js/auto";
import "../../styles/profit-analysis/SalesChart.css";

const SalesChart = ({ viewMode }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  // Mock data for the last 7 days
  const getMockSalesData = () => {
    const today = new Date();
    const salesData = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);

      // Generate random sales data
      const totalRevenue = Math.floor(Math.random() * 5000) + 2000; // Between 2000 and 7000
      const totalProfit = Math.floor(
        totalRevenue * (Math.random() * 0.2 + 0.2)
      ); // 20-40% profit margin

      salesData.push({
        date,
        totalRevenue,
        totalProfit,
      });
    }

    return salesData;
  };

  useEffect(() => {
    const salesData = getMockSalesData();

    if (!salesData || salesData.length === 0) return;

    // Prepare data for chart
    const dates = salesData.map((day) => {
      return day.date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
      });
    });

    const values = salesData.map((day) =>
      viewMode === "revenue" ? day.totalRevenue : day.totalProfit
    );

    // Destroy previous chart if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Create new chart
    const ctx = chartRef.current.getContext("2d");
    chartInstance.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels: dates,
        datasets: [
          {
            label: viewMode === "revenue" ? "Revenue (₹)" : "Profit (₹)",
            data: values,
            backgroundColor:
              viewMode === "revenue"
                ? "rgba(251, 165, 24, 0.7)"
                : "rgba(168, 156, 41, 0.7)",
            borderColor:
              viewMode === "revenue"
                ? "rgb(251, 165, 24)"
                : "rgb(168, 156, 41)",
            borderWidth: 1,
            borderRadius: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: "top",
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                let label = context.dataset.label || "";
                if (label) {
                  label += ": ";
                }
                if (context.parsed.y !== null) {
                  label += new Intl.NumberFormat("en-IN", {
                    style: "currency",
                    currency: "INR",
                  }).format(context.parsed.y);
                }
                return label;
              },
            },
          },
          title: {
            display: true,
            text: "Last 7 Days Sales",
            font: {
              size: 16,
            },
          },
        },
        scales: {
          x: {
            grid: {
              display: false,
            },
            title: {
              display: true,
              text: "Date",
            },
          },
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) => {
                if (value >= 1000) {
                  return "₹" + value / 1000 + "K";
                }
                return "₹" + value;
              },
            },
            title: {
              display: true,
              text: viewMode === "revenue" ? "Revenue (₹)" : "Profit (₹)",
            },
          },
        },
      },
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [viewMode]);

  return (
    <div className="sales-chart-container">
      <canvas ref={chartRef}></canvas>
    </div>
  );
};

export default SalesChart;
