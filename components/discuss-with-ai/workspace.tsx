"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Bot,
  CornerDownLeft,
  MessageSquareMore,
  PencilLine,
  Plus,
  Send,
  Square,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type Subject = {
  _id: string;
  title: string;
  description?: string;
  skillLevel?: string;
  tags?: string[];
};

type ChatMessage = {
  id: string;
  role: "assistant" | "user";
  content: string;
};

type ChatSession = {
  id: string;
  subjectId: string;
  subjectTitle: string;
  title: string;
  updatedAt: string;
  messages: ChatMessage[];
};

const STORAGE_KEY = "carriculae-ai-chat-sessions";

function createInitialAssistantMessage(subjectTitle: string): ChatMessage {
  return {
    id: crypto.randomUUID(),
    role: "assistant",
    content: `We're focused on ${subjectTitle}. Ask your first question whenever you're ready.`,
  };
}

function buildSessionTitle(messages: ChatMessage[]) {
  const firstUserMessage = messages.find((message) => message.role === "user")?.content.trim();
  if (!firstUserMessage) return "New discussion";
  return firstUserMessage.slice(0, 48) + (firstUserMessage.length > 48 ? "..." : "");
}

function formatRelativeTime(value: string) {
  const timestamp = new Date(value).getTime();
  if (Number.isNaN(timestamp)) return "";

  const diffMs = Date.now() - timestamp;
  const diffMinutes = Math.max(Math.floor(diffMs / 60000), 0);
  if (diffMinutes < 1) return "just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

function readSessions() {
  if (typeof window === "undefined") return [] as ChatSession[];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as ChatSession[]) : [];
  } catch {
    return [];
  }
}

