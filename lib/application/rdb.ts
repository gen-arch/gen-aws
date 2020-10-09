import cdk   = require("@aws-cdk/core");
import ec2   = require("@aws-cdk/aws-ec2");
import rds   = require("@aws-cdk/aws-rds");
import asg   = require("@aws-cdk/aws-autoscaling");

interface DBProps {
  vpc:       ec2.IVpc;
}

export class RDB extends cdk.Construct {
  public readonly rds:    { [key: string]: rds.IDatabaseCluster    } = {};

  constructor(parent: cdk.Construct, name: string, props: DBProps) {
    super(parent, name);
    const env: string  = this.node.tryGetContext('env');

    // subnets
    const private_secure_subnet: ec2.SubnetSelection = { subnetGroupName: `${env}-private-secure` }

    //this.docdbs["fuckfish"] = new docdb.DatabaseCluster(this, `${env}-fuckfish-mongo`, {
    //  masterUser: {
    //    username: "gen",
    //  },
    //  instances: 2,
    //  port: 27017,
    //  instanceProps: {
    //    instanceType: new ec2.InstanceType("t3.medium"),
    //    vpc: props.vpc,
    //    vpcSubnets: private_secure_subnet
    //  }
    //})
    //this.docdbs["fuckfish"].connections.allowFrom(props.asgs["fuckfish"].connections, ec2.Port.tcp(27017), "allow mongo access")
  }
}
