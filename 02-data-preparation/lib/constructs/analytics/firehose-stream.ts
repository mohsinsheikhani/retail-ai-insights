import { Construct } from "constructs";

import { CfnDeliveryStream } from "aws-cdk-lib/aws-kinesisfirehose";
import { PolicyStatement, Role, ServicePrincipal } from "aws-cdk-lib/aws-iam";
import { Bucket } from "aws-cdk-lib/aws-s3";
import { LogGroup, LogStream } from "aws-cdk-lib/aws-logs";

interface FirehoseProps {
  destinationBucket: Bucket;
}

export class FirehoseToS3 extends Construct {
  public readonly deliveryStream: CfnDeliveryStream;

  constructor(scope: Construct, id: string, props: FirehoseProps) {
    super(scope, id);

    const logGroup = new LogGroup(this, "FirehoseLogGroup");
    const logStream = new LogStream(this, "FirehoseLogStream", {
      logGroup,
    });

    // IAM Role for Firehose to access S3
    const firehoseRole = new Role(this, "FirehoseRole", {
      assumedBy: new ServicePrincipal("firehose.amazonaws.com"),
    });

    props.destinationBucket.grantWrite(firehoseRole);

    firehoseRole.addToPolicy(
      new PolicyStatement({
        actions: [
          "logs:PutLogEvents",
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
        ],
        resources: [logGroup.logGroupArn],
      })
    );

    // Firehose Delivery Stream
    this.deliveryStream = new CfnDeliveryStream(this, "DatasetFirehose", {
      deliveryStreamName: "firehose-to-s3",
      deliveryStreamType: "DirectPut",
      s3DestinationConfiguration: {
        bucketArn: props.destinationBucket.bucketArn,
        roleArn: firehoseRole.roleArn,
        prefix: "dataset/",
        bufferingHints: {
          intervalInSeconds: 60,
          sizeInMBs: 5,
        },
        compressionFormat: "UNCOMPRESSED",
        cloudWatchLoggingOptions: {
          enabled: true,
          logGroupName: logGroup.logGroupName,
          logStreamName: logStream.logStreamName,
        },
      },
    });
  }
}
