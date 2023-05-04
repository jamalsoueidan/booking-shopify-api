import { HttpRequest, InvocationContext } from "@azure/functions";
import { ScheduleServiceCreate } from "~/functions/schedule";
import { ScheduleProductServiceCreateOrUpdate } from "~/functions/schedule/services/product";
import {
  HttpSuccessResponse,
  createContext,
  createHttpRequest,
} from "~/library/jest/azure";
import {
  CustomerProductsControllerGet,
  CustomerProductsControllerGetRequest,
  CustomerProductsControllerGetResponse,
} from "./get";

require("~/library/jest/mongoose/mongodb.jest");

describe("UserProductsControllerGet", () => {
  let context: InvocationContext = createContext();
  let request: HttpRequest;

  it("Should be able to get all product ids by customer-id", async () => {
    const customerId = 123;
    const newProduct = {
      visible: true,
      duration: 60,
      breakTime: 0,
    };

    const newSchedule = await ScheduleServiceCreate({ name: "ab", customerId });

    await ScheduleProductServiceCreateOrUpdate(
      {
        scheduleId: newSchedule._id,
        customerId: newSchedule.customerId,
        productId: 1000,
      },
      newProduct
    );

    const newSchedule2 = await ScheduleServiceCreate({
      name: "tdd",
      customerId,
    });

    await ScheduleProductServiceCreateOrUpdate(
      {
        scheduleId: newSchedule2._id,
        customerId: newSchedule2.customerId,
        productId: 1002,
      },
      newProduct
    );

    await ScheduleProductServiceCreateOrUpdate(
      {
        scheduleId: newSchedule2._id,
        customerId: newSchedule2.customerId,
        productId: 1004,
      },
      newProduct
    );

    request = await createHttpRequest<CustomerProductsControllerGetRequest>({
      query: { customerId },
    });

    const res: HttpSuccessResponse<CustomerProductsControllerGetResponse> =
      await CustomerProductsControllerGet(request, context);

    expect(res.jsonBody?.success).toBeTruthy();
    expect(res.jsonBody).toHaveProperty("payload");
    expect(res.jsonBody?.payload).toEqual([1000, 1002, 1004]);
  });
});
