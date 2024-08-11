"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/trpc/react";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { ToastAction } from "@/components/ui/toast";

const formSchema = z.object({
  forename: z.string().min(2).max(50),
  surname: z.string().min(2).max(50),
  email: z.string().min(2),
  content: z.string().min(20),
});

export default function Contact() {
    const router = useRouter();
    const { toast } = useToast();

    const contact = api.contact.send.useMutation({
        onSuccess: () => {
            router.push('/');
            toast({
              description: "Deine Anfrage ist bei uns eingegangen.",
            });
        },
        onError: () => {
            toast({
              variant: "destructive",
              title: "Ups! Da ist wohl etwas schiefgelaufen.",
              description: "Die Anfrage konnte nicht bearbeitet werden",
              action: (
                <ToastAction altText="Try again">Erneut versuchen</ToastAction>
              ),
            });
        }
    })

    const form = useForm<z.infer<typeof formSchema>>({
      resolver: zodResolver(formSchema),
      defaultValues: {
        forename: "",
        surname: "",
        email: "",
        content: "",
      },
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
      contact.mutate({ forename: values.forename, surname: values.surname, email: values.email, content: values.content });
    }

    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 min-w-44 w-1/2">
          <FormField
            control={form.control}
            name="forename"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Vorname</FormLabel>
                <FormControl>
                  <Input type="text" placeholder="Max" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="surname"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nachname</FormLabel>
                <FormControl>
                  <Input type="text" placeholder="Mustermann" {...field} />
                </FormControl>
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
                    placeholder="max.mustermann@mail.de"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Anliegen</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Beschreibe dein Anliegen"
                    className="resize-y"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={contact.isPending}>{contact.isPending ? "Wird gesendet.." : "Senden"}</Button>
        </form>
      </Form>
    );
}