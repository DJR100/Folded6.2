import React, { useEffect, useState } from "react";

import { formatCurrency } from "../lib/format-currency"; // You may need to create this utility or use Intl.NumberFormat

import { Text } from "@/components/ui";

export function MoneySavedTicker({
  usdPerMs,
  quitTimestampMs,
}: {
  usdPerMs: number;
  quitTimestampMs: number;
}) {
  const [saved, setSaved] = useState(() =>
    computeSaved(usdPerMs, quitTimestampMs),
  );

  useEffect(() => {
    // Update every 50ms for smooth animation (~20fps)
    const interval = setInterval(() => {
      setSaved(computeSaved(usdPerMs, quitTimestampMs));
    }, 50);
    return () => clearInterval(interval);
  }, [usdPerMs, quitTimestampMs]);

  return (
    <Text variant="h1" className="text-green-500">
      {formatCurrency(saved)}
    </Text>
  );
}

// Helper function (or import from your lib)
function computeSaved(usdPerMs: number, quitTimestampMs: number) {
  return (Date.now() - quitTimestampMs) * usdPerMs;
}
