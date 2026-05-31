"use client";

import Link from "next/link";
import { secureFetch } from "@/lib/secure-fetch";
import { useEffect, useState } from "react";

type Notification = {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  actionUrl: string | null;
  createdAt: string;
};

export function NotificationsContent() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  useEffect(() => {
    async function fetchNotifications() {
      try {
        const url = filter === "unread"
          ? "/api/notifications?unreadOnly=true"
          : "/api/notifications";

        const response = await secureFetch(url);
        if (response.ok) {
          const result = await response.json();
          const data = result.data || result;
          setNotifications(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchNotifications();
  }, [filter]);

  async function markAsRead(id: string) {
    try {
      await secureFetch(`/api/notifications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ read: true }),
      });
      
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  }

  async function markAllAsRead() {
    try {
      await secureFetch("/api/notifications/mark-all-read", {
        method: "POST",
      });
      
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  }

  async function deleteNotification(id: string) {
    try {
      await secureFetch(`/api/notifications/${id}`, {
        method: "DELETE",
      });
      
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-5 py-20 md:px-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 rounded bg-rf-surface-container" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-xl bg-rf-surface-container" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-5 py-20 md:px-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-heading text-4xl font-bold text-rf-text-onyx">
            Notifikasi
          </h1>
          <p className="mt-2 text-rf-text-muted">
            {unreadCount > 0 ? `${unreadCount} notifikasi belum dibaca` : "Semua notifikasi sudah dibaca"}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter(filter === "all" ? "unread" : "all")}
            className="rf-focus-ring rounded-lg border border-rf-outline-variant bg-rf-surface-base px-4 py-2 text-sm font-semibold text-rf-text-onyx hover:bg-rf-surface-container"
          >
            {filter === "all" ? "Belum Dibaca" : "Semua"}
          </button>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="rf-focus-ring rounded-lg bg-rf-primary-container px-4 py-2 text-sm font-semibold text-white hover:bg-rf-primary-fixed hover:text-rf-text-onyx"
            >
              Tandai Semua Dibaca
            </button>
          )}
        </div>
      </div>

      {notifications.length > 0 ? (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <NotificationCard
              key={notification.id}
              notification={notification}
              onMarkAsRead={markAsRead}
              onDelete={deleteNotification}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-rf-outline-variant bg-rf-surface-base p-16 text-center">
          <span className="material-symbols-outlined mx-auto block text-6xl text-rf-outline">
            notifications_off
          </span>
          <h3 className="mt-4 text-xl font-bold text-rf-text-onyx">
            {filter === "unread" ? "Tidak ada notifikasi baru" : "Belum ada notifikasi"}
          </h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-rf-text-muted">
            {filter === "unread" 
              ? "Semua notifikasi sudah dibaca. Kembali ke marketplace untuk aktivitas baru."
              : "Notifikasi akan muncul di sini saat ada aktivitas baru."}
          </p>
          <Link
            href="/"
            className="rf-focus-ring mt-6 inline-flex items-center gap-2 rounded-full bg-rf-primary-container px-6 py-3 text-sm font-semibold text-white hover:bg-rf-primary-fixed hover:text-rf-text-onyx"
          >
            <span className="material-symbols-outlined">home</span>
            Kembali ke Marketplace
          </Link>
        </div>
      )}
    </div>
  );
}

function NotificationCard({
  notification,
  onMarkAsRead,
  onDelete,
}: {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const timeAgo = getTimeAgo(new Date(notification.createdAt));
  const iconMap: Record<string, string> = {
    ORDER_CONFIRMED: "check_circle",
    ORDER_READY: "shopping_bag",
    ORDER_COMPLETED: "task_alt",
    ORDER_CANCELLED: "cancel",
    CLAIM_APPROVED: "thumb_up",
    CLAIM_REJECTED: "thumb_down",
    NEW_ORDER: "receipt",
    NEW_CLAIM: "volunteer_activism",
    MERCHANT_VERIFIED: "verified",
    CHARITY_VERIFIED: "verified",
  };

  const icon = iconMap[notification.type] || "notifications";

  const content = (
    <div
      className={`group relative overflow-hidden rounded-xl border p-4 transition ${
        notification.read
          ? "border-rf-outline-variant/60 bg-rf-surface-base"
          : "border-rf-primary/30 bg-rf-primary/5"
      } hover:shadow-md`}
    >
      <div className="flex gap-4">
        <div className={`flex size-12 shrink-0 items-center justify-center rounded-full ${
          notification.read ? "bg-rf-surface-container" : "bg-rf-primary/10"
        }`}>
          <span className={`material-symbols-outlined ${
            notification.read ? "text-rf-text-muted" : "text-rf-primary"
          }`}>
            {icon}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className={`font-semibold ${
              notification.read ? "text-rf-text-muted" : "text-rf-text-onyx"
            }`}>
              {notification.title}
            </h3>
            {!notification.read && (
              <span className="size-2 shrink-0 rounded-full bg-rf-primary" />
            )}
          </div>
          <p className="mt-1 text-sm text-rf-text-muted">
            {notification.message}
          </p>
          <p className="mt-2 text-xs text-rf-outline">
            {timeAgo}
          </p>
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        {!notification.read && (
          <button
            onClick={(e) => {
              e.preventDefault();
              onMarkAsRead(notification.id);
            }}
            className="rf-focus-ring rounded-lg border border-rf-outline-variant bg-rf-surface-base px-3 py-1 text-xs font-semibold text-rf-text-onyx hover:bg-rf-surface-container"
          >
            Tandai Dibaca
          </button>
        )}
        <button
          onClick={(e) => {
            e.preventDefault();
            onDelete(notification.id);
          }}
          className="rf-focus-ring rounded-lg border border-rf-outline-variant bg-rf-surface-base px-3 py-1 text-xs font-semibold text-rf-error hover:bg-rf-error/10"
        >
          Hapus
        </button>
      </div>
    </div>
  );

  if (notification.actionUrl) {
    return (
      <Link href={notification.actionUrl} onClick={() => !notification.read && onMarkAsRead(notification.id)}>
        {content}
      </Link>
    );
  }

  return content;
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Baru saja";
  if (diffMins < 60) return `${diffMins} menit yang lalu`;
  if (diffHours < 24) return `${diffHours} jam yang lalu`;
  if (diffDays < 7) return `${diffDays} hari yang lalu`;
  
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}
