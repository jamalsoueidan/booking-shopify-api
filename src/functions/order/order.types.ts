import { z } from "zod";

const MoneySetZod = z.object({
  shop_money: z.object({
    amount: z.string(),
    currency_code: z.string(),
  }),
  presentment_money: z.object({
    amount: z.string(),
    currency_code: z.string(),
  }),
});

const ClientDetailsZod = z.object({
  accept_language: z.string().nullable(),
  browser_height: z.number().nullable(),
  browser_ip: z.string(),
  browser_width: z.number().nullable(),
  session_hash: z.string().nullable(),
  user_agent: z.string().nullable(),
});

const DiscountCodeZod = z.object({
  code: z.string(),
  amount: z.string(),
  type: z.string(),
});

const AddressZod = z.object({
  first_name: z.string(),
  address1: z.string(),
  phone: z.string(),
  city: z.string(),
  zip: z.string(),
  province: z.string().nullable(),
  country: z.string(),
  last_name: z.string(),
  address2: z.string().nullable(),
  company: z.string().nullable(),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  name: z.string(),
  country_code: z.string(),
  province_code: z.string().nullable(),
});

const CustomerZod = z.object({
  id: z.number(),
  email: z.string().nullable(),
  accepts_marketing: z.boolean(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
  first_name: z.string(),
  last_name: z.string(),
  state: z.string(),
  note: z.string().nullable(),
  verified_email: z.boolean(),
  multipass_identifier: z.string().nullable(),
  tax_exempt: z.boolean(),
  phone: z.string().nullable(),
  email_marketing_consent: z
    .object({
      /* ... */
    })
    .nullable(),
  sms_marketing_consent: z
    .object({
      state: z.string(),
      opt_in_level: z.string(),
      consent_updated_at: z.coerce.date(),
      consent_collected_from: z.string(),
    })
    .nullable(),
  tags: z.string(),
  currency: z.string(),
  accepts_marketing_updated_at: z.string(),
  marketing_opt_in_level: z.string().nullable(),
  tax_exemptions: z.array(z.string()),
  admin_graphql_api_id: z.string(),
  default_address: AddressZod.nullable(),
});

const propertySchema = z.object({
  name: z.string(),
  value: z.union([z.string(), z.number(), z.coerce.date()]), // Allow string, number, or date
  kind: z.string().optional(),
});

const propertiesSchema = z
  .array(propertySchema)
  .superRefine((properties, ctx) => {
    properties.forEach((property, index) => {
      if (property.name === "_customerId") {
        const parsedNumber = parseInt(property.value as any);
        if (isNaN(parsedNumber)) {
          ctx.addIssue({
            path: [index, "value"],
            message: "Value must be a number",
            code: "custom",
          });
        } else {
          properties[index].value = parsedNumber; // Transform to number
          properties[index].kind = "CustomerIdProperty";
        }
      } else if (property.name === "_from" || property.name === "_to") {
        const parsedDate = new Date(property.value);
        if (isNaN(parsedDate.getTime())) {
          ctx.addIssue({
            path: [index, "value"],
            message: "Value must be a valid date string",
            code: "invalid_date",
          });
        } else {
          properties[index].value = parsedDate; // Transform to date
          properties[index].kind = "DateProperty";
        }
      } else {
        properties[index].kind = "OtherProperty";
      }
    });
  });

const LineItemZod = z.object({
  id: z.number(),
  admin_graphql_api_id: z.string(),
  fulfillable_quantity: z.number(),
  fulfillment_service: z.string(),
  fulfillment_status: z.string().nullable(),
  gift_card: z.boolean(),
  grams: z.number(),
  name: z.string(),
  price: z.string(),
  price_set: MoneySetZod,
  product_exists: z.boolean(),
  product_id: z.number().nullable(),
  properties: propertiesSchema,
  quantity: z.number(),
  requires_shipping: z.boolean(),
  sku: z.string().nullable(),
  taxable: z.boolean(),
  title: z.string(),
  total_discount: z.string(),
  total_discount_set: MoneySetZod,
  variant_id: z.number().nullable(),
  variant_inventory_management: z.string().nullable(),
  variant_title: z.string().nullable(),
  vendor: z.string().nullable(),
  tax_lines: z.array(
    z.object({
      /* ... */
    })
  ),
  duties: z.array(
    z.object({
      /* ... */
    })
  ),
  discount_allocations: z.array(
    z.object({
      /* ... */
    })
  ),
});

const FulfillmentZod = z.object({
  id: z.number(),
  admin_graphql_api_id: z.string(),
  created_at: z.string(),
  location_id: z.number(),
  name: z.string(),
  order_id: z.number(),
  origin_address: z.object({
    /* ... */
  }), // Define further if structure is known
  receipt: z.object({
    /* ... */
  }), // Define further if structure is known
  service: z.string(),
  shipment_status: z.string().nullable(),
  status: z.string(),
  tracking_company: z.string().nullable(),
  tracking_number: z.string().nullable(),
  tracking_numbers: z.array(z.string()),
  tracking_url: z.string().nullable(),
  tracking_urls: z.array(z.string()),
  updated_at: z.string(),
  line_items: z
    .array(LineItemZod)
    .transform((items) =>
      items.filter((item) =>
        item.properties?.some((prop) => prop.name === "_customerId")
      )
    ),
});

const RefundLineItemZod = z.object({
  id: z.number(),
  line_item_id: z.number(),
  location_id: z.number(),
  quantity: z.number(),
  restock_type: z.string(),
  subtotal: z.union([z.string(), z.number()]),
  subtotal_set: MoneySetZod,
  total_tax: z.union([z.string(), z.number()]),
  total_tax_set: MoneySetZod,
  line_item: LineItemZod,
});

const RefundZod = z.object({
  id: z.number(),
  admin_graphql_api_id: z.string(),
  created_at: z.string(),
  note: z.string().nullable(),
  order_id: z.number(),
  processed_at: z.string(),
  restock: z.boolean(),
  total_duties_set: MoneySetZod.nullable(),
  user_id: z.number(),
  order_adjustments: z.array(
    z.object({
      /* ... */
    })
  ), // Define further if structure is known
  transactions: z.array(
    z.object({
      /* ... */
    })
  ), // Define further if structure is known
  refund_line_items: z
    .array(RefundLineItemZod)
    .transform((items) =>
      items.filter((item) =>
        item.line_item.properties?.some((prop) => prop.name === "_customerId")
      )
    ),
  duties: z.array(
    z.object({
      /* ... */
    })
  ), // Define further if structure is known
});

const ShippingLineZod = z.object({
  id: z.number(),
  carrier_identifier: z.string().nullable(),
  code: z.string().nullable(),
  discounted_price: z.string(),
  discounted_price_set: MoneySetZod,
  phone: z.string().nullable(),
  price: z.string(),
  price_set: MoneySetZod,
  requested_fulfillment_service_id: z.string().nullable(),
  source: z.string(),
  title: z.string(),
  tax_lines: z.array(
    z.object({
      /* ... */
    })
  ), // Define further if structure is known
  discount_allocations: z.array(
    z.object({
      /* ... */
    })
  ), // Define further if structure is known
});

export const Order = z.object({
  id: z.number(),
  admin_graphql_api_id: z.string(),
  app_id: z.number().nullable(),
  browser_ip: z.string(),
  buyer_accepts_marketing: z.boolean(),
  cancel_reason: z.string().nullable(),
  cancelled_at: z.string().nullable(),
  cart_token: z.string(),
  checkout_id: z.number().nullable(),
  checkout_token: z.string().nullable(),
  client_details: ClientDetailsZod,
  closed_at: z.string().nullable(),
  confirmation_number: z.string().nullable(),
  confirmed: z.boolean(),
  contact_email: z.string().nullable(),
  created_at: z.string(),
  currency: z.string(),
  current_subtotal_price: z.string(),
  current_subtotal_price_set: MoneySetZod,
  current_total_additional_fees_set: MoneySetZod.nullable(),
  current_total_discounts: z.string(),
  current_total_discounts_set: MoneySetZod,
  current_total_duties_set: MoneySetZod.nullable(),
  current_total_price: z.string(),
  current_total_price_set: MoneySetZod,
  current_total_tax: z.string(),
  current_total_tax_set: MoneySetZod,
  customer_locale: z.string().nullable(),
  device_id: z.number().nullable(),
  discount_codes: z.array(DiscountCodeZod),
  email: z.string(),
  estimated_taxes: z.boolean(),
  financial_status: z.string(),
  fulfillment_status: z.string().nullable(),
  landing_site: z.string(),
  landing_site_ref: z.string().nullable(),
  location_id: z.number().nullable(),
  merchant_of_record_app_id: z.number().nullable(),
  name: z.string(),
  note: z.string().nullable(),
  note_attributes: z.array(z.object({ name: z.string(), value: z.string() })),
  number: z.number(),
  order_number: z.number(),
  order_status_url: z.string(),
  original_total_additional_fees_set: MoneySetZod.nullable(),
  original_total_duties_set: MoneySetZod.nullable(),
  payment_gateway_names: z.array(z.string()),
  phone: z.string().nullable(),
  po_number: z.string().nullable(),
  presentment_currency: z.string(),
  processed_at: z.string(),
  reference: z.string().nullable(),
  referring_site: z.string().nullable(),
  source_identifier: z.string().nullable(),
  source_name: z.string(),
  source_url: z.string().nullable(),
  subtotal_price: z.string(),
  subtotal_price_set: MoneySetZod,
  tags: z.string(),
  tax_exempt: z.boolean(),
  tax_lines: z.array(
    z.object({
      /* ... */
    })
  ),
  taxes_included: z.boolean(),
  test: z.boolean(),
  token: z.string(),
  total_discounts: z.string(),
  total_discounts_set: MoneySetZod,
  total_line_items_price: z.string(),
  total_line_items_price_set: MoneySetZod,
  total_outstanding: z.string(),
  total_price: z.string(),
  total_price_set: MoneySetZod,
  total_shipping_price_set: MoneySetZod,
  total_tax: z.string(),
  total_tax_set: MoneySetZod,
  total_tip_received: z.string(),
  total_weight: z.number(),
  updated_at: z.string(),
  user_id: z.number().nullable(),
  billing_address: AddressZod,
  customer: CustomerZod,
  discount_applications: z.array(
    z.object({
      /* ... */
    })
  ),
  fulfillments: z
    .array(FulfillmentZod)
    .transform((fulfillments) =>
      fulfillments.filter((fulfillment) => fulfillment.line_items.length > 0)
    ),
  line_items: z
    .array(LineItemZod)
    .transform((items) =>
      items.filter((item) =>
        item.properties?.some((prop) => prop.name === "_customerId")
      )
    ),
  payment_terms: z
    .object({
      /* ... */
    })
    .nullable(),
  refunds: z
    .array(RefundZod)
    .transform((refunds) =>
      refunds.filter((refund) => refund.refund_line_items.length > 0)
    ),
  shipping_address: AddressZod.nullable(),
  shipping_lines: z.array(ShippingLineZod),
});

export type Order = z.infer<typeof Order>;
