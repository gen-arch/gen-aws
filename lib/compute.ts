import cdk = require("@aws-cdk/core");
import ec2 = require("@aws-cdk/aws-ec2");
import asg = require("@aws-cdk/aws-autoscaling");

interface ComputeProps {
  vpc:       ec2.IVpc;
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
    const private_secure_subnet: ec2.SubnetSelection = { subnetGroupName: `${env}-private-secure` }

    // ami
    const amazonlinux2 = new ec2.AmazonLinuxImage({ generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2 })
    const bastion      = new ec2.LookupMachineImage({ name: "bastion" })

    // setup commands
    const setup_comand = [
      "sudo timedatectl set-timezone Asia/Tokyo",
      "sudo yum update -y",
      "sudo yum install -y vim git util-linux-user",
    ]

    this.instances["bastion"] = new ec2.Instance(this, `${env}-bastion`, {
      vpc: props.vpc,
      vpcSubnets: public_subnet,
      instanceType: new ec2.InstanceType("t3a.micro"),
      machineImage: bastion,
      keyName: this.node.tryGetContext('bastion-keyname')
    })

    // create instance
    this.asgs["web"] = new asg.AutoScalingGroup(this, `${env}-web`, {
      vpc: props.vpc,
      vpcSubnets: private_subnet,
      instanceType: new ec2.InstanceType("t3a.micro"),
      machineImage: amazonlinux2,
      keyName: "bastion"
    })

    this.asgs["fuckfish"] = new asg.AutoScalingGroup(this, `${env}-fuckfish`, {
      vpc: props.vpc,
      vpcSubnets: private_subnet,
      instanceType: new ec2.InstanceType("t3a.micro"),
      machineImage: amazonlinux2,
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
        `hostnamectl set-hostname ${env}-${name}`,
        "sudo yum update -y",
        "sudo yum install -y vim git",
      )

      // add connections
      asg.connections.allowFrom(ec2.Peer.anyIpv4(), ec2.Port.icmpPing(), 'allow icmp')
      asg.connections.allowFrom(this.instances["bastion"].connections, ec2.Port.tcp(22), 'allow ssh connection for bastion')
    }


  }
}
