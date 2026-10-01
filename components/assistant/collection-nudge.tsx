"use client";

import { useEffect } from "react";
import { nudge } from "@/components/assistant/nudges";

// Collection pages: Scout offers to narrow the list down as soon as the page opens.
export function CollectionNudge({ handle, title }: { handle: string; title: string }) {
  useEffect(() => {
    const timer = window.setTimeout(() => {
      nudge({
        id: `collection-${handle}`,
        text: `Lots to choose from in ${title}. Tell me your size and the look you want, and I'll pick out the best ones for you.`,
        actions: [
          { label: "Pick for me", ask: `Help me choose from ${title}. Ask me my size and what I'm looking for.` },
          { label: "What's popular?", ask: `What are the most popular picks in ${title} right now?` },
        ],
      });
    }, 1200);
    return () => window.clearTimeout(timer);
  }, [handle, title]);
  return null;
}
