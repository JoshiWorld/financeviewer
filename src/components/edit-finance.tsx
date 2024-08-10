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
import { ToastAction } from "@/components/ui/toast";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { PaymentType } from "@prisma/client";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { TagSelector } from "./tag-selector";

type EditFinanceProps = {
  financeId: string;
  isOpen: boolean;
  onClose: () => void;
};

export function EditFinance({ financeId, isOpen, onClose }: EditFinanceProps) {
  const { toast } = useToast();
  const {
    data: finance,
    isLoading,
    isError,
    error,
  } = api.finance.get.useQuery({ id: financeId });
  const tagsQuery = api.user.getTags.useQuery();
  const user = api.user.get.useQuery();

  const editFinance = api.finance.update.useMutation({
    onSuccess: () => {
      onClose();
      toast({
        description: "Der Eintrag wurde erfolgreich bearbeitet",
      });
    },
  });
  const deleteFinance = api.finance.delete.useMutation({
    onSuccess: () => {
      onClose();
      toast({
        variant: "destructive",
        description: "Der Eintrag wurde erfolgreich gelöscht",
      });
    },
  });

  const [title, setTitle] = useState<string>("");
  const [paymentType, setPaymentType] = useState<PaymentType>(
    PaymentType.MONTHLY,
  );
  const [paymentDate, setPaymentDate] = useState<Date | undefined>(new Date());
  const [amount, setAmount] = useState<number>(0);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  useEffect(() => {
    if (isError) {
      toast({
        variant: "destructive",
        title: "Ups! Da ist wohl etwas schiefgelaufen.",
        description: "Die Anfrage konnte nicht bearbeitet werden",
        action: <ToastAction altText="Try again">Erneut versuchen</ToastAction>,
      });
      console.log(error);
    }

    if (finance) {
      setTitle(finance.title);
      setPaymentType(finance.type);
      setPaymentDate(finance.paymentDate);
      setAmount(finance.amount);
      if(finance.tag) {
        setSelectedTag(finance.tag?.title);
      }
    }
  }, [isError, toast, error, finance]);

  if(isLoading && tagsQuery.isLoading && user.isLoading) {
    return <p>Loading..</p>
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Bearbeiten</DialogTitle>
          <DialogDescription>
            Diese Aktion kann nicht rückgängig gemacht werden. Bearbeite die
            Details der Fixkosten.
          </DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <div>Loading...</div>
        ) : (
          finance && (
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
                  onValueChange={(value) =>
                    setPaymentType(value as PaymentType)
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Abrechnungszeitraum auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value={PaymentType.MONTHLY}>
                        Monatlich
                      </SelectItem>
                      <SelectItem value={PaymentType.QUARTER}>
                        Vierteljährlich
                      </SelectItem>
                      <SelectItem value={PaymentType.HALF}>
                        Halbjährlich
                      </SelectItem>
                      <SelectItem value={PaymentType.YEARLY}>
                        Jährlich
                      </SelectItem>
                      <SelectItem value={PaymentType.ONETIME}>
                        Einmalig
                      </SelectItem>
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
                        <span>Pick a date</span>
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
                  onChange={(event) =>
                    setAmount(parseFloat(event.target.value))
                  }
                  value={amount}
                  className="col-span-3"
                />
              </div>
              {user.data?.premium && (
                <TagSelector
                  tags={tagsQuery.data ?? []}
                  selectedTag={selectedTag}
                  setSelectedTag={setSelectedTag}
                />
              )}
            </div>
          )
        )}
        <DialogFooter className="flex justify-between">
          <Button
            type="submit"
            variant="destructive"
            disabled={deleteFinance.isPending}
            onClick={() =>
              deleteFinance.mutate({
                id: financeId,
              })
            }
          >
            {deleteFinance.isPending ? "Wird gelöscht.." : "Löschen"}
          </Button>
          <Button
            type="submit"
            disabled={editFinance.isPending}
            onClick={() =>
              editFinance.mutate({
                id: financeId,
                title,
                type: paymentType,
                amount,
                paymentDate,
                // @ts-expect-error || @ts-ignore
                tagTitle: selectedTag,
              })
            }
          >
            {editFinance.isPending ? "Wird gespeichert.." : "Speichern"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
