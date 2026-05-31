"use client";

import { useCallback, useState, useEffect, useRef } from "react";
import { secureFetch } from "@/lib/secure-fetch";

type Message = {
  id: string;
  orderId: string;
  senderId: string;
  content: string;
  createdAt: string;
  sender: {
    id: string;
    name: string;
    role: string;
  };
};

export function ChatSection({ orderId, currentUserId }: { orderId: string; currentUserId: string }) {
  const [chatMessage, setChatMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Fetch messages
  const fetchMessages = useCallback(async () => {
    try {
      const response = await secureFetch(`/api/orders/${orderId}/messages`);
      const result = await response.json();

      if (response.ok && result.data) {
        setMessages(result.data);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoadingMessages(false);
    }
  }, [orderId]);

  // Send message
  async function sendMessage() {
    if (!chatMessage.trim() || sendingMessage) return;

    setSendingMessage(true);
    try {
      const response = await secureFetch(`/api/orders/${orderId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: chatMessage }),
      });

      const result = await response.json();

      if (response.ok && result.data) {
        setMessages((currentMessages) => [...currentMessages, result.data]);
        setChatMessage("");
        // Scroll to bottom after sending
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSendingMessage(false);
    }
  }

  useEffect(() => {
    const timeout = window.setTimeout(fetchMessages, 0);
    const interval = window.setInterval(fetchMessages, 5000);
    return () => {
      window.clearTimeout(timeout);
      window.clearInterval(interval);
    };
  }, [fetchMessages]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <aside className="rounded-rf-card bg-rf-surface-base p-6 shadow-[0px_20px_40px_rgba(21,128,61,0.08)]">
      <h3 className="text-sm font-extrabold uppercase tracking-wider text-rf-secondary flex items-center gap-2">
        <span className="material-symbols-outlined text-[18px]">forum</span>
        Chat dengan Merchant
      </h3>
      
      <div ref={chatScrollRef} className="mt-4 flex flex-col gap-3 overflow-y-auto pr-2" style={{ maxHeight: "400px" }}>
        {loadingMessages ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-rf-text-muted text-sm">Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-rf-text-muted text-sm text-center">
              Belum ada pesan. Mulai percakapan dengan merchant!
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isCurrentUser = msg.senderId === currentUserId;
            const time = new Date(msg.createdAt).toLocaleTimeString("id-ID", {
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <div
                key={msg.id}
                className={`p-3 rounded-lg ${
                  isCurrentUser
                    ? "bg-rf-primary/10 self-end ml-auto"
                    : "bg-rf-surface-container-low self-start"
                } max-w-[85%]`}
              >
                <p className="text-sm text-rf-text-onyx leading-relaxed">{msg.content}</p>
                <span className={`text-[10px] text-rf-text-muted block mt-1 ${isCurrentUser ? "text-right" : ""}`}>
                  {time}
                </span>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <div className="mt-4 flex items-center gap-2 pt-4 border-t border-rf-border">
        <input
          className="flex-grow rounded-rf-control bg-rf-surface-container-low border-none focus:ring-2 focus:ring-rf-primary px-4 py-2 text-sm text-rf-text-onyx placeholder:text-rf-text-muted"
          placeholder="Ketik pesan..."
          type="text"
          value={chatMessage}
          onChange={(e) => setChatMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
          disabled={sendingMessage}
        />
        <button
          className="w-10 h-10 rounded-full bg-rf-primary text-white flex items-center justify-center hover:bg-rf-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={sendMessage}
          disabled={sendingMessage || !chatMessage.trim()}
        >
          <span className="material-symbols-outlined text-[18px]">send</span>
        </button>
      </div>
    </aside>
  );
}
