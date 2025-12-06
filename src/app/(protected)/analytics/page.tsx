"use client";

import { useMemo } from "react";
import { api } from "@/trpc/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AgCharts } from "ag-charts-react";
import { BarChart3, PieChart, Target, TrendingUp } from "lucide-react";
import {
  formatCurrency,
  formatPercent,
  getPnLColorClass,
  cn,
} from "@/lib/utils";

function StatsOverview() {
  const { data: stats, isLoading } = api.trades.getStats.useQuery();

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="mb-1 h-8 w-32" />
              <Skeleton className="h-3 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const cards = [
    {
      title: "Total P&L",
      value: formatCurrency(stats.totalPnl),
      description: `${stats.totalTrades} closed trades`,
      icon: TrendingUp,
      colorClass: getPnLColorClass(stats.totalPnl),
    },
    {
      title: "Win Rate",
      value: formatPercent(stats.winRate, 1).replace("+", ""),
      description: `${stats.wins}W / ${stats.losses}L`,
      icon: Target,
      colorClass: stats.winRate >= 50 ? "text-profit" : "text-loss",
    },
    {
      title: "Profit Factor",
      value:
        stats.profitFactor === Infinity ? "∞" : stats.profitFactor.toFixed(2),
      description: "Gross profit / loss",
      icon: BarChart3,
      colorClass: stats.profitFactor >= 1 ? "text-profit" : "text-loss",
    },
    {
      title: "Avg Trade",
      value: formatCurrency(
        stats.totalTrades > 0 ? stats.totalPnl / stats.totalTrades : 0
      ),
      description: `Avg win: ${formatCurrency(stats.avgWin)}`,
      icon: PieChart,
      colorClass: getPnLColorClass(
        stats.totalPnl / Math.max(stats.totalTrades, 1)
      ),
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="font-medium text-muted-foreground text-sm">
              {card.title}
            </CardTitle>
            <card.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div
              className={cn("font-bold font-mono text-2xl", card.colorClass)}
            >
              {card.value}
            </div>
            <p className="text-muted-foreground text-xs">{card.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function WinLossChart() {
  const { data: stats, isLoading } = api.trades.getStats.useQuery();

  const chartOptions = useMemo(() => {
    if (!stats) return {};

    return {
      background: { fill: "transparent" },
      data: [
        { category: "Wins", value: stats.wins, color: "#22c55e" },
        { category: "Losses", value: stats.losses, color: "#ef4444" },
        { category: "Breakeven", value: stats.breakevens, color: "#eab308" },
      ],
      series: [
        {
          type: "donut" as const,
          angleKey: "value",
          calloutLabelKey: "category",
          sectorLabelKey: "value",
          fills: ["#22c55e", "#ef4444", "#eab308"],
          innerRadiusRatio: 0.6,
        },
      ],
      legend: {
        position: "bottom" as const,
        item: {
          label: {
            color: "#94a3b8",
          },
        },
      },
    };
  }, [stats]);

  if (isLoading) {
    return <Skeleton className="h-[300px] w-full" />;
  }

  if (!stats || stats.totalTrades === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center text-muted-foreground">
        No trade data available
      </div>
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <AgCharts options={chartOptions as any} style={{ height: 300 }} />;
}

function PnLDistributionChart() {
  const { data, isLoading } = api.trades.getAll.useQuery({
    status: "closed",
    limit: 100,
  });

  const chartOptions = useMemo(() => {
    if (!data?.items) return {};

    const trades = data.items
      .filter((t) => t.netPnl)
      .map((t, i) => ({
        trade: i + 1,
        pnl: parseFloat(t.netPnl!),
        color: parseFloat(t.netPnl!) >= 0 ? "#22c55e" : "#ef4444",
      }));

    return {
      background: { fill: "transparent" },
      data: trades.slice(0, 50),
      series: [
        {
          type: "bar" as const,
          xKey: "trade",
          yKey: "pnl",
          fill: "#10b981",
          cornerRadius: 4,
          formatter: (params: { datum: { pnl: number } }) => ({
            fill: params.datum.pnl >= 0 ? "#22c55e" : "#ef4444",
          }),
        },
      ],
      axes: [
        {
          type: "category" as const,
          position: "bottom" as const,
          label: { color: "#94a3b8" },
          line: { color: "#334155" },
        },
        {
          type: "number" as const,
          position: "left" as const,
          label: {
            color: "#94a3b8",
            formatter: (params: { value: number }) => `$${params.value}`,
          },
          line: { color: "#334155" },
          gridLine: { style: [{ stroke: "#1e293b" }] },
        },
      ],
    };
  }, [data]);

  if (isLoading) {
    return <Skeleton className="h-[300px] w-full" />;
  }

  if (!data?.items || data.items.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center text-muted-foreground">
        No trade data available
      </div>
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <AgCharts options={chartOptions as any} style={{ height: 300 }} />;
}

function CumulativePnLChart() {
  const { data, isLoading } = api.trades.getAll.useQuery({
    status: "closed",
    limit: 100,
  });

  const chartOptions = useMemo(() => {
    if (!data?.items) return {};

    let cumulative = 0;
    const trades = data.items
      .filter((t) => t.netPnl)
      .reverse()
      .map((t, i) => {
        cumulative += parseFloat(t.netPnl!);
        return {
          trade: i + 1,
          pnl: cumulative,
          date: new Date(t.exitTime!).toLocaleDateString(),
        };
      });

    return {
      background: { fill: "transparent" },
      data: trades,
      series: [
        {
          type: "area" as const,
          xKey: "trade",
          yKey: "pnl",
          fill: "#10b98133",
          stroke: "#10b981",
          strokeWidth: 2,
          marker: { enabled: false },
        },
      ],
      axes: [
        {
          type: "category" as const,
          position: "bottom" as const,
          label: { color: "#94a3b8" },
          line: { color: "#334155" },
        },
        {
          type: "number" as const,
          position: "left" as const,
          label: {
            color: "#94a3b8",
            formatter: (params: { value: number }) => `$${params.value}`,
          },
          line: { color: "#334155" },
          gridLine: { style: [{ stroke: "#1e293b" }] },
        },
      ],
    };
  }, [data]);

  if (isLoading) {
    return <Skeleton className="h-[300px] w-full" />;
  }

  if (!data?.items || data.items.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center text-muted-foreground">
        No trade data available
      </div>
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <AgCharts options={chartOptions as any} style={{ height: 300 }} />;
}

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-bold text-3xl tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">
          Visualize your trading performance
        </p>
      </div>

      {/* Stats Overview */}
      <StatsOverview />

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Win/Loss Distribution</CardTitle>
            <CardDescription>Breakdown of trade outcomes</CardDescription>
          </CardHeader>
          <CardContent>
            <WinLossChart />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cumulative P&L</CardTitle>
            <CardDescription>Equity curve over time</CardDescription>
          </CardHeader>
          <CardContent>
            <CumulativePnLChart />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>P&L by Trade</CardTitle>
            <CardDescription>
              Individual trade results (last 50)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PnLDistributionChart />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
