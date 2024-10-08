"use client";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/trpc/react";
import React from "react";
import { EditFinance } from "@/components/edit-finance";
import { useQueryClient } from "@tanstack/react-query"; // Importiere useQueryClient
import { Button } from "@/components/ui/button";
import { CreateFinance } from "@/components/create-finance";
import { type PaymentType } from "@prisma/client";
import { Badge } from "@/components/ui/badge";

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

const paymentTypeLabels: Record<PaymentType, string> = {
  MONTHLY: "Monatlich",
  QUARTER: "Vierteljährlich",
  HALF: "Halbjährlich",
  YEARLY: "Jährlich",
  ONETIME: "Einmalig",
};

export function FinanceTable() {
  const [selectedMonth, setSelectedMonth] = React.useState<string>(
    new Date().getMonth().toString(),
  );
  const [selectedYear, setSelectedYear] = React.useState<string>(
    new Date().getFullYear().toString(),
  );
  const [isEditDialogOpen, setEditDialogOpen] = React.useState<boolean>(false);
  const [isCreateDialogOpen, setCreateDialogOpen] =
    React.useState<boolean>(false);
  const [selectedFinanceId, setSelectedFinanceId] = React.useState<
    string | null
  >(null);

  const queryClient = useQueryClient(); // Initialisiere queryClient

  const {
    data: finances,
    isLoading,
    isError,
    error,
  } = api.finance.getMonth.useQuery(
    { month: selectedMonth, year: parseInt(selectedYear) },
    {
      refetchOnWindowFocus: true,
      staleTime: 60000,
    },
  );
  const years = api.finance.getYears.useQuery();

  const handleChange = (value: string) => {
    setSelectedMonth(value);
  };

  const handleEdit = (financeId: string) => {
    setSelectedFinanceId(financeId);
    setEditDialogOpen(true);
  };

  const handleEditClose = () => {
    setEditDialogOpen(false);
    // @ts-expect-error || @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    queryClient.invalidateQueries([
      "finance.getMonth",
      { month: selectedMonth },
    ]); // Invalide die Query
  };

  const handleCreateClose = () => {
    setCreateDialogOpen(false);
    // @ts-expect-error || @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    queryClient.invalidateQueries([
      "finance.getMonth",
      { month: selectedMonth },
    ]); // Invalide die Query
  };

  if (isLoading && years.isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <>
      <div className="flex">
        <div>
          <Select value={selectedMonth} onValueChange={handleChange}>
            <SelectTrigger className="w-[200px]">
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
        </div>
        <div className="pl-4">
          {years.data && (
            <Select
              value={selectedYear}
              onValueChange={(value) => setSelectedYear(value)}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Jahr auswählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {years.data.map((year) => (
                    <SelectItem key={year.toString()} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      <Table>
        <TableCaption>Alle Fixkosten des Monats.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Abrechnungszyklus</TableHead>
            <TableHead>Beschreibung</TableHead>
            <TableHead>Abrechnungsdatum</TableHead>
            <TableHead className="text-right">Wert</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {finances?.map((finance) => (
            <TableRow
              key={finance.id}
              onClick={() => handleEdit(finance.id)}
              // className={
              //   isPastPayment(finance.paymentDate, finance.type)
              //     ? "bg-green-200 dark:bg-green-950"
              //     : ""
              // }
            >
              <TableCell className="font-medium">
                {paymentTypeLabels[finance.type]}
              </TableCell>
              <TableCell>
                {finance.title}
                {finance.tag && <Badge className="ml-2">{finance.tag.title}</Badge>}
              </TableCell>
              <TableCell>
                Am {new Date(finance.paymentDate).getDate()}. Tag des Monats
              </TableCell>
              <TableCell className="text-right">
                {finance.amount.toLocaleString("de-DE", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{" "}
                €
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={3}>Gesamt</TableCell>
            <TableCell className="text-right">
              {finances
                ?.reduce((total, finance) => total + finance.amount, 0)
                .toLocaleString("de-DE", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{" "}
              €
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>

      {selectedFinanceId && !isCreateDialogOpen && (
        <EditFinance
          financeId={selectedFinanceId}
          isOpen={isEditDialogOpen}
          onClose={handleEditClose}
        />
      )}

      <Button onClick={() => setCreateDialogOpen(true)}>
        Eintrag hinzufügen
      </Button>
      {!isEditDialogOpen && (
        <CreateFinance
          isOpen={isCreateDialogOpen}
          onClose={handleCreateClose}
        />
      )}
    </>
  );
}