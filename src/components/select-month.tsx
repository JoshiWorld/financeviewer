"use client";

import * as React from "react";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const months = [
  { value: "0", label: "Januar" },
  { value: "1", label: "Februar" },
  { value: "2", label: "März" },
  { value: "3", label: "April" },
  { value: "4", label: "Mai" },
  { value: "5", label: "Juni" },
  { value: "6", label: "Juli" },
  { value: "7", label: "August" },
  { value: "8", label: "September" },
  { value: "9", label: "Oktober" },
  { value: "10", label: "November" },
  { value: "11", label: "Dezember" },
];

interface SelectMonthProps {
  onMonthChange: (month: string) => void;
}

export function SelectMonth({ onMonthChange }: SelectMonthProps) {
  const [selectedMonth, setSelectedMonth] = React.useState<string>(
    new Date().getMonth().toString(),
  );

  const handleChange = (value: string) => {
    setSelectedMonth(value);
    onMonthChange(value);
  };

  return (
    <Select value={selectedMonth} onValueChange={handleChange}>
      <SelectTrigger className="w-[300px]">
        <SelectValue placeholder="Abrechnungszeitraum auswählen" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {months.map((month) => (
            <SelectItem key={month.value} value={month.value}>
              {month.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
