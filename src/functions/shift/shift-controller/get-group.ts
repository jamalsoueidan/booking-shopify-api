import { z } from "zod";
import { _ } from "~/library/handler";
import { jwtVerify } from "~/library/jwt";
import { ShiftRestrictUser } from "../shift-middleware/shift-restrictions";
import { ShiftServiceGetGroup } from "../shift.service";
import { Shift, ShiftDaysInterval, ShiftSchema } from "../shift.types";

export type ShiftControllerGetGroupRequest = {
  query: ShiftControllerGetGroupQuery;
};

export const ShiftControllerGetGroupSchema = ShiftSchema.pick({
  userId: true,
}).extend({ groupId: z.string() });

export type ShiftControllerGetGroupQuery = z.infer<
  typeof ShiftControllerGetGroupSchema
>;

export type ShiftControllerGetGroupResponse = Pick<
  Shift,
  "tag" | "start" | "end"
> & {
  days: Array<ShiftDaysInterval>;
};

export const ShiftControllerGetGroup = _(
  jwtVerify,
  ShiftRestrictUser,
  async ({ query }: ShiftControllerGetGroupRequest) => {
    const validateQuery = ShiftControllerGetGroupSchema.parse(query);
    return ShiftServiceGetGroup(validateQuery);
  }
);
