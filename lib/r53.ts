import cdk     = require("@aws-cdk/core");
import r53     = require("@aws-cdk/aws-route53");
import ec2     = require("@aws-cdk/aws-ec2");
import elb     = require("@aws-cdk/aws-elasticloadbalancingv2");
import docdb   = require("@aws-cdk/aws-docdb");
import targets = require('@aws-cdk/aws-route53-targets');

interface R53StackProps {
  vpc:       ec2.IVpc;
  instances: { [key: string]: ec2.IInstance | ec2.BastionHostLinux; };
  albs:      { [key: string]: elb.IApplicationLoadBalancer; };
  docdbs:    { [key: string]: docdb.IDatabaseCluster };
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

    new r53.ARecord(this, `www.${hostzone}`, {
      zone: public_zone,
      recordName: "www",
      target: r53.RecordTarget.fromAlias(new targets.LoadBalancerTarget(props.albs["web"])),
    })

    new r53.ARecord(this, `fuckfish.${hostzone}`, {
      zone: public_zone,
      recordName: "fuckfish",
      target: r53.RecordTarget.fromAlias(new targets.LoadBalancerTarget(props.albs["web"])),
    })
    // ------------------------------------------------------------------------------------


    // [Private Hostzone] ------------------------------------------------------------------
    // create private domain
    const private_domain = `${env}.lan.${hostzone}`
    const private_zone = new r53.PrivateHostedZone(this, private_domain, {
      zoneName: private_domain,
      vpc: props.vpc
    })
    // ====================================================================================

    // add records for all instance
    for (let [name, node] of Object.entries(props.instances)) {
      new r53.CnameRecord(this, `${name}.${private_domain}`, {
        zone: private_zone,
        recordName: name,
        domainName: node.instancePrivateDnsName
      })
    }
    // ------------------------------------------------------------------------------------
  }
}
