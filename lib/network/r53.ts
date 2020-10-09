import cdk     = require("@aws-cdk/core");
import r53     = require("@aws-cdk/aws-route53");
import ec2     = require("@aws-cdk/aws-ec2");

interface R53StackProps {
  vpc:       ec2.IVpc;
}

export class R53 extends cdk.Construct {
  constructor(parent: cdk.Construct, name: string, props: R53StackProps) {
    super(parent, name);
    const hostzone: string = this.node.tryGetContext('hostzone');
    const env:      string = this.node.tryGetContext('env');

    // [Public Hostzone] ------------------------------------------------------------------
    // lookup for public hostzone
    const public_zone = r53.HostedZone.fromLookup(this, hostzone, { domainName: hostzone })
    // ====================================================================================

    // ------------------------------------------------------------------------------------


    // [Private Hostzone] ------------------------------------------------------------------
    // create private domain
    const private_domain = `${env}.lan.${hostzone}`
    const private_zone = new r53.PrivateHostedZone(this, private_domain, {
      zoneName: private_domain,
      vpc: props.vpc
    })
    // ====================================================================================

    // ------------------------------------------------------------------------------------
  }
}
