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
        tagTitle: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!input.tagTitle) {
        return ctx.db.finance.create({
          data: {
            title: input.title,
            createdBy: { connect: { id: ctx.session.user.id } },
            amount: input.amount,
            type: input.type,
            paymentDate: new Date(input.paymentDate),
          },
        });
      }

      const existingTag = await ctx.db.tag.findFirst({
        where: {
          user: { id: ctx.session.user.id },
          title: input.tagTitle,
        },
      });

      if (!existingTag) {
        const createdTag = await ctx.db.tag.create({
          data: {
            title: input.tagTitle,
            user: { connect: { id: ctx.session.user.id } },
          },
        });

        return ctx.db.finance.create({
          data: {
            title: input.title,
            createdBy: { connect: { id: ctx.session.user.id } },
            amount: input.amount,
            type: input.type,
            paymentDate: new Date(input.paymentDate),
            tag: { connect: { id: createdTag.id } },
          },
        });
      }

      return ctx.db.finance.create({
        data: {
          title: input.title,
          createdBy: { connect: { id: ctx.session.user.id } },
          amount: input.amount,
          type: input.type,
          paymentDate: new Date(input.paymentDate),
          tag: { connect: { id: existingTag.id } },
        },
      });
    }),

  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const finance = await ctx.db.finance.findUnique({
        where: {
          createdBy: { id: ctx.session.user.id },
          id: input.id,
        },
        include: {
          tag: true,
        },
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
        tagTitle: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!input.tagTitle) {
        return ctx.db.finance.update({
          where: { id: input.id },
          data: {
            title: input.title,
            paymentDate: input.paymentDate,
            amount: input.amount,
            type: input.type,
          },
        });
      }

      const existingTag = await ctx.db.tag.findFirst({
        where: {
          user: { id: ctx.session.user.id },
          title: input.tagTitle,
        },
      });

      if (!existingTag) {
        const createdTag = await ctx.db.tag.create({
          data: {
            title: input.tagTitle,
            user: { connect: { id: ctx.session.user.id } },
          },
        });

        return ctx.db.finance.update({
          where: { id: input.id },
          data: {
            title: input.title,
            paymentDate: input.paymentDate,
            amount: input.amount,
            type: input.type,
            tag: { connect: { id: createdTag.id } },
          },
        });
      }

      return ctx.db.finance.update({
        where: { id: input.id },
        data: {
          title: input.title,
          paymentDate: input.paymentDate,
          amount: input.amount,
          type: input.type,
          tag: { connect: { id: existingTag.id } },
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

  getYears: protectedProcedure.query(async ({ ctx }) => {
    const years = await ctx.db.finance.groupBy({
      by: ["paymentDate"],
      _count: {
        paymentDate: true,
      },
    });

    const uniqueYears = [
      ...new Set(
        years.map((entry) => new Date(entry.paymentDate).getFullYear()),
      ),
    ];

    uniqueYears.sort((a, b) => a - b);

    return uniqueYears;
  }),

  getMonth: protectedProcedure
    .input(
      z.object({
        month: z.string(),
        year: z.number().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const month = parseInt(input.month, 10);

      const finances = await ctx.db.finance.findMany({
        orderBy: { paymentDate: "desc" },
        where: {
          createdBy: { id: ctx.session.user.id },
          ...(input.year && {
            OR: [
              {
                paymentDate: {
                  gte: new Date(input.year, 0, 1),
                  lt: new Date(input.year + 1, 0, 1),
                },
              },
              {
                type: {
                  in: [
                    PaymentType.MONTHLY,
                    PaymentType.QUARTER,
                    PaymentType.HALF,
                    PaymentType.YEARLY,
                  ],
                },
              },
            ],
          }),
        },
        include: {
          tag: true,
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
          case PaymentType.ONETIME:
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

  overview: protectedProcedure
    .input(
      z.object({
        year: z.number().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const finances = await ctx.db.finance.findMany({
        where: {
          createdBy: { id: ctx.session.user.id },
          ...(input.year && {
            OR: [
              {
                paymentDate: {
                  gte: new Date(input.year, 0, 1),
                  lt: new Date(input.year + 1, 0, 1),
                },
              },
              {
                type: {
                  in: [
                    PaymentType.MONTHLY,
                    PaymentType.QUARTER,
                    PaymentType.HALF,
                    PaymentType.YEARLY,
                  ],
                },
              },
            ],
          }),
        },
      });

      const monthlyExpenses = {
        januar: 0,
        februar: 0,
        märz: 0,
        april: 0,
        mai: 0,
        juni: 0,
        juli: 0,
        august: 0,
        september: 0,
        oktober: 0,
        november: 0,
        dezember: 0,
      };

      finances.forEach((finance) => {
        const paymentDate = new Date(finance.paymentDate);
        const paymentMonth = paymentDate.getMonth();

        switch (finance.type) {
          case PaymentType.MONTHLY:
            Object.keys(monthlyExpenses).forEach((month) => {
              // @ts-expect-error || @ts-ignore
              monthlyExpenses[month] += finance.amount;
            });
            break;

          case PaymentType.QUARTER:
            Object.keys(monthlyExpenses).forEach((month, index) => {
              if (index % 3 === paymentMonth % 3) {
                // @ts-expect-error || @ts-ignore
                monthlyExpenses[month] += finance.amount;
              }
            });
            break;

          case PaymentType.HALF:
            Object.keys(monthlyExpenses).forEach((month, index) => {
              if (index % 6 === paymentMonth % 6) {
                // @ts-expect-error || @ts-ignore
                monthlyExpenses[month] += finance.amount;
              }
            });
            break;

          case PaymentType.YEARLY:
          case PaymentType.ONETIME:
            Object.keys(monthlyExpenses).forEach((month, index) => {
              if (index === paymentMonth) {
                // @ts-expect-error || @ts-ignore
                monthlyExpenses[month] += finance.amount;
              }
            });
            break;

          default:
            break;
        }
      });

      return monthlyExpenses;
    }),

  tagsOverview: protectedProcedure
    .input(
      z.object({
        year: z.number().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const tags = await ctx.db.tag.findMany();
      const finances = await ctx.db.finance.findMany({
        where: {
          createdById: ctx.session.user.id,
          ...(input.year && {
            OR: [
              {
                paymentDate: {
                  gte: new Date(input.year, 0, 1),
                  lt: new Date(input.year + 1, 0, 1),
                },
              },
            ],
          }),
        },
        include: {
          tag: true,
        },
      });

      const tagExpenses: Record<string, number> = {};

      finances.forEach((finance) => {
        tags.forEach((tag) => {
          if (!tagExpenses[tag.title]) {
            tagExpenses[tag.title] = 0;
          }

          // @ts-expect-error || @ts-ignore
          if(finance.tag?.id === tag.id) tagExpenses[tag.title] += finance.amount;
          // else {
          //   if(!tagExpenses.Unknown) {
          //     tagExpenses.Unknown = 0;
          //   }
          //   tagExpenses.Unknown += finance.amount;
          // }
        });
      });

      // Das Array der Tags mit ihren Kosten zurückgeben
      return Object.entries(tagExpenses).map(([tag, amount]) => ({
        tag,
        amount,
      }));
    }),
});
