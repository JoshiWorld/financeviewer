"use client";

import { loadStripe } from "@stripe/stripe-js";
import { useEffect, useState } from "react";
import { api } from "@/trpc/react";

// Lade Stripe außerhalb der Komponente, um zu verhindern, dass es bei jedem Rendern neu geladen wird
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,);

function CheckoutButton() {
  const { data: pubKey, isLoading } = api.stripe.getPublicKey.useQuery();
  const { mutateAsync: createCheckoutSession } =
    api.stripe.createCheckoutSession.useMutation();

  if (isLoading || !pubKey) return <p>Loading...</p>;

  const handleCheckout = async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const stripe = await stripePromise;

    const { sessionId } = await createCheckoutSession({
      items: [{ priceId: "price_1PmbdWIHb6ypa5dxf6829M6G", quantity: 1 }],
      successUrl: `${window.location.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${window.location.origin}/canceled`,
    });

    if (stripe) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      await stripe.redirectToCheckout({ sessionId });
    }
  };

  return <button onClick={handleCheckout}>Checkout</button>;
}

const ProductDisplay = () => (
  <section>
    <div className="product">
      <Logo />
      <div className="description">
        <h3>Starter plan</h3>
        <h5>$20.00 / month</h5>
      </div>
    </div>
    <CheckoutButton />
  </section>
);

const SuccessDisplay = ({ sessionId }: { sessionId: string }) => (
  <section>
    <Logo />
    <div className="product Box-root">
      <div className="description Box-root">
        <h3>Subscription to starter plan successful!</h3>
      </div>
    </div>
    <form action="/create-portal-session" method="POST">
      <input
        type="hidden"
        id="session-id"
        name="session_id"
        value={sessionId}
      />
      <button id="checkout-and-portal-button" type="submit">
        Manage your billing information
      </button>
    </form>
  </section>
);

const Message = ({ message }: { message: string }) => (
  <section>
    <p>{message}</p>
  </section>
);

export default function App() {
  const [message, setMessage] = useState<string>("");
  const [success, setSuccess] = useState<boolean>(false);
  const [sessionId, setSessionId] = useState<string>("");

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);

    if (query.get("success")) {
      setSuccess(true);
      setSessionId(query.get("session_id")!);
    }

    if (query.get("canceled")) {
      setSuccess(false);
      setMessage(
        "Order canceled -- continue to shop around and checkout when you're ready.",
      );
    }
  }, []);

  if (success && sessionId !== "") {
    return <SuccessDisplay sessionId={sessionId} />;
  } else if (message) {
    return <Message message={message} />;
  } else {
    return <ProductDisplay />;
  }
}

const Logo = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
    width="14px"
    height="16px"
    viewBox="0 0 14 16"
    version="1.1"
  >
    <defs />
    <g id="Flow" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
      <g
        id="0-Default"
        transform="translate(-121.000000, -40.000000)"
        fill="#E184DF"
      >
        <path
          d="M127,50 L126,50 C123.238576,50 121,47.7614237 121,45 C121,42.2385763 123.238576,40 126,40 L135,40 L135,56 L133,56 L133,42 L129,42 L129,56 L127,56 L127,50 Z M127,48 L127,42 L126,42 C124.343146,42 123,43.3431458 123,45 C123,46.6568542 124.343146,48 126,48 L127,48 Z"
          id="Pilcrow"
        />
      </g>
    </g>
  </svg>
);
