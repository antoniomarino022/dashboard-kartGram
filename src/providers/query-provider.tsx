"use client";

import { useState } from "react";
import axios from "axios";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as Tooltip from "@radix-ui/react-tooltip";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
            retry: (failureCount, error) => {
              if (axios.isAxiosError(error)) {
                const status = error.response?.status;
                if (
                  status === 400 ||
                  status === 401 ||
                  status === 403 ||
                  status === 404 ||
                  status === 409
                ) {
                  return false;
                }
              }
              return failureCount < 1;
            },
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <Tooltip.Provider delayDuration={250}>{children}</Tooltip.Provider>
    </QueryClientProvider>
  );
}
