import * as cdk from '@aws-cdk/core';
import { Vpc } from './network/vpc'
import { R53 } from './network/r53'

export class NetworkStack extends cdk.Stack {
  public readonly vpc: Vpc;
  public readonly r53: R53;

  constructor(parent: cdk.App, name: string, props?: cdk.StackProps) {
    super(parent, name, props);

    this.vpc = new Vpc(this, 'Vpc')
    this.r53 = new R53(this, 'R35', {vpc: this.vpc.vpc})
  }
}