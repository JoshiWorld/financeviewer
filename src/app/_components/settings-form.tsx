"use client";

import { api } from "@/trpc/react";
import { useToast } from "@/components/ui/use-toast";
import { ToastAction } from "@/components/ui/toast";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const formSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().min(2).max(50),
  image: z.string().min(2),
  income: z.number(),
});

export function SettingsForm({ userId }: { userId: string }) {
  const { toast } = useToast();
  const {
    data: user,
    isLoading,
    isError,
    error,
  } = api.user.get.useQuery();

  const updateUser = api.user.update.useMutation({
    onSuccess: () => {
      toast({
        description: "Deine Einstellungen wurden gespeichert.",
      });
    },
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      image: "",
      income: 0,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    updateUser.mutate({ id: userId, email: values.email, name: values.name, image: values.image, income: values.income });
  }

  useEffect(() => {
    if (user) {
      form.setValue("name", user.name!);
      form.setValue("email", user.email!);
      form.setValue("image", user.image!);
      form.setValue("income", user.income!);
    }
  }, [user, form]);

  if (isLoading) return <p>Loading..</p>;
  if (isError) {
    toast({
      variant: "destructive",
      title: "Ups! Da ist wohl etwas schiefgelaufen.",
      description: "Die Anfrage konnte nicht bearbeitet werden",
      action: <ToastAction altText="Try again">Erneut versuchen</ToastAction>,
    });
    console.log(error);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input type="text" placeholder="Max Mustermann" {...field} />
              </FormControl>
              <FormDescription>
                Dieser Name wird oben angezeigt.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>E-Mail</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="max.mustermann@email.de"
                  {...field}
                />
              </FormControl>
              <FormDescription>Deine E-Mail zum Anmelden.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Profilbild</FormLabel>
              <FormControl>
                <Input type="text" placeholder="Link zu Bild" {...field} />
              </FormControl>
              <FormDescription>Dein Profilbild.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="income"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Einkommen</FormLabel>
              <FormControl>
                <Input type="number" placeholder="Einkommen" {...field} />
              </FormControl>
              <FormDescription>Dein Einkommen.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={updateUser.isPending}>
          {updateUser.isPending ? "Wird gespeichert.." : "Speichern"}
        </Button>
      </form>
    </Form>
  );
}
