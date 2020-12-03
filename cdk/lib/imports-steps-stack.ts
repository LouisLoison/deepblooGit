import { Chain, Choice, Condition, Fail, StateMachine, Task, LogLevel, Map } from '@aws-cdk/aws-stepfunctions';
import { InvokeFunction, LambdaInvoke } from '@aws-cdk/aws-stepfunctions-tasks';
import { AssetCode, Function, Runtime, LayerVersion, ILayerVersion } from '@aws-cdk/aws-lambda';
import { S3EventSource, } from '@aws-cdk/aws-lambda-event-sources';
import { Construct, Stack, StackProps, Duration } from '@aws-cdk/core';
import { Secret } from '@aws-cdk/aws-secretsmanager';
import { Vpc } from '@aws-cdk/aws-ec2';
import s3 = require('@aws-cdk/aws-s3');
import iam = require('@aws-cdk/aws-iam');
import logs = require('@aws-cdk/aws-logs');

/*
interface ImportsStepsStackProps extends StackProps {
  nodeLayerArn: ILayerVersion;
}
 */

export class ImportsStepsStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const environment = {
      NODE_ENV: "dev",
    }

    const secretArn = 'arn:aws:secretsmanager:eu-west-1:669031476932:secret:aurora-creds-faJRvx'

    const dbEnv = {
      DB_HOST: "serverless-test.cluster-cxvdonhye3yz.eu-west-1.rds.amazonaws.com",
      DB_SECRET: secretArn,
    }

    const appsearchSecretArn = "arn:aws:secretsmanager:eu-west-1:669031476932:secret:appsearch-TZnQcu"
    const appsearchEnv = {
      APPSEARCH_ENDPOINT: "https://7bbe91f62e1e4ff6b41e5ee2fba2cdbd.app-search.eu-west-1.aws.found.io/",
      APPSEARCH_SECRET: appsearchSecretArn,
    }


    const dbSecret = Secret.fromSecretAttributes(this, 'dbSecret', {
      secretArn,

      // If the secret is encrypted using a KMS-hosted CMK, either import or reference that key:
      // encryptionKey,
    });
    const appsearchSecret = Secret.fromSecretAttributes(this, 'appsearchSecret', {
      secretArn: appsearchSecretArn,
    });

    const documentsBucketArn = 'arn:aws:s3:::textractpipelinestack-documentsbucket9ec9deb9-mla8aarhzynj'
    const documentsBucket = s3.Bucket.fromBucketArn(this, 'DocumentsBucket', documentsBucketArn);

    const sftpBucket = new s3.Bucket(this, 'sftpBucketDev', { versioned: false});
    //    const nodeLayer = LayerVersion.fromLayerVersionArn(scope, `${id}Layer`, props.nodeLayerArn)
    const vpc = Vpc.fromVpcAttributes(this, 'Vpc', {
      vpcId: 'vpc-f7456f91',
      availabilityZones: ['eu-west-1a', 'eu-west-1b', 'eu-west-1c'],
      // publicSubnetIds: ['subnet-225d2a6a', 'subnet-a8d677f2', 'subnet-aff99dc9'],
      // publicSubnetIds: ['subnet-xxxxxx', 'subnet-xxxxxx', 'subnet-xxxxxx'],
      privateSubnetIds: ['subnet-0d44e4d2296bfd59f', 'subnet-0530f274ce7351e90', 'subnet-0530f274ce7351e90'],
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



    const stepTenderConvert = new Function(this, 'convertTender', {
      runtime: Runtime.NODEJS_12_X,
      code: new AssetCode('../lambda/function/stepTenderConvert'),
      handler: 'index.handler',
      memorySize: 500,
      reservedConcurrentExecutions: 4,
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
      reservedConcurrentExecutions: 4,
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
      reservedConcurrentExecutions: 4,
      timeout: Duration.seconds(50),
      environment: {
        ...environment,
        ...dbEnv,
      }
    });

    const stepTenderMerge = new Function(this, 'mergeTender', {
      runtime: Runtime.NODEJS_12_X,
      code: new AssetCode('../lambda/function/stepTenderMerge'),
      handler: 'index.handler',
      vpc,
      memorySize: 500,
      reservedConcurrentExecutions: 4,
      timeout: Duration.seconds(60),
      environment: {
        ...environment,
        ...dbEnv,
      }
    });

    const stepTenderIndex = new Function(this, 'stepTenderIndex', {
      runtime: Runtime.NODEJS_12_X,
      code: new AssetCode('../lambda/function/stepTenderIndex'),
      handler: 'index.handler',
      memorySize: 500,
      reservedConcurrentExecutions: 4,
      timeout: Duration.seconds(60),
      environment: {
        ...environment,
        ...appsearchEnv,
      }
    });

    const stepDocumentDownload = new Function(this, 'downloadDocument', {
      runtime: Runtime.NODEJS_12_X,
      code: new AssetCode('../lambda/function/stepDocumentDownload'),
      handler: 'index.handler',
      memorySize: 500,
      reservedConcurrentExecutions: 4,
      timeout: Duration.seconds(60),
      vpc,
      environment: {
        ...environment,
        ...dbEnv,
        DOCUMENTS_BUCKET: documentsBucket.bucketName,
      }
    });

    stepTenderConvert.addLayers(nodeLayer, deepblooLayer)
    stepTenderAnalyze.addLayers(nodeLayer, deepblooLayer)
    stepTenderStore.addLayers(nodeLayer, deepblooLayer)
    stepTenderMerge.addLayers(nodeLayer, deepblooLayer)
    stepTenderIndex.addLayers(nodeLayer, deepblooLayer)
    stepDocumentDownload.addLayers(nodeLayer, deepblooLayer)
    dbSecret.grantRead(stepTenderAnalyze)
    dbSecret.grantRead(stepTenderStore)
    dbSecret.grantRead(stepTenderMerge)
    dbSecret.grantRead(stepDocumentDownload)
    appsearchSecret.grantRead(stepTenderIndex)
    documentsBucket.grantReadWrite(stepDocumentDownload)

    const convertTenderTask = new Task(this, 'Tender Conversion Task', {
      task: new InvokeFunction(stepTenderConvert),
      inputPath: '$.tenderData',
      resultPath: '$.convertedData',
      // outputPath: '$.convertedData',
    })

    const analyzeTenderTask = new Task(this, 'Tender Analyze Task', {
      task: new InvokeFunction(stepTenderAnalyze),
      // inputPath: '$.convertedData',
      // resultPath: '$.analyzedData',
    });

    const storeTenderTask = new Task(this, 'Tender Store Task', {
      task: new InvokeFunction(stepTenderStore),
      resultPath: '$.storedData',
    });

    const mergeTenderTask = new Task(this, 'Tender Merge Task', {
      task: new InvokeFunction(stepTenderMerge),
      // inputPath: '$.storedData',
      resultPath: '$.mergedData',
    });

    const stepTenderIndexTask = new Task(this, 'Appsearch Index Task', {
      task: new InvokeFunction(stepTenderIndex),
      resultPath: '$.appsearchResult',
    });

    const downloadTask = new Task(this, 'Download Task', {
      task: new InvokeFunction(stepDocumentDownload),
      // inputPath: '$.convertedData',
    });

    const downloadMap = new Map(this, 'Download Map', {
      inputPath: '$.mergedData',
      itemsPath: '$.newSourceUrls',
      resultPath: '$.downloadedData',
    }).iterator(downloadTask);


    const chain = Chain.start(convertTenderTask)
    //.start(new Choice(this, 'Tender source ?')
    //.when(Condition.stringEquals('$.tenderFormat', 'tenderinfo'), convertTenderTask)
    //.when(Condition.stringEquals('$.tenderFormat', 'dgmarket'), convertTenderTask)
    //.afterwards()
      .next(analyzeTenderTask)
      .next(storeTenderTask)
      .next(mergeTenderTask)
      .next(stepTenderIndexTask)
      .next(downloadMap)
    //)

    //  .next(downloadTask)
      /*      .next(
        isComplete
      .when(Condition.numberEquals('$.Status', 1), closeCase)
      .when(Condition.numberEquals('$.Status', 0), escalateCase.next(jobFailed)),
  );
       */

    const logGroup = new logs.LogGroup(this, 'MyLogGroup');

    const stateMachine = new StateMachine(this, 'StateMachine', {
      definition: chain,
      logs: {
        destination: logGroup,
        level: LogLevel.ALL,
      }
    });

    const xmlImport = new Function(this, 'XmlImport', {
      runtime: Runtime.NODEJS_12_X,
      code: new AssetCode('../lambda/function/xmlimport'),
      handler: 'index.handler',
      memorySize: 500,
      //      reservedConcurrentExecutions: 20,
      timeout: Duration.seconds(50),
      environment: {
        ...environment,
        TENDER_STATE_MACHINE_ARN: stateMachine.stateMachineArn,
      }
    });

    xmlImport.addLayers(nodeLayer, deepblooLayer)
    //Trigger
    xmlImport.addEventSource(new S3EventSource(sftpBucket, {
      events: [ s3.EventType.OBJECT_CREATED ],
      filters: [{ prefix: 'incoming/', suffix: '.xml'}]
    }))
    sftpBucket.grantReadWrite(xmlImport)
    stateMachine.grantStartExecution(xmlImport)
    // stateMachine.grantRead(xmlImport)
    // stateMachine.grantTaskResponse(xmlImport)
  }
}
