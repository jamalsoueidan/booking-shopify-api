import { app } from "@azure/functions";
import * as df from "durable-functions";
import { ShopifyControllerSearchCustomers } from "./shopify";
import { ShopifyDurableLoadData } from "./shopify/shopify-durable";

app.http("shopifyLoadData", {
  route: "shopify/load-data",
  extraInputs: [df.input.durableClient()],
  handler: ShopifyDurableLoadData,
});

app.http("shopifySearchCustomers", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "shopify/search-customers",
  handler: ShopifyControllerSearchCustomers,
});