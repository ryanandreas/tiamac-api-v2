import ProfileHeader from "./components/profile-header";
import ProfileContent from "./components/profile-content";
import { getCurrentUser } from "@/app/actions/session";

export default async function Page() {
  const user = await getCurrentUser();

  return (
    <div className="container mx-auto space-y-6 px-4 py-10">
      <ProfileHeader user={user} />
      <ProfileContent user={user} />
    </div>
  );
}
