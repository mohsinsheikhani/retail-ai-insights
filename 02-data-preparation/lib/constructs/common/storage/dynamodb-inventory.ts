import { Construct } from "constructs";

import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as cdk from "aws-cdk-lib";

export class DynamoDBInventory extends Construct {
  public readonly inventoryTable: dynamodb.Table;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    this.inventoryTable = new dynamodb.Table(this, "RetailInventoryTable", {
      tableName: "RetailInventoryTable",
      partitionKey: { name: "product_id", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      encryption: dynamodb.TableEncryption.AWS_MANAGED,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
  }
}
