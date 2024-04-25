import { ScheduleModel } from "~/functions/schedule";
import { NumberOrString, StringOrObjectId } from "~/library/zod";

export type CustomerLocationServiceGetProductsProps = {
  customerId: NumberOrString;
  locationId: StringOrObjectId;
};

export const CustomerLocationServiceGetProducts = async ({
  customerId,
  locationId,
}: CustomerLocationServiceGetProductsProps) => {
  return ScheduleModel.aggregate([
    {
      $match: {
        customerId,
      },
    },
    {
      $unwind: "$products",
    },
    {
      $match: {
        "products.locations.location": locationId,
      },
    },
    {
      $replaceRoot: {
        newRoot: "$products",
      },
    },
  ]);
};