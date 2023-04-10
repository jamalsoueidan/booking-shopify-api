import { UserServiceBelongsToSameGroup } from "~/functions/user";
import { ForbiddenError, SessionKey } from "~/library/handler";

export type SessionRequest = {
  query: {
    userId: string;
  };
};

export const ShiftRestrictUser = async ({
  query,
  session,
}: SessionKey<SessionRequest>) => {
  if (session.isUser && query.userId !== session.userId) {
    throw new ForbiddenError("not allowed to modifiy other user");
  }

  await ShiftRestrictGroup({ query, session });
};

export const ShiftRestrictGroup = async ({
  query,
  session,
}: SessionKey<SessionRequest>) => {
  if (!session.isOwner) {
    const belongToSameGroup = await UserServiceBelongsToSameGroup({
      userId: query.userId,
      group: session.group,
    });
    if (!belongToSameGroup) {
      throw new ForbiddenError("not allowed to modifiy staff in other groups");
    }
  }
};
