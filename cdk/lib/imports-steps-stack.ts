import { Chain, Choice, Condition, Fail, StateMachine, Task } from '@aws-cdk/aws-stepfunctions';
import { InvokeFunction } from '@aws-cdk/aws-stepfunctions-tasks';
import { AssetCode, Function, Runtime, LayerVersion, ILayerVersion } from '@aws-cdk/aws-lambda';
import { S3EventSource, } from '@aws-cdk/aws-lambda-event-sources';
import { Construct, Stack, StackProps, Duration } from '@aws-cdk/core';
import s3 = require('@aws-cdk/aws-s3');
import iam = require('@aws-cdk/aws-iam');


interface ImportsStepsStackProps extends StackProps {
  nodeLayerArn: ILayerVersion;
}

export class ImportsStepsStack extends Stack {
  constructor(scope: Construct, id: string, props: ImportsStepsStackProps) {
    super(scope, id, props);

    const environment = {
      NODE_ENV: "dev",
      DB_HOST: "",
    }

    const sftpBucket = new s3.Bucket(this, 'sftpBucketDev', { versioned: false});
    //    const nodeLayer = LayerVersion.fromLayerVersionArn(scope, `${id}Layer`, props.nodeLayerArn)
    const nodeLayer = props.nodeLayerArn
    const appsearchIndex = new Function(this, 'AppsearchIndex', {
      runtime: Runtime.NODEJS_12_X,
      code: new AssetCode('../lambda/function/appsearchIndex'),
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

    appsearchIndex.addLayers(nodeLayer)
    downloadAttachments.addLayers(nodeLayer)

    const appsearchImportTask = new Task(this, 'Appsearch Import Task', {
      task: new InvokeFunction(appsearchIndex),
    });

    const downloadTask = new Task(this, 'Download Task', {
      task: new InvokeFunction(downloadAttachments),
    });


    const chain = Chain.start(appsearchImportTask)
      .next(downloadTask)
      /*      .next(
        isComplete
      .when(Condition.numberEquals('$.Status', 1), closeCase)
      .when(Condition.numberEquals('$.Status', 0), escalateCase.next(jobFailed)),
  );
       */
    const stateMachine = new StateMachine(this, 'StateMachine', {
      definition: chain,
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
  }
}
