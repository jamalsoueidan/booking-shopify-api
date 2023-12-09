import { Document, Model, Schema } from "mongoose";
import { Order } from "./order.types";

export interface IOrder extends Order {}

export interface IOrderDocument extends IOrder, Omit<Document, "id"> {}

export interface IOrderModel extends Model<IOrderDocument> {}

const PriceSetSchema = new Schema(
  {
    shop_money: {
      amount: String,
      currency_code: String,
    },
    presentment_money: {
      amount: String,
      currency_code: String,
    },
  },
  {
    autoIndex: false,
    _id: false,
  }
);

const DiscountCodeSchema = new Schema(
  {
    code: String,
    amount: String,
    type: String,
  },
  {
    autoIndex: false,
    _id: false,
  }
);

const AddressSchema = new Schema(
  {
    first_name: String,
    address1: String,
    phone: String,
    city: String,
    zip: String,
    province: String,
    country: String,
    last_name: String,
    address2: String,
    company: String,
    latitude: Number,
    longitude: Number,
    name: String,
    country_code: String,
    province_code: String,
  },
  {
    _id: false,
  }
);

const CustomerSchema = new Schema(
  {
    id: {
      type: Number,
      required: true,
      unique: true,
    },
    email: String,
    accepts_marketing: Boolean,
    created_at: Date,
    updated_at: Date,
    first_name: String,
    last_name: String,
    state: String,
    note: String,
    verified_email: Boolean,
    multipass_identifier: String,
    tax_exempt: Boolean,
    phone: String,
    email_marketing_consent: {},
    sms_marketing_consent: {},
    tags: String,
    currency: String,
    accepts_marketing_updated_at: Date,
    marketing_opt_in_level: String,
    tax_exemptions: [String],
    admin_graphql_api_id: String,
    default_address: AddressSchema,
  },
  {
    autoIndex: false,
    _id: false,
  }
);

const propertySchema = new Schema(
  {
    name: { type: String, required: true, unqiue: true, index: true },
  },
  { discriminatorKey: "kind", _id: false }
);

const LineItemSchema = new Schema(
  {
    id: {
      type: Number,
      required: true,
      unique: true,
      index: true,
    },
    admin_graphql_api_id: String,
    fulfillable_quantity: Number,
    fulfillment_service: String,
    fulfillment_status: String,
    gift_card: Boolean,
    grams: Number,
    name: String,
    price: String,
    price_set: PriceSetSchema,
    product_exists: Boolean,
    product_id: Number,
    properties: [propertySchema],
    quantity: Number,
    requires_shipping: Boolean,
    sku: String,
    taxable: Boolean,
    title: String,
    total_discount: String,
    total_discount_set: PriceSetSchema,
    variant_id: Number,
    variant_inventory_management: String,
    variant_title: String,
    vendor: String,
  },
  {
    autoIndex: false,
    _id: false,
  }
);

const properties =
  LineItemSchema.path<Schema.Types.DocumentArray>("properties");

properties.discriminator(
  "CustomerIdProperty",
  new Schema(
    {
      value: { type: Number, index: true },
    },
    { _id: false }
  )
);

properties.discriminator(
  "DateProperty",
  new Schema({
    value: { type: Date, index: true },
  })
);

properties.discriminator(
  "OtherProperty",
  new Schema({
    value: String,
  })
);

const FulfillmentSchema = new Schema(
  {
    id: {
      type: Number,
      required: true,
      unique: true,
    },
    admin_graphql_api_id: String,
    created_at: Date,
    location_id: Number,
    name: String,
    order_id: Number,
    service: String,
    shipment_status: String,
    status: String,
    tracking_company: String,
    tracking_number: String,
    tracking_numbers: [String],
    tracking_url: String,
    tracking_urls: [String],
    updated_at: Date,
    line_items: [
      {
        id: {
          type: Number,
          index: true,
        },
        name: String,
      },
    ],
  },
  {
    autoIndex: false,
    _id: false,
  }
);

const RefundLineItemSchema = new Schema(
  {
    id: {
      type: Number,
      required: true,
      unique: true,
    },
    line_item_id: {
      type: Number,
      index: true,
    },
    location_id: Number,
    quantity: Number,
    restock_type: String,
    subtotal: String,
    subtotal_set: PriceSetSchema,
    total_tax: String,
    total_tax_set: PriceSetSchema,
    line_item: {
      id: Number,
      name: String,
    },
  },
  {
    autoIndex: false,
    _id: false,
  }
);

const RefundSchema = new Schema(
  {
    id: {
      type: Number,
      required: true,
      unique: true,
    },
    admin_graphql_api_id: String,
    created_at: Date,
    note: String,
    order_id: Number,
    processed_at: Date,
    restock: Boolean,
    total_duties_set: PriceSetSchema,
    user_id: Number,
    refund_line_items: [RefundLineItemSchema],
  },
  {
    autoIndex: false,
    _id: false,
  }
);

const ShippingLineSchema = new Schema(
  {
    id: {
      type: Number,
      required: true,
      unique: true,
    },
    carrier_identifier: String,
    code: String,
    discounted_price: String,
    discounted_price_set: PriceSetSchema,
    phone: String,
    price: String,
    price_set: PriceSetSchema,
    requested_fulfillment_service_id: String,
    source: String,
    title: String,
  },
  {
    autoIndex: false,
    _id: false,
  }
);

export const OrdreMongooseSchema = new Schema<IOrderDocument, IOrderModel>({
  id: {
    type: Number,
    required: true,
    unique: true,
    index: true,
  },
  admin_graphql_api_id: String,
  buyer_accepts_marketing: Boolean,
  cancel_reason: String,
  cancelled_at: Date,
  closed_at: Date,
  confirmed: Boolean,
  contact_email: String,
  created_at: Date,
  currency: String,
  current_subtotal_price: String,
  current_subtotal_price_set: PriceSetSchema,
  current_total_additional_fees_set: PriceSetSchema,
  current_total_discounts: String,
  current_total_discounts_set: PriceSetSchema,
  current_total_duties_set: PriceSetSchema,
  current_total_price: String,
  current_total_price_set: PriceSetSchema,
  current_total_tax: String,
  current_total_tax_set: PriceSetSchema,
  customer_locale: String,
  discount_codes: [DiscountCodeSchema],
  email: String,
  estimated_taxes: Boolean,
  financial_status: String,
  fulfillment_status: String,
  location_id: Number,
  name: String,
  note: String,
  note_attributes: [{}],
  number: Number,
  order_number: Number,
  order_status_url: String,
  phone: String,
  po_number: String,
  presentment_currency: String,
  processed_at: Date,
  source_identifier: String,
  subtotal_price: String,
  subtotal_price_set: PriceSetSchema,
  tags: String,
  tax_exempt: Boolean,
  tax_lines: [{}],
  taxes_included: Boolean,
  test: Boolean,
  total_discounts: String,
  total_discounts_set: PriceSetSchema,
  total_line_items_price: String,
  total_line_items_price_set: PriceSetSchema,
  total_outstanding: String,
  total_price: String,
  total_price_set: PriceSetSchema,
  total_shipping_price_set: PriceSetSchema,
  total_tax: String,
  total_tax_set: PriceSetSchema,
  total_tip_received: String,
  total_weight: Number,
  updated_at: Date,
  user_id: Number,
  billing_address: AddressSchema,
  customer: CustomerSchema,
  discount_applications: [{}],
  fulfillments: [FulfillmentSchema],
  line_items: [LineItemSchema],
  payment_terms: {},
  refunds: [RefundSchema],
  shipping_address: AddressSchema,
  shipping_lines: [ShippingLineSchema],
});