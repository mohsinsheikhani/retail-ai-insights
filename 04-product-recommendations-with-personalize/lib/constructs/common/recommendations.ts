import { Construct } from "constructs";
import {
  NodejsFunction,
  NodejsFunctionProps,
} from "aws-cdk-lib/aws-lambda-nodejs";

import * as iam from "aws-cdk-lib/aws-iam";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as path from "path";
import * as cdk from "aws-cdk-lib";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import { Table } from "aws-cdk-lib/aws-dynamodb";

interface RecommendationsProps {
  retailTable: Table;
}

export class RecommendationResource extends Construct {
  constructor(scope: Construct, id: string, props: RecommendationsProps) {
    super(scope, id);

    const getRecommendationsFunctionsProps: NodejsFunctionProps = {
      functionName: "GetRecommendationsLambda",
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: "handler",
      memorySize: 256,
      entry: path.join(__dirname, "../../../lambda/recommend_handler/index.js"),
      timeout: cdk.Duration.seconds(20),
      environment: {
        PERSONALIZE_CAMPAIGN_ARN: `arn:aws:personalize:us-east-1:${
          cdk.Stack.of(this).account
        }:campaign/retail-recommendation-campaign`,
        PRODUCT_TABLE_NAME: props.retailTable.tableName,
      },
    };

    const getRecommendationsLambda = new NodejsFunction(
      this,
      "GetRecommendationsLambda",
      {
        ...getRecommendationsFunctionsProps,
      }
    );

    getRecommendationsLambda.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ["personalize:GetRecommendations"],
        resources: [
          `arn:aws:personalize:us-east-1:${
            cdk.Stack.of(this).account
          }:campaign/retail-recommendation-campaign`,
        ],
      })
    );

    getRecommendationsLambda.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ["dynamodb:BatchGetItem"],
        resources: [props.retailTable.tableArn],
      })
    );

    // Api Gateway resource for /recommendations endpoint
    const api = new apigateway.RestApi(this, "GetRecommendationsAPI", {
      restApiName: "GetRecommendations",
      description: "API to retrieve recommendations.",
      deployOptions: {
        stageName: "prod",
      },
    });

    const askResource = api.root.addResource("recommendations");

    askResource.addMethod(
      "GET",
      new apigateway.LambdaIntegration(getRecommendationsLambda),
      {
        apiKeyRequired: false,
      }
    );

    new cdk.CfnOutput(this, "GetRecommendationsApiOutput", {
      value: `https://${api.restApiId}.execute-api.${
        cdk.Stack.of(this).region
      }.amazonaws.com/${api.deploymentStage.stageName}/recommendations`,
    });
  }
}
