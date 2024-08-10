import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

type UpdatedData = {
  name?: string;
  email?: string;
  image?: string;
  income?: number;
  emailVerified?: Date;
};

type UpdatedTag = {
  title?: string;
};

export const userRouter = createTRPCRouter({
  get: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { id: ctx.session.user.id },
    });

    return user ?? null;
  }),
  getByMail: protectedProcedure
    .input(z.object({ mail: z.string() }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { email: input.mail },
      });

      return user ?? null;
    }),
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        email: z.string().optional(),
        image: z.string().optional(),
        emailVerified: z.date().optional(),
        income: z.number().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const updateData: UpdatedData = {};

      if (input.name !== undefined) {
        updateData.name = input.name;
      }
      if (input.email !== undefined) {
        updateData.email = input.email;
      }
      if (input.image !== undefined) {
        updateData.image = input.image;
      }
      if (input.emailVerified !== undefined) {
        updateData.emailVerified = input.emailVerified;
      }
      if (input.income !== undefined) {
        updateData.income = input.income;
      }

      return ctx.db.user.update({
        where: { id: input.id },
        data: updateData,
      });
    }),

  getTags: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.tag.findMany({
      where: {
        user: {
          id: ctx.session.user.id,
        },
      },
    });
  }),
  createTag: protectedProcedure
    .input(
      z.object({
        title: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.tag.create({
        data: {
          title: input.title,
          user: { connect: { id: ctx.session.user.id } },
        },
      });
    }),
  getTag: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.tag.findUnique({
        where: {
          user: {
            id: ctx.session.user.id,
          },
          id: input.id,
        },
      });
    }),
  deleteTag: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.tag.delete({
        where: {
          user: {
            id: ctx.session.user.id,
          },
          id: input.id,
        },
      });
    }),
  updateTag: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const updateData: UpdatedTag = {};

      if (input.title !== undefined) {
        updateData.title = input.title;
      }

      return ctx.db.tag.update({
        where: { id: input.id, user: { id: ctx.session.user.id } },
        data: updateData,
      });
    }),
});
