import { z } from "zod";
import nodemailer from "nodemailer";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { env } from "@/env";

export const contactRouter = createTRPCRouter({
  send: publicProcedure
    .input(
      z.object({
        forename: z.string().min(2),
        surname: z.string().min(2),
        email: z.string().min(2),
        content: z.string().min(20),
      }),
    )
    .mutation(async ({ input }) => {
      const { forename, surname, email, content } = input;

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      const transporter = nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: Number(env.SMTP_PORT),
        secure: true,
        auth: {
          user: env.SMTP_USER,
          pass: env.SMTP_PASSWORD,
        },
      });

      const mailOptions = {
        from: `"${forename} ${surname}" <${env.CONTACT_EMAIL}>`,
        to: env.CONTACT_EMAIL,
        subject: "FinanceViewer | Neue Kontaktanfrage",
        text: `Neue Kontaktanfrage von:
  
          Vorname: ${forename}
          Nachname: ${surname}
          E-Mail: ${email}

          Inhalt der Nachricht:
          ${content}`,
        html: `<p>Neue Kontaktanfrage von:</p>
         <p><strong>Vorname:</strong> ${forename}</p>
         <p><strong>Nachname:</strong> ${surname}</p>
         <p><strong>E-Mail:</strong> ${email}</p>
         <p><strong>Inhalt der Nachricht:</strong></p>
         <p>${content}</p>`,
      };

      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      await transporter.sendMail(mailOptions);

      return {
        success: true,
        message: "E-Mail erfolgreich gesendet",
      };
    }),
});
