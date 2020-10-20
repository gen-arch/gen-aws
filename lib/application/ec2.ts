import cdk = require("@aws-cdk/core");
import ec2 = require("@aws-cdk/aws-ec2");
import asg = require("@aws-cdk/aws-autoscaling");
import iam = require("@aws-cdk/aws-iam");

interface EC2Props {
  vpc:       ec2.IVpc;
  policy:    { [key: string]: iam.PolicyStatement };
}

export class EC2 extends cdk.Construct {
  public readonly instances: { [key: string]: ec2.Instance } = {};
  public readonly asgs:      { [key: string]: asg.AutoScalingGroup } = {};

  constructor(parent: cdk.Construct, name: string, props: EC2Props) {
    super(parent, name);

    const env:      string  = this.node.tryGetContext('env');

    // subnets
    const private_subnet:        ec2.SubnetSelection = { subnetGroupName: `${env}-private` }

    // ami
    const amazonlinux2 = new ec2.AmazonLinuxImage({ generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2 })

    // setup commands
    const setup_comand = [
      "sudo timedatectl set-timezone Asia/Tokyo",
      "sudo yum update -y",
      "sudo yum install -y vim git util-linux-user",
    ]

    // create instance
    this.asgs["web"] = new asg.AutoScalingGroup(this, `${env}-web-asg`, {
      vpc: props.vpc,
      vpcSubnets: private_subnet,
      instanceType: new ec2.InstanceType("t3a.micro"),
      machineImage: amazonlinux2,
    })

    // default setup
    for (let [name, node] of Object.entries(this.instances)) {
      node.addUserData(
        `hostnamectl set-hostname ${env}-${name}`,
        ...setup_comand
      )
      node.addToRolePolicy(props.policy["ssm"])
      node.connections.allowFrom(ec2.Peer.anyIpv4(), ec2.Port.tcp(22), 'allow ssh connection')
      node.connections.allowFrom(ec2.Peer.anyIpv4(), ec2.Port.icmpPing(), 'allow icmp')
    };

    for (let [name, asg] of Object.entries(this.asgs)) {
      // execute comannds
      asg.addUserData(
        `hostnamectl set-hostname ${env}-${name}-asg`,
        "sudo yum update -y",
        "sudo yum install -y vim git",
      )
      asg.addToRolePolicy(props.policy["ssm"])
      cdk.Tag.add(asg, "Name", `${env}-${name}-asg`)

      // add connections
      asg.connections.allowFrom(ec2.Peer.anyIpv4(), ec2.Port.tcp(22), 'allow ssh connection')
      asg.connections.allowFrom(ec2.Peer.anyIpv4(), ec2.Port.icmpPing(), 'allow icmp')
    }


  }
}
