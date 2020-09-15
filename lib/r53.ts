import { Construct } from '@aws-cdk/core';
import {
  HostedZone,
  CnameRecord,
  PrivateHostedZone
} from '@aws-cdk/aws-route53'
import {
  Instance,
  IVpc,
} from "@aws-cdk/aws-ec2";


interface R53StackProps {
  vpc: IVpc;
  nodes: { [key: string]: Instance; };
}

export class R53 extends Construct {
  constructor(parent: Construct, name: string, props: R53StackProps) {
    super(parent, name);
    const hostzone: string = this.node.tryGetContext('hostzone');
    const env:      string = this.node.tryGetContext('env');

    if(this.node.tryGetContext('public_hostzone')) {
      // lookup for public hostzone
      const public_zone = HostedZone.fromLookup(this, hostzone, {
        domainName : hostzone,
      })

      const public_access_node = ["bastion"]
      for (let name of public_access_node) {
        new CnameRecord(this, `${name}.${hostzone}`, {
          zone: public_zone,
          recordName: name,
          domainName: props.nodes[name].instancePublicDnsName
        })
      }
    }

    // create private domain
    const private_zone = new PrivateHostedZone(this, `${env}.lan.${hostzone}`, {
      zoneName: `${env}.lan.${hostzone}`,
      vpc: props.vpc
    })

    for (let name in props.nodes) {
      new CnameRecord(this, `${name}.${env}.${hostzone}`, {
        zone: private_zone,
        recordName: name,
        domainName: props.nodes[name].instancePrivateDnsName
      })
    }
  }
}
