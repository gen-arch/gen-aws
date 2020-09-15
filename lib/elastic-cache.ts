import { Construct } from "@aws-cdk/core";
import {
  IVpc,
  ISecurityGroup,
} from "@aws-cdk/aws-ec2";
import {
  CfnCacheCluster,
  CfnSubnetGroup
} from "@aws-cdk/aws-elasticache";

interface ElastiCacheProps {
  vpc: IVpc;
  sg: { [key: string]: ISecurityGroup; };
}

export class ElastiCache extends Construct {
  constructor(parent: Construct, name: string, props: ElastiCacheProps) {
    super(parent, name);

    const env: string       = this.node.tryGetContext('env');
    const subnets: string[] = props.vpc.privateSubnets.map(subnet => subnet.subnetId)

    new CfnSubnetGroup(this, `${env}-subnet`, {
      cacheSubnetGroupName: `${env}-subnet`,
      description: `${env} subnet`,
      subnetIds: subnets
    })

    new CfnCacheCluster(this, `${env}-redis28`, {
      azMode: "single-az",
      cacheNodeType: "cache.t3.micro",
      cacheSubnetGroupName: `${env}-subnet`,
      clusterName: `${env}-redis-1`,
      engine: "redis",
      engineVersion: "2.8.24",
      numCacheNodes: 1,
      vpcSecurityGroupIds: [props.sg["redis"].securityGroupId]
    });

    new CfnCacheCluster(this, `${env}-redis50`, {
      azMode: "single-az",
      cacheNodeType: "cache.t3.micro",
      cacheSubnetGroupName: `${env}-subnet`,
      clusterName: `${env}-redis-2`,
      engine: "redis",
      engineVersion: "5.0.6",
      numCacheNodes: 1,
      vpcSecurityGroupIds: [props.sg["redis"].securityGroupId]
    });
  }
}
