import axios, { AxiosError } from "axios";
import type {
  ApiErrorResponse,
  Car,
  Character,
  CreateCarInput,
  CreateCharacterInput,
  CreateMapInput,
  GameMap,
  UpdateCarInput,
  UpdateCharacterInput,
  UpdateMapInput,
} from "@/types/api";

export const apiClient = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL || "https://kart-gram.vercel.app"}/api`,
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

    if (status === 400 && data?.errors) {
      const messages = Object.entries(data.errors)
        .flatMap(([field, errs]) => errs.map((e) => `${field}: ${e}`))
        .join(" | ");
      return {
        status: 400,
        message: messages || data.message || "Errore di validazione dei dati.",
        fieldErrors: data.errors,
        isForbidden: false,
      };
    }

    return {
      status,
      message:
        data?.message ||
        axiosErr.message ||
        "Si è verificato un errore durante la comunicazione con il server.",
      fieldErrors: data?.errors,
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
