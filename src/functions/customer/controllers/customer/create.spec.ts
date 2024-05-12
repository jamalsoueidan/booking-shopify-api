import { HttpRequest, InvocationContext } from "@azure/functions";
import {
  HttpSuccessResponse,
  createContext,
  createHttpRequest,
} from "~/library/jest/azure";

import { getUserObject } from "~/library/jest/helpers";
import { shopifyAdmin } from "~/library/shopify";
import {
  CustomerControllerCreate,
  CustomerControllerCreateRequest,
  CustomerControllerCreateResponse,
} from "./create";

require("~/library/jest/mongoose/mongodb.jest");

jest.mock("@shopify/admin-api-client", () => ({
  createAdminApiClient: () => ({
    request: jest.fn(),
  }),
}));

const mockRequest = shopifyAdmin.request as jest.Mock;

const mockCollection = {
  collectionCreate: {
    collection: {
      id: "gid://shopify/Collection/625094558023",
      title: "testestest",
      descriptionHtml: "",
      handle: "testestest",
      sortOrder: "BEST_SELLING",
      ruleSet: {
        appliedDisjunctively: false,
        rules: [
          {
            column: "TAG",
            relation: "EQUALS",
            condition: "testest",
          },
        ],
      },
    },
  },
};

const mockPublications = {
  publications: {
    nodes: [
      {
        id: "gid://shopify/Publication/100827824402",
      },
      {
        id: "gid://shopify/Publication/100833296658",
      },
      {
        id: "gid://shopify/Publication/109184483602",
      },
      {
        id: "gid://shopify/Publication/124387754258",
      },
      {
        id: "gid://shopify/Publication/131001155858",
      },
      {
        id: "gid://shopify/Publication/134703219015",
      },
      {
        id: "gid://shopify/Publication/175752184135",
      },
    ],
  },
};

const mockPublish = {
  publishable: {
    id: "gid://shopify/Collection/625094558023",
    handle: "testestest",
  },
};

describe("CustomerControllerCreate", () => {
  let context: InvocationContext;
  let request: HttpRequest;

  beforeEach(() => {
    context = createContext();
  });

  it("Should be able to create user", async () => {
    mockRequest
      .mockResolvedValueOnce({
        data: mockCollection,
      })
      .mockResolvedValueOnce({
        data: mockPublications,
      })
      .mockResolvedValue({
        mockPublish,
      });

    request = await createHttpRequest<CustomerControllerCreateRequest>({
      body: getUserObject(),
    });

    const res: HttpSuccessResponse<CustomerControllerCreateResponse> =
      await CustomerControllerCreate(request, context);

    expect(res.jsonBody?.success).toBeTruthy();
    expect(res.jsonBody).toHaveProperty("payload");
  });
});
