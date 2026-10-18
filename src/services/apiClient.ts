import axios, { AxiosError } from "axios";
import type {
  ApiErrorResponse,
  Car,
  Character,
  CreateCarInput,
  CreateCharacterInput,
  CreateMapInput,
  CreatePaintInput,
  CreatePowerupInput,
  CreateWheelInput,
  GameMap,
  Paint,
  Powerup,
  UpdateCarInput,
  UpdateCharacterInput,
  UpdateMapInput,
  UpdatePaintInput,
  UpdatePowerupInput,
  UpdateWheelInput,
  Wheel,
} from "@/types/api";

export const apiClient = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}/api`,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
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

    if (status === 403) {
      return {
        status: 403,
        message: "Accesso negato: sono richiesti privilegi di amministratore.",
        isForbidden: true,
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
          `Endpoint API non trovato (404: ${axiosErr.config?.url || ""}). Verifica che il backend aggiornato sia stato deployato o sia attivo.`,
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

export const carsService = {
  getAll: async (): Promise<Car[]> => {
    const { data } = await apiClient.get<Car[]>("/car");
    return data;
  },
  getById: async (id: number): Promise<Car> => {
    const { data } = await apiClient.get<Car>(`/car/${id}`);
    return data;
  },
  create: async (payload: CreateCarInput): Promise<Car> => {
    const { data } = await apiClient.post<Car>("/car", payload);
    return data;
  },
  update: async (id: number, payload: UpdateCarInput): Promise<Car> => {
    const { data } = await apiClient.put<Car>(`/car/${id}`, payload);
    return data;
  },
  remove: async (id: number): Promise<void> => {
    await apiClient.delete(`/car/${id}`);
  },
};

export const charactersService = {
  getAll: async (): Promise<Character[]> => {
    const { data } = await apiClient.get<Character[]>("/character");
    return data;
  },
  getById: async (id: number): Promise<Character> => {
    const { data } = await apiClient.get<Character>(`/character/${id}`);
    return data;
  },
  create: async (payload: CreateCharacterInput): Promise<Character> => {
    const { data } = await apiClient.post<Character>("/character", payload);
    return data;
  },
  update: async (id: number, payload: UpdateCharacterInput): Promise<Character> => {
    const { data } = await apiClient.put<Character>(`/character/${id}`, payload);
    return data;
  },
  remove: async (id: number): Promise<void> => {
    await apiClient.delete(`/character/${id}`);
  },
};

export const mapsService = {
  getAll: async (): Promise<GameMap[]> => {
    const { data } = await apiClient.get<GameMap[]>("/maps");
    return data;
  },
  getById: async (id: number): Promise<GameMap> => {
    const { data } = await apiClient.get<GameMap>(`/maps/${id}`);
    return data;
  },
  create: async (payload: CreateMapInput): Promise<GameMap> => {
    const { data } = await apiClient.post<GameMap>("/maps", payload);
    return data;
  },
  update: async (id: number, payload: UpdateMapInput): Promise<GameMap> => {
    const { data } = await apiClient.put<GameMap>(`/maps/${id}`, payload);
    return data;
  },
  remove: async (id: number): Promise<void> => {
    await apiClient.delete(`/maps/${id}`);
  },
};

export const paintsService = {
  getAll: async (): Promise<Paint[]> => {
    const { data } = await apiClient.get<Paint[]>("/paints");
    return data;
  },
  getById: async (id: number): Promise<Paint> => {
    const { data } = await apiClient.get<Paint>(`/paints/${id}`);
    return data;
  },
  create: async (payload: CreatePaintInput): Promise<Paint> => {
    const { data } = await apiClient.post<Paint>("/paints", payload);
    return data;
  },
  update: async (id: number, payload: UpdatePaintInput): Promise<Paint> => {
    const { data } = await apiClient.put<Paint>(`/paints/${id}`, payload);
    return data;
  },
  remove: async (id: number): Promise<void> => {
    await apiClient.delete(`/paints/${id}`);
  },
};

export const wheelsService = {
  getAll: async (): Promise<Wheel[]> => {
    const { data } = await apiClient.get<Wheel[]>("/wheels");
    return data;
  },
  getById: async (id: number): Promise<Wheel> => {
    const { data } = await apiClient.get<Wheel>(`/wheels/${id}`);
    return data;
  },
  create: async (payload: CreateWheelInput): Promise<Wheel> => {
    const { data } = await apiClient.post<Wheel>("/wheels", payload);
    return data;
  },
  update: async (id: number, payload: UpdateWheelInput): Promise<Wheel> => {
    const { data } = await apiClient.put<Wheel>(`/wheels/${id}`, payload);
    return data;
  },
  remove: async (id: number): Promise<void> => {
    await apiClient.delete(`/wheels/${id}`);
  },
};

export const powerupsService = {
  getAll: async (): Promise<Powerup[]> => {
    const { data } = await apiClient.get<Powerup[]>("/powerups");
    return data;
  },
  getById: async (id: number): Promise<Powerup> => {
    const { data } = await apiClient.get<Powerup>(`/powerups/${id}`);
    return data;
  },
  create: async (payload: CreatePowerupInput): Promise<Powerup> => {
    const { data } = await apiClient.post<Powerup>("/powerups", payload);
    return data;
  },
  update: async (id: number, payload: UpdatePowerupInput): Promise<Powerup> => {
    const { data } = await apiClient.put<Powerup>(`/powerups/${id}`, payload);
    return data;
  },
  remove: async (id: number): Promise<void> => {
    await apiClient.delete(`/powerups/${id}`);
  },
};

