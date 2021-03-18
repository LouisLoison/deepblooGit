import { Construct, Stack, StackProps, CfnOutput, Duration } from '@aws-cdk/core';
import {
  Credentials,
  AuroraPostgresEngineVersion,
  DatabaseClusterEngine, ServerlessCluster,
} from '@aws-cdk/aws-rds';
import { Vpc, SecurityGroup } from '@aws-cdk/aws-ec2';
import { Secret } from "@aws-cdk/aws-secretsmanager";
import { config } from './config';

export class AuroraDbStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props)

    const {
      NODE_ENV,
      vpcId,
      availabilityZones,
      publicSubnetIds,
    } = config


    const dbSecret = new Secret(this, 'Aurora DB secret', {
      secretName: 'aurora',
      /*
      generateSecretString: {
        secretStringTemplate: `{"username": "deepbloo", "database": "deepbloo_${NODE_ENV}"}`,
        generateStringKey: 'password',
        passwordLength: 16,
        excludeCharacters: '"@/\\'
      }
       */
    })


    // In case of lack of Public subnet error, add to the sbnets
    // a tag, key: aws-cdk:subnet-type	  , value: Public
    const vpc = Vpc.fromVpcAttributes(this, 'Vpc', {
      vpcId,
      availabilityZones,
      // publicSubnetIds, 
      privateSubnetIds: publicSubnetIds,
    });

    new CfnOutput(this, 'secret-arn', {
      exportName: 'aurora-secret-arn',
      value: dbSecret.secretArn
    })

    const auroraSg = new SecurityGroup(this, 'aurora-security-group', {
      securityGroupName: 'aurora-security-group',
      vpc: vpc
    })

    const instance = new ServerlessCluster(this, 'ServerlessDB', {
      engine: DatabaseClusterEngine.auroraPostgres({
        version: AuroraPostgresEngineVersion.VER_10_4,
      }),
      enableDataApi: true,
      clusterIdentifier: "db",
      credentials: Credentials.fromSecret(dbSecret, 'deepbloo'), // Optional - will default to 'admin' username and generated password
      securityGroups: [auroraSg],
      vpc,
      /*
      vpcSubnets: {
        subnetType: SubnetType.PRIVATE
      }
       */
      scaling: {
        autoPause: Duration.days(0),
        minCapacity: 2,
        maxCapacity: 4,
      },
      backupRetention: Duration.days(30),
    });
    new CfnOutput(this, 'clusterArn', {
      exportName: 'aurora-arn',
      value: instance.clusterArn,
    })
    new CfnOutput(this, 'clusterEndpoint', {
      exportName: 'aurora-endpoint',
      value: instance.clusterEndpoint.hostname,
    })
  }
}
