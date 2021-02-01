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
import { AssetCode, Function, Runtime, LayerVersion } from '@aws-cdk/aws-lambda';
import { Secret } from '@aws-cdk/aws-secretsmanager';

import * as iam from '@aws-cdk/aws-iam';
import { join } from "path";
import { readFileSync } from "fs";

export class ApiStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const environment = {
      NODE_ENV: "dev",
    }

    const hivebriteSecretArn = "arn:aws:secretsmanager:eu-west-1:669031476932:secret:hivebrite-tayvUB"
    const hivebriteEnv = {
      HIVEBRITE_SECRET: hivebriteSecretArn,
    }

    const hivebriteSecret = Secret.fromSecretAttributes(this, 'hivebriteSecret', {
      secretArn: hivebriteSecretArn,
    });

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

    const nodeLayer = new LayerVersion(this, 'NodeLib', {
      code: new AssetCode('../lambda/layer/npm'),
      compatibleRuntimes: [Runtime.NODEJS_12_X],
      license: 'Apache-2.0, MIT',
      description: 'Old backend and dependencies layer.',
    });

    const deepblooLayer = new LayerVersion(this, 'DeepblooLib', {
      code: new AssetCode('../lambda/layer/deepbloo'),
      compatibleRuntimes: [Runtime.NODEJS_12_X],
      license: 'Private, Unlicensed',
      description: 'Deepbloo lib layer.',
    });

    const hivebriteResolver = new Function(this, 'hivebriteResolver', {
      runtime: Runtime.NODEJS_12_X,
      code: new AssetCode('../lambda/function/hivebriteresolver'),
      handler: 'index.handler',
      memorySize: 500,
      environment: {
        ...environment,
        ...hivebriteEnv
      }
    });

    const userAuthorizerL = new Function(this, 'userAuthorizerL', {
      runtime: Runtime.NODEJS_12_X,
      code: new AssetCode('../lambda/function/userAuthorizer'),
      handler: 'index.handler',
      memorySize: 500,
      environment: {
        ...environment,
        ...hivebriteEnv
      }
    });

    hivebriteResolver.addLayers(nodeLayer, deepblooLayer)
    hivebriteSecret.grantRead(hivebriteResolver)

    userAuthorizerL.addLayers(nodeLayer, deepblooLayer)
    hivebriteSecret.grantRead(userAuthorizerL)

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
          }), new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: ['lambda:invokeFunction'],
            resources: [hivebriteResolver.functionArn]
          }),
          new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: ['lambda:invokeFunction'],
            resources: [userAuthorizerL.functionArn]
          })]
        }),

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
          databaseName: 'deepbloo_dev',
          dbClusterIdentifier: dbArn
        }
      },
      serviceRoleArn: appsyncServiceRole.roleArn
    })

    const hivebriteDataSource = new CfnDataSource(this, `hivebrite-ds`, {
      apiId: api.apiId,
      type: "AWS_LAMBDA",
      name: `hivebrite_ds`,
      lambdaConfig: {
        lambdaFunctionArn: hivebriteResolver.functionArn
      },
      serviceRoleArn: appsyncServiceRole.roleArn
    })

    const userAuthorizerDataSource = new CfnDataSource(this, `user-authorizer-ds`, {
      apiId: api.apiId,
      type: "AWS_LAMBDA",
      name: `hivebrite_ds`,
      lambdaConfig: {
        lambdaFunctionArn: userAuthorizerL.functionArn
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

    const hivebriteUsersResolver = new CfnResolver(this, `hivebriteUsers`, {
      apiId: api.apiId,
      fieldName: "hivebriteUsers",
      typeName: "Query",
      requestMappingTemplate: readFileSync(
        `${__dirname}/../../appsync/Query.hivebriteUsers.request.vtl`,
        { encoding: "utf8" }
      ),
      responseMappingTemplate: readFileSync(
        `${__dirname}/../../appsync/lambda_response.vtl`,
        { encoding: "utf8" }
      ),
      dataSourceName: hivebriteDataSource.name
    })
    hivebriteUsersResolver.addDependsOn(hivebriteDataSource);

    const verifyTokenResolver = new CfnResolver(this, `verifyTokenResolver`, {
      apiId: api.apiId,
      fieldName: "verifyToken",
      typeName: "Query",
      requestMappingTemplate: readFileSync(
        `${__dirname}/../../appsync/Query.verifyToken.request.vtl`,
        { encoding: "utf8" }
      ),
      responseMappingTemplate: readFileSync(
        `${__dirname}/../../appsync/lambda_response.vtl`,
        { encoding: "utf8" }
      ),
      dataSourceName: userAuthorizerDataSource.name
    })
    verifyTokenResolver.addDependsOn(userAuthorizerDataSource);

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
