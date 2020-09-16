import { Construct } from "@aws-cdk/core";
import {
  Vpc,
  SubnetType,
} from "@aws-cdk/aws-ec2";

export class Network extends Construct {
  public readonly vpc: Vpc;

  //public readonly dbSg: SecurityGroup;
  constructor(parent: Construct, name: string) {
    super(parent, name);

    const env: string = this.node.tryGetContext('env');
    const params: any = this.node.tryGetContext(env);

    // create vpc
    this.vpc = new Vpc(this, `${env}-vpc`, {
      cidr: params["cibr"],
      enableDnsHostnames: true,
      enableDnsSupport: true,
      maxAzs: params["maxAzs"],
      subnetConfiguration: [
        { name: `${env}-private`, subnetType: SubnetType.PRIVATE, cidrMask: 24 },
        { name: `${env}-public`, subnetType: SubnetType.PUBLIC, cidrMask: 24 }
      ]
    });
    this.vpc.addFlowLog(`${env}-vpc-flow-log`)

  }
}
