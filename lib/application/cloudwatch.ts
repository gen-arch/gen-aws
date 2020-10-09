import cdk = require("@aws-cdk/core");
import cw  = require("@aws-cdk/aws-cloudwatch");

import { EC2 } from './ec2'

interface CloudWatchProps {
  ec2: EC2;
}

export class CloudWatch extends cdk.Construct {
  constructor(parent: cdk.Construct, name: string, props: CloudWatchProps) {
    super(parent, name);
  }
}
