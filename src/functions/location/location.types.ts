import { z } from "zod";
import { BooleanOrStringType, GidFormat, NumberOrString } from "~/library/zod";

export enum LocationTypes {
  ORIGIN = "origin",
  DESTINATION = "destination",
}

export enum LocationOriginTypes {
  HOME = "home",
  COMMERCIAL = "commercial",
}
export const LocationZodSchema = z.object({
  isDefault: BooleanOrStringType,
  locationType: z.nativeEnum(LocationTypes),
  customerId: GidFormat,
  name: z.string(),
  fullAddress: z.string(),
  city: z.string(),
  country: z.string(),
  originType: z.nativeEnum(LocationOriginTypes),
  distanceForFree: NumberOrString,
  distanceHourlyRate: NumberOrString,
  fixedRatePerKm: NumberOrString,
  minDriveDistance: NumberOrString,
  maxDriveDistance: NumberOrString,
  startFee: NumberOrString,
  deletedAt: z.coerce.date().optional(),
});

export type Location = z.infer<typeof LocationZodSchema>;
