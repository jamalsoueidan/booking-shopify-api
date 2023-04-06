import { z } from "zod";
import { _ } from "~/library/handler";
import { jwtVerify } from "~/library/jwt";
import { ShiftServiceCreateGroup } from "../shift.service";
import { Shift, ShiftDaysEnum, ShiftSchema } from "../shift.types";

export type ShiftControllerCreateGroupRequest = {
  query: ShiftControllerCreateGroupQuery;
  body: ShiftControllerCreateGroupBody;
};

export const ShiftControllerCreateGroupBodySchema = ShiftSchema.pick({
  tag: true,
  start: true,
  end: true,
}).extend({
  days: z.array(ShiftDaysEnum),
});

export type ShiftControllerCreateGroupBody = z.infer<
  typeof ShiftControllerCreateGroupBodySchema
>;

export const ShiftControllerCreateGroupQuerySchema = ShiftSchema.pick({
  userId: true,
});

export type ShiftControllerCreateGroupQuery = z.infer<
  typeof ShiftControllerCreateGroupQuerySchema
>;

export type ShiftControllerCreateGroupResponse = Array<Omit<Shift, "_id">>;

export const ShiftControllerCreateGroup = _(
  jwtVerify,
  ({
    query,
    body,
  }: ShiftControllerCreateGroupRequest): Promise<ShiftControllerCreateGroupResponse> => {
    const validateBody = ShiftControllerCreateGroupBodySchema.parse(body);
    return ShiftServiceCreateGroup(query, validateBody);
  }
);
