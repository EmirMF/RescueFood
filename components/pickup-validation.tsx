"use client";

import { useEffect, useRef, useState } from "react";
import { secureFetch } from "@/lib/secure-fetch";
import { PickupCodeCard } from "@/components/pickup-code-card";
import type { RescueOrder } from "@/lib/types";

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

export function PickupValidation({ order }: { order: RescueOrder }) {
  const [status, setStatus] = useState(order.status);
  const [inputCode, setInputCode] = useState("");
  const [message, setMessage] = useState("");
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scannerMessage, setScannerMessage] = useState(
    "Buka kamera untuk scan QR customer.",
  );
  const [scannerReady, setScannerReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  async function completePickup() {
    setMessage("");

    try {
      const response = await secureFetch(`/api/orders/${order.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "COMPLETED",
        }),
      });
      const result = await response.json();

      if (!response.ok || !result.data) {
        setMessage(result.error ?? "Status backend belum bisa diperbarui.");
        return;
      }

      setStatus("completed");
      setMessage("Status pickup tersimpan di database.");
    } catch {
      setMessage("API tidak terhubung. Status belum tersimpan.");
    }
  }

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
        setScannerMessage(
          "Browser ini belum mendukung QR scanner bawaan. Input kode manual tetap bisa dipakai.",
        );
        return;
      }

      if (!navigator.mediaDevices?.getUserMedia) {
        setScannerReady(false);
        setScannerMessage(
          "Kamera tidak tersedia di browser ini. Input kode manual tetap bisa dipakai.",
        );
        return;
      }

      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: {
              ideal: "environment",
            },
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
        setScannerMessage("Arahkan kamera ke QR customer.");

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
                  ? "QR cocok. Pickup bisa diselesaikan."
                  : "QR terbaca, tapi kodenya tidak cocok dengan order ini.",
              );
            }
          } catch {
            setScannerMessage("QR belum terbaca. Coba dekatkan kamera.");
          }

          frameId = window.setTimeout(scanFrame, 500);
        };

        scanFrame();
      } catch {
        setScannerReady(false);
        setScannerMessage(
          "Izin kamera ditolak atau kamera tidak bisa dibuka. Input kode manual tetap bisa dipakai.",
        );
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

  const isCodeMatched = inputCode === order.pickupCode;

  return (
    <>
      <div className="mt-4">
        <PickupCodeCard code={order.pickupCode} label="Customer code" />
      </div>

      <div className="mt-4 rounded-rf-control border border-rf-outline-variant bg-rf-surface-container-low p-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-extrabold text-rf-text-onyx">
              QR scanner
            </p>
            <p className="mt-1 text-xs font-semibold leading-5 text-rf-text-muted">
              {scannerMessage}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setScannerOpen((current) => !current)}
            className="rf-focus-ring shrink-0 rounded-rf-control border border-rf-outline-variant px-3 py-2 text-xs font-extrabold text-rf-primary"
          >
            {scannerOpen ? "Tutup" : "Scan QR"}
          </button>
        </div>

        {scannerOpen ? (
          <div className="mt-3 overflow-hidden rounded-rf-control bg-black">
            <video
              ref={videoRef}
              className="aspect-[4/3] w-full object-cover"
              muted
              playsInline
            />
            {!scannerReady ? (
              <div className="border-t border-white/10 px-3 py-2 text-xs font-semibold text-white/75">
                Menunggu akses kamera...
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      <label className="mt-4 grid gap-2">
        <span className="text-sm font-extrabold text-rf-text-onyx">
          Scan QR atau input kode pickup
        </span>
        <input
          value={inputCode}
          onChange={(event) => setInputCode(event.target.value.toUpperCase())}
          className="rf-focus-ring h-12 rounded-rf-control border border-rf-outline-variant bg-rf-surface-container-low px-4 text-center text-lg font-black tracking-wider outline-none focus:border-rf-primary"
        />
      </label>
      <button
        type="button"
        disabled={status === "completed" || !isCodeMatched}
        onClick={completePickup}
        className="rf-focus-ring mt-5 w-full rounded-rf-control bg-rf-primary-container px-5 py-4 text-sm font-extrabold text-white disabled:cursor-not-allowed disabled:bg-rf-outline-variant disabled:text-rf-text-muted"
      >
        {status === "completed" ? "Pickup sudah selesai" : "Tandai pickup selesai"}
      </button>
      <p className="mt-4 text-center text-xs font-semibold leading-5 text-rf-text-muted">
        {message || "Status akan disimpan ke backend untuk order database."}
      </p>
    </>
  );
}
