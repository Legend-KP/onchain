"use client";

import dynamic from "next/dynamic";
import { APP_NAME } from "~/lib/constants";

// Dynamic import to avoid SSR issues with wagmi hooks
const MicroTab = dynamic(() => import("~/components/ui/tabs/MicroTab").then(mod => ({ default: mod.MicroTab })), {
  ssr: false,
});

export default function Micro() {
  return <MicroTab />;
}

