import { Construct } from "constructs";
import * as cdk from "aws-cdk-lib";
import { aws_lambda as lambda, Duration } from "aws-cdk-lib";
import { Rule, Schedule } from "aws-cdk-lib/aws-events";
import { LambdaFunction } from "aws-cdk-lib/aws-events-targets";
import { PolicyStatement } from "aws-cdk-lib/aws-iam";
import {
  NodejsFunction,
  NodejsFunctionProps,
} from "aws-cdk-lib/aws-lambda-nodejs";
import path from "path";

export class ScheduleForecastTask extends Construct {
  constructor(scope: Construct, id: string, instanceId: string) {
    super(scope, id);

    const startInstanceLambdaProps: NodejsFunctionProps = {
      functionName: "StartInstanceLambda",
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: "handler",
      memorySize: 128,
      entry: path.join(__dirname, "../../../lambda/start-instance/index.js"),
      timeout: cdk.Duration.seconds(10),
      environment: {
        INSTANCE_ID: instanceId,
      },
    };

    const startInstanceLambda = new NodejsFunction(
      this,
      "StartInstanceLambda",
      {
        ...startInstanceLambdaProps,
      }
    );

    startInstanceLambda.addToRolePolicy(
      new PolicyStatement({
        actions: ["ec2:StartInstances"],
        resources: [`arn:aws:ec2:*:*:instance/${instanceId}`],
      })
    );

    new Rule(this, "StartInstanceSchedule", {
      schedule: Schedule.cron({ minute: "0", hour: "1" }),
      targets: [new LambdaFunction(startInstanceLambda)],
    });
  }
}
