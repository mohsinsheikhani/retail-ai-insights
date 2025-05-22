import { Construct } from "constructs";
import { Vpc, SubnetType, NatProvider } from "aws-cdk-lib/aws-ec2";
import { StackProps } from "aws-cdk-lib";

export interface VpcResourceProps extends StackProps {
  maxAzs?: number;
}

export class VpcResource extends Construct {
  public readonly vpc: Vpc;

  constructor(scope: Construct, id: string, props: VpcResourceProps) {
    super(scope, id);

    this.vpc = new Vpc(this, "RetailForecastVpc", {
      vpcName: "RetailAIVPC",
      maxAzs: props.maxAzs ?? 1,
      natGatewayProvider: NatProvider.gateway(),
      natGateways: 0,
      subnetConfiguration: [
        {
          name: "PublicSubnet",
          subnetType: SubnetType.PUBLIC,
          cidrMask: 24,
        },
        {
          name: "PrivateSubnet",
          subnetType: SubnetType.PRIVATE_WITH_EGRESS,
          cidrMask: 24,
        },
      ],
    });
  }
}
