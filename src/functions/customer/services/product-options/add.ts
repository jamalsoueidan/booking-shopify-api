import { ScheduleModel } from "~/functions/schedule";
import { UserModel } from "~/functions/user";
import { NotFoundError, ShopifyError } from "~/library/handler";
import { shopifyAdmin } from "~/library/shopify";
import { GidFormat } from "~/library/zod";
import { CustomerProductServiceGet } from "../product/get";
import { mergeArraysUnique } from "../product/update";

export type CustomerProductOptionsServiceAddProps = {
  customerId: number;
  productId: number; // add option to this productId
  cloneId: number; // which productId to clone from shopify
  title: string;
};

export async function CustomerProductOptionsServiceAdd({
  customerId,
  productId,
  cloneId,
  title,
}: CustomerProductOptionsServiceAddProps) {
  const user = await UserModel.findOne({
    customerId,
  })
    .orFail(
      new NotFoundError([
        {
          path: ["customerId"],
          message: "NOT_FOUND",
          code: "custom",
        },
      ])
    )
    .lean();

  const product = await CustomerProductServiceGet({
    customerId,
    productId,
  });

  const { data } = await shopifyAdmin.request(PRODUCT_OPTION_DUPLCATE, {
    variables: {
      productId: `gid://shopify/Product/${cloneId}`,
      title,
    },
  });

  if (!data?.productDuplicate?.newProduct) {
    throw new ShopifyError([
      {
        path: ["shopify"],
        message: "GRAPHQL_ERROR",
        code: "custom",
      },
    ]);
  }

  const newProductId = GidFormat.parse(data.productDuplicate.newProduct.id);

  await shopifyAdmin.request(PRODUCT_OPTION_UPDATE_TAG, {
    variables: {
      id: `gid://shopify/Product/${newProductId}`,
      tags: `user, options, user-${user.username}, customer-${customerId}, product-${productId}, product-${product.productHandle}`,
    },
  });

  const newOption = {
    productId: newProductId,
    title: data.productDuplicate.newProduct.title,
    variants:
      data.productDuplicate?.newProduct?.variants.nodes.map((variant) => ({
        variantId: GidFormat.parse(variant.id),
        title: variant.title,
        price: variant.price,
        duration: {
          metafieldId: GidFormat.parse(variant.duration?.id),
          value: parseInt(variant.duration?.value || "0"),
        },
      })) || [],
  };

  const newProduct = {
    ...product,
    options: mergeArraysUnique(
      product?.options || [],
      [newOption],
      "productId"
    ),
  };

  await ScheduleModel.updateOne(
    {
      customerId,
      "products.productId": productId,
    },
    {
      $set: {
        "products.$": newProduct,
      },
    }
  );

  return newOption;
}

export const PRODUCT_OPTION_DUPLCATE = `#graphql
  mutation productOptionDuplicate($productId: ID!, $title: String!) {
    productDuplicate(newTitle: $title, productId: $productId) {
      newProduct {
        id
        title
        handle
        variants(first: 5) {
          nodes {
            id
            title
            price
            duration: metafield(key: "duration", namespace: "booking") {
              id
              value
            }
          }
        }
      }
    }
  }
` as const;

export const PRODUCT_OPTION_UPDATE_TAG = `#graphql
  mutation productOptionUpdateTag($id: ID!, $tags: [String!]!) {
    productUpdate(input: {tags: $tags, id: $id}) {
      product {
        id
        tags
      }
    }
  }
` as const;
