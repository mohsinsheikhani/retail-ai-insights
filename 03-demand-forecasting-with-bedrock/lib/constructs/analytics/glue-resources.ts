import { Construct } from "constructs";
import * as cdk from "aws-cdk-lib";

import { Bucket } from "aws-cdk-lib/aws-s3";
import { CfnCrawler, CfnJob, CfnDatabase } from "aws-cdk-lib/aws-glue";
import {
  Role,
  ServicePrincipal,
  ManagedPolicy,
  PolicyStatement,
} from "aws-cdk-lib/aws-iam";

interface GlueProps {
  bronzeBucket: Bucket;
  silverBucket: Bucket;
  goldBucket: Bucket;
  dataAssetsBucket: Bucket;
}

export class GlueResources extends Construct {
  constructor(scope: Construct, id: string, props: GlueProps) {
    super(scope, id);

    const { bronzeBucket, silverBucket, goldBucket, dataAssetsBucket } = props;

    // Glue Database
    const glueDatabase = new CfnDatabase(this, "SalesDatabase", {
      catalogId: cdk.Stack.of(this).account,
      databaseInput: {
        name: "sales_data_db",
      },
    });

    // Create IAM Role for Glue
    const glueRole = new Role(this, "GlueServiceRole", {
      assumedBy: new ServicePrincipal("glue.amazonaws.com"),
    });

    bronzeBucket.grantRead(glueRole);
    silverBucket.grantReadWrite(glueRole);
    goldBucket.grantReadWrite(glueRole);

    glueRole.addToPolicy(
      new PolicyStatement({
        actions: ["s3:GetObject"],
        resources: [`${dataAssetsBucket.bucketArn}/*`],
      })
    );

    glueRole.addManagedPolicy(
      ManagedPolicy.fromAwsManagedPolicyName("service-role/AWSGlueServiceRole")
    );

    // Glue Crawler (for Bronze Bucket)
    new CfnCrawler(this, "DataCrawlerBronze", {
      name: "DataCrawlerBronze",
      role: glueRole.roleArn,
      databaseName: glueDatabase.ref,
      targets: {
        s3Targets: [{ path: bronzeBucket.s3UrlForObject() }],
      },
      tablePrefix: "bronze_",
    });

    // Glue ETL Job
    new CfnJob(this, "DataCleaningETLJob", {
      name: "DataCleaningETLJob",
      role: glueRole.roleArn,
      command: {
        name: "glueetl",
        pythonVersion: "3",
        scriptLocation: dataAssetsBucket.s3UrlForObject(
          "scripts/sales_etl_script.py"
        ),
      },
      defaultArguments: {
        "--TempDir": silverBucket.s3UrlForObject("temp/"),
        "--job-language": "python",
        "--bronze_bucket": bronzeBucket.bucketName,
        "--silver_bucket": silverBucket.bucketName,
      },
      glueVersion: "3.0",
      maxRetries: 0,
      timeout: 10,
      workerType: "Standard",
      numberOfWorkers: 2,
    });

    // Glue Crawler (for Silver Bucket)
    new CfnCrawler(this, "DataCrawlerSilver", {
      name: "DataCrawlerSilver",
      role: glueRole.roleArn,
      databaseName: glueDatabase.ref,
      targets: {
        s3Targets: [
          {
            path: `${silverBucket.s3UrlForObject()}/cleaned_data/`,
          },
        ],
      },
      tablePrefix: "silver_",
    });

    // Glue Crawler (for Gold Bucket)
    new CfnCrawler(this, "DataCrawlerForecast", {
      name: "DataCrawlerForecast",
      role: glueRole.roleArn,
      databaseName: glueDatabase.ref,
      targets: {
        s3Targets: [{ path: `${goldBucket.s3UrlForObject()}/forecast_ready/` }],
      },
      tablePrefix: "gold_",
    });

    // Glue Crawler (for Gold Bucket)
    new CfnCrawler(this, "DataCrawlerRecommendations", {
      name: "DataCrawlerRecommendations",
      role: glueRole.roleArn,
      databaseName: glueDatabase.ref,
      targets: {
        s3Targets: [
          { path: `${goldBucket.s3UrlForObject()}/recommendations_ready/` },
        ],
      },
      tablePrefix: "gold_",
    });

    // Glue ETL Job to output forecast ready dataset
    new CfnJob(this, "ForecastGoldETLJob", {
      name: "ForecastGoldETLJob",
      role: glueRole.roleArn,
      command: {
        name: "glueetl",
        pythonVersion: "3",
        scriptLocation: dataAssetsBucket.s3UrlForObject(
          "scripts/forecast_gold_etl_script.py"
        ),
      },
      defaultArguments: {
        "--TempDir": silverBucket.s3UrlForObject("temp/"),
        "--job-language": "python",
        "--silver_bucket": silverBucket.bucketName,
        "--gold_bucket": goldBucket.bucketName,
      },
      glueVersion: "3.0",
      maxRetries: 0,
      timeout: 10,
      workerType: "Standard",
      numberOfWorkers: 2,
    });

    // Glue ETL Job to output recommendation ready dataset
    new CfnJob(this, "RecommendationGoldETLJob", {
      name: "RecommendationGoldETLJob",
      role: glueRole.roleArn,
      command: {
        name: "glueetl",
        pythonVersion: "3",
        scriptLocation: dataAssetsBucket.s3UrlForObject(
          "scripts/user_interaction_etl_script.py"
        ),
      },
      defaultArguments: {
        "--TempDir": silverBucket.s3UrlForObject("temp/"),
        "--job-language": "python",
        "--data_assets_bucket": dataAssetsBucket.bucketName,
        "--gold_bucket": goldBucket.bucketName,
      },
      glueVersion: "3.0",
      maxRetries: 0,
      timeout: 10,
      workerType: "Standard",
      numberOfWorkers: 2,
    });
  }
}
