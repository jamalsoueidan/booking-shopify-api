import { z } from "zod";
import { CustomerLocationServiceGetAll } from "~/functions/customer/services/location";
import { _ } from "~/library/handler";
import { NumberOrStringType, StringOrObjectIdType } from "~/library/zod";
import { CustomerBlockedServiceList } from "../../services/blocked/list";

export type CustomerBlockedControllerListRequest = {
  query: z.infer<typeof CustomerBlockedControllerListSchema>;
};

export const CustomerBlockedControllerListSchema = z.object({
  customerId: NumberOrStringType,
  limit: NumberOrStringType,
  nextCursor: StringOrObjectIdType,
});

export type CustomerBlockedControllerListResponse = Awaited<
  ReturnType<typeof CustomerLocationServiceGetAll>
>;

export const CustomerBlockedControllerList = _(
  ({ query }: CustomerBlockedControllerListRequest) => {
    const validateData = CustomerBlockedControllerListSchema.parse(query);
    return CustomerBlockedServiceList(validateData);
  }
);
