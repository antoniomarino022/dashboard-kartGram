"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  carsService,
  charactersService,
  mapsService,
} from "@/services/apiClient";
import type {
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

export const catalogKeys = {
  cars: ["cars"] as const,
  characters: ["characters"] as const,
  maps: ["maps"] as const,
};

// --- Cars Hooks ---

export function useCarsQuery() {
  return useQuery({
    queryKey: catalogKeys.cars,
    queryFn: carsService.getAll,
  });
}

export function useCreateCarMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateCarInput) => carsService.create(payload),
    onSuccess: (createdCar) => {
      queryClient.setQueryData<Car[]>(catalogKeys.cars, (prev = []) => [
        ...prev,
        createdCar,
      ]);
      queryClient.invalidateQueries({ queryKey: catalogKeys.cars });
    },
  });
}

export function useUpdateCarMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateCarInput }) =>
      carsService.update(id, payload),
    onSuccess: (updatedCar) => {
      queryClient.setQueryData<Car[]>(catalogKeys.cars, (prev = []) =>
        prev.map((item) => (item.id === updatedCar.id ? updatedCar : item))
      );
      queryClient.invalidateQueries({ queryKey: catalogKeys.cars });
    },
  });
}

export function useDeleteCarMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => carsService.remove(id),
    onSuccess: (_, deletedId) => {
      queryClient.setQueryData<Car[]>(catalogKeys.cars, (prev = []) =>
        prev.filter((item) => item.id !== deletedId)
      );
      queryClient.invalidateQueries({ queryKey: catalogKeys.cars });
    },
  });
}

// --- Characters Hooks ---

export function useCharactersQuery() {
  return useQuery({
    queryKey: catalogKeys.characters,
    queryFn: charactersService.getAll,
  });
}

export function useCreateCharacterMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateCharacterInput) =>
      charactersService.create(payload),
    onSuccess: (createdCharacter) => {
      queryClient.setQueryData<Character[]>(
        catalogKeys.characters,
        (prev = []) => [...prev, createdCharacter]
      );
      queryClient.invalidateQueries({ queryKey: catalogKeys.characters });
    },
  });
}

export function useUpdateCharacterMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: UpdateCharacterInput;
    }) => charactersService.update(id, payload),
    onSuccess: (updatedCharacter) => {
      queryClient.setQueryData<Character[]>(
        catalogKeys.characters,
        (prev = []) =>
          prev.map((item) =>
            item.id === updatedCharacter.id ? updatedCharacter : item
          )
      );
      queryClient.invalidateQueries({ queryKey: catalogKeys.characters });
    },
  });
}

export function useDeleteCharacterMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => charactersService.remove(id),
    onSuccess: (_, deletedId) => {
      queryClient.setQueryData<Character[]>(
        catalogKeys.characters,
        (prev = []) => prev.filter((item) => item.id !== deletedId)
      );
      queryClient.invalidateQueries({ queryKey: catalogKeys.characters });
    },
  });
}

// --- Maps Hooks ---

export function useMapsQuery() {
  return useQuery({
    queryKey: catalogKeys.maps,
    queryFn: mapsService.getAll,
  });
}

export function useCreateMapMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateMapInput) => mapsService.create(payload),
    onSuccess: (createdMap) => {
      queryClient.setQueryData<GameMap[]>(catalogKeys.maps, (prev = []) => [
        ...prev,
        createdMap,
      ]);
      queryClient.invalidateQueries({ queryKey: catalogKeys.maps });
    },
  });
}

export function useUpdateMapMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateMapInput }) =>
      mapsService.update(id, payload),
    onSuccess: (updatedMap) => {
      queryClient.setQueryData<GameMap[]>(catalogKeys.maps, (prev = []) =>
        prev.map((item) => (item.id === updatedMap.id ? updatedMap : item))
      );
      queryClient.invalidateQueries({ queryKey: catalogKeys.maps });
    },
  });
}

export function useDeleteMapMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => mapsService.remove(id),
    onSuccess: (_, deletedId) => {
      queryClient.setQueryData<GameMap[]>(catalogKeys.maps, (prev = []) =>
        prev.filter((item) => item.id !== deletedId)
      );
      queryClient.invalidateQueries({ queryKey: catalogKeys.maps });
    },
  });
}
