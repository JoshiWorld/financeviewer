"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar as CalendarIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { api } from "@/trpc/react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { PaymentType } from "@prisma/client";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { useState } from "react";

type CreateFinanceProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function CreateFinance({ isOpen, onClose }: CreateFinanceProps) {
  const { toast } = useToast();
  const createFinance = api.finance.create.useMutation({
    onSuccess: () => {
      setTitle("");
      setPaymentType(PaymentType.MONTHLY);
      setPaymentDate(new Date());
      setAmount(0);
      onClose();
      toast({
        description: "Der Eintrag wurde erstellt.",
      });
    },
  });

  const [title, setTitle] = useState<string>("");
  const [paymentType, setPaymentType] = useState<PaymentType>(
    PaymentType.MONTHLY,
  );
  const [paymentDate, setPaymentDate] = useState<Date | undefined>(new Date());
  const [amount, setAmount] = useState<number>(0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Eintrag hinzufügen</DialogTitle>
          <DialogDescription>
            Hier kannst du Fixkosten erstellen
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Beschreibung
            </Label>
            <Input
              id="title"
              type="text"
              onChange={(event) => setTitle(event.target.value)}
              value={title}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="type" className="text-right">
              Zyklus
            </Label>
            <Select
              value={paymentType}
              onValueChange={(value) => setPaymentType(value as PaymentType)}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Abrechnungszeitraum auswählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value={PaymentType.MONTHLY}>Monatlich</SelectItem>
                  <SelectItem value={PaymentType.QUARTER}>
                    Vierteljährlich
                  </SelectItem>
                  <SelectItem value={PaymentType.HALF}>Halbjährlich</SelectItem>
                  <SelectItem value={PaymentType.YEARLY}>Jährlich</SelectItem>
                  <SelectItem value={PaymentType.ONETIME}>Einmalig</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="paymentDate" className="text-right">
              Abrechnung
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-[280px] justify-start text-left font-normal",
                    !paymentDate && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {paymentDate ? (
                    format(paymentDate, "PPP")
                  ) : (
                    <span>Datum auswählen</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={paymentDate}
                  onSelect={setPaymentDate}
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="amount" className="text-right">
              Wert
            </Label>
            <Input
              id="amount"
              type="number"
              onChange={(event) => setAmount(parseFloat(event.target.value))}
              value={amount}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            type="submit"
            disabled={createFinance.isPending}
            onClick={() =>
              createFinance.mutate({
                title,
                type: paymentType,
                amount,
                paymentDate: paymentDate!.toISOString(),
              })
            }
          >
            {createFinance.isPending ? "Wird hinzugefügt.." : "Hinzufügen"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
