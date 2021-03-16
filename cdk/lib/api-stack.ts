import * as cdk from '@aws-cdk/core';
import { UserPool, VerificationEmailStyle, UserPoolClient, AccountRecovery } from '@aws-cdk/aws-cognito';
import {
  GraphqlApi,
  AuthorizationType,
  FieldLogLevel,
  // MappingTemplate,
  CfnResolver,
  CfnDataSource,
  Schema,
  CfnFunctionConfiguration,
  // NoneDataSource,
} from '@aws-cdk/aws-appsync';
import { Vpc } from '@aws-cdk/aws-ec2';
import { AssetCode, Function, Runtime, LayerVersion } from '@aws-cdk/aws-lambda';
import { Secret } from '@aws-cdk/aws-secretsmanager';

import * as iam from '@aws-cdk/aws-iam';
import { join } from "path";
import { readFileSync } from "fs";
import { Duration } from '@aws-cdk/core';

import { config } from './config';

export class ApiStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const {
      DB_SECRET,
      DB_HOST,
      APPSEARCH_ENDPOINT,
      APPSEARCH_SECRET,
      NODE_ENV,
      ELASTIC_SECRET,
      vpcId,
      availabilityZones,
      privateSubnetIds,
      HIVEBRITE_SECRET,
    } = config

    const environment = {
      NODE_ENV,
    }

    const dbEnv = {
      DB_HOST,
      DB_SECRET,
    }

    const appsearchEnv = {
      APPSEARCH_ENDPOINT,
      APPSEARCH_SECRET,
    }

    const hivebriteEnv = {
      HIVEBRITE_SECRET,
    }
    const hivebriteSecret = Secret.fromSecretAttributes(this, 'hivebriteSecret', {
      secretArn: HIVEBRITE_SECRET,
    });

    const dbArn = `arn:aws:rds:${this.region}:${this.account}:cluster:serverless-test`

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

    // -------------ROLE DEFINITIONS----------------- //
    const lambdaBasicDbSecretVpcExecutionRole = new iam.Role(this, `LAMBDA_BASIC_DBSECRET_VPC_EXECUTION_ROLE_${environment.NODE_ENV}`, {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      roleName: `LAMBDA_BASIC_DBSECRET_VPC_EXECUTION_ROLE_${environment.NODE_ENV}`,
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName("service-role/AWSLambdaBasicExecutionRole"),
        iam.ManagedPolicy.fromAwsManagedPolicyName("service-role/AWSLambdaVPCAccessExecutionRole"),

      ],
      inlinePolicies: {
        "access-secretsmanager": new iam.PolicyDocument({
          statements: [new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: ['secretsmanager:*'],
            resources: [DB_SECRET]
          }),
          new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: ['secretsmanager:*'],
            resources: [HIVEBRITE_SECRET]
          }),
          new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: ['secretsmanager:*'],
            resources: [APPSEARCH_SECRET]
          }),
          new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: ['secretsmanager:*'],
            resources: [ELASTIC_SECRET]
          })
          ]
        }),

      }
    });

    // -------------VPC FUNCTION DEFINITIONS----------------- //
    const vpc = Vpc.fromVpcAttributes(this, 'Vpc', {
      vpcId,
      availabilityZones,
      privateSubnetIds,
    });

    // -------------LAMBDA FUNCTION DEFINITIONS----------------- //
    const hivebriteResolver = new Function(this, 'hivebriteResolver', {
      functionName: `hivebriteResolver-${environment.NODE_ENV}`,
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

    const userResolver = new Function(this, 'userResolver', {
      functionName: `userResolver-${environment.NODE_ENV}`,
      runtime: Runtime.NODEJS_12_X,
      code: new AssetCode('../lambda/function/userResolver'),
      handler: 'index.handler',
      memorySize: 500,
      timeout: Duration.seconds(10),
      environment: {
        ...environment,
        ...hivebriteEnv
      },
    });
    userResolver.addLayers(nodeLayer, deepblooLayer)
    hivebriteSecret.grantRead(userResolver)


    const stepValueExtraction = Function.fromFunctionAttributes(
      this, 'stepValueExtraction',
      {
        functionArn: `arn:aws:lambda:eu-west-1:669031476932:function:stepValueExtraction-${environment.NODE_ENV}`,
      }
    );

    const elasticResolver = new Function(this, 'elasticResolver', {
      functionName: `elasticResolver-${environment.NODE_ENV}`,
      runtime: Runtime.NODEJS_12_X,
      code: new AssetCode('../lambda/function/elasticResolver'),
      handler: 'index.handler',
      memorySize: 500,
      timeout: Duration.seconds(15),
      vpc,
      environment: {
        ...environment,
        ...appsearchEnv,
        ...dbEnv,
        ELASTIC_SECRET,
      },
      role: lambdaBasicDbSecretVpcExecutionRole
    });
    elasticResolver.addLayers(nodeLayer, deepblooLayer)
    stepValueExtraction.grantInvoke(elasticResolver)


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
            resources: [DB_SECRET]
          })]
        }),

      }
    })

    // ------------- DATASOURCE DEFINITIONS----------------- //
    const auroraDataSource = new CfnDataSource(this, `appsync-aurora-ds`, {
      apiId: api.apiId,
      type: "RELATIONAL_DATABASE",
      name: `aurora_ds`,
      relationalDatabaseConfig: {
        relationalDatabaseSourceType: "RDS_HTTP_ENDPOINT",
        rdsHttpEndpointConfig: {
          awsRegion: 'eu-west-1',
          awsSecretStoreArn: DB_SECRET,
          databaseName: 'deepbloo_dev',
          dbClusterIdentifier: dbArn
        }
      },
      serviceRoleArn: appsyncServiceRole.roleArn
    })

    const hivebriteDataSource = api.addLambdaDataSource( //TODO CHANGE IT TO CfnDataSource class
      'hivebriteDataSource',
      hivebriteResolver
    )

    const userDataSource = api.addLambdaDataSource( //TODO CHANGE IT TO CfnDataSource class
      'userDataSource',
      userResolver
    )

    const elasticDataSource = api.addLambdaDataSource( //TODO CHANGE IT TO CfnDataSource class
      'elasticDataSource',
      elasticResolver
    )

    const noneDataSource = api.addNoneDataSource( //TODO CHANGE IT TO CfnDataSource class
      'noneDataSource',
    )

    // -------------SIMPLE QUERY AND MUTATION RESOLVERS DEFINITIONS----------------- //


    // -------------PIPELINE FUNCITONS DEFINITIONS----------------- //
    const TokenAuthorizerFunction = new CfnFunctionConfiguration(this, 'TokenAuthorizerFunction', {
      apiId: api.apiId,
      name: "TokenAuthorizerFunction",
      functionVersion: "2018-05-29",
      description: "description",
      dataSourceName: userDataSource.name,
      requestMappingTemplate: readFileSync(
        `${__dirname}/../../appsync/function.TokenAuthorizerFunction.request.vtl`,
        { encoding: "utf8" }
      ),
      responseMappingTemplate: readFileSync(
        `${__dirname}/../../appsync/function.TokenAuthorizerFunction.response.vtl`,
        { encoding: "utf8" }
      )
    })

    const HivebriteFunction = new CfnFunctionConfiguration(this, 'HivebriteFunction', {
      apiId: api.apiId,
      name: "HivebriteFunction",
      functionVersion: "2018-05-29",
      description: "description",
      dataSourceName: hivebriteDataSource.name,
      requestMappingTemplate: readFileSync(
        `${__dirname}/../../appsync/function.HivebriteFunction.request.vtl`,
        { encoding: "utf8" }
      ),
      responseMappingTemplate: readFileSync(
        `${__dirname}/../../appsync/function.HivebriteFunction.response.vtl`,
        { encoding: "utf8" }
      )
    })

    const GetTenderFunction = new CfnFunctionConfiguration(this, `GetTenderFunction`, {
      apiId: api.apiId,
      functionVersion: "2018-05-29",
      description: "description",
      dataSourceName: auroraDataSource.name,
      name: "GetTenderFunction",
      requestMappingTemplate: readFileSync(
        `${__dirname}/../../appsync/function.GetTenderFunction.request.vtl`,
        { encoding: "utf8" }
      ),
      responseMappingTemplate: readFileSync(
        `${__dirname}/../../appsync/function.GetTenderFunction.response.vtl`,
        { encoding: "utf8" }
      ),
    })

    const CreateTenderAuroraFunction = new CfnFunctionConfiguration(this, `CreateTenderAuroraFunction`, {
      apiId: api.apiId,
      functionVersion: "2018-05-29",
      description: "description",
      dataSourceName: auroraDataSource.name,
      name: "CreateTenderAuroraFunction",
      requestMappingTemplate: readFileSync(
        `${__dirname}/../../appsync/function.insertAurora.request.vtl`,
        { encoding: "utf8" }
      ),
      responseMappingTemplate: readFileSync(
        `${__dirname}/../../appsync/function.insertAurora.response.vtl`,
        { encoding: "utf8" }
      ),
    })

    const CreateTenderElasticFunction = new CfnFunctionConfiguration(this, `CreateTenderElasticFunction`, {
      apiId: api.apiId,
      functionVersion: "2018-05-29",
      description: "description",
      dataSourceName: elasticDataSource.name,
      name: "CreateTenderElasticFunction",
      requestMappingTemplate: readFileSync(
        `${__dirname}/../../appsync/function.CreateTenderElasticFunction.request.vtl`,
        { encoding: "utf8" }
      ),
      responseMappingTemplate: readFileSync(
        `${__dirname}/../../appsync/function.CreateTenderElasticFunction.response.vtl`,
        { encoding: "utf8" }
      ),
    })

    const UpdateTenderElasticFunction = new CfnFunctionConfiguration(this, `UpdateTenderElasticFunction`, {
      apiId: api.apiId,
      functionVersion: "2018-05-29",
      description: "description",
      dataSourceName: elasticDataSource.name,
      name: "UpdateTenderElasticFunction",
      requestMappingTemplate: readFileSync(
        `${__dirname}/../../appsync/function.UpdateTenderElasticFunction.request.vtl`,
        { encoding: "utf8" }
      ),
      responseMappingTemplate: readFileSync(
        `${__dirname}/../../appsync/function.UpdateTenderElasticFunction.response.vtl`,
        { encoding: "utf8" }
      ),
    })


    const CreateTenderCriterionCpvsAuroraFunction = new CfnFunctionConfiguration(this, `CreateTenderCriterionCpvsAuroraFunction`, {
      apiId: api.apiId,
      functionVersion: "2018-05-29",
      description: "description",
      dataSourceName: auroraDataSource.name,
      name: "CreateTenderCriterionCpvsAuroraFunction",
      requestMappingTemplate: readFileSync(
        `${__dirname}/../../appsync/function.insertAurora.request.vtl`,
        { encoding: "utf8" }
      ),
      responseMappingTemplate: readFileSync(
        `${__dirname}/../../appsync/function.insertAurora.response.vtl`,
        { encoding: "utf8" }
      ),
    })

    const CreateTenderCriterionsAuroraFunction = new CfnFunctionConfiguration(this, `CreateTenderCriterionsAuroraFunction`, {
      apiId: api.apiId,
      functionVersion: "2018-05-29",
      description: "description",
      dataSourceName: auroraDataSource.name,
      name: "CreateTenderCriterionsAuroraFunction",
      requestMappingTemplate: readFileSync(
        `${__dirname}/../../appsync/function.insertAurora.request.vtl`,
        { encoding: "utf8" }
      ),
      responseMappingTemplate: readFileSync(
        `${__dirname}/../../appsync/function.insertAurora.response.vtl`,
        { encoding: "utf8" }
      ),
    })

    const GetUserAuroraFunction = new CfnFunctionConfiguration(this, `GetUserAuroraFunction`, {
      apiId: api.apiId,
      functionVersion: "2018-05-29",
      description: "description",
      dataSourceName: auroraDataSource.name,
      name: "GetUserAuroraFunction",
      requestMappingTemplate: readFileSync(
        `${__dirname}/../../appsync/function.GetUserAuroraFunction.request.vtl`,
        { encoding: "utf8" }
      ),
      responseMappingTemplate: readFileSync(
        `${__dirname}/../../appsync/function.GetUserAuroraFunction.response.vtl`,
        { encoding: "utf8" }
      ),
    })

    const CheckNonPrivateTenderFunction = new CfnFunctionConfiguration(this, `CheckNonPrivateTenderFunction`, {
      apiId: api.apiId,
      functionVersion: "2018-05-29",
      description: "description",
      dataSourceName: noneDataSource.name,
      name: "CheckNonPrivateTenderFunction",
      requestMappingTemplate: readFileSync(
        `${__dirname}/../../appsync/function.CheckNonPrivateTenderFunction.request.vtl`,
        { encoding: "utf8" }
      ),
      responseMappingTemplate: readFileSync(
        `${__dirname}/../../appsync/function.CheckNonPrivateTenderFunction.response.vtl`,
        { encoding: "utf8" }
      ),
    })

    const CreateAclAuroraFunction = new CfnFunctionConfiguration(this, `CreateAclAuroraFunction`, {
      apiId: api.apiId,
      functionVersion: "2018-05-29",
      description: "CreateAclAuroraFunction",
      dataSourceName: auroraDataSource.name,
      name: "CreateAclAuroraFunction",
      requestMappingTemplate: readFileSync(
        `${__dirname}/../../appsync/function.insertAurora.request.vtl`,
        { encoding: "utf8" }
      ),
      responseMappingTemplate: readFileSync(
        `${__dirname}/../../appsync/function.insertAurora.response.vtl`,
        { encoding: "utf8" }
      ),
    })

    const GetAclAuroraFunction = new CfnFunctionConfiguration(this, `GetAclAuroraFunction`, {
      apiId: api.apiId,
      functionVersion: "2018-05-29",
      description: "GetAclAuroraFunction",
      dataSourceName: auroraDataSource.name,
      name: "GetAclAuroraFunction",
      requestMappingTemplate: readFileSync(
        `${__dirname}/../../appsync/function.GetAclAuroraFunction.request.vtl`,
        { encoding: "utf8" }
      ),
      responseMappingTemplate: readFileSync(
        `${__dirname}/../../appsync/function.GetAclAuroraFunction.response.vtl`,
        { encoding: "utf8" }
      ),
    })

    const UpdateTenderAuroraFunction = new CfnFunctionConfiguration(this, `UpdateTenderAuroraFunction`, {
      apiId: api.apiId,
      functionVersion: "2018-05-29",
      description: "UpdateTenderAuroraFunction",
      dataSourceName: auroraDataSource.name,
      name: "UpdateTenderAuroraFunction",
      requestMappingTemplate: readFileSync(
        `${__dirname}/../../appsync/function.multiInsertUpdateAurora.request.vtl`,
        { encoding: "utf8" }
      ),
      responseMappingTemplate: readFileSync(
        `${__dirname}/../../appsync/function.multiInsertUpdateAurora.response.vtl`,
        { encoding: "utf8" }
      ),
    })

    const UpdateTenderCriterionsAuroraFunction = new CfnFunctionConfiguration(this, `UpdateTenderCriterionsAuroraFunction`, {
      apiId: api.apiId,
      functionVersion: "2018-05-29",
      description: "UpdateTenderCriterionsAuroraFunction",
      dataSourceName: auroraDataSource.name,
      name: "UpdateTenderCriterionsAuroraFunction",
      requestMappingTemplate: readFileSync(
        `${__dirname}/../../appsync/function.multiInsertUpdateAurora.request.vtl`,
        { encoding: "utf8" }
      ),
      responseMappingTemplate: readFileSync(
        `${__dirname}/../../appsync/function.multiInsertUpdateAurora.response.vtl`,
        { encoding: "utf8" }
      ),
    })

    const UpdateTenderCriterionCpvsAuroraFunction = new CfnFunctionConfiguration(this, `UpdateTenderCriterionCpvsAuroraFunction`, {
      apiId: api.apiId,
      functionVersion: "2018-05-29",
      description: "UpdateTenderCriterionCpvsAuroraFunction",
      dataSourceName: auroraDataSource.name,
      name: "UpdateTenderCriterionCpvsAuroraFunction",
      requestMappingTemplate: readFileSync(
        `${__dirname}/../../appsync/function.multiInsertUpdateAurora.request.vtl`,
        { encoding: "utf8" }
      ),
      responseMappingTemplate: readFileSync(
        `${__dirname}/../../appsync/function.multiInsertUpdateAurora.response.vtl`,
        { encoding: "utf8" }
      ),
    })

    const UpdateTenderLocalFunction = new CfnFunctionConfiguration(this, `UpdateTenderLocalFunction`, {
      apiId: api.apiId,
      functionVersion: "2018-05-29",
      description: "UpdateTenderLocalFunction",
      dataSourceName: auroraDataSource.name,
      name: "UpdateTenderLocalFunction",
      requestMappingTemplate: readFileSync(
        `${__dirname}/../../appsync/function.UpdateTenderLocalFunction.request.vtl`,
        { encoding: "utf8" }
      ),
      responseMappingTemplate: readFileSync(
        `${__dirname}/../../appsync/function.UpdateTenderLocalFunction.response.vtl`,
        { encoding: "utf8" }
      ),
    })
    // -------------PIPELINE QUERIES AND MUTATIONS DEFINITIONS----------------- //
    const GetUserPipeline = new CfnResolver(this, `GetUserPipeline`, {
      apiId: api.apiId,
      kind: 'PIPELINE',
      typeName: "Query",
      fieldName: "GetUser",
      requestMappingTemplate: readFileSync(
        `${__dirname}/../../appsync/pipeline.before.vtl`,
        { encoding: "utf8" }
      ),
      responseMappingTemplate: readFileSync(
        `${__dirname}/../../appsync/pipeline.after.vtl`,
        { encoding: "utf8" }
      ),
      pipelineConfig: {
        functions: [TokenAuthorizerFunction.attrFunctionId, GetUserAuroraFunction.attrFunctionId]
      },
    })

    const GetTenderPipeline = new CfnResolver(this, `GetTenderPipeline`, {
      apiId: api.apiId,
      kind: 'PIPELINE',
      typeName: "Query",
      fieldName: "GetTender",
      requestMappingTemplate: readFileSync(
        `${__dirname}/../../appsync/pipeline.before.vtl`,
        { encoding: "utf8" }
      ),
      responseMappingTemplate: readFileSync(
        `${__dirname}/../../appsync/pipeline.after.vtl`,
        { encoding: "utf8" }
      ),
      pipelineConfig: {
        functions: [
          TokenAuthorizerFunction.attrFunctionId,
          GetTenderFunction.attrFunctionId,
          GetUserAuroraFunction.attrFunctionId,
          GetAclAuroraFunction.attrFunctionId,
          CheckNonPrivateTenderFunction.attrFunctionId
        ]
      },
    })

    const CreateTenderPipeline = new CfnResolver(this, `CreateTender`, {
      apiId: api.apiId,
      kind: 'PIPELINE',
      typeName: "Mutation",
      fieldName: "CreateTender",
      requestMappingTemplate: readFileSync(
        `${__dirname}/../../appsync/function.CreateTender.before.vtl`,
        { encoding: "utf8" }
      ),
      responseMappingTemplate: readFileSync(
        `${__dirname}/../../appsync/function.CreateTender.after.vtl`,
        { encoding: "utf8" }
      ),
      pipelineConfig: {
        functions: [
          TokenAuthorizerFunction.attrFunctionId,
          GetUserAuroraFunction.attrFunctionId,
          CreateTenderElasticFunction.attrFunctionId,
          CreateTenderAuroraFunction.attrFunctionId,
          CreateTenderCriterionCpvsAuroraFunction.attrFunctionId,
          CreateTenderCriterionsAuroraFunction.attrFunctionId,
          CreateAclAuroraFunction.attrFunctionId
        ],
      },
    })

    const UpdateTenderPipeline = new CfnResolver(this, `UpdateTenderPipeline`, {
      apiId: api.apiId,
      kind: 'PIPELINE',
      typeName: "Mutation",
      fieldName: "UpdateTender",
      requestMappingTemplate: readFileSync(
        `${__dirname}/../../appsync/function.UpdateTender.before.vtl`,
        { encoding: "utf8" }
      ),
      responseMappingTemplate: readFileSync(
        `${__dirname}/../../appsync/function.UpdateTender.after.vtl`,
        { encoding: "utf8" }
      ),
      pipelineConfig: {
        functions: [
          TokenAuthorizerFunction.attrFunctionId,
          GetUserAuroraFunction.attrFunctionId,
          GetAclAuroraFunction.attrFunctionId,
          GetTenderFunction.attrFunctionId,
          UpdateTenderLocalFunction.attrFunctionId,
          UpdateTenderElasticFunction.attrFunctionId,
          UpdateTenderAuroraFunction.attrFunctionId,
          UpdateTenderCriterionsAuroraFunction.attrFunctionId,
          UpdateTenderCriterionCpvsAuroraFunction.attrFunctionId
        ]
      }
    })

    const GetTenderCriterionCpvs = new CfnResolver(this, `GetTenderCriterionCpvs`, {
      apiId: api.apiId,
      typeName: "Tender",
      fieldName: "tenderCriterionCpv",
      requestMappingTemplate: readFileSync(
        `${__dirname}/../../appsync/Query.Tender.tenderCriterionCpv.request.vtl`,
        { encoding: "utf8" }
      ),
      responseMappingTemplate: readFileSync(
        `${__dirname}/../../appsync/Query.Tender.tenderCriterionCpv.response.vtl`,
        { encoding: "utf8" }
      ),
      dataSourceName: auroraDataSource.name,
    })
    GetTenderCriterionCpvs.addDependsOn(auroraDataSource);

    const GetTenderCriterion = new CfnResolver(this, `GetTenderCriterion`, {
      apiId: api.apiId,
      typeName: "Tender",
      fieldName: "tenderCriterion",
      requestMappingTemplate: readFileSync(
        `${__dirname}/../../appsync/Query.Tender.tenderCriterion.request.vtl`,
        { encoding: "utf8" }
      ),
      responseMappingTemplate: readFileSync(
        `${__dirname}/../../appsync/Query.Tender.tenderCriterion.response.vtl`,
        { encoding: "utf8" }
      ),
      dataSourceName: auroraDataSource.name,
    })
    GetTenderCriterion.addDependsOn(auroraDataSource);
  }
}
