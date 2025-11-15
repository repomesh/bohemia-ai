import { UserButton } from "@clerk/nextjs";

export default function AgentsPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <UserButton />
    </div>
  );
}
