'use client';

import { useState, useEffect } from 'react';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Custom styled marker — SVG drop pin
const markerSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="28" height="42">
  <defs>
    <filter id="shadow" x="-30%" y="-10%" width="160%" height="140%">
      <feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.3"/>
    </filter>
  </defs>
  <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24s12-15 12-24C24 5.4 18.6 0 12 0z"
        fill="#6366f1" filter="url(#shadow)"/>
  <circle cx="12" cy="12" r="5" fill="white"/>
</svg>`;

const customIcon = L.divIcon({
  html: markerSvg,
  className: '',
  iconSize: [28, 42],
  iconAnchor: [14, 42],
  popupAnchor: [0, -42],
});

interface CityMapInnerProps {
  selectedPosition: [number, number] | null;
  onMapClick: (lat: number, lng: number) => void;
}

function MapClickHandler({
  onMapClick,
  onPendingClick,
}: {
  onMapClick: (lat: number, lng: number) => void;
  onPendingClick: (pos: [number, number]) => void;
}) {
  useMapEvents({
    click(e) {
      const pos: [number, number] = [e.latlng.lat, e.latlng.lng];
      onPendingClick(pos); // 즉시 핀 표시
      onMapClick(e.latlng.lat, e.latlng.lng); // 역지오코딩 시작
    },
  });
  return null;
}

function FlyToPosition({ position }: { position: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.setView(position, Math.max(map.getZoom(), 8), { animate: true, duration: 0.15 });
    }
  }, [map, position]);
  return null;
}

export default function CityMapInner({ selectedPosition, onMapClick }: CityMapInnerProps) {
  const [pendingPosition, setPendingPosition] = useState<[number, number] | null>(null);
  const center: [number, number] = selectedPosition || [37.57, 126.98];
  const zoom = selectedPosition ? 10 : 3;

  // selectedPosition이 업데이트되면 pending 클리어
  useEffect(() => {
    if (selectedPosition) {
      setPendingPosition(null);
    }
  }, [selectedPosition]);

  const displayPosition = pendingPosition || selectedPosition;

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height: '240px', width: '100%' }}
      className="rounded-lg z-0 border shadow-sm"
    >
      <TileLayer
        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />
      <MapClickHandler onMapClick={onMapClick} onPendingClick={setPendingPosition} />
      <FlyToPosition position={selectedPosition} />
      {displayPosition && (
        <>
          <CircleMarker
            center={displayPosition}
            radius={20}
            pathOptions={{
              color: '#6366f1',
              fillColor: '#6366f1',
              fillOpacity: 0.1,
              weight: 1.5,
            }}
          />
          <Marker position={displayPosition} icon={customIcon} />
        </>
      )}
    </MapContainer>
  );
}
