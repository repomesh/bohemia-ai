"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, usePathname } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { agentsAPI, liveKitAPI } from "@/lib/api/agents";
import { VoiceAgent } from "@/types/agent.types";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Play } from "lucide-react";
import { format } from "date-fns";
import { useBreadcrumbContext } from "@/components/breadcrumbs-context";

export default function AgentDetailsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams<{ agentId: string }>();
  const { getToken } = useAuth();
  const { setTitle } = useBreadcrumbContext();

  const [agent, setAgent] = useState<VoiceAgent | null>(null);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    const fetchAgent = async () => {
      try {
        setLoading(true);
        const token = await getToken();
        if (!token) {
          toast.error("Authentication required");
          return;
        }
        const data = await agentsAPI.get(params.agentId, token);
        setAgent(data);
        // Update breadcrumb with agent name
        setTitle(pathname, data.name);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load agent details");
      } finally {
        setLoading(false);
      }
    };
    if (params.agentId) {
      fetchAgent();
    }
  }, [params.agentId, getToken, pathname, setTitle]);

  const handleTest = async () => {
    if (!agent) return;
    try {
      setTesting(true);
      toast.loading("Starting test session...", { id: "test-agent" });
      const token = await getToken();
      if (!token) {
        toast.error("Authentication required", { id: "test-agent" });
        return;
      }
      const session = await liveKitAPI.createSession(
        agent.id,
        undefined,
        token,
      );
      toast.success("Test session created!", { id: "test-agent" });
      // Avoid huge query strings that can trigger 431 header errors.
      // Persist session details temporarily for the test page to read.
      sessionStorage.setItem(
        "livekit:testSession",
        JSON.stringify({
          agentId: agent.id,
          agentName: agent.name,
          livekitAgentName: agent.livekitAgentName,
          sessionId: session.sessionId,
          roomName: session.roomName,
          accessToken: session.accessToken,
          wsUrl: session.wsUrl,
        }),
      );
      router.push(`/dashboard/agents/${agent.id}/test`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to start test session", { id: "test-agent" });
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 px-4 pb-8 md:px-6 min-w-0">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-8 w-64 bg-muted animate-pulse rounded" />
              <div className="h-5 w-16 bg-muted animate-pulse rounded" />
            </div>
            <div className="h-4 w-[40ch] bg-muted animate-pulse rounded" />
            <div className="h-3 w-48 bg-muted animate-pulse rounded" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-9 w-20 bg-muted animate-pulse rounded" />
            <div className="h-9 w-28 bg-muted animate-pulse rounded" />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="p-6 rounded border">
            <div className="h-5 w-40 bg-muted animate-pulse rounded mb-4" />
            <div className="space-y-3">
              <div className="flex justify-between">
                <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                <div className="h-4 w-40 bg-muted animate-pulse rounded" />
              </div>
              <div className="flex justify-between">
                <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                <div className="h-4 w-40 bg-muted animate-pulse rounded" />
              </div>
              <div className="flex justify-between">
                <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                <div className="h-4 w-40 bg-muted animate-pulse rounded" />
              </div>
              <div className="flex justify-between">
                <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                <div className="h-4 w-16 bg-muted animate-pulse rounded" />
              </div>
            </div>
          </div>
          <div className="p-6 rounded border">
            <div className="h-5 w-32 bg-muted animate-pulse rounded mb-4" />
            <div className="space-y-3">
              <div className="flex justify-between">
                <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                <div className="h-4 w-24 bg-muted animate-pulse rounded" />
              </div>
              <div className="flex justify-between">
                <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                <div className="h-4 w-24 bg-muted animate-pulse rounded" />
              </div>
              <div className="flex justify-between">
                <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                <div className="h-4 w-24 bg-muted animate-pulse rounded" />
              </div>
            </div>
          </div>
        </div>

        {/* Instructions skeleton */}
        <div className="p-6 rounded border space-y-3">
          <div className="h-5 w-48 bg-muted animate-pulse rounded" />
          <div className="space-y-2 max-h-[60vh] overflow-hidden">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className="h-4 w-full bg-muted animate-pulse rounded"
                style={{ width: `${80 - (i % 4) * 10}%` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div className="text-muted-foreground">Agent not found.</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-4 pb-8 md:px-6 min-w-0">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            {agent.name}
          </h1>
          {agent.description && (
            <p className="text-muted-foreground max-w-2xl">
              {agent.description}
            </p>
          )}
          <div className="text-xs text-muted-foreground font-mono space-x-2">
            <span>Record ID: {agent.id}</span>
            <span>LiveKit: {agent.livekitAgentName ?? "Not linked"}</span>
          </div>
          <div className="text-xs text-muted-foreground">
            Created {format(new Date(agent.createdAt), "MMM d, yyyy")} • Updated{" "}
            {format(new Date(agent.updatedAt), "MMM d, yyyy")}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => router.back()} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button onClick={handleTest} disabled={testing}>
            <Play className="mr-2 h-4 w-4" />
            {testing ? "Starting..." : "Test Agent"}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6 space-y-4">
          <h2 className="text-lg font-medium">Model Configuration</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">LLM</span>
              <span className="font-mono">
                {agent.llmProvider} / {agent.llmModel}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">STT</span>
              <span className="font-mono">
                {agent.sttProvider} / {agent.sttModel}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">TTS</span>
              <span className="font-mono">
                {agent.ttsProvider} / {agent.ttsVoice}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Target Latency</span>
              <span>{agent.targetLatency} ms</span>
            </div>
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <h2 className="text-lg font-medium">Behavior</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Turn Detection</span>
              <span className="font-mono">{agent.turnDetection}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Interruptions</span>
              <span>
                {agent.allowInterruptions ? "Allowed" : "Not allowed"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Session Timeout</span>
              <span>{agent.sessionTimeout}s</span>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6 space-y-3">
        <h2 className="text-lg font-medium">System Instructions</h2>
        <pre className="whitespace-pre-wrap wrap-break-word text-sm bg-muted/40 p-3 rounded border max-h-[60vh] overflow-auto">
          {agent.instructions}
        </pre>
      </Card>
    </div>
  );
}
