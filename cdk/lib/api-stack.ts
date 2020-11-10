import * as cdk from '@aws-cdk/core';
import { UserPool, VerificationEmailStyle, UserPoolClient, AccountRecovery } from '@aws-cdk/aws-cognito';
import {
  GraphqlApi,
  AuthorizationType,
  FieldLogLevel,
  MappingTemplate,
  CfnResolver,
  CfnDataSource,
  Schema
} from '@aws-cdk/aws-appsync';

import * as iam from '@aws-cdk/aws-iam';
import { join } from "path";
import { readFileSync } from "fs";

export class ApiStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const dbArn = `arn:aws:rds:${this.region}:${this.account}:cluster:serverless-test`
    new cdk.CfnOutput(this, 'db-arn', {
      exportName: 'db-arn',
      value: dbArn
    })

    // The code that defines your stack goes here
    const userPool = new UserPool(this, 'dev-user-pool', {
      selfSignUpEnabled: true,
      accountRecovery: AccountRecovery.PHONE_AND_EMAIL,
      userVerification: {
        emailStyle: VerificationEmailStyle.CODE
      },
      autoVerify: {
        email: true
      },
      standardAttributes: {
        email: {
          required: true,
          mutable: true
        }
      }
    });

    const userPoolClient = new UserPoolClient(this, "UserPoolClient", {
      userPool
    });

    new cdk.CfnOutput(this, "UserPoolId", {
      value: userPool.userPoolId
    });

    new cdk.CfnOutput(this, "UserPoolClientId", {
      value: userPoolClient.userPoolClientId
    });

    /*
const messageTable = new Table(this, 'CDKMessageTable', {
  billingMode: BillingMode.PAY_PER_REQUEST,
  partitionKey: {
    name: 'id',
    type: AttributeType.STRING,
  },
});

const roomTable = new Table(this, 'CDKRoomTable', {
  billingMode: BillingMode.PAY_PER_REQUEST,
  partitionKey: {
    name: 'id',
    type: AttributeType.STRING,
  },
});

messageTable.addGlobalSecondaryIndex({
  indexName: 'messages-by-room-id',
  partitionKey: {
    name: 'roomId',
    type: AttributeType.STRING
  },
  sortKey: {
    name: 'createdAt',
    type: AttributeType.STRING
  }
})

const messageTableServiceRole = new Role(this, 'MessageTableServiceRole', {
  assumedBy: new ServicePrincipal('dynamodb.amazonaws.com')
});

messageTableServiceRole.addToPolicy(
  new PolicyStatement({
    effect: Effect.ALLOW,
    resources: [`${messageTable.tableArn}/index/messages-by-room-id`],
    actions: [
      'dymamodb:Query'
    ]
  })
);
 */

    const api = new GraphqlApi(this, 'deepbloo-dev-api', {
      name: "deepbloo-dev",
      logConfig: {
        fieldLogLevel: FieldLogLevel.ALL,
      },
      schema: Schema.fromAsset(join(__dirname, '../../appsync/schema.graphql')),
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: AuthorizationType.USER_POOL,
          userPoolConfig: {
            userPool
          }
        },
      },
    });


    new cdk.CfnOutput(this, "GraphQLAPIURL", {
      value: api.graphqlUrl
    });

    //   const dbCreds = Secret.fromSecretName(this, 'SecretFromName', 'aurora-creds')
    const awsSecretStoreArn = 'arn:aws:secretsmanager:eu-west-1:669031476932:secret:aurora-creds-faJRvx'

    const appsyncServiceRole = new iam.Role(this, `appsync-service-role`, {
      roleName: `appsync-service-role`,
      assumedBy: new iam.ServicePrincipal("appsync.amazonaws.com"),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName("service-role/AWSAppSyncPushToCloudWatchLogs")
      ],
      inlinePolicies: {
        "access-rds": new iam.PolicyDocument({
          statements: [new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: ['rds:*', 'rds-data:*'],
            resources: [dbArn]
          }), new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: ['secretsmanager:*'],
            resources: [awsSecretStoreArn]
          })]
        })
      }
    })

    const appsyncDataSource = new CfnDataSource(this, `appsync-aurora-ds`, {
      apiId: api.apiId,
      type: "RELATIONAL_DATABASE",
      name: `aurora_ds`,
      relationalDatabaseConfig: {
        relationalDatabaseSourceType: "RDS_HTTP_ENDPOINT",
        rdsHttpEndpointConfig: {
          awsRegion: 'eu-west-1',
          awsSecretStoreArn,
          databaseName: 'deepbloo',
          dbClusterIdentifier: dbArn
        }
      },
      serviceRoleArn: appsyncServiceRole.roleArn
    })

    const listEventsResolver = new CfnResolver(this, `get-tender-resolver`, {
      apiId: api.apiId,
      fieldName: "getTender",
      typeName: "Query",
      requestMappingTemplate: readFileSync(
      `${__dirname}/../../appsync/tenderRequestMapping.vtl`,
        { encoding: "utf8" }
      ),
      responseMappingTemplate: `
            #if($ctx.error)
                $utils.error($ctx.error.message, $ctx.error.type)
            #end
            $utils.toJson($utils.rds.toJsonObject($ctx.result)[0][0])`,
      dataSourceName: appsyncDataSource.name
    })

    listEventsResolver.addDependsOn(appsyncDataSource);

    /*
    const resolver = new CfnResolver(this, "ListThingsAPI", {
      apiId: api.apiId,
      dataSourceName: dataSource.dataSourceName,
      typeName: "Query",
      fieldName: "getThings",
      requestMappingTemplate: JSON.stringify({
        version: "2018-05-29",
        statements: ["SELECT * FROM mytable"]
      }),
      responseMappingTemplate: readFileSync(
        `${__dirname}/response_mappings/return_list.vtl`,
        ENC_UTF8
      )
    });
       */
  }
}
