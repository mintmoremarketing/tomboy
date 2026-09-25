"use client";

import { useState } from "react";
import { clearAssistantData } from "@/components/assistant/client";

export function ClearDataButton() {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      className="button button--dark privacy-clear"
      disabled={done}
      onClick={() => {
        clearAssistantData();
        setDone(true);
      }}
    >
      {done ? "Cleared from this device ✓" : "Clear my Scout data on this device"}
    </button>
  );
}
