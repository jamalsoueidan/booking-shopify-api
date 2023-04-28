import { BadError, NotFoundError } from "~/library/handler";
import { isMongooseError } from "~/library/mongoose";
import { AuthRole, AuthServiceCreate, AuthServiceUpdate } from "../auth";
import { UserModel } from "./user.model";
import { User } from "./user.types";

export const UserServiceCreate = async (
  body: Omit<User, "_id">,
  role: AuthRole = AuthRole.user
) => {
  try {
    const user = await UserModel.create(body);

    await AuthServiceCreate({
      ...body,
      userId: user._id.toString(),
      role,
    });

    return user;
  } catch (err: any) {
    if (isMongooseError(err)) {
      throw new BadError([
        {
          message: "DUPLICATED_PHONE_IN_DB",
          code: "custom",
          path: Object.keys(err.keyValue),
        },
      ]);
    }
    throw err;
  }
};

export const UserServiceFindAll = (props: any = {}) => UserModel.find(props);

type UserServiceFindByIdAndUpdateQuery = Pick<User, "_id"> &
  Partial<Pick<User, "group">>;

export const UserServiceFindByIdAndUpdate = async (
  query: UserServiceFindByIdAndUpdateQuery,
  body: Partial<Omit<User, "_id">>
) => {
  const user = await UserModel.findOneAndUpdate(query, body, {
    new: true,
  });
  if (!user) {
    throw new NotFoundError([
      {
        path: ["userId"],
        message: "NOT_FOUND",
        code: "custom",
      },
    ]);
  }

  await AuthServiceUpdate(
    { userId: user._id },
    { email: user.email, phone: user.phone, group: user.group }
  );

  return user;
};

export const UserServiceGetUserIdsbyGroup = async ({
  group,
}: {
  group: string;
}): Promise<Array<string>> => {
  const users = await UserModel.find({ group }, "_id");
  return users.map(({ _id }) => _id.toString());
};

type UserServiceGetByIdProps = {
  _id: string;
  group?: string;
};

export const UserServiceGetById = async (props: UserServiceGetByIdProps) => {
  const user = await UserModel.findOne(props).lean();
  if (!user) {
    throw new NotFoundError([
      {
        path: ["userId"],
        message: "NOT_FOUND",
        code: "custom",
      },
    ]);
  }
  return user;
};

type UserServiceBelongsToSameGroup = {
  userId: string;
  group: string;
};

export const UserServiceBelongsToSameGroup = async (
  props: UserServiceBelongsToSameGroup
) => {
  const user = await UserModel.findById(props.userId, "group");
  return user?.group === props.group;
};
