"use client";

import { useState, useEffect } from "react";

export default function Success() {
  const [success, setSuccess] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    // This will run only on the client-side
    const query = new URLSearchParams(window.location.search);

    if (query.get("session_id")) {
      setSuccess(true);
      setSessionId(query.get("session_id") ?? null);
    } else {
      setSuccess(false);
    }
  }, []);

  if (success && sessionId) {
    return <SuccessDisplay sessionId={sessionId} />;
  }

  return <p>Kein Abo ausgewählt.</p>;
}

function SuccessDisplay({ sessionId }: { sessionId: string }) {
  return (
    <section>
      <div className="product">
        <h3>Subscription to starter plan successful!</h3>
        <p>Session ID: {sessionId}</p>
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
}
