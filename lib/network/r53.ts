import cdk     = require("@aws-cdk/core");
import r53     = require("@aws-cdk/aws-route53");
import ec2     = require("@aws-cdk/aws-ec2");

interface R53StackProps {
  vpc:       ec2.IVpc;
}

export class R53 extends cdk.Construct {
  public readonly zones:      { [key: string]: r53.IPrivateHostedZone|r53.IPublicHostedZone } = {};
  constructor(parent: cdk.Construct, name: string, props: R53StackProps) {
    super(parent, name);
    const hostzone: string = this.node.tryGetContext('hostzone');
    const env:      string = this.node.tryGetContext('env');

    // [Public Hostzone] ------------------------------------------------------------------
    // create private domain
    this.zones["public"] = new r53.PublicHostedZone(this, hostzone, {
      zoneName: hostzone,
    })
    // ====================================================================================

    // ------------------------------------------------------------------------------------


    // [Private Hostzone] ------------------------------------------------------------------
    // create private domain
    const private_domain = `${env}.lan.${hostzone}`
    this.zones["private"] = new r53.PrivateHostedZone(this, private_domain, {
      zoneName: private_domain,
      vpc: props.vpc
    })
    // ====================================================================================

    // ------------------------------------------------------------------------------------
  }
}
