"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@clerk/nextjs";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { agentsAPI } from "@/lib/api/agents";
import { toast } from "sonner";
import { Loader2, Save, TestTube } from "lucide-react";

const agentFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  description: z.string().optional(),
  instructions: z.string().min(1, "Instructions are required"),
  llmProvider: z.enum(["openai"]),
  llmModel: z.string().min(1, "LLM model is required"),
  llmTemperature: z.number().min(0).max(2),
  llmMaxTokens: z.number().min(1).max(4000),
  sttProvider: z.enum(["deepgram"]),
  sttModel: z.string(),
  sttLanguage: z.string(),
  sttDetectLanguage: z.boolean().optional(),
  sttEnableDiarization: z.boolean().optional(),
  sttInterimResults: z.boolean().optional(),
  ttsProvider: z.enum(["elevenlabs"]),
  ttsVoice: z.string().min(1, "TTS voice is required"),
  ttsModel: z.string().optional(),
  ttsSpeed: z.number().min(0.5).max(2).optional(),
  ttsStability: z.number().min(0).max(1).optional(),
  audioSampleRate: z.number(),
  audioChannels: z.enum(["1", "2"]),
  audioFrameLength: z.number(),
  audioNoiseFilter: z.boolean(),
  audioEchoCancellation: z.boolean(),
  turnDetection: z.enum([
    "vad",
    "stt",
    "realtime_llm",
    "manual",
    "multilingual",
  ]),
  vadProvider: z.enum(["silero", "webrtcvad"]).optional(),
  vadThreshold: z.number().min(0).max(1).optional(),
  allowInterruptions: z.boolean(),
  minInterruptionDuration: z.number().min(0).max(5),
  resumeFalseInterruption: z.boolean(),
  falseInterruptionTimeout: z.number().min(0).max(10),
  preemptiveGeneration: z.boolean(),
  minEndpointingDelay: z.number().min(0).max(5),
  maxEndpointingDelay: z.number().min(0).max(10),
  maxToolSteps: z.number().min(1).max(10),
  userAwayTimeout: z.number().min(1).max(300),
  sessionTimeout: z.number().min(60).max(7200),
  targetLatency: z.number().min(100).max(5000),
  functionCallsEnabled: z.boolean(),
  backgroundAudioEnabled: z.boolean(),
});

type AgentFormValues = z.infer<typeof agentFormSchema>;

const FIXED_MODEL_CONFIG = {
  llmProvider: "openai" as const,
  llmModel: "gpt-4.1-mini",
  sttProvider: "deepgram" as const,
  sttModel: "nova-2",
  ttsProvider: "elevenlabs" as const,
  ttsVoice: "rachel",
  ttsModel: "eleven_turbo_v2",
};

const defaultValues: Partial<AgentFormValues> = {
  name: "",
  description: "",
  instructions: "",
  llmProvider: FIXED_MODEL_CONFIG.llmProvider,
  llmModel: FIXED_MODEL_CONFIG.llmModel,
  llmTemperature: 0.7,
  llmMaxTokens: 1000,
  sttProvider: FIXED_MODEL_CONFIG.sttProvider,
  sttModel: FIXED_MODEL_CONFIG.sttModel,
  sttLanguage: "en",
  sttDetectLanguage: false,
  sttEnableDiarization: false,
  sttInterimResults: true,
  ttsProvider: FIXED_MODEL_CONFIG.ttsProvider,
  ttsVoice: FIXED_MODEL_CONFIG.ttsVoice,
  ttsModel: FIXED_MODEL_CONFIG.ttsModel,
  ttsSpeed: 1.0,
  ttsStability: 0.5,
  audioSampleRate: 48000,
  audioChannels: "1",
  audioFrameLength: 20,
  audioNoiseFilter: true,
  audioEchoCancellation: true,
  turnDetection: "vad",
  vadProvider: "silero",
  vadThreshold: 0.5,
  allowInterruptions: true,
  minInterruptionDuration: 0.5,
  resumeFalseInterruption: true,
  falseInterruptionTimeout: 1.0,
  preemptiveGeneration: true,
  minEndpointingDelay: 0.5,
  maxEndpointingDelay: 3.0,
  maxToolSteps: 3,
  userAwayTimeout: 15.0,
  sessionTimeout: 3600,
  targetLatency: 1000,
  functionCallsEnabled: false,
  backgroundAudioEnabled: false,
};

