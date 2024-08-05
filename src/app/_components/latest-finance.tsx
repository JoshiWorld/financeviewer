"use client";

import { useState } from "react";

import { api } from "@/trpc/react";
import { PaymentType } from "@prisma/client";

export function LatestFinance() {
  const [latestFinance] = api.finance.getLatest.useSuspenseQuery();

  const utils = api.useUtils();

  const [title, setTitle] = useState<string>("");
  const [amount, setAmount] = useState<number>(0);
  const [type, setType] = useState<PaymentType>(PaymentType.MONTHLY);
  const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString());

  const createFinance = api.finance.create.useMutation({
    onSuccess: async () => {
      await utils.finance.invalidate();
      setTitle("");
      setAmount(0);
      setType(PaymentType.MONTHLY);
      setPaymentDate(new Date().toISOString());
    },
  });

  return (
    <div className="w-full max-w-xs">
      {latestFinance ? (
        <p className="truncate">{latestFinance.createdAt.toLocaleString()}</p>
      ) : (
        <p>You have no posts yet.</p>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          createFinance.mutate({ title, amount, type, paymentDate });
        }}
        className="flex flex-col gap-2"
      >
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-full px-4 py-2"
        />
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.valueAsNumber)}
          className="w-full rounded-full px-4 py-2"
        />
        <input
          type="date"
          placeholder="Date"
          value={paymentDate}
          onChange={(e) => setPaymentDate(e.target.value)}
          className="w-full rounded-full px-4 py-2"
        />
        <select
          value={type}
          onChange={(e) => setType(e.target.value as PaymentType)}
          className="w-full rounded-full px-4 py-2"
        >
          {Object.values(PaymentType).map((paymentType) => (
            <option key={paymentType} value={paymentType}>
              {paymentType}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-full bg-white/10 px-10 py-3 font-semibold transition hover:bg-white/20"
          disabled={createFinance.isPending}
        >
          {createFinance.isPending ? "Submitting..." : "Submit"}
        </button>
      </form>
    </div>
  );
}
