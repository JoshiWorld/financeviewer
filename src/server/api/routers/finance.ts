import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure
} from "@/server/api/trpc";
import { PaymentType } from "@prisma/client";

const paymentTypeSchema = z.nativeEnum(PaymentType);

export const financeRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1),
        amount: z.number(),
        type: paymentTypeSchema,
        paymentDate: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.finance.create({
        data: {
          title: input.title,
          createdBy: { connect: { id: ctx.session.user.id } },
          amount: input.amount,
          type: input.type,
          paymentDate: new Date(input.paymentDate),
        },
      });
    }),

  get: protectedProcedure.input(z.object({id: z.string()})).query(async ({ ctx, input }) => {
    const finance = await ctx.db.finance.findUnique({
      where: { createdBy: { id: ctx.session.user.id }, id: input.id },
    });

    return finance ?? null;
  }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().optional(),
        paymentDate: z.date().optional(),
        amount: z.number().optional(),
        type: paymentTypeSchema.optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.finance.update({
        where: { id: input.id },
        data: {
          title: input.title,
          paymentDate: input.paymentDate,
          amount: input.amount,
          type: input.type,
        },
      });
    }),

  getAll: protectedProcedure.query(({ ctx }) => {
    return ctx.db.finance.findMany({
      orderBy: { updatedAt: "desc" },
      where: { createdBy: { id: ctx.session.user.id } },
    });
  }),

  delete: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.finance.delete({
        where: { id: input.id },
      });
    }),

  getMonth: protectedProcedure
    .input(
      z.object({
        month: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const month = parseInt(input.month, 10);

      const finances = await ctx.db.finance.findMany({
        orderBy: { createdAt: "desc" },
        where: {
          createdBy: { id: ctx.session.user.id },
        },
      });

      // Filtert die Finanzdaten entsprechend dem PaymentType
      const filteredFinances = finances.filter((finance) => {
        const paymentDate = new Date(finance.paymentDate);
        const paymentMonth = paymentDate.getMonth();

        // Überprüft den PaymentType und filtert basierend auf dem Monat
        switch (finance.type) {
          case PaymentType.MONTHLY:
            // Monatszahlungen sind immer relevant
            return true;

          case PaymentType.QUARTER:
            // Quartalszahlungen sind alle drei Monate relevant
            return paymentMonth % 3 === month % 3;

          case PaymentType.HALF:
            // Halbjährliche Zahlungen sind alle sechs Monate relevant
            return paymentMonth % 6 === month % 6;

          case PaymentType.YEARLY:
            // Jährliche Zahlungen sind nur relevant, wenn sie im gleichen Monat des Jahres sind
            return paymentMonth === month;

          default:
            return false;
        }
      });

      // Sortieren nach dem Tag des Monats
      return filteredFinances.sort((a, b) => {
        const dayA = new Date(a.paymentDate).getDate();
        const dayB = new Date(b.paymentDate).getDate();
        return dayA - dayB;
      });
    }),
});
