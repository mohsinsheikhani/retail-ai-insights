import { Construct } from "constructs";
import {
  Instance,
  InstanceClass,
  InstanceSize,
  InstanceType,
  MachineImage,
  Vpc,
  SecurityGroup,
  Peer,
  Port,
} from "aws-cdk-lib/aws-ec2";
import {
  Role,
  ServicePrincipal,
  ManagedPolicy,
  PolicyStatement,
} from "aws-cdk-lib/aws-iam";
import { Bucket } from "aws-cdk-lib/aws-s3";
import { Table } from "aws-cdk-lib/aws-dynamodb";
import { aws_ec2 as ec2 } from "aws-cdk-lib";

interface ForecastEc2Props {
  vpc: Vpc;
  goldBucket: Bucket;
  dataAssetsBucket: Bucket;
  forecastTable: Table;
}

export class ForecastEc2Instance extends Construct {
  public readonly instance: Instance;

  constructor(scope: Construct, id: string, props: ForecastEc2Props) {
    super(scope, id);

    const { vpc, goldBucket, dataAssetsBucket, forecastTable } = props;

    const role = new Role(this, "ForecastEC2Role", {
      assumedBy: new ServicePrincipal("ec2.amazonaws.com"),
      managedPolicies: [
        ManagedPolicy.fromAwsManagedPolicyName("CloudWatchAgentServerPolicy"),
        ManagedPolicy.fromAwsManagedPolicyName("AmazonS3ReadOnlyAccess"),
        ManagedPolicy.fromAwsManagedPolicyName("AmazonDynamoDBFullAccess"),
      ],
    });

    role.addToPolicy(
      new PolicyStatement({
        actions: ["bedrock:InvokeModel"],
        resources: ["*"],
      })
    );

    role.addToPolicy(
      new PolicyStatement({
        actions: ["ec2:TerminateInstances"],
        resources: ["*"],
        conditions: {
          StringEquals: {
            "ec2:ResourceTag/Name": "ForecastEC2",
          },
        },
      })
    );

    const userData = ec2.UserData.forLinux();
    userData.addCommands(
      "sudo yum update -y",
      "sudo yum install -y python3 pip -y",
      "pip3 install boto3 pandas pyarrow",

      "cd /home/ec2-user",

      `curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"`,
      "unzip awscliv2.zip",
      "sudo ./aws/install --update",

      // Export environment variables to .bashrc or directly
      `echo 'export GOLD_BUCKET=${goldBucket.bucketName}' >> /etc/profile`,
      `echo 'export FORECAST_TABLE=${forecastTable.tableName}' >> /etc/profile`,
      "source /etc/profile",

      `aws s3 cp s3://${dataAssetsBucket.bucketName}/scripts/inventory_forecaster.py .`,
      "python3 ./inventory_forecaster.py",

      "shutdown now -h"
    );

    this.instance = new Instance(this, "ForecastEC2", {
      instanceName: "ForecastEC2",
      instanceType: InstanceType.of(InstanceClass.T3, InstanceSize.MEDIUM),
      machineImage: MachineImage.latestAmazonLinux2023(),
      vpc,
      role,
      userData,
      associatePublicIpAddress: true,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PUBLIC,
      },
    });
  }
}
