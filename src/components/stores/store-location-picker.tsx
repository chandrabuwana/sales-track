"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useToast } from "@/components/ui/use-toast";

// Fix for default marker icon in Leaflet
const icon = L.icon({
  iconUrl: "/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface LocationPickerProps {
  value: { latitude: number; longitude: number };
  onChange: (location: { latitude: number; longitude: number }) => void;
}

function LocationMarker({ value, onChange }: LocationPickerProps) {
  const [position, setPosition] = useState<L.LatLng | null>(
    new L.LatLng(value.latitude, value.longitude)
  );
  const { toast } = useToast();

  const map = useMapEvents({
    click(e) {
      // Check if location is within Jakarta bounds
      if (
        e.latlng.lat < -6.4 ||
        e.latlng.lat > -6.1 ||
        e.latlng.lng < 106.7 ||
        e.latlng.lng > 107.0
      ) {
        toast({
          variant: "destructive",
          title: "Location Out of Bounds",
          description: "Please select a location within Jakarta area",
        });
        return;
      }
      setPosition(e.latlng);
      onChange({ latitude: e.latlng.lat, longitude: e.latlng.lng });
    },
  });

  useEffect(() => {
    // Center map on initial position
    if (position) {
      map.setView(position, map.getZoom());
    }
  }, []);

  return position === null ? null : (
    <Marker position={position} icon={icon} />
  );
}

export function StoreLocationPicker({ value, onChange }: LocationPickerProps) {
  return (
    <div className="h-[300px] w-full rounded-md border">
      <MapContainer
        center={[value.latitude, value.longitude]}
        zoom={13}
        className="h-full w-full rounded-md"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker value={value} onChange={onChange} />
      </MapContainer>
    </div>
  );
}
