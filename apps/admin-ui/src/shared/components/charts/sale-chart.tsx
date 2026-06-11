"use client";

import Box from "apps/admin-ui/src/shared/components/box";
import React from "react";
import Chart, { Props } from "react-apexcharts";

export const SalesChart = ({
  ordersData,
}: {
  ordersData?: {
    month: string;
    count: number;
  }[];
}) => {
  const chartSeries: Props["series"] = [
    {
      name: "Sales",
      data: ordersData?.map((data) => data.count) || [
        31, 40, 28, 51, 42, 109, 100,
      ],
    },
  ];

  const chartOptions: Props["options"] = {
    chart: {
      type: "area",
      toolbar: { show: false },
      background: "transparent",
    },
    dataLabels: { enabled: false },
    stroke: {
      curve: "smooth",
      width: 2,
      colors: ["#0085ff"],
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.4,
        opacityTo: 0,
        stops: [0, 90, 100],
        colorStops: [
          { offset: 0, color: "#0085ff", opacity: 0.4 },
          { offset: 100, color: "#0085ff", opacity: 0 },
        ],
      },
    },
    xaxis: {
      categories: ordersData?.map((d) => d.month) || [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul",
      ],
      labels: { style: { colors: "#94a3b8" } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: { style: { colors: "#94a3b8" } },
    },
    grid: {
      borderColor: "#1e293b",
      strokeDashArray: 4,
    },
    tooltip: {
      theme: "dark",
    },
    theme: {
      mode: "dark",
    },
  };

  return (
    <Box css={{ width: "100%", marginTop: "16px" }}>
      <Chart
        options={chartOptions}
        series={chartSeries}
        type="area"
        height={280}
        width="100%"
      />
    </Box>
  );
};