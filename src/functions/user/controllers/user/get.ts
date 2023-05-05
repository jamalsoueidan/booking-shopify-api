import { z } from "zod";
import { _ } from "~/library/handler";

import { UserServiceGet } from "../../services/user";
import { UserZodSchema } from "../../user.types";

export type UserControllerGetRequest = {
  query: z.infer<typeof UserServiceGetSchema>;
};

export const UserServiceGetSchema = UserZodSchema.pick({
  username: true,
});

export type UserControllerGetResponse = Awaited<
  ReturnType<typeof UserServiceGet>
>;

export const UserControllerGet = _(
  async ({ query }: UserControllerGetRequest) => {
    const validateData = UserServiceGetSchema.parse(query);
    return UserServiceGet(validateData);
  }
);
