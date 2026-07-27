import { getCurrentUser } from "@/lib/auth/session";
import { LandingClient } from "../landing-client";

export const dynamic = "force-dynamic";

export default async function DedicatedLandingPage() {
  const { user } = await getCurrentUser();
  const isLoggedIn = Boolean(user);

  return <LandingClient isLoggedIn={isLoggedIn} />;
}