function writeSessions(sessions: ChatSession[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

function sortSessionsByUpdatedAt(sessions: ChatSession[]) {
  return [...sessions].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

export function DiscussWithAIWorkspace() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const subjectId = searchParams.get("subjectId") || "";

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [subjectsLoading, setSubjectsLoading] = useState(true);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>("");
  const [draft, setDraft] = useState("");
  const [historyOpen, setHistoryOpen] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const initializedSubjectIdRef = useRef<string>("");
  const abortRef = useRef<AbortController | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let mounted = true;

    fetch("/api/subjects", { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error("Failed to load subjects.");
        }
        return res.json();
      })
      .then((data: Subject[]) => {
        if (mounted) {
          setSubjects(Array.isArray(data) ? data : []);
        }
      })
      .catch(() => {
        if (mounted) {
          toast.error("Could not load your subjects.");
        }
      })
      .finally(() => {
        if (mounted) {
          setSubjectsLoading(false);
        }
      });

    return () => {
      mounted = false;
      abortRef.current?.abort();
    };
  }, []);

  const selectedSubject = useMemo(
    () => subjects.find((subject) => subject._id === subjectId) || null,
    [subjectId, subjects]
  );

  useEffect(() => {
    if (!selectedSubject) return;
    if (initializedSubjectIdRef.current === selectedSubject._id) return;

    initializedSubjectIdRef.current = selectedSubject._id;

    const storedSessions = sortSessionsByUpdatedAt(readSessions());
    const subjectSessions = storedSessions.filter(
      (session) => session.subjectId === selectedSubject._id
    );

    if (subjectSessions.length) {
      setSessions(subjectSessions);
      setActiveSessionId(subjectSessions[0].id);
      return;
    }

    const nextSession: ChatSession = {
      id: crypto.randomUUID(),
      subjectId: selectedSubject._id,
      subjectTitle: selectedSubject.title,
      title: "New discussion",
      updatedAt: new Date().toISOString(),
      messages: [createInitialAssistantMessage(selectedSubject.title)],
    };

    writeSessions([nextSession, ...storedSessions]);
    setSessions([nextSession]);
    setActiveSessionId(nextSession.id);
  }, [selectedSubject]);

  useEffect(() => {
    viewportRef.current?.scrollTo({
      top: viewportRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [activeSessionId, sessions]);

  const activeSession =
    sessions.find((session) => session.id === activeSessionId) || sessions[0] || null;
  const isFreshSession =
    activeSession?.title === "New discussion" &&
    activeSession.messages.length === 1 &&
    activeSession.messages[0]?.role === "assistant";

  const visibleSessions = sessions;

  function saveSubjectSessions(nextSubjectSessions: ChatSession[]) {
    if (!selectedSubject) return;

    const allOtherSessions = readSessions().filter(
      (session) => session.subjectId !== selectedSubject._id
    );
    writeSessions([...sortSessionsByUpdatedAt(nextSubjectSessions), ...allOtherSessions]);
  }

  function replaceActiveSession(updatedSession: ChatSession) {
    setSessions((currentSessions) => {
      const nextSessions = sortSessionsByUpdatedAt(
        currentSessions.map((session) =>
          session.id === updatedSession.id ? updatedSession : session
        )
      );
      saveSubjectSessions(nextSessions);
      return nextSessions;
    });
  }

  function createNewSession() {
    if (!selectedSubject || isStreaming) return;

    const newSession: ChatSession = {
      id: crypto.randomUUID(),
      subjectId: selectedSubject._id,
      subjectTitle: selectedSubject.title,
      title: "New discussion",
      updatedAt: new Date().toISOString(),
      messages: [createInitialAssistantMessage(selectedSubject.title)],
    };

    setSessions((currentSessions) => {
      const nextSessions = sortSessionsByUpdatedAt([newSession, ...currentSessions]);
      saveSubjectSessions(nextSessions);
      return nextSessions;
    });
    setActiveSessionId(newSession.id);
    setDraft("");
    setHistoryOpen(false);
  }

  async function sendMessage(prefill?: string) {
    if (!activeSession || !selectedSubject || isStreaming) return;

    const content = (prefill ?? draft).trim();
    if (!content) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content,
    };
    const assistantMessageId = crypto.randomUUID();
    const nextMessages = [
      ...activeSession.messages,
      userMessage,
      { id: assistantMessageId, role: "assistant" as const, content: "" },
    ];

    const pendingSession: ChatSession = {
      ...activeSession,
      title: buildSessionTitle(nextMessages),
      updatedAt: new Date().toISOString(),
      messages: nextMessages,
    };

    replaceActiveSession(pendingSession);
    setDraft("");
    setIsStreaming(true);
    setStreamingMessageId(assistantMessageId);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        signal: controller.signal,
        body: JSON.stringify({
          subjectId: selectedSubject._id,
          messages: nextMessages
            .filter((message) => message.id !== assistantMessageId)
            .map((message) => ({
              role: message.role,
              content: message.content,
            })),
        }),
      });

      if (!res.ok || !res.body) {
        const payload = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error || "Failed to start chat response.");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        accumulated += decoder.decode(value, { stream: true });
        replaceActiveSession({
          ...pendingSession,
          updatedAt: new Date().toISOString(),
          messages: pendingSession.messages.map((message) =>
            message.id === assistantMessageId ? { ...message, content: accumulated } : message
          ),
        });
      }

      if (!accumulated.trim()) {
        replaceActiveSession({
          ...pendingSession,
          updatedAt: new Date().toISOString(),
          messages: pendingSession.messages.map((message) =>
            message.id === assistantMessageId
              ? {
                  ...message,
                  content: "I could not generate a response this time. Please try again.",
                }
              : message
          ),
        });
      }
    } catch (error) {
      if ((error as Error).name === "AbortError") {
        replaceActiveSession({
          ...pendingSession,
          updatedAt: new Date().toISOString(),
          messages: pendingSession.messages.filter(
            (message) => message.id !== assistantMessageId || message.content.trim().length > 0
          ),
        });
        return;
      }

      toast.error(error instanceof Error ? error.message : "Chat failed.");
      replaceActiveSession({
        ...pendingSession,
        updatedAt: new Date().toISOString(),
        messages: pendingSession.messages.filter((message) => message.id !== assistantMessageId),
      });
    } finally {
      setIsStreaming(false);
      setStreamingMessageId(null);
      abortRef.current = null;
    }
  }

  function stopStreaming() {
    abortRef.current?.abort();
    setIsStreaming(false);
    setStreamingMessageId(null);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void sendMessage();
    }
  }

  if (subjectsLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-50">
        <div className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-white px-5 py-4 text-sm text-muted-foreground shadow-sm">
          <Spinner />
          Loading discussion workspace...
        </div>
      </div>
    );
  }

  if (!selectedSubject || !subjectId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-50 p-4">
        <div className="w-full max-w-lg rounded-[28px] border border-stone-200 bg-white p-8 text-center shadow-sm">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-emerald-700">
            Discuss with AI
          </p>
          <h1 className="mt-3 text-2xl font-semibold text-stone-950">Choose a subject first</h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            This workspace needs a subject so the discussion can stay focused and your previous chats
            can be grouped correctly.
          </p>
          <Button asChild className="mt-6">
            <Link href="/dashboard/discuss-with-ai">
              <ArrowLeft className="size-4" />
              Back to subject selection
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden bg-[linear-gradient(180deg,#f7f7f6_0%,#f1f5f2_100%)]">
      <div className="flex h-full flex-col md:flex-row">
        <aside
          className={cn(
            "border-b border-stone-200 bg-white md:h-full md:w-80 md:shrink-0 md:border-r md:border-b-0",
            historyOpen ? "block" : "hidden md:block"
          )}
        >
          <div className="flex h-full flex-col">
            <div className="space-y-4 px-5 py-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold tracking-tight text-stone-950">Carriculae AI</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.18em] text-emerald-700">
                    Discuss with AI
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon-sm"
                    className="md:hidden"
                    onClick={() => setHistoryOpen(false)}
                    title="Close history"
                  >
                    <Square className="size-3.5" />
                  </Button>
                  <Button variant="outline" size="icon-sm" asChild>
                    <Link href="/dashboard/discuss-with-ai" title="Change subject">
                      <ArrowLeft className="size-4" />
                    </Link>
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  Subject
                </p>
                <Select
                  value={selectedSubject._id}
                  onValueChange={(nextSubjectId) => {
                    if (nextSubjectId === selectedSubject._id) return;
                    setHistoryOpen(false);
                    router.push(`/dashboard/discuss-with-ai/chat?subjectId=${nextSubjectId}`);
                  }}
                >
                  <SelectTrigger className="w-full bg-stone-50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem key={subject._id} value={subject._id}>
                        {subject.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={createNewSession} className="w-full" disabled={isStreaming}>
                <Plus className="size-4" />
                New Chat
              </Button>
            </div>

            <Separator />

            <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
              <div className="space-y-1.5">
                <p className="px-2 pb-2 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  Chat History
                </p>
                {visibleSessions.map((session, index) => {
                  const isActive = session.id === activeSessionId;
                  const label = session.title === "New discussion" ? `Chat ${visibleSessions.length - index}` : session.title;

                  return (
                    <button
                      key={session.id}
                      type="button"
                      onClick={() => {
                        if (isStreaming) return;
                        setActiveSessionId(session.id);
                        setHistoryOpen(false);
                      }}
                      className={cn(
                        "w-full rounded-xl px-3 py-2 text-left transition-colors",
                        isActive
                          ? "bg-emerald-50 text-emerald-950"
                          : "text-stone-600 hover:bg-stone-100 hover:text-stone-950"
                      )}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="truncate text-sm font-medium">{label}</p>
                        <span className="shrink-0 text-[11px] text-muted-foreground">
                          {formatRelativeTime(session.updatedAt)}
                        </span>
                      </div>
                    </button>
                  );
                })}

                {!visibleSessions.length ? (
                  <div className="px-2 py-6 text-sm text-muted-foreground">
                    No chats yet.
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </aside>

        <main className="flex h-full min-w-0 flex-1 flex-col overflow-hidden">
          <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
            <div
              ref={viewportRef}
              className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-4 py-5 md:px-6 lg:px-8"
            >
              <div className="flex justify-end md:hidden">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white/90"
                  onClick={() => setHistoryOpen((current) => !current)}
                >
                  <MessageSquareMore className="size-4" />
                  History
                </Button>
              </div>

              {isFreshSession ? (
                <div className="flex flex-1 items-center justify-center py-10">
                  <div className="mx-auto flex w-full max-w-2xl flex-col items-center rounded-[32px] border border-stone-200/80 bg-white/75 px-8 py-12 text-center shadow-[0_20px_60px_rgba(0,0,0,0.05)] backdrop-blur">
                    <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                      <Bot className="size-6" />
                    </div>
                    <p className="text-xs font-medium uppercase tracking-[0.22em] text-emerald-700">
                      New chat
                    </p>
                    <h2 className="mt-3 text-3xl font-semibold tracking-tight text-stone-950">
                      Start a conversation about {selectedSubject.title}
                    </h2>
                    <p className="mt-4 max-w-xl text-sm leading-7 text-muted-foreground">
                      Ask for explanations, debugging help, architecture advice, study plans, or a
                      concept breakdown. Once you send the first message, the discussion will begin here.
                    </p>
                  </div>
                </div>
              ) : (
                activeSession?.messages.map((message) => {
                  const isAssistant = message.role === "assistant";
                  const isCurrentStream = message.id === streamingMessageId;

                  return (
                    <div
                      key={message.id}
                      className={cn("flex w-full", isAssistant ? "justify-start" : "justify-end")}
                    >
                      <div
                        className={cn(
                          "max-w-3xl rounded-3xl px-4 py-3 shadow-sm md:px-5",
                          isAssistant
                            ? "rounded-bl-md border border-stone-200 bg-white text-stone-900"
                            : "rounded-br-md bg-emerald-600 text-white"
                        )}
                      >
                        <div className="mb-2 flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.16em] opacity-75">
                          {isAssistant ? (
                            <Bot className="size-3.5" />
                          ) : (
                            <PencilLine className="size-3.5" />
                          )}
                          {isAssistant ? "AI coach" : "You"}
                          {isCurrentStream ? <Spinner className="size-3" /> : null}
                        </div>
                        <p className="whitespace-pre-wrap text-sm leading-7">
                          {message.content || (isCurrentStream ? "Thinking..." : "")}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="border-t border-stone-200 bg-white/96 px-4 py-4 backdrop-blur md:px-6 lg:px-8">
              <div className="rounded-[28px] border border-stone-200 bg-stone-50 p-3 shadow-[0_10px_30px_rgba(0,0,0,0.03)]">
                <Textarea
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`Ask anything about ${selectedSubject.title}...`}
                  className="h-12 min-h-0 max-h-40 resize-none overflow-y-auto border-0 bg-transparent px-1 py-1 text-sm shadow-none focus-visible:ring-0"
                />
                <div className="mt-3 flex items-center justify-between gap-3 border-t border-stone-200/80 pt-3">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CornerDownLeft className="size-3.5" />
                    Enter to send
                  </div>
                  <div className="flex items-center gap-2">
                    {isStreaming ? (
                      <Button variant="outline" onClick={stopStreaming}>
                        <Square className="size-3.5" />
                        Stop
                      </Button>
                    ) : null}
                    <Button
                      onClick={() => void sendMessage()}
                      disabled={!draft.trim() || isStreaming}
                    >
                      {isStreaming ? <Spinner /> : <Send className="size-3.5" />}
                      Send
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
