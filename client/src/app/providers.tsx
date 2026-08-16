"use client";

import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { persistQueryClient } from "@tanstack/react-query-persist-client";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useEffect, useState } from "react";
import { makeQueryClient } from "@/lib/query-client";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => makeQueryClient());

  // Persistence is a client-only progressive enhancement (needs localStorage),
  // so it's wired up after mount rather than gating the provider itself —
  // otherwise SSR/static prerendering would render with no QueryClient at all.
  useEffect(() => {
    const persister = createSyncStoragePersister({ storage: window.localStorage, key: "cutzone:query-cache" });
    const [unsubscribe] = persistQueryClient({
      queryClient,
      persister,
      maxAge: 1000 * 60 * 60 * 24 * 3,
      dehydrateOptions: {
        shouldDehydrateQuery: (query) => query.state.status === "success",
      },
    });
    return unsubscribe;
  }, [queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === "development" && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}
