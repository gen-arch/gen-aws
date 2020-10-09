import cdk = require("@aws-cdk/core");
import iam = require("@aws-cdk/aws-iam");

export class IAM extends cdk.Construct {
  public readonly policy: { [key: string]: iam.PolicyStatement } = {};

  constructor(parent: cdk.Construct, name: string) {
    super(parent, name);

    this.policy["ssm"] = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        "ssm:DescribeAssociation",
        "ssm:GetDeployablePatchSnapshotForInstance",
        "ssm:GetDocument",
        "ssm:DescribeDocument",
        "ssm:GetManifest",
        "ssm:GetParameter",
        "ssm:GetParameters",
        "ssm:ListAssociations",
        "ssm:ListInstanceAssociations",
        "ssm:PutInventory",
        "ssm:PutComplianceItems",
        "ssm:PutConfigurePackageResult",
        "ssm:UpdateAssociationStatus",
        "ssm:UpdateInstanceAssociationStatus",
        "ssm:UpdateInstanceInformation",
        "ssmmessages:*",
        "ec2messages:*"
      ],
      resources: ["*"]
    })
  }
}
