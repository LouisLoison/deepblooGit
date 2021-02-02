import * as cdk from '@aws-cdk/core';
import { UserPool, VerificationEmailStyle, UserPoolClient, AccountRecovery } from '@aws-cdk/aws-cognito';
import {
  GraphqlApi,
  AuthorizationType,
  FieldLogLevel,
  MappingTemplate,
  CfnResolver,
  CfnDataSource,
  CfnFunctionConfiguration,
  Schema,
  AppsyncFunction,
  Resolver
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
    const awsSecretStoreArn = 'arn:aws:secretsmanager:eu-west-1:669031476932:secret:aurora-creds-faJRvx'
    const dbEnv = {
      DB_HOST: "serverless-test.cluster-cxvdonhye3yz.eu-west-1.rds.amazonaws.com",
      DB_SECRET: awsSecretStoreArn,
    }
    const dbSecret = Secret.fromSecretAttributes(this, 'dbSecret', {
      secretArn: awsSecretStoreArn,
    });

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

    // -------------LAYER DEFINITIONS----------------- //
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

    // -------------LAMBDA FUNCTION DEFINITIONS----------------- //
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
    hivebriteResolver.addLayers(nodeLayer, deepblooLayer)
    hivebriteSecret.grantRead(hivebriteResolver)

    const userL = new Function(this, 'userL', {
      runtime: Runtime.NODEJS_12_X,
      code: new AssetCode('../lambda/function/user'),
      handler: 'index.handler',
      memorySize: 500,
      environment: {
        ...environment,
        ...hivebriteEnv,
        ...dbEnv
      }
    });
    userL.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ["textract:*"],
        resources: ["*"]
      })
    );
    userL.addLayers(nodeLayer, deepblooLayer)
    hivebriteSecret.grantRead(userL)
    dbSecret.grantRead(userL)

    // ------------- GraphqlApi DEFINITIONS----------------- //
    const api = new GraphqlApi(this, 'deepbloo-dev-api', {
      name: "deepbloo-dev",
      logConfig: {
        fieldLogLevel: FieldLogLevel.ALL,
      },
      schema: Schema.fromAsset(join(__dirname, '../../appsync/schema.graphql')),
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: AuthorizationType.API_KEY
        },
      },
    });

    new cdk.CfnOutput(this, "GraphQLAPIURL", {
      value: api.graphqlUrl
    });

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
        }),

      }
    })
    // ------------- DATASOURCE DEFINITIONS----------------- //
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

    const hivebriteDataSource = api.addLambdaDataSource(
      'hivebriteDataSource',
      hivebriteResolver
    )

    const userDataSource = api.addLambdaDataSource(
      'userDataSource',
      userL
    )
    // ------------- RESOLVERS DEFINITIONS----------------- //
    const listEventsResolver = new CfnResolver(this, `get-tender-resolver`, {
      apiId: api.apiId,
      fieldName: "GetTender",
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
      dataSourceName: appsyncDataSource.name,
    })
    listEventsResolver.addDependsOn(appsyncDataSource);

    hivebriteDataSource.createResolver({
      typeName: 'Query',
      fieldName: 'HivebriteUsers',
      requestMappingTemplate: MappingTemplate.fromString(
        `{
          "version": "2017-02-28",
          "operation": "Invoke",
          "payload": {
              "field": "HivebriteUsers",
              "arguments":  $utils.toJson($context.arguments)
          }
      }`),
      responseMappingTemplate: MappingTemplate.fromString(
        `
      #if( $context.result && $context.result.Error )
        $utils.error($context.result.Error)
      #else
        $utils.toJson($context.result.data)
      #end
        `,
      ),
    })

    const f1 = new AppsyncFunction(this, 'TokenAuthorizer', {
      api,
      name: 'TokenAuthorizer',
      dataSource: userDataSource,
      requestMappingTemplate: MappingTemplate.fromString(
        `{
          "version": "2017-02-28",
          "operation": "Invoke",
          "payload": {
              "field": "TokenAuthorizer",
              "arguments":  $utils.toJson($context.arguments)
          }
      }`
      ),
      responseMappingTemplate: MappingTemplate.fromString(
        `
      #if( $context.result && $context.result.Error )
        $utils.error($context.result.Error)
      #else
        $util.qr($context.stash.put("id", $context.result.data.id))
        $util.qr($context.stash.put("name", $context.result.data.name))
        $util.qr($context.stash.put("primary_email", $context.result.data.primary_email))
        $util.qr($context.stash.put("nbf", $context.result.data.nbf))
        $utils.toJson($context.result.data)
      #end
        `,
      )
    })

    const f2 = new AppsyncFunction(this, 'f2', {
      api,
      name: 'User',
      dataSource: userDataSource,
      requestMappingTemplate: MappingTemplate.fromString(
        `{
          "version": "2017-02-28",
          "operation": "Invoke",
          "payload": {
              "field": "User",
              "arguments":  $utils.toJson($context.arguments),
              "stash":  $utils.toJson($context.stash),
          }
      }`
      ),
      responseMappingTemplate: MappingTemplate.fromString(
        `
      #if( $context.result && $context.result.Error )
        $utils.error($context.result.Error)
      #else
        $utils.toJson($context.result.data)
      #end
        `,
      )
    })

    const resolver = new Resolver(this, 'createDataPointPipeline', {
      api,
      typeName: 'Query',
      fieldName: 'User',
      pipelineConfig: [f1, f2],
      requestMappingTemplate: MappingTemplate.fromString('{}'),
      responseMappingTemplate: MappingTemplate.fromString('$util.toJson($ctx.prev.result)'),
    })

    // userDataSource.createResolver({
    //   typeName: 'Query',
    //   fieldName: 'user',
    //   requestMappingTemplate: MappingTemplate.fromFile(
    //     `${__dirname}/../../appsync/Query.hivebriteUsers.request.vtl`,
    //   ),
    //   responseMappingTemplate: MappingTemplate.fromFile(
    //     `${__dirname}/../../appsync/lambda.response.vtl`,
    //   ),
    // })
  }
}
