import { NotFoundError } from "~/library/handler";
import { ScheduleModel } from "../schedule.model";
import { Schedule, ScheduleProduct } from "../schedule.types";

export type ScheduleProductServiceDestroyFilter = {
  scheduleId: Schedule["_id"];
  customerId: Schedule["customerId"];
  productId: ScheduleProduct["productId"];
};

export const ScheduleProductServiceDestroy = async (
  filter: ScheduleProductServiceDestroyFilter
) => {
  try {
    const schedule = await ScheduleModel.findOne({
      _id: filter.scheduleId,
      customerId: filter.customerId,
    }).orFail(
      new NotFoundError([
        {
          code: "custom",
          message: "SCHEDULE_NOT_FOUND",
          path: ["schedule"],
        },
      ])
    );

    if (!schedule) {
      throw new Error("Schedule not found");
    }

    return schedule.removeProduct(filter.productId);
  } catch (error) {
    console.error("Error adding product:", error);
  }
};

export type ScheduleProductServiceCreateOrUpdateFilter = {
  scheduleId: Schedule["_id"];
  customerId: Schedule["customerId"];
};

export type ScheduleProductServiceCreateOrUpdateBody = ScheduleProduct;

export const ScheduleProductServiceCreateOrUpdate = async (
  filter: ScheduleProductServiceCreateOrUpdateFilter,
  product: ScheduleProductServiceCreateOrUpdateBody
) => {
  try {
    const schedule = await ScheduleModel.findOne({
      _id: filter.scheduleId,
      customerId: filter.customerId,
    }).orFail(
      new NotFoundError([
        {
          code: "custom",
          message: "SCHEDULE_NOT_FOUND",
          path: ["schedule"],
        },
      ])
    );

    if (!schedule) {
      throw new Error("Schedule not found");
    }

    return schedule.createOrUpdateProduct(product);
  } catch (error) {
    console.error("Error adding product:", error);
  }
};
