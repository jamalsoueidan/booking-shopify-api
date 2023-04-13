import { SessionKey, _ } from "~/library/handler";
import { jwtVerify } from "~/library/jwt";
import {
  ProductServiceGetAll,
  ProductServiceGetAllProps,
} from "../product.service";

export type ProductControllerGetAllRequest = {
  query: ProductServiceGetAllProps;
};

export type ProductControllerGetAllResponse = ReturnType<
  typeof ProductServiceGetAll
>;

export const ProductControllerGetAll = _(
  jwtVerify,
  ({ query, session }: SessionKey<ProductControllerGetAllRequest>) => {
    if (!session.isOwner) {
      if (session.isUser) {
        query.userId = session.userId;
      }

      query.group = session.group;
    }

    return ProductServiceGetAll(query);
  }
);
