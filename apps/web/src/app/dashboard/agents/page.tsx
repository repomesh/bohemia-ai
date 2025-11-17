import { Suspense } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import PageContainer from "@/components/layout/page-container";
import { AgentsTable } from "./components/agents-table";
import { Skeleton } from "@/components/ui/skeleton";

function AgentsTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <Skeleton className="h-8 w-[200px]" />
        <Skeleton className="h-8 w-[100px]" />
      </div>
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    </div>
  );
}

export default function AgentsPage() {
  return (
    <PageContainer scrollable>
      <div className="w-full space-y-4">
        <div className="flex items-start justify-between">
          <Heading
            title="Voice Agents"
            description="Manage your voice AI agents and their configurations."
          />
          <Link href="/dashboard/agents/create">
            <Button>
              <Plus className="h-4 w-4" />
              Create Agent
            </Button>
          </Link>
        </div>
        <Separator />
        <Suspense fallback={<AgentsTableSkeleton />}>
          <AgentsTable />
        </Suspense>
      </div>
    </PageContainer>
  );
}
