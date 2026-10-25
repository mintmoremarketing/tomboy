"use client";

import { saveAudience } from "@/lib/audience";
import { useRouter } from "next/navigation";
import { StartingGateway, type Audience } from "@/components/block/starting-gateway";

// Always shows the welcome gateway (the homepage only shows it on a first visit).
// Picking a lineup saves it and lands on the homepage in that audience.
export default function WelcomePage() {
  const router = useRouter();

  function choose(value: Audience) {
    saveAudience(value);
    router.push("/");
  }

  return (
    <main>
      <StartingGateway isOpen onSelectAudience={choose} />
    </main>
  );
}
