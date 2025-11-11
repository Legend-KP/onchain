import { Metadata } from "next";
import Micro from "./micro";
import { APP_NAME } from "~/lib/constants";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `${APP_NAME} - Micro Page`,
    description: "Send zero-value transactions on Base and Celo chains",
  };
}

export default function MicroPage() {
  return <Micro />;
}

