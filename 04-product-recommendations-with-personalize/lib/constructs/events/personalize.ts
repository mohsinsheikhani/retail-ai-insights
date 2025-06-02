import { Construct } from "constructs";
import {
  CfnDatasetGroup,
  CfnSchema,
  CfnDataset,
} from "aws-cdk-lib/aws-personalize";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as iam from "aws-cdk-lib/aws-iam";
import * as cdk from "aws-cdk-lib";

export class PersonalizeResources extends Construct {
  public readonly datasetGroupArn: string;

  constructor(scope: Construct, id: string, props: { goldBucket: s3.IBucket }) {
    super(scope, id);

    // Dataset Group
    const datasetGroup = new CfnDatasetGroup(this, "DatasetGroup", {
      name: "RetailInventoryDatasetGroup",
      domain: "ECOMMERCE",
    });

    // Interactions Schema
    const interactionsSchema = new CfnSchema(this, "InteractionSchema", {
      name: "RetailInteractionSchema",
      domain: "ECOMMERCE",
      schema: JSON.stringify({
        type: "record",
        name: "Interactions",
        namespace: "com.amazonaws.personalize.schema",
        fields: [
          { name: "USER_ID", type: "string" },
          { name: "ITEM_ID", type: "string" },
          { name: "EVENT_TYPE", type: "string" },
          { name: "TIMESTAMP", type: "long" },
        ],
        version: "1.0",
      }),
    });

    // Interactions Dataset
    new CfnDataset(this, "InteractionsDataset", {
      datasetGroupArn: datasetGroup.attrDatasetGroupArn,
      datasetType: "Interactions",
      name: "RetailInteractions",
      schemaArn: interactionsSchema.attrSchemaArn,
    });

    const personalizeExecutionRole = new iam.Role(
      this,
      "PersonalizeExecutionRole",
      {
        roleName: "AmazonPersonalize-ExecutionRole",
        assumedBy: new iam.ServicePrincipal("personalize.amazonaws.com"),
      }
    );

    personalizeExecutionRole.addToPolicy(
      new iam.PolicyStatement({
        actions: ["s3:GetObject", "s3:ListBucket"],
        resources: [
          props.goldBucket.bucketArn,
          `${props.goldBucket.bucketArn}/*`,
        ],
      })
    );

    this.datasetGroupArn = datasetGroup.attrDatasetGroupArn;

    new cdk.CfnOutput(this, "PersonalizeExecutionRoleArn", {
      value: personalizeExecutionRole.roleArn,
    });
  }
}
