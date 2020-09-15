import { Construct } from "@aws-cdk/core";
import {
  Vpc,
  Peer,
  Port,
  SubnetType,
  SecurityGroup,
} from "@aws-cdk/aws-ec2";

export class Network extends Construct {
  public readonly vpc: Vpc;
  public readonly sg: { [key: string]: SecurityGroup; } = {};

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

    // create security group
    this.sg['bastion'] = new SecurityGroup(this, "bastion", {
      vpc: this.vpc,
      allowAllOutbound: true,
      securityGroupName: `${env}-bastion`,
      description: `${env}-bastion`
    });

    this.sg['private-app'] = new SecurityGroup(this, "private-app-default", {
      vpc: this.vpc,
      allowAllOutbound: true,
      securityGroupName: `${env}-private-app-default`,
      description: `${env}-private-app-default`
    });

    this.sg['redis'] = new SecurityGroup(this, "redis", {
      vpc: this.vpc,
      allowAllOutbound: true,
      securityGroupName: `${env}-redis`,
      description: `${env}-redis`
    });

    // add ingressrule
    this.sg['bastion'].addIngressRule(Peer.anyIpv4(), Port.tcp(22), 'allow ssh connection')

    // add all icmp ping
    for (let name in this.sg) {
      this.sg[name].addIngressRule(Peer.anyIpv4(), Port.icmpPing(), 'allow icmp')
    };
  }
}
