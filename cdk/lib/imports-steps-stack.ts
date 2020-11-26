import { Chain, Choice, Condition, Fail, StateMachine, Task, LogLevel } from '@aws-cdk/aws-stepfunctions';
import { InvokeFunction } from '@aws-cdk/aws-stepfunctions-tasks';
import { AssetCode, Function, Runtime, LayerVersion, ILayerVersion } from '@aws-cdk/aws-lambda';
import { S3EventSource, } from '@aws-cdk/aws-lambda-event-sources';
import { Construct, Stack, StackProps, Duration } from '@aws-cdk/core';
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
    const dbEnv = {
      DB_HOST: "serverless-test.cluster-cxvdonhye3yz.eu-west-1.rds.amazonaws.com",
      DB_SECRET: 'arn:aws:secretsmanager:eu-west-1:669031476932:secret:aurora-creds-faJRvx',
    }

    const sftpBucket = new s3.Bucket(this, 'sftpBucketDev', { versioned: false});
    //    const nodeLayer = LayerVersion.fromLayerVersionArn(scope, `${id}Layer`, props.nodeLayerArn)
    const vpc = Vpc.fromVpcAttributes(this, 'Vpc', {
      vpcId: 'vpc-f7456f91',
      availabilityZones: ['eu-west-1a', 'eu-west-1b', 'eu-west-1c'],
      // publicSubnetIds: ['subnet-225d2a6a', 'subnet-a8d677f2', 'subnet-aff99dc9'],
      // publicSubnetIds: ['subnet-xxxxxx', 'subnet-xxxxxx', 'subnet-xxxxxx'],
      privateSubnetIds: ['subnet-225d2a6a', 'subnet-a8d677f2', 'subnet-aff99dc9'],
    });

    const nodeLayer = new LayerVersion(this, 'NodeLib', {
      code: new AssetCode('../lambda/layer/npm'),
      compatibleRuntimes: [Runtime.NODEJS_12_X],
      license: 'Apache-2.0, MIT',
      description: 'Old backend and dependencies layer.',
    });


    const stepTenderConvert = new Function(this, 'convertTender', {
      runtime: Runtime.NODEJS_12_X,
      code: new AssetCode('../lambda/function/stepTenderConvert'),
      handler: 'index.handler',
      memorySize: 500,
      //      reservedConcurrentExecutions: 20,
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
      //      reservedConcurrentExecutions: 20,
      timeout: Duration.seconds(50),
      environment: {
        ...environment,
      }
    });

    const stepTenderStore = new Function(this, 'storeTender', {
      runtime: Runtime.NODEJS_12_X,
      code: new AssetCode('../lambda/function/stepTenderStore'),
      handler: 'index.handler',
      vpc,
      memorySize: 500,
      //      reservedConcurrentExecutions: 20,
      timeout: Duration.seconds(50),
      environment: {
        ...environment,
      }
    });

    const stepTenderMerge = new Function(this, 'mergeTender', {
      runtime: Runtime.NODEJS_12_X,
      code: new AssetCode('../lambda/function/stepTenderMerge'),
      handler: 'index.handler',
      memorySize: 500,
      //      reservedConcurrentExecutions: 20,
      timeout: Duration.seconds(50),
      environment: {
        ...environment,
      }
    });

    const stepTenderIndex = new Function(this, 'stepTenderIndex', {
      runtime: Runtime.NODEJS_12_X,
      code: new AssetCode('../lambda/function/stepTenderIndex'),
      handler: 'index.handler',
      memorySize: 500,
      //      reservedConcurrentExecutions: 20,
      timeout: Duration.seconds(50),
      environment: {
        ...environment,
      }
    });

    const downloadAttachments = new Function(this, 'downloadDocument', {
      runtime: Runtime.NODEJS_12_X,
      code: new AssetCode('../lambda/function/downloadDocument'),
      handler: 'index.handler',
      memorySize: 500,
      //      reservedConcurrentExecutions: 20,
      timeout: Duration.seconds(50),
      environment: {
        ...environment,
      }
    });

    stepTenderConvert.addLayers(nodeLayer)
    stepTenderAnalyze.addLayers(nodeLayer)
    stepTenderStore.addLayers(nodeLayer)
    stepTenderMerge.addLayers(nodeLayer)
    stepTenderIndex.addLayers(nodeLayer)
    downloadAttachments.addLayers(nodeLayer)

    const convertTenderTask = new Task(this, 'Tender Conversion Task', {
      task: new InvokeFunction(stepTenderConvert),
      inputPath: '$.tenderData',
      resultPath: '$.convertedData',
      // outputPath: '$.convertedData',
    })

    const analyzeTenderTask = new Task(this, 'Tender Analyze Task', {
      task: new InvokeFunction(stepTenderAnalyze),
      inputPath: '$.convertedData',
      resultPath: '$.analyzedData',
    });

    const storeTenderTask = new Task(this, 'Tender Store Task', {
      task: new InvokeFunction(stepTenderStore),
    });

    const mergeTenderTask = new Task(this, 'Tender Merge Task', {
      task: new InvokeFunction(stepTenderMerge),
    });

    const stepTenderIndexTask = new Task(this, 'Appsearch Index Task', {
      task: new InvokeFunction(stepTenderIndex),
    });

    const downloadTask = new Task(this, 'Download Task', {
      task: new InvokeFunction(downloadAttachments),
    });


    const chain = Chain.start(convertTenderTask)
    //.start(new Choice(this, 'Tender source ?')
    //.when(Condition.stringEquals('$.tenderFormat', 'tenderinfo'), convertTenderTask)
    //.when(Condition.stringEquals('$.tenderFormat', 'dgmarket'), convertTenderTask)
    //.afterwards()
      .next(analyzeTenderTask)
      .next(storeTenderTask)
      .next(mergeTenderTask)
      .next(stepTenderIndexTask)
      .next(downloadTask)
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

    xmlImport.addLayers(nodeLayer)
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
