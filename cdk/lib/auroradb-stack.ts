import { Construct, Stack, StackProps } from '@aws-cdk/core';
import {
  DatabaseInstanceEngine,
  DatabaseInstance,
  Credentials,
  AuroraPostgresEngineVersion,
  DatabaseClusterEngine, ServerlessCluster,
} from '@aws-cdk/aws-rds';
import { Vpc, InstanceClass, InstanceSize, InstanceType, SubnetType } from '@aws-cdk/aws-ec2';
import {Secret} from "@aws-cdk/aws-secretsmanager";

export class AuroraDbStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props)

    const secretArn = 'arn:aws:secretsmanager:eu-west-1:669031476932:secret:aurora-creds-faJRvx'

    const dbEnv = {
      DB_HOST: "serverless-test.cluster-cxvdonhye3yz.eu-west-1.rds.amazonaws.com",
      DB_SECRET: secretArn,
    }
    const dbSecret = Secret.fromSecretAttributes(this, 'dbSecret', {
      secretArn,
    });

    const vpc = Vpc.fromVpcAttributes(this, 'Vpc', {
      vpcId: 'vpc-f7456f91',
      availabilityZones: ['eu-west-1'],
      privateSubnetIds: ['subnet-0d44e4d2296bfd59f', 'subnet-0530f274ce7351e90', 'subnet-0530f274ce7351e90'],
    });

    const instance = new ServerlessCluster(this, 'Serverless', {
      engine: DatabaseClusterEngine.auroraPostgres({
        version: AuroraPostgresEngineVersion.VER_10_4,
      }),
      clusterIdentifier: "deepbloo-serveless-db",
      credentials: Credentials.fromSecret(dbSecret, 'deepbloo'), // Optional - will default to 'admin' username and generated password
      vpc,
      vpcSubnets: {
        subnetType: SubnetType.PRIVATE
      }
    });
  }
}