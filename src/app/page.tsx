import { getCurrentUser } from "@/lib/auth/session";
import { LandingClient } from "./landing-client";

export default async function HomePage() {
  const { user } = await getCurrentUser();
  const isLoggedIn = Boolean(user);

  return <LandingClient isLoggedIn={isLoggedIn} />;
}
