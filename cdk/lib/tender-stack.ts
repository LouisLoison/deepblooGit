import {
  Chain,
  Choice,
  Condition,
  Fail,
  StateMachine,
  Map,
  IStateMachine,
  LogLevel,
  Succeed,
  Wait,
  WaitTime,
} from '@aws-cdk/aws-stepfunctions';
import { LambdaInvoke, StepFunctionsStartExecution } from '@aws-cdk/aws-stepfunctions-tasks';
import { AssetCode, Function, Runtime, LayerVersion } from '@aws-cdk/aws-lambda';
import { S3EventSource } from '@aws-cdk/aws-lambda-event-sources';
import { Construct, Stack, StackProps, Duration } from '@aws-cdk/core';
import { Secret } from '@aws-cdk/aws-secretsmanager';
import { Vpc } from '@aws-cdk/aws-ec2';
import s3 = require('@aws-cdk/aws-s3');
import logs = require('@aws-cdk/aws-logs');

import { config } from './config';

interface TenderStackProps extends StackProps {
  documentMachine: IStateMachine;
}

export class TenderStack extends Stack {
  constructor(scope: Construct, id: string, props: TenderStackProps) {
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

    const dbSecret = Secret.fromSecretAttributes(this, 'dbSecret', {
      secretArn: DB_SECRET,

      // If the secret is encrypted using a KMS-hosted CMK, either import or reference that key:
      // encryptionKey,
    });
    const appsearchSecret = Secret.fromSecretAttributes(this, 'appsearchSecret', {
      secretArn: APPSEARCH_SECRET,
    });

    const elasticSecret = Secret.fromSecretAttributes(this, 'elasticSecret', {
      secretArn: ELASTIC_SECRET,
    });

    const sftpBucket = new s3.Bucket(this, 'sftpBucketDev', { versioned: false });

    // const imageMagickLayer = LayerVersion.fromLayerVersionArn(this, 'ImageMagickLayer',"arn:aws:lambda:eu-west-1:669031476932:layer:image-magick:1")
    //    const nodeLayer = LayerVersion.fromLayerVersionArn(scope, `${id}Layer`, props.nodeLayerArn)

    const vpc = Vpc.fromVpcAttributes(this, 'Vpc', {
      vpcId,
      availabilityZones,
      // publicSubnetIds: ['subnet-225d2a6a', 'subnet-a8d677f2', 'subnet-aff99dc9'],
      // publicSubnetIds: ['subnet-xxxxxx', 'subnet-xxxxxx', 'subnet-xxxxxx'],
      privateSubnetIds,
    });

    const nodeLayer = new LayerVersion(this, 'NodeLib', {
      code: new AssetCode('../lambda/layer/npm'),
      compatibleRuntimes: [Runtime.NODEJS_12_X],
      license: 'Apache-2.0, MIT',
      description: 'Old backend and dependencies layer.',
    });

    // Helper Layer with helper functions
    const helperLayer = new LayerVersion(this, 'HelperLayer', {
      code: new AssetCode('../lambda/layer/helper'),
      compatibleRuntimes: [Runtime.PYTHON_3_8],
      license: 'Apache-2.0',
      description: 'Helper layer.',
    });

    // Python libs helper layer
    const pythonModulesLayer = new LayerVersion(this, 'PythonModules', {
      code: new AssetCode('../lambda/layer/pipenv'),
      compatibleRuntimes: [Runtime.PYTHON_3_8],
      license: 'Apache-2.0, MIT',
      description: 'Pipenv-installed pypi modules layer.',
    });

    const deepblooLayer = new LayerVersion(this, 'DeepblooLib', {
      code: new AssetCode('../lambda/layer/deepbloo'),
      compatibleRuntimes: [Runtime.NODEJS_12_X],
      license: 'Private, Unlicensed',
      description: 'Deepbloo lib layer.',
    });

    const stepTenderConvert = new Function(this, 'convertTender', {
      runtime: Runtime.NODEJS_12_X,
      code: new AssetCode('../lambda/function/stepTenderConvert'),
      handler: 'index.handler',
      memorySize: 500,
      reservedConcurrentExecutions: 20,
      timeout: Duration.seconds(50),
      environment: {
        ...environment,
      }
    });

    const stepTenderAnalyze = new Function(this, 'analyzeTender', {
      runtime: Runtime.NODEJS_12_X,
      code: new AssetCode('../lambda/function/stepTenderAnalyze'),
      handler: 'index.handler',
      vpc,
      memorySize: 500,
      reservedConcurrentExecutions: 20,
      timeout: Duration.seconds(60),
      environment: {
        ...environment,
        ...dbEnv,
      }
    });

    const stepTenderStore = new Function(this, 'storeTender', {
      runtime: Runtime.NODEJS_12_X,
      code: new AssetCode('../lambda/function/stepTenderStore'),
      handler: 'index.handler',
      vpc,
      memorySize: 500,
      reservedConcurrentExecutions: 20,
      timeout: Duration.seconds(70),
      environment: {
        ...environment,
        ...dbEnv,
        DEBUG: "1",
      }
    });

    const stepTenderMerge = new Function(this, 'mergeTender', {
      runtime: Runtime.NODEJS_12_X,
      code: new AssetCode('../lambda/function/stepTenderMerge'),
      handler: 'index.handler',
      vpc,
      memorySize: 500,
      reservedConcurrentExecutions: 20,
      timeout: Duration.seconds(60),
      environment: {
        ...environment,
        ...dbEnv,
        DEBUG: "1",
      }
    });

    const stepTenderIndex = new Function(this, 'stepTenderIndex', {
      runtime: Runtime.NODEJS_12_X,
      code: new AssetCode('../lambda/function/stepTenderIndex'),
      handler: 'index.handler',
      memorySize: 500,
      reservedConcurrentExecutions: 20,
      timeout: Duration.seconds(20),
      environment: {
        ...environment,
        ...appsearchEnv,
      }
    });

    const stepTenderElasticIndex = new Function(this, 'stepTenderElasticIndex', {
      runtime: Runtime.NODEJS_12_X,
      code: new AssetCode('../lambda/function/stepTenderElasticIndex'),
      handler: 'index.handler',
      memorySize: 500,
      reservedConcurrentExecutions: 20,
      timeout: Duration.seconds(20),
      environment: {
        ...environment,
        ELASTIC_SECRET,
      }
    });

    const stepNotifyError = new Function(this, 'stepNotifyError', {
      runtime: Runtime.NODEJS_12_X,
      code: new AssetCode('../lambda/function/stepNotifyError'),
      handler: 'index.handler',
      memorySize: 500,
      reservedConcurrentExecutions: 20,
      timeout: Duration.seconds(20),
      environment: {
        ...environment,
        ELASTIC_SECRET,
      }
    });

    const stepValueExtraction = new Function(this, 'ValueExtraction', {
      functionName: `stepValueExtraction-${environment.NODE_ENV}`,
      runtime: Runtime.PYTHON_3_8,
      code: new AssetCode('../lambda/function/valueextraction'),
      handler: 'lambda_function.lambda_handler',
      memorySize: 1720,
      reservedConcurrentExecutions: 105,
      timeout: Duration.seconds(60),
      environment: {
      }
    })

    const stepNamedEntities = new Function(this, 'NamedEntities', {
      runtime: Runtime.PYTHON_3_8,
      code: new AssetCode('../lambda/function/stepNamedEntities'),
      handler: 'lambda_function.lambda_handler',
      memorySize: 500,
      reservedConcurrentExecutions: 20,
      timeout: Duration.seconds(60),
      environment: {
      }
    })

    stepTenderConvert.addLayers(nodeLayer, deepblooLayer)
    stepTenderAnalyze.addLayers(nodeLayer, deepblooLayer)
    stepTenderStore.addLayers(nodeLayer, deepblooLayer)
    stepTenderMerge.addLayers(nodeLayer, deepblooLayer)
    stepTenderIndex.addLayers(nodeLayer, deepblooLayer)
    stepTenderElasticIndex.addLayers(nodeLayer, deepblooLayer)
    stepNotifyError.addLayers(nodeLayer, deepblooLayer)
    stepValueExtraction.addLayers(pythonModulesLayer, helperLayer)
    stepNamedEntities.addLayers(pythonModulesLayer, helperLayer)

    dbSecret.grantRead(stepTenderAnalyze)
    dbSecret.grantRead(stepTenderStore)
    dbSecret.grantRead(stepTenderMerge)
    appsearchSecret.grantRead(stepTenderIndex)
    elasticSecret.grantRead(stepTenderElasticIndex)
    elasticSecret.grantRead(stepNotifyError)

    stepValueExtraction.grantInvoke(stepTenderAnalyze)
    const processFail = new Fail(this, 'processFail', {
      error: 'WorkflowFailure',
      cause: "Download task failed"
    });

    const notifyErrorTask = new LambdaInvoke(this, 'Notify Error', {
      lambdaFunction: stepNotifyError,
      payloadResponseOnly: true,
    }).addRetry({
      backoffRate: 5,
      interval: Duration.seconds(3),
      maxAttempts: 4
    }).next(processFail);

    const convertTenderTask = new LambdaInvoke(this, 'Tender Conversion Task', {
      lambdaFunction: stepTenderConvert,
      inputPath: '$.tenderData',
      // resultPath: '$.convertedData',
      // outputPath: '$.Payload',
      payloadResponseOnly: true,
    }).addRetry({
      backoffRate: 3,
      interval: Duration.seconds(3),
      maxAttempts: 4
    }).addCatch(notifyErrorTask)

    const analyzeTenderTask = new LambdaInvoke(this, 'Tender Analyze Task', {
      lambdaFunction: stepTenderAnalyze,
      // inputPath: '$.convertedData',
      // resultPath: '$.analyzedData',
      payloadResponseOnly: true,
    }).addRetry({
      backoffRate: 3,
      interval: Duration.seconds(4),
      maxAttempts: 4
    }).addCatch(notifyErrorTask)


    const storeTenderTask = new LambdaInvoke(this, 'Tender Store Task', {
      lambdaFunction: stepTenderStore,
      resultPath: '$.storedData',
      payloadResponseOnly: true,
    }).addRetry({
      backoffRate: 3,
      interval: Duration.seconds(5),
      maxAttempts: 4
    }).addCatch(notifyErrorTask);

    const mergeTenderTask = new LambdaInvoke(this, 'Tender Merge Task', {
      lambdaFunction: stepTenderMerge,
      // inputPath: '$.storedData',
      resultPath: '$.mergedData',
      payloadResponseOnly: true,
    }).addRetry({
      backoffRate: 4,
      interval: Duration.seconds(3),
      maxAttempts: 4
    }).addCatch(notifyErrorTask);

    const stepTenderIndexTask = new LambdaInvoke(this, 'Appsearch Index Task', {
      lambdaFunction: stepTenderIndex,
      resultPath: '$.appsearchResult',
      payloadResponseOnly: true,
    }).addRetry({
      backoffRate: 5,
      interval: Duration.seconds(3),
      maxAttempts: 4
    }).addCatch(notifyErrorTask);

    const stepTenderElasticIndexTask = new LambdaInvoke(this, 'Elastic Index Task', {
      lambdaFunction: stepTenderElasticIndex,
      resultPath: '$.elasticResult',
      payloadResponseOnly: true,
    }).addRetry({
      backoffRate: 5,
      interval: Duration.seconds(3),
      maxAttempts: 4
    }).addCatch(notifyErrorTask);

    const namedEntitiesTask = new LambdaInvoke(this, 'Named Entities', {
      lambdaFunction: stepNamedEntities,
      inputPath: '$.formatedData',
      resultPath: '$.entities',
      payloadResponseOnly: true,
    }).addCatch(notifyErrorTask)

    /*
    const valueExtractionTask = new LambdaInvoke(this, 'Value Extraction', {
      lambdaFunction: stepValueExtraction,
      inputPath: '$.formatedData',
      resultPath: '$.metrics',
      payloadResponseOnly: true,
    }).addCatch(notifyErrorTask)
    */

    const stepFunctionsTask = new StepFunctionsStartExecution(this, "Document Process", {
      stateMachine: props.documentMachine,
      inputPath: '$',
      resultPath: '$'
    });

    const documentMap = new Map(this, 'Document Map', {
      inputPath: '$.mergedData',
      itemsPath: '$.newSourceUrls',
      resultPath: '$.downloadedData',
      maxConcurrency: 2,
    }).iterator(stepFunctionsTask);

    const logGroup = new logs.LogGroup(this, 'TenderLogGroup');

    const noInterest = new Succeed(this, 'No interest', { comment: "e.g. tender has no CPV match" })
    const fullSucceed = new Succeed(this, 'Completed', { comment: "Tender fully available" })

    const initialWait = new Wait(this, 'Waiting for our turn', {
      time: WaitTime.secondsPath('$.startDelay')
    })

    const chain = Chain.start(initialWait)
      .next(convertTenderTask)
      .next(analyzeTenderTask)
      .next(namedEntitiesTask)
      .next(storeTenderTask)
      .next(mergeTenderTask)
      .next(stepTenderElasticIndexTask)
      .next(new Choice(this, 'Has interest ?')
        .when(Condition.numberLessThan('$.formatedData.status', 20), noInterest)
        .otherwise(stepTenderIndexTask
          .next(new Choice(this, 'Has documents ?')
            .when(Condition.booleanEquals('$.mergedData.hasDocuments', true), documentMap
              .next(fullSucceed)
            ).otherwise(fullSucceed)
          )
        )
      )

    const stateMachine = new StateMachine(this, 'TenderProcess', {
      definition: chain,
      logs: {
        destination: logGroup,
        level: LogLevel.ERROR,
      },
      tracingEnabled: true,
    });


    const xmlImport = new Function(this, 'XmlImport', {
      runtime: Runtime.NODEJS_12_X,
      code: new AssetCode('../lambda/function/xmlimport'),
      handler: 'index.handler',
      memorySize: 1500,
      reservedConcurrentExecutions: 2,
      timeout: Duration.seconds(900),
      environment: {
        ...environment,
        TENDER_STATE_MACHINE_ARN: stateMachine.stateMachineArn,
      }
    });


    xmlImport.addLayers(nodeLayer, deepblooLayer)
    //Trigger
    xmlImport.addEventSource(new S3EventSource(sftpBucket, {
      events: [s3.EventType.OBJECT_CREATED],
      filters: [{ prefix: 'incoming/', suffix: '.xml' }]
    }))
    sftpBucket.grantReadWrite(xmlImport)
    stateMachine.grantStartExecution(xmlImport)
    // stateMachine.grantRead(xmlImport)
    // stateMachine.grantTaskResponse(xmlImport)

  }
}
