import React, { useEffect, useRef, useMemo } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { generateCorridor3DBuildings } from '../data/buildings3D';

interface Buildings3DCanvasProps {
  routeGeometry?: [number, number][];
  enabled: boolean;
}

function adjustHexColor(hex: string, amount: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  if (isNaN(num)) return '#94a3b8';
  const delta = Math.round(2.55 * amount);
  const r = (num >> 16) + delta;
  const g = ((num >> 8) & 0x00ff) + delta;
  const b = (num & 0x0000ff) + delta;

  return (
    '#' +
    (
      0x1000000 +
      (r < 255 ? (r < 1 ? 0 : r) : 255) * 0x10000 +
      (g < 255 ? (g < 1 ? 0 : g) : 255) * 0x100 +
      (b < 255 ? (b < 1 ? 0 : b) : 255)
    )
      .toString(16)
      .slice(1)
  );
}

export const Buildings3DCanvas: React.FC<Buildings3DCanvasProps> = ({
  routeGeometry = [],
  enabled
}) => {
  const map = useMap();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const buildings = useMemo(() => generateCorridor3DBuildings(routeGeometry), [routeGeometry]);

  useEffect(() => {
    if (!enabled) {
      if (canvasRef.current) {
        canvasRef.current.style.display = 'none';
      }
      return;
    }

    let canvas = canvasRef.current;
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.className = 'leaflet-3d-buildings-canvas';
      canvas.style.position = 'absolute';
      canvas.style.top = '0';
      canvas.style.left = '0';
      canvas.style.pointerEvents = 'none';
      canvas.style.zIndex = '450';
      map.getPanes().overlayPane.appendChild(canvas);
      canvasRef.current = canvas;
    }
    canvas.style.display = 'block';

    const render = () => {
      if (!canvas || !map) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const size = map.getSize();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = size.x * dpr;
      canvas.height = size.y * dpr;
      canvas.style.width = `${size.x}px`;
      canvas.style.height = `${size.y}px`;

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, size.x, size.y);

      const zoom = map.getZoom();
      if (zoom < 14) {
        ctx.restore();
        return;
      }

      const scale = Math.pow(2, zoom - 15) * 1.4;

      buildings.forEach((bldg) => {
        const points = bldg.footprint.map(([lat, lon]) =>
          map.latLngToContainerPoint(L.latLng(lat, lon))
        );

        const minX = Math.min(...points.map((p) => p.x));
        const maxX = Math.max(...points.map((p) => p.x));
        const minY = Math.min(...points.map((p) => p.y));
        const maxY = Math.max(...points.map((p) => p.y));

        if (maxX < -50 || minX > size.x + 50 || maxY < -50 || minY > size.y + 50) {
          return;
        }

        const heightPx = -Math.min(90, Math.max(6, bldg.height * scale));
        const offsetX = heightPx * -0.25;

        // Ground shadow
        ctx.beginPath();
        ctx.moveTo(points[0].x + 4, points[0].y + 4);
        for (let i = 1; i < points.length; i++) {
          ctx.lineTo(points[i].x + 4, points[i].y + 4);
        }
        ctx.closePath();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.14)';
        ctx.fill();

        // Isometric walls
        for (let i = 0; i < points.length; i++) {
          const p1 = points[i];
          const p2 = points[(i + 1) % points.length];
          const top1 = { x: p1.x + offsetX, y: p1.y + heightPx };
          const top2 = { x: p2.x + offsetX, y: p2.y + heightPx };

          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.lineTo(top2.x, top2.y);
          ctx.lineTo(top1.x, top1.y);
          ctx.closePath();

          const dx = p2.x - p1.x;
          const dy = p2.y - p1.y;
          const isLightSide = dy > 0 || dx > 0;
          ctx.fillStyle = isLightSide ? bldg.color : adjustHexColor(bldg.color, -25);
          ctx.fill();
          ctx.strokeStyle = 'rgba(0, 0, 0, 0.18)';
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }

        // Roof
        ctx.beginPath();
        ctx.moveTo(points[0].x + offsetX, points[0].y + heightPx);
        for (let i = 1; i < points.length; i++) {
          ctx.lineTo(points[i].x + offsetX, points[i].y + heightPx);
        }
        ctx.closePath();
        ctx.fillStyle = bldg.roofColor;
        ctx.fill();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Building label when zoomed in
        if (bldg.name && zoom >= 16) {
          const centerX = points.reduce((acc, p) => acc + p.x, 0) / points.length + offsetX;
          const centerY = points.reduce((acc, p) => acc + p.y, 0) / points.length + heightPx - 6;

          ctx.font = 'bold 10px Plus Jakarta Sans, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          const textWidth = ctx.measureText(bldg.name).width;

          ctx.fillStyle = 'rgba(15, 23, 42, 0.82)';
          ctx.beginPath();
          if (typeof ctx.roundRect === 'function') {
            ctx.roundRect(centerX - textWidth / 2 - 4, centerY - 8, textWidth + 8, 16, 4);
          } else {
            ctx.rect(centerX - textWidth / 2 - 4, centerY - 8, textWidth + 8, 16);
          }
          ctx.fill();

          ctx.fillStyle = '#ffffff';
          ctx.fillText(bldg.name, centerX, centerY);
        }
      });

      ctx.restore();
    };

    map.on('move', render);
    map.on('zoom', render);
    map.on('viewreset', render);
    render();

    return () => {
      map.off('move', render);
      map.off('zoom', render);
      map.off('viewreset', render);
      if (canvas && canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
        canvasRef.current = null;
      }
    };
  }, [map, buildings, enabled]);

  return null;
};
