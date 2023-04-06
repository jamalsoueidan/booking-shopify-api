import { z } from "zod";
import { _ } from "~/library/handler";
import { jwtVerify } from "~/library/jwt";
import { ShiftRestrictUser } from "../shift-middleware/shift-restrictions";
import { ShiftServiceDestroy } from "../shift.service";
import { Shift, ShiftSchema } from "../shift.types";

export type ShiftControllerDestroyRequest = {
  query: ShiftControllerDestroyQuery;
};

export const ShiftControllerDestroyQuerySchema = ShiftSchema.pick({
  _id: true,
  userId: true,
});

export type ShiftControllerDestroyQuery = z.infer<
  typeof ShiftControllerDestroyQuerySchema
>;

export type ShiftControllerDestroyResponse = Array<Omit<Shift, "_id">>;

export const ShiftControllerDestroy = _(
  jwtVerify,
  ShiftRestrictUser,
  ({ query }: ShiftControllerDestroyRequest) => {
    const validateQuery = ShiftControllerDestroyQuerySchema.parse(query);
    return ShiftServiceDestroy(validateQuery);
  }
);
