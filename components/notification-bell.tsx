"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUnreadCount() {
      try {
        const response = await fetch("/api/notifications/unread-count");
        if (response.ok) {
          const result = await response.json();
          const data = result.data || result;
          setUnreadCount(data.count || 0);
        }
      } catch (error) {
        console.error("Failed to fetch unread count:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchUnreadCount();
    
    // Poll every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <Link
      href="/notifications"
      className="rf-focus-ring relative inline-flex h-10 items-center rounded-rf-control border border-rf-outline-variant bg-rf-surface-base px-3 text-rf-primary transition hover:bg-rf-surface-container"
      aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
    >
      <span className="material-symbols-outlined">
        notifications
      </span>
      {!loading && unreadCount > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-rf-error px-1 text-[10px] font-bold text-white">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </Link>
  );
}
