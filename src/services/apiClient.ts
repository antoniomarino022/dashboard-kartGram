import axios, { AxiosError } from "axios";
import { API_URL } from "@/lib/api-url";
import type {
  AdminStats,
  ApiErrorResponse,
  CreateItemInput,
  Item,
  PaymentsPage,
  PlayerDetail,
  PlayersPage,
  UpdateItemInput,
  UpdatePlayerInput,
} from "@/types/api";

export const apiClient = axios.create({
  baseURL: `${API_URL}/api`,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// sessione scaduta → login
apiClient.interceptors.response.use(undefined, (error: unknown) => {
  if (
    axios.isAxiosError(error) &&
    error.response?.status === 401 &&
    typeof window !== "undefined" &&
    window.location.pathname !== "/login"
  ) {
    window.location.replace("/login");
  }
  return Promise.reject(error);
});

export interface ParsedApiError {
  status?: number;
  message: string;
  fieldErrors?: Record<string, string[]>;
  isForbidden: boolean;
}

export function parseApiError(error: unknown): ParsedApiError {
  if (axios.isAxiosError(error)) {
    const axiosErr = error as AxiosError<ApiErrorResponse>;
    const status = axiosErr.response?.status;
    const data = axiosErr.response?.data;

    if (status === 401 || status === 403) {
      const apiMsg =
        typeof data === "object" && data !== null
          ? data.message || data.error
          : undefined;
      return {
        status,
        message: apiMsg || (status === 401 ? "Sessione scaduta" : "Accesso negato"),
        isForbidden: status === 403,
      };
    }

    if (status === 404) {
      const apiMsg =
        typeof data === "object" && data !== null
          ? data.message || data.error
          : undefined;
      return {
        status: 404,
        message:
          apiMsg ||
          `Non trovato (${axiosErr.config?.url || ""})`,
        isForbidden: false,
      };
    }

    if (status === 400 && data?.errors) {
      const messages = Object.entries(data.errors)
        .flatMap(([field, errs]) => errs.map((e) => `${field}: ${e}`))
        .join(" | ");
      return {
        status: 400,
        message:
          messages ||
          data.message ||
          data.error ||
          "Errore di validazione dei dati.",
        fieldErrors: data.errors,
        isForbidden: false,
      };
    }

    const serverMessage =
      typeof data === "object" && data !== null
        ? data.message || data.error
        : undefined;

    return {
      status,
      message:
        serverMessage ||
        axiosErr.message ||
        "Si è verificato un errore durante la comunicazione con il server.",
      fieldErrors:
        typeof data === "object" && data !== null ? data.errors : undefined,
      isForbidden: false,
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message,
      isForbidden: false,
    };
  }

  return {
    message: "Errore imprevisto.",
    isForbidden: false,
  };
}

// --- API Services ---

export const adminService = {
  stats: async (): Promise<AdminStats> => {
    const { data } = await apiClient.get<AdminStats>("/admin/stats");
    return data;
  },
  items: async (): Promise<Item[]> => {
    const { data } = await apiClient.get<Item[]>("/admin/items");
    return data;
  },
  createItem: async (payload: CreateItemInput): Promise<Item> => {
    const { data } = await apiClient.post<Item>("/admin/items", payload);
    return data;
  },
  updateItem: async (id: string, payload: UpdateItemInput): Promise<Item> => {
    const { data } = await apiClient.put<Item>(`/admin/items/${encodeURIComponent(id)}`, payload);
    return data;
  },
  removeItem: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/items/${encodeURIComponent(id)}`);
  },
  players: async (q: string, page: number): Promise<PlayersPage> => {
    const { data } = await apiClient.get<PlayersPage>("/admin/players", {
      params: { q: q || undefined, page },
    });
    return data;
  },
  player: async (id: number): Promise<PlayerDetail> => {
    const { data } = await apiClient.get<PlayerDetail>(`/admin/players/${id}`);
    return data;
  },
  updatePlayer: async (id: number, payload: UpdatePlayerInput): Promise<PlayerDetail> => {
    const { data } = await apiClient.patch<PlayerDetail>(`/admin/players/${id}`, payload);
    return data;
  },
  grantItem: async (id: number, itemId: string): Promise<PlayerDetail> => {
    const { data } = await apiClient.post<PlayerDetail>(`/admin/players/${id}/items`, { itemId });
    return data;
  },
  revokeItem: async (id: number, itemId: string): Promise<PlayerDetail> => {
    const { data } = await apiClient.delete<PlayerDetail>(
      `/admin/players/${id}/items/${encodeURIComponent(itemId)}`
    );
    return data;
  },
  payments: async (page: number): Promise<PaymentsPage> => {
    const { data } = await apiClient.get<PaymentsPage>("/admin/payments", { params: { page } });
    return data;
  },
};
