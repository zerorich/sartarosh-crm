export interface Coordinates {
  lat: number;
  lng: number;
}

export type LocationSource = "current" | "map" | "none";

export interface SelectedLocation extends Coordinates {
  source: LocationSource;
  label?: string;
}
