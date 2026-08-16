import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { SelectedLocation } from "@/types/location";

interface LocationState {
  location: SelectedLocation | null;
  setLocation: (location: SelectedLocation) => void;
  clearLocation: () => void;
}

export const useLocationStore = create<LocationState>()(
  persist(
    (set) => ({
      location: null,
      setLocation: (location) => set({ location }),
      clearLocation: () => set({ location: null }),
    }),
    { name: "cutzone:location" },
  ),
);
