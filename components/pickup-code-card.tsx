"use client";

import Image from "next/image";
import QRCode from "qrcode";
import { useEffect, useState } from "react";

type PickupCodeCardProps = {
  code: string;
  label?: string;
};

export function PickupCodeCard({
  code,
  label = "Pickup code",
}: PickupCodeCardProps) {
  const [qrDataUrl, setQrDataUrl] = useState("");

  useEffect(() => {
    let isMounted = true;

    QRCode.toDataURL(code, {
      errorCorrectionLevel: "M",
      margin: 2,
      scale: 8,
      type: "image/png",
    }).then((url) => {
      if (isMounted) {
        setQrDataUrl(url);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [code]);

  return (
    <div className="rounded-rf-card bg-rf-primary-fixed p-6 text-center">
      <p className="text-sm font-extrabold text-rf-primary">{label}</p>
      <p className="mt-2 text-4xl font-black tracking-wider text-rf-primary">
        {code}
      </p>
      <div className="mx-auto mt-5 flex size-44 items-center justify-center rounded-rf-control border border-rf-outline-variant bg-white p-3">
        {qrDataUrl ? (
          <Image
            src={qrDataUrl}
            alt={`QR pickup ${code}`}
            width={160}
            height={160}
            className="size-40"
            unoptimized
          />
        ) : (
          <span className="text-xs font-extrabold text-rf-text-muted">
            Membuat QR...
          </span>
        )}
      </div>
    </div>
  );
}
