import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";

import { DynamoDBInventory } from "./constructs/common/storage/dynamodb-inventory";
import { VpcResource } from "./constructs/shared/networking/vpc";
import { S3BucketFactory } from "./constructs/common/storage/s3-bucket-factory";
import { FirehoseToS3 } from "./constructs/analytics/firehose-stream";
import { GlueResources } from "./constructs/analytics/glue-resources";
import { ForecastEc2Instance } from "./constructs/common/compute/forecast-instance";
import { ScheduleForecastTask } from "./constructs/events/schedule-ec2-task";
import { PersonalizeResources } from "./constructs/events/personalize";
import { RecommendationResource } from "./constructs/common/recommendations";

export class RetailAiTestingStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const dynamoConstruct = new DynamoDBInventory(this, "DynamoDBInventory");

    const { vpc } = new VpcResource(this, "RetailVpc", {});

    /**
     * Multi Zone Bucket
     **/
    const { bucket: bronzeBucket } = new S3BucketFactory(
      this,
      "BronzeDataLakeBucket",
      {
        bucketName: "retail-ai-bronze-zone",
      }
    );

    const { bucket: silverBucket } = new S3BucketFactory(
      this,
      "SilverDataLakeBucket",
      {
        bucketName: "retail-ai-silver-zone",
      }
    );

    const { bucket: goldBucket } = new S3BucketFactory(this, "GoldDataBucket", {
      bucketName: "retail-ai-gold-zone",
    });

    const { bucket: dataAssetsBucket } = new S3BucketFactory(
      this,
      "DataAssets",
      {
        bucketName: "retail-ai-zone-assets",
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
      bronzeBucket,
      silverBucket,
      goldBucket,
      dataAssetsBucket,
    });

    const forecastInstance = new ForecastEc2Instance(this, "ForecastingEc2", {
      vpc: vpc,
      goldBucket,
      dataAssetsBucket,
      forecastTable: dynamoConstruct.inventoryTable,
    });

    new ScheduleForecastTask(
      this,
      "ScheduleForecastTask",
      forecastInstance.instance.instanceId
    );

    new PersonalizeResources(this, "PersonalizeInfra", {
      goldBucket,
    });

    new RecommendationResource(this, "RecommendationResource", {
      retailTable: dynamoConstruct.inventoryTable,
    });
  }
}
