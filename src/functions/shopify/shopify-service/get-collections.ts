import { gql, request } from "graphql-request";

export type ShopifyCollection = {
  id: string;
  title: string;
  image?: {
    url: string;
  };
};

export type ShopifyServiceGetCollections = {
  collections: {
    nodes: Array<ShopifyCollection>;
  };
};

const query = gql`
  query {
    collections(first: 100) {
      nodes {
        id
        title
        image {
          url
        }
      }
    }
  }
`;

const headers = {
  "X-Shopify-Access-Token": process.env["ShopifyAccessToken"] || "",
};

export const ShopifyServiceGetCollections = async () => {
  const response = await request<ShopifyServiceGetCollections>(
    process.env["ShopifyApiUrl"] || "",
    query,
    undefined,
    headers
  );
  return response.collections?.nodes;
};
