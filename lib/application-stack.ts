import * as cdk from '@aws-cdk/core';
import { SecurityStack } from './security-stack'
import { NetworkStack } from './network-stack'

import { ELB        } from './application/elb'
import { EC2        } from './application/ec2'
import { RDB        } from './application/rdb'
import { CloudWatch } from './application/cloudwatch'

interface ApplicationStackProps extends cdk.StackProps {
  security: SecurityStack;
  network:  NetworkStack;
}

export class ApplicationStack extends cdk.Stack {
  public readonly ec2: EC2;
  public readonly rdb: RDB;
  public readonly elb: ELB;
  public readonly cw:  CloudWatch;

  constructor(parent: cdk.App, name: string, props: ApplicationStackProps) {
    super(parent, name, props);

    this.ec2 = new EC2(this, "EC2", {vpc: props.network.vpc.vpc, policy: props.security.iam.policy})
    this.elb = new ELB(this, "ELB", {vpc: props.network.vpc.vpc, asgs: this.ec2.asgs})
    this.rdb = new RDB(this, "RDB", {vpc: props.network.vpc.vpc})
    this.cw  = new CloudWatch(this, "CloudWatch", {ec2: this.ec2})
  }
}
