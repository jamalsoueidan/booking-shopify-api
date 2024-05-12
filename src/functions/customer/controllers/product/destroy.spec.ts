import { HttpRequest, InvocationContext } from "@azure/functions";

import { TimeUnit } from "~/functions/schedule";
import {
  HttpSuccessResponse,
  createContext,
  createHttpRequest,
} from "~/library/jest/azure";

import { getProductObject } from "~/library/jest/helpers/product";
import { createSchedule } from "~/library/jest/helpers/schedule";
import { shopifyAdmin } from "~/library/shopify";
import {
  CustomerProductControllerDestroy,
  CustomerProductControllerDestroyRequest,
  CustomerProductControllerDestroyResponse,
} from "./destroy";

require("~/library/jest/mongoose/mongodb.jest");

jest.mock("@shopify/admin-api-client", () => ({
  createAdminApiClient: () => ({
    request: jest.fn(),
  }),
}));

const mockRequest = shopifyAdmin.request as jest.Mock;

describe("CustomerProductControllerDestroy", () => {
  let context: InvocationContext;
  let request: HttpRequest;
  const product = getProductObject({
    duration: 60,
    breakTime: 0,
    noticePeriod: {
      value: 1,
      unit: TimeUnit.DAYS,
    },
    bookingPeriod: {
      value: 1,
      unit: TimeUnit.WEEKS,
    },
  });

  beforeEach(async () => {
    context = createContext();
  });

  it("should be able to destroy schedule", async () => {
    const newSchedule = await createSchedule({
      name: "adsasd",
      customerId: 123,
      products: [product],
    });

    mockRequest.mockResolvedValueOnce({
      data: {
        productDelete: {
          deletedProductId: {
            id: "123",
          },
        },
      },
    });

    request = await createHttpRequest<CustomerProductControllerDestroyRequest>({
      query: {
        customerId: newSchedule.customerId,
        productId: product.productId,
      },
    });

    const res: HttpSuccessResponse<CustomerProductControllerDestroyResponse> =
      await CustomerProductControllerDestroy(request, context);

    expect(res.jsonBody?.success).toBeTruthy();
    expect(res.jsonBody?.payload?.modifiedCount).toBe(1);
  });
});
