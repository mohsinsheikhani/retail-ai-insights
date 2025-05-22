import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { VpcResource } from "./shared/networking/vpc";
import { S3BucketFactory } from "./constructs/common/storage/s3-bucket-factory";
import { FirehoseToS3 } from "./constructs/analytics/firehose-stream";
import { DynamoDBInventory } from "./constructs/common/storage/dynamodb-inventory";

export class DataIngestionStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    /**
     * Retail Inventory Table
     **/
    const dynamoConstruct = new DynamoDBInventory(this, "DynamoDBInventory");

    /**
     * VPC Setup
     **/
    const { vpc } = new VpcResource(this, "RetailVpc", {
      maxAzs: 2,
    });

    /**
     * Multi Zone Bucket
     **/
    const { bucket: bronzeBucket } = new S3BucketFactory(
      this,
      "BronzeDataLakeBucket",
      {
        bucketName: "retail-ai-bronze-data",
      }
    );

    /**
     * Firehose Stream
     **/
    new FirehoseToS3(this, "FirehoseToS3", {
      destinationBucket: bronzeBucket,
    });
  }
}
