import { Metadata } from "next";
import dynamic from "next/dynamic";
import { APP_NAME } from "~/lib/constants";

// Dynamic import to avoid SSR issues with wagmi hooks
const MicroTab = dynamic(() => import("~/components/ui/tabs/MicroTab").then(mod => ({ default: mod.MicroTab })), {
  ssr: false,
});

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `${APP_NAME} - Micro Page`,
    description: "Send zero-value transactions on Base and Celo chains",
  };
}

export default function MicroPage() {
  return <MicroTab />;
}

