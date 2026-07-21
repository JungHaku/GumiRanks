"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { GUMI } from "@/lib/site";

type ChatMessage = { role: "user" | "assistant"; content: string };

const GREETING: ChatMessage = {
  role: "assistant",
  content:
    "*beep boop* Hi, I'm Gumi! Ask me anything about my rankings — like who's #1 in a category, or how I score everyone. *beep boop*",
};

export function GumiChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([GREETING]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight });
  }, [messages, pending, open]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || pending) return;
    const next: ChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setPending(true);
    try {
      const res = await fetch("/api/gumi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // The greeting is client-side flavor; only send real turns.
        body: JSON.stringify({ messages: next.slice(1) }),
      });
      const data = await res.json();
      setMessages([
        ...next,
        {
          role: "assistant",
          content:
            typeof data?.reply === "string"
              ? data.reply
              : "*beep boop* Zzzt — something glitched. Try again? *beep boop*",
        },
      ]);
    } catch {
      setMessages([
        ...next,
        {
          role: "assistant",
          content:
            "*beep boop* Zzzt — I couldn't reach my brain. Try again in a moment? *beep boop*",
        },
      ]);
    } finally {
      setPending(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        className="gumi-chat-open"
        onClick={() => setOpen(true)}
      >
        💬 Talk to {GUMI.name} <span className="beep">*beep boop*</span>
      </button>
    );
  }

  return (
    <div className="gumi-chat" aria-label={`Chat with ${GUMI.name}`}>
      <div className="gumi-chat-head">
        <Image
          src={GUMI.face}
          alt=""
          width={28}
          height={28}
          className="gumi-chat-face"
        />
        <strong>Talk to {GUMI.name}</strong>
        <button
          type="button"
          className="gumi-chat-close"
          onClick={() => setOpen(false)}
          aria-label="Close chat"
        >
          ×
        </button>
      </div>
      <div className="gumi-chat-log" ref={logRef}>
        {messages.map((m, i) => (
          <p key={i} className={`gumi-msg ${m.role}`}>
            {m.content}
          </p>
        ))}
        {pending ? <p className="gumi-msg assistant typing">*beep…*</p> : null}
      </div>
      <form className="gumi-chat-form" onSubmit={send}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask Gumi about a ranking…"
          maxLength={500}
          disabled={pending}
        />
        <button type="submit" className="btn" disabled={pending || !input.trim()}>
          Send
        </button>
      </form>
    </div>
  );
}
