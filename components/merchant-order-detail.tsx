"use client";

import { useCallback, useState, useEffect, useRef } from "react";
import Image from "next/image";
import type { RescueOrder, FoodListing } from "@/lib/types";
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

type Review = {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  customer: {
    id: string;
    name: string;
  };
};

type BarcodeDetectorConstructor = new (options?: {
  formats?: string[];
}) => {
  detect: (source: HTMLVideoElement) => Promise<Array<{ rawValue: string }>>;
};

declare global {
  interface Window {
    BarcodeDetector?: BarcodeDetectorConstructor;
  }
}

export function MerchantOrderDetail({
  order: initialOrder,
  listing,
  customerEmail,
}: {
  order: RescueOrder;
  listing: FoodListing | null;
  customerEmail: string;
}) {
  const [order, setOrder] = useState(initialOrder);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [review, setReview] = useState<Review | null>(null);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scannerMessage, setScannerMessage] = useState("Buka kamera untuk scan QR customer");
  const [scannerReady, setScannerReady] = useState(false);
  const [inputCode, setInputCode] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  async function updateOrderStatus(newStatus: string) {
    setMessage("");
    setLoading(true);

    // Convert frontend status format to API format
    const apiStatus = newStatus.toUpperCase();

    try {
      const response = await secureFetch(`/api/orders/${order.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: apiStatus }),
      });

      const result = await response.json();

      if (!response.ok || !result.data) {
        setMessage(result.error ?? "Gagal memperbarui status");
        return;
      }

      setOrder({ ...order, status: newStatus as typeof order.status });
      setMessage("Status berhasil diperbarui");
    } catch {
      setMessage("Gagal terhubung ke server");
    } finally {
      setLoading(false);
    }
  }

  // Fetch messages
  const fetchMessages = useCallback(async () => {
    try {
      const response = await secureFetch(`/api/orders/${order.id}/messages`);
      const result = await response.json();

      if (response.ok && result.data) {
        setMessages(result.data);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoadingMessages(false);
    }
  }, [order.id]);

  // Send message
  async function sendMessage() {
    if (!chatMessage.trim() || sendingMessage) return;

    setSendingMessage(true);
    try {
      const response = await secureFetch(`/api/orders/${order.id}/messages`, {
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

  // Fetch review
  const fetchReview = useCallback(async () => {
    try {
      const response = await secureFetch(`/api/orders/${order.id}/review`);
      const result = await response.json();

      if (response.ok && result.data) {
        setReview(result.data);
      }
    } catch (error) {
      console.error("Error fetching review:", error);
    } finally {
    }
  }, [order.id]);

  useEffect(() => {
    const timeout = window.setTimeout(fetchMessages, 0);
    const interval = window.setInterval(fetchMessages, 5000);
    return () => {
      window.clearTimeout(timeout);
      window.clearInterval(interval);
    };
  }, [fetchMessages]);

  useEffect(() => {
    const timeout = window.setTimeout(fetchReview, 0);
    return () => window.clearTimeout(timeout);
  }, [fetchReview]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const statusConfig = {
    pending: { label: "Pending Validation", icon: "pending", color: "bg-surface-container-high text-on-surface" },
    confirmed: { label: "Confirmed", icon: "check_circle", color: "bg-primary/10 text-primary" },
    ready_for_pickup: { label: "Ready for Pickup", icon: "inventory_2", color: "bg-secondary/10 text-secondary" },
    completed: { label: "Completed", icon: "task_alt", color: "bg-primary text-on-primary" },
    cancelled: { label: "Cancelled", icon: "cancel", color: "bg-error/10 text-error" },
    expired: { label: "Expired", icon: "schedule", color: "bg-surface-container text-on-surface-variant" },
  };

  // QR Scanner Effect
  useEffect(() => {
    if (!scannerOpen) {
      return;
    }

    let stream: MediaStream | null = null;
    let frameId = 0;
    let stopped = false;
    const videoElement = videoRef.current;

    async function startScanner() {
      if (!window.BarcodeDetector) {
        setScannerReady(false);
        setScannerMessage("Browser ini belum mendukung QR scanner. Input kode manual tetap bisa dipakai.");
        return;
      }

      if (!navigator.mediaDevices?.getUserMedia) {
        setScannerReady(false);
        setScannerMessage("Kamera tidak tersedia. Input kode manual tetap bisa dipakai.");
        return;
      }

      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: "environment" },
          },
          audio: false,
        });

        const video = videoElement;
        if (!video || stopped) {
          return;
        }

        video.srcObject = stream;
        await video.play();

        const detector = new window.BarcodeDetector({
          formats: ["qr_code"],
        });

        setScannerReady(true);
        setScannerMessage("Arahkan kamera ke QR customer");

        const scanFrame = async () => {
          if (stopped || !videoElement) {
            return;
          }

          try {
            const codes = await detector.detect(videoElement);
            const code = codes[0]?.rawValue?.trim().toUpperCase();

            if (code) {
              setInputCode(code);
              setScannerMessage(
                code === order.pickupCode
                  ? "✓ QR cocok! Kode valid."
                  : "✗ Kode tidak cocok dengan order ini."
              );
            }
          } catch {
            setScannerMessage("Scanning...");
          }

          frameId = window.setTimeout(scanFrame, 500);
        };

        scanFrame();
      } catch {
        setScannerReady(false);
        setScannerMessage("Izin kamera ditolak. Input kode manual tetap bisa dipakai.");
      }
    }

    startScanner();

    return () => {
      stopped = true;
      window.clearTimeout(frameId);
      stream?.getTracks().forEach((track) => track.stop());
      if (videoElement) {
        videoElement.srcObject = null;
      }
      setScannerReady(false);
    };
  }, [order.pickupCode, scannerOpen]);

  const currentStatus = statusConfig[order.status] || statusConfig.pending;
  const totalPrice = listing ? listing.rescuePrice * order.quantity : 0;

  return (
    <div className="w-full max-w-[1280px] mx-auto px-5 md:px-16 py-12 flex flex-col gap-8">
      {/* Breadcrumb & Header */}
      <div className="flex flex-col gap-4">
        <a className="flex items-center gap-2 text-primary font-label-md text-label-md hover:underline w-fit" href="/merchant">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Back to Orders
        </a>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-background">
              Order #{order.id.slice(-8).toUpperCase()}
            </h1>
            <span className={`${currentStatus.color} px-3 py-1 rounded-full font-label-sm text-label-sm flex items-center gap-1`}>
              <span className="material-symbols-outlined text-[14px]">{currentStatus.icon}</span>
              {currentStatus.label}
            </span>
          </div>
          <div className="text-on-surface-variant font-body-md text-body-md flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px]">schedule</span>
            {new Date(order.createdAt).toLocaleDateString("id-ID", { 
              day: "numeric", 
              month: "long", 
              hour: "2-digit", 
              minute: "2-digit" 
            })}
          </div>
        </div>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Order Details (8 cols) */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
          {/* Items Card */}
          <section className="bg-surface-container-lowest rounded-xl p-6 flex flex-col gap-6 relative overflow-hidden" style={{ boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.04)" }}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[100px] -z-0"></div>
            <h2 className="font-title-md text-title-md text-on-surface relative z-10 flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">shopping_bag</span>
              Order Items
            </h2>
            
            <div className="flex flex-col gap-4 relative z-10">
              {/* Item */}
              <div className="flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-lg bg-surface-container overflow-hidden flex-shrink-0 relative">
                    {listing?.imageUrl ? (
                      <Image 
                        alt={listing.title} 
                        src={listing.imageUrl}
                        fill
                        className="object-cover" 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-on-surface-variant">restaurant</span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-label-md text-label-md text-on-surface">
                      {listing?.title || "Item tidak ditemukan"}
                    </span>
                    <span className="font-body-md text-body-md text-on-surface-variant text-sm">
                      {listing?.category || "-"}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-right">
                  <span className="font-body-md text-body-md text-on-surface-variant">
                    x {order.quantity}
                  </span>
                  <span className="font-label-md text-label-md text-on-surface w-20">
                    Rp {listing ? listing.rescuePrice.toLocaleString("id-ID") : "-"}
                  </span>
                </div>
              </div>
            </div>

            {/* Subtotal Section */}
            <div className="mt-4 pt-4 border-t border-outline-variant/20 flex flex-col gap-2 relative z-10">
              <div className="flex justify-between items-center text-on-surface-variant font-body-md text-body-md">
                <span>Subtotal</span>
                <span>Rp {totalPrice.toLocaleString("id-ID")}</span>
              </div>
              <div className="flex justify-between items-center text-on-surface-variant font-body-md text-body-md">
                <span>Platform Fee</span>
                <span>Rp 0</span>
              </div>
              <div className="flex justify-between items-center mt-2 pt-2 text-on-surface font-title-md text-title-md">
                <span>Total Earnings</span>
                <span className="text-primary">Rp {totalPrice.toLocaleString("id-ID")}</span>
              </div>
              
              {/* Payment Status */}
              <div className="mt-3 pt-3 border-t border-outline-variant/20">
                <div className="flex justify-between items-center">
                  <span className="font-label-md text-label-md text-on-surface">Payment Status</span>
                  <span className={`font-label-sm text-label-sm px-3 py-1 rounded-full ${
                    order.paymentStatus === 'PAID' 
                      ? 'bg-primary/10 text-primary' 
                      : order.paymentStatus === 'FAILED'
                        ? 'bg-error/10 text-error'
                        : 'bg-surface-container-high text-on-surface-variant'
                  }`}>
                    {order.paymentStatus === 'PAID' ? '✓ Paid' : 
                     order.paymentStatus === 'FAILED' ? '✗ Failed' :
                     order.paymentStatus === 'EXPIRED' ? 'Expired' : 'Pending'}
                  </span>
                </div>
                {order.paymentMethod && (
                  <p className="font-body-md text-body-md text-on-surface-variant text-sm mt-1">
                    Method: {order.paymentMethod}
                  </p>
                )}
                {order.paidAt && (
                  <p className="font-body-md text-body-md text-on-surface-variant text-sm">
                    Paid: {new Date(order.paidAt).toLocaleString("id-ID")}
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* Pickup Code Card with QR Scanner */}
          <section className="bg-surface-container-lowest rounded-xl p-6 flex flex-col gap-4" style={{ boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.04)" }}>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-[32px]">qr_code_scanner</span>
              </div>
              <div className="flex flex-col flex-grow">
                <h3 className="font-title-md text-title-md text-on-surface">Pickup Validation</h3>
                <p className="font-body-md text-body-md text-on-surface-variant text-sm">
                  Expected code: <span className="font-label-md text-on-surface">{order.pickupCode}</span>
                </p>
              </div>
            </div>

            {/* QR Scanner Section */}
            <div className="border border-outline-variant/30 rounded-lg p-4 bg-surface-container-low">
              <div className="flex items-center justify-between gap-3 mb-3">
                <div>
                  <p className="font-label-md text-label-md text-on-surface">QR Scanner</p>
                  <p className="font-body-md text-body-md text-on-surface-variant text-xs mt-1">
                    {scannerMessage}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setScannerOpen((current) => !current)}
                  className="shrink-0 rounded-full border border-primary px-4 py-2 font-label-sm text-label-sm text-primary hover:bg-primary/10 transition-colors"
                >
                  {scannerOpen ? "Close" : "Scan QR"}
                </button>
              </div>

              {scannerOpen && (
                <div className="mt-3 overflow-hidden rounded-lg bg-black">
                  <video
                    ref={videoRef}
                    className="aspect-[4/3] w-full object-cover"
                    muted
                    playsInline
                  />
                  {!scannerReady && (
                    <div className="border-t border-white/10 px-3 py-2 text-xs font-label-sm text-white/75">
                      Waiting for camera access...
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Manual Input */}
            <div className="flex flex-col gap-2">
              <label className="font-label-md text-label-md text-on-surface">
                Or enter code manually
              </label>
              <input
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                placeholder="Enter pickup code"
                className="h-12 rounded-lg border border-outline-variant bg-surface-container px-4 text-center text-lg font-bold tracking-wider outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-on-surface"
              />
              {inputCode && (
                <p className={`text-center text-sm font-label-sm ${inputCode === order.pickupCode ? "text-primary" : "text-error"}`}>
                  {inputCode === order.pickupCode ? "✓ Code matched!" : "✗ Code does not match"}
                </p>
              )}
            </div>

            {/* Complete Pickup Button */}
            <button
              onClick={() => updateOrderStatus("completed")}
              disabled={order.status !== "ready_for_pickup" || inputCode !== order.pickupCode || loading}
              className="w-full bg-primary text-on-primary font-label-md text-label-md py-3 px-4 rounded-full hover:bg-primary-container transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              title={
                order.status !== "ready_for_pickup" 
                  ? "Mark as ready first" 
                  : inputCode !== order.pickupCode 
                    ? "Enter correct pickup code" 
                    : ""
              }
            >
              <span className="material-symbols-outlined text-[20px]">task_alt</span>
              Complete Pickup
            </button>
          </section>
        </div>

        {/* RIGHT COLUMN: Customer & Actions (4 cols) */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
          {/* Action Buttons */}
          <section className="bg-surface-container-lowest rounded-xl p-6 flex flex-col gap-4" style={{ boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.04)" }}>
            <button
              onClick={() => updateOrderStatus("confirmed")}
              disabled={order.status !== "pending" || loading}
              className="w-full bg-primary text-on-primary font-label-md text-label-md py-3 px-4 rounded-full hover:bg-primary-container transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              title={order.status !== "pending" ? "Order already confirmed" : ""}
            >
              <span className="material-symbols-outlined text-[20px]">check_circle</span>
              Confirm Order
            </button>

            <button
              onClick={() => updateOrderStatus("ready_for_pickup")}
              disabled={order.status !== "confirmed" || loading}
              className="w-full bg-secondary text-on-secondary font-label-md text-label-md py-3 px-4 rounded-full hover:bg-secondary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              title={order.status !== "confirmed" ? "Confirm order first" : ""}
            >
              <span className="material-symbols-outlined text-[20px]">inventory_2</span>
              Mark as Ready
            </button>

            <div className="w-full h-[1px] bg-outline-variant/30 my-2"></div>

            <button
              onClick={() => updateOrderStatus("cancelled")}
              disabled={order.status === "completed" || order.status === "cancelled" || loading}
              className="w-full bg-transparent text-error font-label-md text-label-md py-2 px-4 rounded-full hover:bg-error-container/20 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-[20px]">cancel</span>
              Cancel Order
            </button>

            {message && (
              <p className={`text-center text-sm ${message.includes("berhasil") ? "text-primary" : "text-error"}`}>
                {message}
              </p>
            )}
          </section>

          {/* Customer Info */}
          <section className="bg-surface-container-lowest rounded-xl p-6 flex flex-col gap-4" style={{ boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.04)" }}>
            <h3 className="font-title-md text-title-md text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">person</span>
              Customer
            </h3>
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-label-md text-label-md flex-shrink-0">
                {order.customerName.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col flex-grow">
                <span className="font-label-md text-label-md text-on-surface">
                  {order.customerName}
                </span>
                <span className="font-body-md text-body-md text-on-surface-variant text-sm">
                  {customerEmail}
                </span>
                <div className="flex items-center gap-1 text-primary mt-1">
                  <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="font-label-sm text-label-sm">4.9</span>
                  <span className="font-body-md text-body-md text-on-surface-variant ml-1 text-xs">(12 orders)</span>
                </div>
              </div>
            </div>
          </section>

          {/* Chat Area */}
          <section className="bg-surface-container-lowest rounded-xl p-6 flex flex-col gap-3" style={{ boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.04)" }}>
            <h3 className="font-title-md text-title-md text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">forum</span>
              Messages
            </h3>
            <div ref={chatScrollRef} className="flex-grow overflow-y-auto flex flex-col gap-3 pr-2 h-64 chat-scroll">
              {loadingMessages ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-on-surface-variant text-sm">Loading messages...</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-on-surface-variant text-sm">No messages yet. Start the conversation!</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isCustomer = msg.sender.role === "CUSTOMER";
                  const time = new Date(msg.createdAt).toLocaleTimeString("id-ID", {
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  return (
                    <div
                      key={msg.id}
                      className={`p-3 rounded-xl w-10/12 border ${
                        isCustomer
                          ? "bg-surface-container-low rounded-tr-xl rounded-bl-xl rounded-br-xl self-start border-outline-variant/20"
                          : "bg-primary/10 rounded-tl-xl rounded-bl-xl rounded-br-xl self-end border-primary/20"
                      }`}
                    >
                      <p className="font-body-md text-body-md text-on-surface text-sm">{msg.content}</p>
                      <span className={`font-label-sm text-label-sm text-on-surface-variant text-[10px] block mt-1 ${isCustomer ? "" : "text-right"}`}>
                        {time}
                      </span>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>
            {/* Chat Input */}
            <div className="flex items-center gap-2 mt-auto pt-2 border-t border-outline-variant/20">
              <input 
                className="flex-grow bg-surface-container rounded-full border-none focus:ring-2 focus:ring-primary font-body-md text-body-md px-4 py-2 text-sm text-on-surface placeholder:text-on-surface-variant/50" 
                placeholder="Type a message..." 
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
                className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center hover:bg-primary transition-colors flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={sendMessage}
                disabled={sendingMessage || !chatMessage.trim()}
              >
                <span className="material-symbols-outlined text-[18px]">send</span>
              </button>
            </div>
          </section>

          {/* Review Section */}
          {review && (
            <section className="bg-surface-container-lowest rounded-xl p-6 flex flex-col gap-3" style={{ boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.04)" }}>
              <h3 className="font-title-md text-title-md text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px]">rate_review</span>
                Customer Review
              </h3>
              
              <div className="flex items-center gap-2 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className="material-symbols-outlined text-[24px]"
                    style={{
                      fontVariationSettings: star <= review.rating ? "'FILL' 1" : "'FILL' 0",
                      color: star <= review.rating ? "#F59E0B" : "#D1D5DB",
                    }}
                  >
                    star
                  </span>
                ))}
                <span className="font-label-lg text-label-lg text-on-surface ml-2">
                  {review.rating}.0
                </span>
              </div>

              {review.comment && (
                <p className="font-body-md text-body-md text-on-surface leading-relaxed">
                  {review.comment}
                </p>
              )}

              <div className="flex items-center gap-2 mt-2 pt-3 border-t border-outline-variant/20">
                <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-label-sm text-label-sm">
                  {review.customer.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col">
                  <span className="font-label-sm text-label-sm text-on-surface">
                    {review.customer.name}
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant text-xs">
                    {new Date(review.createdAt).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
