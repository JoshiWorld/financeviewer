"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { api } from "@/trpc/react";
import { ToastAction } from "@/components/ui/toast";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";

export function EinnahmenInput({ userId }: { userId: string }) {
  const { toast } = useToast();
  const [einnahmen, setEinnahmen] = useState<number>(0);
  const {
    data: user,
    isLoading,
    isError,
    error,
  } = api.user.get.useQuery();
  const updateIncome = api.user.update.useMutation({
    onSuccess: () => {
        toast({
          title: "Deine Einnahmen wurden erfolgreich geändert!",
        });
    }
  })

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
    if (user) {
      if (user.income) {
        setEinnahmen(user.income);
      }
    }
  }, [user, isError, error, toast]);

  const handleSubmit = () => {
    updateIncome.mutate({ id: userId, income: einnahmen });
  }

  if(isLoading) {
    return <p>Loading..</p>;
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-4 rounded p-6 shadow-md">
      <Label className="text-lg font-semibold">Einnahmen</Label>
      <Input
        type="number"
        value={einnahmen}
        onChange={(event) => setEinnahmen(parseFloat(event.target.value))}
        className="w-1/2 rounded border p-2"
      />
      <Button
        onClick={handleSubmit}
        className="rounded px-4 py-2"
      >
        Speichern
      </Button>
    </div>
  );
}
