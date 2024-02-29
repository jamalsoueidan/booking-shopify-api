import { Location } from "~/functions/location";
import { OrderModel } from "~/functions/order/order.models";
import {
  Order,
  OrderFulfillment,
  OrderLineItem,
  OrderRefund,
  OrderRefundLineItem,
} from "~/functions/order/order.types";
import { Shipping } from "~/functions/shipping/shipping.types";
import { User } from "~/functions/user";
import { NotFoundError } from "~/library/handler";

export type OrderLineItemsAggreate = OrderLineItem & {
  user: Pick<
    User,
    "customerId" | "username" | "fullname" | "images" | "shortDescription"
  >;
  location: Pick<
    Location,
    "name" | "fullAddress" | "locationType" | "originType"
  >;
  shipping?: Pick<Shipping, "destination" | "cost" | "distance" | "duration">;
};

export type CustomerOrderServiceGetAggregate = Omit<
  Order,
  "line_items" | "refunds" | "fulfillments"
> & {
  line_items: Array<OrderLineItemsAggreate>;
  fulfillments: Array<Omit<OrderFulfillment, "line_items">>;
  refunds: Array<
    Omit<OrderRefund, "refund_line_items"> & {
      refund_line_items: Array<Omit<OrderRefundLineItem, "line_item">>;
    }
  >;
};

export type CustomerOrderServiceGetProps = {
  customerId: number;
  orderId: number;
};

export const CustomerOrderServiceGet = async ({
  customerId,
  orderId,
}: CustomerOrderServiceGetProps) => {
  const orders = await OrderModel.aggregate<CustomerOrderServiceGetAggregate>([
    {
      $match: {
        $and: [
          {
            $or: [
              {
                "line_items.properties.customerId": customerId,
              },
              {
                "customer.id": customerId,
              },
            ],
          },
          {
            id: orderId,
          },
        ],
      },
    },
    { $unwind: "$line_items" },
    {
      $lookup: {
        from: "User",
        let: { customerId: "$line_items.properties.customerId" },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$customerId", "$$customerId"],
              },
            },
          },
          {
            $project: {
              customerId: 1,
              username: 1,
              createdAt: 1,
              fullname: 1,
              shortDescription: 1,
              "images.profile": "$images.profile",
            },
          },
        ],
        as: "line_items.user",
      },
    },
    {
      $unwind: {
        path: "$line_items.user",
        preserveNullAndEmptyArrays: true, // Set to false if you always expect a match
      },
    },
    {
      $lookup: {
        from: "Location",
        let: { locationId: "$line_items.properties.locationId" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  {
                    $eq: ["$_id", { $toObjectId: "$$locationId" }],
                  },
                ],
              },
            },
          },
          {
            $project: {
              name: 1,
              fullAddress: 1,
              originType: 1,
              locationType: 1,
            },
          },
        ],
        as: "line_items.location",
      },
    },
    {
      $unwind: {
        path: "$line_items.location",
        preserveNullAndEmptyArrays: true, // Set to false if you always expect a match
      },
    },
    {
      $lookup: {
        from: "Shipping",
        let: { shippingId: "$line_items.properties.shippingId" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  {
                    $eq: ["$_id", { $toObjectId: "$$shippingId" }],
                  },
                ],
              },
            },
          },
          {
            $project: {
              destination: 1,
              duration: 1,
              distance: 1,
              cost: 1,
            },
          },
        ],
        as: "line_items.shipping",
      },
    },
    {
      $unwind: {
        path: "$line_items.shipping",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $addFields: {
        refunds: {
          $filter: {
            input: "$refunds",
            as: "refund",
            cond: {
              $anyElementTrue: {
                $map: {
                  input: "$$refund.refund_line_items",
                  as: "refund_line_item",
                  in: {
                    $eq: ["$$refund_line_item.line_item_id", "$line_items.id"],
                  },
                },
              },
            },
          },
        },
        fulfillments: {
          $filter: {
            input: "$fulfillments",
            as: "fulfillment",
            cond: {
              $anyElementTrue: {
                $map: {
                  input: "$$fulfillment.line_items",
                  as: "fulfillment_line_item",
                  in: {
                    $eq: ["$$fulfillment_line_item.id", "$line_items.id"],
                  },
                },
              },
            },
          },
        },
      },
    },
    {
      $group: {
        _id: "$id",
        line_items: { $push: "$line_items" },
        customer: { $first: "$customer" },
        orderNumber: { $first: "$order_number" },
        fulfillmentStatus: { $first: "$fulfillment_status" },
        financialStatus: { $first: "$financial_status" },
        createdAt: { $first: "$created_at" },
        updatedAt: { $first: "$updated_at" },
        cancelReason: { $first: "$cancel_reason" },
        cancelledAt: { $first: "$cancelled_at" },
        note: { $first: "$note" },
        noteAttributes: { $first: "$note_attributes" },
        fulfillmentsArray: { $push: "$fulfillments" },
        refundsArray: { $push: "$refunds" },
      },
    },
    {
      $project: {
        id: "$_id",
        line_items: 1,
        customer: 1,
        orderNumber: 1,
        fulfillmentStatus: 1,
        financialStatus: 1,
        createdAt: 1,
        updatedAt: 1,
        cancelReason: 1,
        cancelledAt: 1,
        note: 1,
        noteAttributes: 1,
        fulfillments: {
          $reduce: {
            input: "$fulfillmentsArray",
            initialValue: [],
            in: { $concatArrays: ["$$value", "$$this"] },
          },
        },
        refunds: {
          $reduce: {
            input: "$refundsArray",
            initialValue: [],
            in: { $concatArrays: ["$$value", "$$this"] },
          },
        },
      },
    },
  ]);

  if (orders.length === 0) {
    throw new NotFoundError([
      {
        code: "custom",
        message: "ORDER_NOT_FOUND",
        path: ["lineItemId"],
      },
    ]);
  }

  return orders[0];
};
