#!/usr/bin/env node
import * as cdk from '@aws-cdk/core';
import { Compute } from '../lib/compute';
import { Network } from '../lib/network';
import { R53 } from '../lib/r53';
import { ElastiCache } from '../lib/elastic-cache';

class GenAwsStack extends cdk.Stack {
  constructor(parent: cdk.App, name: string, props: cdk.StackProps) {
    super(parent, name, props);

    const network = new Network(this, 'Network');
    const compute = new Compute(this, 'Compute', { vpc: network.vpc, sg: network.sg });
    const r53     = new R53(this, 'R53', { vpc: network.vpc, nodes: compute.nodes });
    const cache   = new ElastiCache(this, 'ElastCache', { vpc: network.vpc, sg: network.sg });
  }
};

const app = new cdk.App();
new GenAwsStack(app, "GenAwsStack", {
  env: {
    account:  process.env.CDK_DEFAULT_ACCOUNT,
    region:   process.env.CDK_DEFAULT_REGION
  }
});
