import * as cdk from '@aws-cdk/core';
import { IAM } from './security/iam'

export class SecurityStack extends cdk.Stack {
  public readonly iam: IAM;

  constructor(parent: cdk.App, name: string, props?: cdk.StackProps) {
    super(parent, name, props);

    this.iam = new IAM(this, "IAM")
  }
}
