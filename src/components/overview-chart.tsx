"use client";

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { api } from "@/trpc/react";
import { useToast } from "@/components/ui/use-toast";
import { ToastAction } from "./ui/toast";

const monthNames = [
  "Januar",
  "Februar",
  "März",
  "April",
  "Mai",
  "Juni",
  "Juli",
  "August",
  "September",
  "Oktober",
  "November",
  "Dezember",
];

const chartConfig = {
  einnahmen: {
    label: "Einnahmen",
    color: "#21b74a",
  },
  ausgaben: {
    label: "Ausgaben",
    color: "#dc2626",
  },
} satisfies ChartConfig;

export function OverviewChart({ userId }: { userId: string }) {
  const { toast } = useToast();
  const {
    data: ausgaben,
    isLoading,
    isError,
    error,
  } = api.finance.overview.useQuery();
  const user = api.user.get.useQuery({ id: userId });

  if (isLoading && user.isLoading) {
    return <p>Loading..</p>;
  }

  if (isError) {
    toast({
      variant: "destructive",
      title: "Ups! Da ist wohl etwas schiefgelaufen.",
      description: "Die Anfrage konnte nicht bearbeitet werden",
      action: <ToastAction altText="Try again">Erneut versuchen</ToastAction>,
    });
    console.log(error);
    return null;
  }

  const chartData = monthNames.map((month) => ({
    month: month,
    einnahmen: user.data?.income,
    // @ts-expect-error || @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    ausgaben: ausgaben ? ausgaben[month.toLowerCase()] || 0 : 0, // Falls keine Ausgaben vorhanden sind, setze sie auf 0
  }));

  return (
    <div className="overflow-x-auto">
      <ChartContainer config={chartConfig} className="min-h-[200px] md:min-h-[500px] w-full">
        <BarChart accessibilityLayer data={chartData}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="month"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
            tickFormatter={(value: string) => value.slice(0, 3)}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar dataKey="einnahmen" fill="var(--color-einnahmen)" radius={4} />
          <Bar dataKey="ausgaben" fill="var(--color-ausgaben)" radius={4} />
        </BarChart>
      </ChartContainer>
    </div>
  );
}
