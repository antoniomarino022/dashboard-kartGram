"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  carsService,
  charactersService,
  mapsService,
  paintsService,
  powerupsService,
  wheelsService,
} from "@/services/apiClient";
import type {
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

export const catalogKeys = {
  cars: ["cars"] as const,
  characters: ["characters"] as const,
  maps: ["maps"] as const,
  paints: ["paints"] as const,
  wheels: ["wheels"] as const,
  powerups: ["powerups"] as const,
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

// --- Paints Hooks ---

export function usePaintsQuery() {
  return useQuery({
    queryKey: catalogKeys.paints,
    queryFn: paintsService.getAll,
  });
}

export function useCreatePaintMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreatePaintInput) => paintsService.create(payload),
    onSuccess: (createdPaint) => {
      queryClient.setQueryData<Paint[]>(catalogKeys.paints, (prev = []) => [
        ...prev,
        createdPaint,
      ]);
      queryClient.invalidateQueries({ queryKey: catalogKeys.paints });
    },
  });
}

export function useUpdatePaintMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdatePaintInput }) =>
      paintsService.update(id, payload),
    onSuccess: (updatedPaint) => {
      queryClient.setQueryData<Paint[]>(catalogKeys.paints, (prev = []) =>
        prev.map((item) => (item.id === updatedPaint.id ? updatedPaint : item))
      );
      queryClient.invalidateQueries({ queryKey: catalogKeys.paints });
    },
  });
}

export function useDeletePaintMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => paintsService.remove(id),
    onSuccess: (_, deletedId) => {
      queryClient.setQueryData<Paint[]>(catalogKeys.paints, (prev = []) =>
        prev.filter((item) => item.id !== deletedId)
      );
      queryClient.invalidateQueries({ queryKey: catalogKeys.paints });
    },
  });
}

// --- Wheels Hooks ---

export function useWheelsQuery() {
  return useQuery({
    queryKey: catalogKeys.wheels,
    queryFn: wheelsService.getAll,
  });
}

export function useCreateWheelMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateWheelInput) => wheelsService.create(payload),
    onSuccess: (createdWheel) => {
      queryClient.setQueryData<Wheel[]>(catalogKeys.wheels, (prev = []) => [
        ...prev,
        createdWheel,
      ]);
      queryClient.invalidateQueries({ queryKey: catalogKeys.wheels });
    },
  });
}

export function useUpdateWheelMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateWheelInput }) =>
      wheelsService.update(id, payload),
    onSuccess: (updatedWheel) => {
      queryClient.setQueryData<Wheel[]>(catalogKeys.wheels, (prev = []) =>
        prev.map((item) => (item.id === updatedWheel.id ? updatedWheel : item))
      );
      queryClient.invalidateQueries({ queryKey: catalogKeys.wheels });
    },
  });
}

export function useDeleteWheelMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => wheelsService.remove(id),
    onSuccess: (_, deletedId) => {
      queryClient.setQueryData<Wheel[]>(catalogKeys.wheels, (prev = []) =>
        prev.filter((item) => item.id !== deletedId)
      );
      queryClient.invalidateQueries({ queryKey: catalogKeys.wheels });
    },
  });
}

// --- Powerups Hooks ---

export function usePowerupsQuery() {
  return useQuery({
    queryKey: catalogKeys.powerups,
    queryFn: powerupsService.getAll,
  });
}

export function useCreatePowerupMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreatePowerupInput) => powerupsService.create(payload),
    onSuccess: (createdPowerup) => {
      queryClient.setQueryData<Powerup[]>(catalogKeys.powerups, (prev = []) => [
        ...prev,
        createdPowerup,
      ]);
      queryClient.invalidateQueries({ queryKey: catalogKeys.powerups });
    },
  });
}

export function useUpdatePowerupMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: UpdatePowerupInput;
    }) => powerupsService.update(id, payload),
    onSuccess: (updatedPowerup) => {
      queryClient.setQueryData<Powerup[]>(catalogKeys.powerups, (prev = []) =>
        prev.map((item) =>
          item.id === updatedPowerup.id ? updatedPowerup : item
        )
      );
      queryClient.invalidateQueries({ queryKey: catalogKeys.powerups });
    },
  });
}

export function useDeletePowerupMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => powerupsService.remove(id),
    onSuccess: (_, deletedId) => {
      queryClient.setQueryData<Powerup[]>(catalogKeys.powerups, (prev = []) =>
        prev.filter((item) => item.id !== deletedId)
      );
      queryClient.invalidateQueries({ queryKey: catalogKeys.powerups });
    },
  });
}

