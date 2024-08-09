"use client";

import * as React from "react";
import { Label, Pie, PieChart } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/trpc/react";

const months = [
  "Januar",
  "Februar",
  "März",
  "April",
  "Mai",
  "Juni",
  "Juli",
  "August",
  "September",
  "October",
  "November",
  "Dezember",
];

export function MonthTagsOverviewChart({
  year,
}: {
  year: string;
}) {
  const [selectedMonth, setSelectedMonth] = React.useState<string>(new Date().getMonth().toString());

  const { data: tags, isLoading } = api.finance.tagsOverview.useQuery({
    year: parseInt(year),
    month: parseInt(selectedMonth)
  });

  if(isLoading) {
    return <p>Loading..</p>;
  }

  if(tags) {
    return (
      <div className="flex flex-col items-center p-4 border-4 rounded-lg border-zinc-800 shadow-lg">
        <Select
          value={selectedMonth}
          onValueChange={(value) => setSelectedMonth(value)}
        >
          <SelectTrigger className="w-[300px]">
            <SelectValue placeholder="Select a month" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {months.map((month, index) => (
                <SelectItem key={index} value={index.toString()}>
                  {month}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <PieTagChart tags={tags} year={year} month={selectedMonth} />
      </div>
    );
  }

  return <p>Loading error..</p>;
}

type Tag = {
  tag: string;
  amount: number;
}

function PieTagChart({ tags, year, month }: { tags: Tag[], year: string, month: string }) {
  const totalAmount = tags.reduce((sum, tag) => sum + tag.amount, 0);
  const roundedTotal = Math.floor(totalAmount * 100) / 100;

  const chartConfig = tags.reduce((config, tag, index) => {
    const color = `hsl(var(--chart-${(index % 5) + 1}))`;

    config[tag.tag] = {
      label: tag.tag,
      color: color,
    };

    return config;
  }, {} as ChartConfig);

  const chartData = tags.map((tag) => ({
    tag: tag.tag,
    amount: tag.amount,
    // @ts-expect-error || @ts-ignore
    fill: chartConfig[tag.tag].color,
  }));

  return (
    <Card className="flex flex-col my-4">
      <CardHeader className="items-center pb-0">
        <CardTitle>Ausgaben nach Kategorien</CardTitle>
        <CardDescription>{months[parseInt(month)]} {year}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="amount"
              nameKey="tag"
              innerRadius={60}
              strokeWidth={5}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-xl font-bold"
                        >
                          {roundedTotal.toLocaleString()} €
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy ?? 0) + 24}
                          className="fill-muted-foreground"
                        >
                          Ausgaben
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      {/* <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none">
          Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Showing total visitors for the last 6 months
        </div>
      </CardFooter> */}
    </Card>
  );
}