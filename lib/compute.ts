import cdk = require("@aws-cdk/core");
import ec2 = require("@aws-cdk/aws-ec2");
import asg = require("@aws-cdk/aws-autoscaling");
import iam = require("@aws-cdk/aws-iam");
import { Tag } from "@aws-cdk/core";

interface ComputeProps {
  vpc:       ec2.IVpc;
  policy:    { [key: string]: iam.PolicyStatement };
}

export class Compute extends cdk.Construct {
  public readonly instances: { [key: string]: ec2.Instance | ec2.BastionHostLinux } = {};
  public readonly asgs:      { [key: string]: asg.AutoScalingGroup } = {};

  constructor(parent: cdk.Construct, name: string, props: ComputeProps) {
    super(parent, name);

    const env:      string  = this.node.tryGetContext('env');

    // subnets
    const public_subnet:         ec2.SubnetSelection = { subnetGroupName: `${env}-public` }
    const private_subnet:        ec2.SubnetSelection = { subnetGroupName: `${env}-private` }

    // ami
    const amazonlinux2 = new ec2.AmazonLinuxImage({ generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2 })
    const bastion      = new ec2.LookupMachineImage({ name: "bastion" })
    const fuckfish     = new ec2.LookupMachineImage({ name: "fuckfish" })

    // setup commands
    const setup_comand = [
      "sudo timedatectl set-timezone Asia/Tokyo",
      "sudo yum update -y",
      "sudo yum install -y vim git util-linux-user",
    ]

    this.instances["bastion"] = new ec2.BastionHostLinux(this, `${env}-bastion`, {
      vpc: props.vpc,
      subnetSelection: private_subnet,
      instanceType: new ec2.InstanceType("t3a.micro"),
      machineImage: bastion,
      instanceName: `${env}-bastion`,
    })

    // create instance
    this.asgs["web"] = new asg.AutoScalingGroup(this, `${env}-web-asg`, {
      vpc: props.vpc,
      vpcSubnets: private_subnet,
      instanceType: new ec2.InstanceType("t3a.micro"),
      machineImage: amazonlinux2,
      keyName: "bastion"
    })

    this.asgs["fuckfish"] = new asg.AutoScalingGroup(this, `${env}-fuckfish-asg`, {
      vpc: props.vpc,
      vpcSubnets: private_subnet,
      instanceType: new ec2.InstanceType("t3a.micro"),
      machineImage: fuckfish,
      keyName: "bastion"
    })

    // default setup
    for (let [name, node] of Object.entries(this.instances)) {
      if (node instanceof ec2.Instance) {
        node.addUserData(
          `hostnamectl set-hostname ${env}-${name}`,
          ...setup_comand
        )
        node.connections.allowFrom(this.instances["bastion"].connections, ec2.Port.tcp(22), 'allow ssh connection for bastion')
        node.connections.allowFrom(ec2.Peer.anyIpv4(), ec2.Port.icmpPing(), 'allow icmp')
      } else if (node instanceof ec2.BastionHostLinux) {
        node.instance.addUserData(
          `hostnamectl set-hostname ${env}-${name}`,
          ...setup_comand
        )

        node.allowSshAccessFrom(ec2.Peer.anyIpv4())
      };
    };

    for (let [name, asg] of Object.entries(this.asgs)) {
      // execute comannds
      asg.addUserData(
        `hostnamectl set-hostname ${env}-${name}-asg`,
        "sudo yum update -y",
        "sudo yum install -y vim git",
      )
      asg.addToRolePolicy(props.policy["ssm"])
      Tag.add(asg, "Name", `${env}-${name}-asg`)

      // add connections
      asg.connections.allowFrom(ec2.Peer.anyIpv4(), ec2.Port.icmpPing(), 'allow icmp')
      asg.connections.allowFrom(ec2.Peer.anyIpv4(), ec2.Port.tcp(22), 'allow ssh connection')
    }


  }
}
