import cdk   = require("@aws-cdk/core");
import ec2   = require("@aws-cdk/aws-ec2");
import rds   = require("@aws-cdk/aws-rds");
import docdb = require("@aws-cdk/aws-docdb");
import asg   = require("@aws-cdk/aws-autoscaling");

interface DBProps {
  vpc:       ec2.IVpc;
  asgs:      { [key: string]: asg.AutoScalingGroup };
}

export class DB extends cdk.Construct {
  public readonly docdbs: { [key: string]: docdb.IDatabaseCluster } = {};
  public readonly rds:    { [key: string]: rds.IDatabaseCluster    } = {};

  constructor(parent: cdk.Construct, name: string, props: DBProps) {
    super(parent, name);
    const env: string  = this.node.tryGetContext('env');

    // subnets
    const private_secure_subnet: ec2.SubnetSelection = { subnetGroupName: `${env}-private-secure` }

    this.docdbs["fuckfish"] = new docdb.DatabaseCluster(this, `${env}-fuckfish-mongo`, {
      masterUser: {
        username: "gen",
      },
      instances: 2,
      port: 27017,
      instanceProps: {
        instanceType: new ec2.InstanceType("t3.medium"),
        vpc: props.vpc,
        vpcSubnets: private_secure_subnet
      }
    })
    this.docdbs["fuckfish"].connections.allowFrom(props.asgs["fuckfish"].connections, ec2.Port.tcp(27017), "allow mongo access")


    this.rds["blog"] = new rds.DatabaseCluster(this, `${env}-blog-aurora`, {
      masterUser: {
        username: "gen"
      },
      engine: rds.DatabaseClusterEngine.AURORA_MYSQL,
      port: 3306,
      instanceProps: {
        instanceType: new ec2.InstanceType("t3.medium"),
        vpc: props.vpc,
        vpcSubnets: private_secure_subnet
      },
    })

    this.rds["blog"].connections.allowFrom(props.asgs["blog"].connections, ec2.Port.tcp(3306), "allow mysql access")
  }
}
