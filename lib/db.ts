import cdk   = require("@aws-cdk/core");
import ec2   = require("@aws-cdk/aws-ec2");
import docdb = require("@aws-cdk/aws-docdb");
import asg   = require("@aws-cdk/aws-autoscaling");

interface DBProps {
  vpc:       ec2.IVpc;
  asgs:      { [key: string]: asg.AutoScalingGroup };
}

export class DB extends cdk.Construct {
  public readonly docdbs: { [key: string]: docdb.IDatabaseCluster } = {};
  constructor(parent: cdk.Construct, name: string, props: DBProps) {
    super(parent, name);

    const env:      string  = this.node.tryGetContext('env');
    const private_subnet    = { subnetType: ec2.SubnetType.PRIVATE }

    this.docdbs["fuckfish"] = new docdb.DatabaseCluster(this, `${env}-fuckfish-mongo`, {
      masterUser: {
        username: "gen",
      },
      instances: 2,
      port: 27017,
      instanceProps: {
        instanceType: new ec2.InstanceType("t3.medium"),
        vpc: props.vpc,
        vpcSubnets: private_subnet
      }
    })
    
    this.docdbs["fuckfish"].connections.allowFrom(props.asgs["fuckfish"].connections, ec2.Port.tcp(27017), "allow mongo access")
  }
}