export function AgentForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [testMode, setTestMode] = useState(false);
  const { getToken } = useAuth();

  const form = useForm<AgentFormValues>({
    resolver: zodResolver(agentFormSchema),
    defaultValues,
  });

  async function onSubmit(values: AgentFormValues) {
    try {
      setLoading(true);

      const agentData = {
        name: values.name,
        description: values.description,
        instructions: values.instructions,
        llmProvider: FIXED_MODEL_CONFIG.llmProvider,
        llmModel: FIXED_MODEL_CONFIG.llmModel,
        llmTemperature: values.llmTemperature,
        llmMaxTokens: values.llmMaxTokens,
        sttProvider: FIXED_MODEL_CONFIG.sttProvider,
        sttModel: FIXED_MODEL_CONFIG.sttModel,
        sttLanguage: values.sttLanguage,
        sttSettings: {
          detectLanguage: values.sttDetectLanguage,
          enableDiarization: values.sttEnableDiarization,
          interimResults: values.sttInterimResults,
        },
        ttsProvider: FIXED_MODEL_CONFIG.ttsProvider,
        ttsVoice: FIXED_MODEL_CONFIG.ttsVoice,
        ttsModel: FIXED_MODEL_CONFIG.ttsModel,
        ttsSettings: {
          speed: values.ttsSpeed,
          stability: values.ttsStability,
        },
        audioSettings: {
          sampleRate: values.audioSampleRate,
          channels: Number(values.audioChannels) as 1 | 2,
          frameLength: values.audioFrameLength,
          noiseFilter: values.audioNoiseFilter,
          echoCancellation: values.audioEchoCancellation,
        },
        turnDetection: values.turnDetection,
        vadSettings: {
          provider: values.vadProvider,
          threshold: values.vadThreshold,
        },
        allowInterruptions: values.allowInterruptions,
        minInterruptionDuration: values.minInterruptionDuration,
        resumeFalseInterruption: values.resumeFalseInterruption,
        falseInterruptionTimeout: values.falseInterruptionTimeout,
        preemptiveGeneration: values.preemptiveGeneration,
        minEndpointingDelay: values.minEndpointingDelay,
        maxEndpointingDelay: values.maxEndpointingDelay,
        maxToolSteps: values.maxToolSteps,
        userAwayTimeout: values.userAwayTimeout,
        sessionTimeout: values.sessionTimeout,
        targetLatency: values.targetLatency,
        functionCalls: {
          enabled: values.functionCallsEnabled,
          tools: [],
        },
        backgroundAudio: {
          enabled: values.backgroundAudioEnabled,
        },
      };

      const token = await getToken?.();
      const agent = await agentsAPI.create(agentData, token || undefined);

      toast.success("Agent created successfully!");

      if (testMode) {
        router.push(`/dashboard/agents/${agent.id}/test`);
      } else {
        router.push("/dashboard/agents");
      }
    } catch (error) {
      console.error("Failed to create agent:", error);
      toast.error("Failed to create agent");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Form
      form={form}
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-6"
    >
      <Card>
        <CardContent className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Agent Name</FormLabel>
                <FormDescription>
                  A unique name to identify your voice agent.
                </FormDescription>
                <FormControl>
                  <Input placeholder="My Voice Assistant" {...field} />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description (Optional)</FormLabel>
                <FormDescription>
                  Describe what this agent does and its purpose.
                </FormDescription>
                <FormControl>
                  <Textarea
                    placeholder="A helpful voice assistant for customer service..."
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="instructions"
            render={({ field }) => (
              <FormItem>
                <FormLabel>System Instructions</FormLabel>
                <FormDescription>
                  Instructions that define the agent&apos;s personality and
                  behavior.
                </FormDescription>
                <FormControl>
                  <Textarea
                    placeholder="You are a helpful voice assistant. Be concise and friendly..."
                    className="min-h-20 resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>

      <Separator />

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>

        <div className="flex gap-2">
          <Button
            type="submit"
            variant="outline"
            disabled={loading}
            onClick={() => setTestMode(true)}
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <TestTube className="mr-2 h-4 w-4" />
            )}
            Create & Test
          </Button>

          <Button
            type="submit"
            disabled={loading}
            onClick={() => setTestMode(false)}
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Create Agent
          </Button>
        </div>
      </div>
    </Form>
  );
}
