import { apiClient } from "./client";
import type { Paginated } from "@/types/api";
import type { NearbySalon, Salon } from "@/types/salon";

export interface NearbySalonsQuery {
  lat: number;
  lng: number;
  radius?: number;
  search?: string;
}

export function fetchNearbySalons(query: NearbySalonsQuery) {
  return apiClient.get<NearbySalon[]>("/salons/nearby", query);
}

export interface ListSalonsQuery {
  page?: number;
  limit?: number;
  search?: string;
}

export function fetchSalons(query: ListSalonsQuery = {}) {
  return apiClient.get<Paginated<Salon>>("/salons", query);
}

export function fetchSalon(id: string) {
  return apiClient.get<Salon>(`/salons/${id}`);
}
