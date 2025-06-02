import {
  PersonalizeRuntimeClient,
  GetRecommendationsCommand,
} from "@aws-sdk/client-personalize-runtime";
import { DynamoDBClient, BatchGetItemCommand } from "@aws-sdk/client-dynamodb";

const personalizeClient = new PersonalizeRuntimeClient({});
const dynamoClient = new DynamoDBClient({});
const CAMPAIGN_ARN = process.env.PERSONALIZE_CAMPAIGN_ARN;
const PRODUCT_TABLE_NAME = process.env.PRODUCT_TABLE_NAME;

const unmarshallItem = (item) => {
  const result = {};
  for (const key in item) {
    const value = item[key];
    result[key] = Object.values(value)[0]; // Strip { S: "..." } → "..."
  }
  return result;
};

export const handler = async (event) => {
  const productId = event.queryStringParameters?.product_id;

  if (!productId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing product_id in query parameters" }),
    };
  }

  try {
    const personalizeResponse = await personalizeClient.send(
      new GetRecommendationsCommand({
        campaignArn: CAMPAIGN_ARN,
        itemId: productId,
        numResults: 5,
      })
    );

    const recommendedIds = personalizeResponse.itemList.map(
      (item) => item.itemId
    );

    if (recommendedIds.length === 0) {
      return {
        statusCode: 200,
        body: JSON.stringify({ products: [] }),
      };
    }

    const batchGetResponse = await dynamoClient.send(
      new BatchGetItemCommand({
        RequestItems: {
          [PRODUCT_TABLE_NAME]: {
            Keys: recommendedIds.map((id) => ({ product_id: { S: id } })),
          },
        },
      })
    );

    const products = batchGetResponse.Responses?.[PRODUCT_TABLE_NAME] || [];
    const formattedProducts = products.map(unmarshallItem);

    return {
      statusCode: 200,
      body: JSON.stringify({ products: formattedProducts }),
    };
  } catch (err) {
    console.error("Error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to get product details" }),
    };
  }
};
