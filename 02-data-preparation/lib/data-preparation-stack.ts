import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";

import { S3BucketFactory } from "./constructs/common/storage/s3-bucket-factory";
import { FirehoseToS3 } from "./constructs/analytics/firehose-stream";
import { GlueResources } from "./constructs/analytics/glue-resources";
import { DynamoDBInventory } from "./constructs/common/storage/dynamodb-inventory";
import { VpcResource } from "./constructs/shared/networking/vpc";

export class DataPreparationStack extends cdk.Stack {
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

    const { bucket: silverBucket } = new S3BucketFactory(
      this,
      "SilverDataLakeBucket",
      {
        bucketName: "retail-ai-silver-data",
      }
    );

    const { bucket: goldBucket } = new S3BucketFactory(this, "GoldDataBucket", {
      bucketName: "retail-ai-gold-data",
    });

    const { bucket: dataAssetsBucket } = new S3BucketFactory(
      this,
      "DataAssets",
      {
        bucketName: "retail-ai-data-assets",
      }
    );

    /**
     * Firehose Stream
     **/
    new FirehoseToS3(this, "FirehoseToS3", {
      destinationBucket: bronzeBucket,
    });

    /**
     * Glue ETL Resources
     **/
    new GlueResources(this, "GlueResources", {
      bronzeBucket: bronzeBucket,
      silverBucket: silverBucket,
      goldBucket: goldBucket,
      dataAssetsBucket: dataAssetsBucket,
    });
  }
}
