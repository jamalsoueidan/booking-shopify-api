import { z } from "zod";
import {
  GidFormat,
  NumberOrStringType,
  StringOrObjectIdType,
} from "~/library/zod";

export enum LocationTypes {
  ORIGIN = "origin",
  DESTINATION = "destination",
}

export enum LocationDestinationTypes {
  HOME = "home",
  COMMERCIAL = "commercial",
}
export const LocationZodSchema = z.object({
  _id: StringOrObjectIdType,
  locationType: z.nativeEnum(LocationTypes),
  customerId: GidFormat,
});

export type Location = z.infer<typeof LocationZodSchema>;

export const LocationOriginZodSchema = z.object({
  name: z.string(),
  fullAddress: z.string(),
  destinationType: z.nativeEnum(LocationDestinationTypes),
});

export type LocationOrigin = z.infer<typeof LocationOriginZodSchema>;

export const LocationDestinationZodSchema = z.object({
  name: z.string(),
  minDistanceForFree: NumberOrStringType,
  distanceHourlyRate: NumberOrStringType,
  fixedRatePerKm: NumberOrStringType,
});

export type LocationDestination = z.infer<typeof LocationDestinationZodSchema>;
