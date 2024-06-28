import { app } from "@azure/functions";
import "module-alias/register";
import { OpenAIControllerProductCategorize } from "./openai/controllers/product-categorize";

app.http("openaiProductCategorize", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "openai/products-categorize",
  handler: OpenAIControllerProductCategorize,
});
