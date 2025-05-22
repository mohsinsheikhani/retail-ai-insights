import { Construct } from "constructs";
import {
  Bucket,
  BlockPublicAccess,
  BucketEncryption,
} from "aws-cdk-lib/aws-s3";
import * as cdk from "aws-cdk-lib";

interface CustomS3BucketProps {
  bucketName: string;
}

export class S3BucketFactory extends Construct {
  public readonly bucket: Bucket;

  constructor(scope: Construct, id: string, props: CustomS3BucketProps) {
    super(scope, id);

    const { bucketName } = props;

    this.bucket = new Bucket(this, "S3Bucket", {
      bucketName,
      versioned: true,
      enforceSSL: true,
      autoDeleteObjects: true,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      encryption: BucketEncryption.S3_MANAGED,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
  }
}
