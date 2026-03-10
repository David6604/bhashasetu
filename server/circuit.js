// server/circuit.js
import CircuitBreaker from "opossum";
import fetch from "node-fetch";

export const pythonBreaker = new CircuitBreaker(
  async (payload) => {
    const resp = await fetch(`${process.env.PYTHON_SERVICE_URL}/translate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!resp.ok) {
      const err = await resp.json();
      throw new Error(err.message);
    }
    return resp.json();
  },
  {
    timeout: 10_000,
    errorThresholdPercentage: 50,
    resetTimeout: 30_000,
  }
);