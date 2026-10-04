/**
 * Gradient AI — Spatial World Event Bus
 * Connects 2D UI interactions to the persistent 3D spatial world
 */

export type SpatialEventType =
  | "energy-pulse"
  | "trajectory-highlight"
  | "capability-focus"
  | "sector-focus"
  | "speed-burst"
  | "risk-shift";

export interface SpatialEventDetail {
  type: SpatialEventType;
  intensity?: number;
  sector?: number;
  color?: string;
  dimension?: string;
  payload?: Record<string, unknown>;
}

export function emitSpatialEvent(detail: SpatialEventDetail): void {
  if (typeof window === "undefined") return;
  const event = new CustomEvent<SpatialEventDetail>("gradient-spatial-event", {
    detail,
  });
  window.dispatchEvent(event);
}
