"use client";

import { useEffect, useRef } from "react";
import type { Map as LeafletMap, Marker } from "leaflet";

type MerchantLocationPickerProps = {
  address: string;
  latitude: string;
  longitude: string;
  onPick: (latitude: number, longitude: number) => void;
};

const fallbackPosition = {
  latitude: -6.917464,
  longitude: 107.619125,
};

export function MerchantLocationPicker({
  address,
  latitude,
  longitude,
  onPick,
}: MerchantLocationPickerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markerRef = useRef<Marker | null>(null);
  const onPickRef = useRef(onPick);
  const parsedLatitude = Number(latitude);
  const parsedLongitude = Number(longitude);
  const hasCoordinates =
    Number.isFinite(parsedLatitude) && Number.isFinite(parsedLongitude);
  const currentLatitude = hasCoordinates
    ? parsedLatitude
    : fallbackPosition.latitude;
  const currentLongitude = hasCoordinates
    ? parsedLongitude
    : fallbackPosition.longitude;
  const initialPositionRef = useRef({
    hasCoordinates,
    latitude: currentLatitude,
    longitude: currentLongitude,
  });

  useEffect(() => {
    onPickRef.current = onPick;
  }, [onPick]);

  useEffect(() => {
    let cancelled = false;

    async function setupMap() {
      if (!containerRef.current || mapRef.current) {
        return;
      }

      const leaflet = await import("leaflet");

      if (cancelled || !containerRef.current) {
        return;
      }

      const markerIcon = leaflet.icon({
        iconAnchor: [12, 41],
        iconRetinaUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconSize: [25, 41],
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
        shadowUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const initialPosition = initialPositionRef.current;
      const map = leaflet
        .map(containerRef.current, {
          scrollWheelZoom: false,
        })
        .setView(
          [initialPosition.latitude, initialPosition.longitude],
          initialPosition.hasCoordinates ? 16 : 13,
        );

      leaflet
        .tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        })
        .addTo(map);

      const marker = leaflet
        .marker([initialPosition.latitude, initialPosition.longitude], {
          draggable: true,
          icon: markerIcon,
        })
        .addTo(map);

      marker.on("dragend", () => {
        const position = marker.getLatLng();
        onPickRef.current(position.lat, position.lng);
      });

      map.on("click", (event) => {
        marker.setLatLng(event.latlng);
        onPickRef.current(event.latlng.lat, event.latlng.lng);
      });

      mapRef.current = map;
      markerRef.current = marker;
    }

    setupMap();

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const marker = markerRef.current;

    if (!map || !marker) {
      return;
    }

    const nextPosition: [number, number] = [currentLatitude, currentLongitude];
    marker.setLatLng(nextPosition);
    map.setView(nextPosition, hasCoordinates ? Math.max(map.getZoom(), 15) : 13);
  }, [currentLatitude, currentLongitude, hasCoordinates]);

  return (
    <div className="overflow-hidden rounded-xl border border-rf-outline-variant/30 bg-rf-surface-base">
      <div ref={containerRef} className="h-80 w-full" />
      <div className="border-t border-rf-outline-variant/20 p-4">
        <p className="break-words text-sm font-extrabold leading-6 text-rf-text-onyx">
          {address || "Klik peta untuk memilih titik pickup"}
        </p>
        <p className="mt-1 text-xs font-semibold leading-5 text-rf-text-muted">
          Klik peta atau geser pin untuk mengatur pinpoint merchant.
        </p>
      </div>
    </div>
  );
}
