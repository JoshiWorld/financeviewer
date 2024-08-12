import { env } from "@/env";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import Stripe from "stripe";
import { z } from "zod";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

export const stripeRouter = createTRPCRouter({
  getPublicKey: publicProcedure.query(() => {
    return { key: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY };
  }),

  createCheckoutSession: publicProcedure
    .input(
      z.object({
        items: z.array(
          z.object({
            priceId: z.string(),
            quantity: z.number().min(1),
          }),
        ),
        successUrl: z.string(),
        cancelUrl: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const session = await stripe.checkout.sessions.create({
        billing_address_collection: "auto",
        line_items: input.items.map((item) => ({
          price: item.priceId,
          quantity: item.quantity,
        })),
        mode: "subscription",
        success_url: input.successUrl,
        cancel_url: input.cancelUrl,
        automatic_tax: { enabled: true },
      });
      return { sessionId: session.id };
    }),

  createPortalSession: publicProcedure
    .input(
      z.object({
        sessionId: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const checkoutSession = await stripe.checkout.sessions.retrieve(
        input.sessionId,
      );
      const portalSession = await stripe.billingPortal.sessions.create({
        customer: checkoutSession.customer as string,
        return_url: `${env.NEXTAUTH_URL}`,
      });
      return { url: portalSession.url };
    }),
});
