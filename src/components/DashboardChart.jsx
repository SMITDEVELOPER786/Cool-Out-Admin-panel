import React, { useState } from "react";
import ReactApexChart from "react-apexcharts";

const DashboardChart = () => {
  const [period, setPeriod] = useState("week");

  const series = [
    {
      name: "Active Users",
      data:
        period === "week"
          ? [30, 45, 60, 50, 70, 90, 120]
          : [200, 400, 350, 500, 600, 700, 650, 800, 900, 1000, 950, 1100],
    },
  ];

  const options = {
    chart: {
      type: "area",
      height: 350,
      toolbar: { show: false },
    },
    colors: ["#9EC7C9"], // theme color
    dataLabels: { enabled: false },
    stroke: { curve: "smooth", width: 2 },
    xaxis: {
      categories:
        period === "week"
          ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
          : ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
      labels: { style: { colors: "#6B7280" } },
    },
    yaxis: { min: 0 },
    grid: { borderColor: "#E5E7EB" },
  };

  return (
    <div
      style={{
        marginTop: "24px",
        paddingLeft: "5px",
         marginLeft:"20px",
        padding: "20px 20px 20px 20px",
        borderRadius: "12px",
        border: "1px solid #E5E7EB",
        backgroundColor: "#ffffff",
        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "16px",
        }}
      >
        <h3 style={{ fontSize: "15px", fontWeight: "600", color: "#333"  ,paddingLeft:"3px"}}>
          User Activity
        </h3>
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={() => setPeriod("week")}
            style={{
              padding: "6px 12px",
              fontSize: "14px",
              borderRadius: "6px",
              border: "none",
              cursor: "pointer",
              backgroundColor: period === "week" ? "#9EC7C9" : "#E5E7EB",
              color: period === "week" ? "#fff" : "#333",
              transition: "background 0.3s",
            }}
          >
            Week
          </button>
          <button
            onClick={() => setPeriod("month")}
            style={{
              padding: "6px 6px",
              fontSize: "14px",
              borderRadius: "6px",
              border: "none",
              cursor: "pointer",
              backgroundColor: period === "month" ? "#9EC7C9" : "#E5E7EB",
              color: period === "month" ? "#fff" : "#333",
              transition: "background 0.3s",
            }}
          >
            Month
          </button>
        </div>
      </div>
      <ReactApexChart options={options} series={series} type="area" height={300} />
    </div>
  );
};

export default DashboardChart;
