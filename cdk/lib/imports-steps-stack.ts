import { Chain, Choice, Condition, Fail, StateMachine, Task } from '@aws-cdk/aws-stepfunctions';
import { InvokeFunction } from '@aws-cdk/aws-stepfunctions-tasks';
import { AssetCode, Function, Runtime, LayerVersion, S3EventSource, } from '@aws-cdk/aws-lambda';
import { Construct, Stack, StackProps, Duration } from '@aws-cdk/core';
import s3 = require('@aws-cdk/aws-s3');
import iam = require('@aws-cdk/aws-iam');


interface ImportStepStackProps extends StackProps {
  nodeLayerArn: string;
}

export class ImportStepStack extends Stack {
  constructor(scope: Construct, id: string, props: ImportStepStackProps) {
    super(scope, id, props);

    const environment = {
      NODE_ENV: "dev",
      DB_HOST: "",
    }

    const sftpBucket = new s3.Bucket(this, 'sftpBucketDev', { versioned: false});

    const nodeLayer = LayerVersion.fromLayerVersionArn(scope, id, props.nodeLayerArn)

    const xmlImport = new Function(this, 'XmlImport', {
      runtime: Runtime.NODEJS_12_X,
      code: new AssetCode('../lambda/function/xmlimport'),
      handler: 'index.handler',
      memorySize: 500,
      //      reservedConcurrentExecutions: 20,
      timeout: Duration.seconds(50),
      environment: {
        ...environment,
      }
    });

    
    //Trigger
    xmlImport.addEventSource(new S3EventSource(sftpBucket, {
      events: [ s3.EventType.OBJECT_CREATED ],
      filters: [{ prefix: 'incoming/', suffix: '.xml'}]
    }))
    sftpBucket.grantReadWrite(xmlImport)

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

    const downloadDocument = new Function(this, 'downloadDocument', {
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

    xmlImport.addLayers(nodeLayer)
    appsearchIndex.addLayers(nodeLayer)
    downloadDocument.addLayers(nodeLayer)

    const importTask = new Task(this, 'Import Task', {
      task: new InvokeFunction(xmlImport),
    });

    const downloadTask = new Task(this, 'Download Task', {
      task: new InvokeFunction(downloadAttachments),
    });


    const chain = Chain.start(importTask)
      .next(downloadTask)
      /*      .next(
        isComplete
      .when(Condition.numberEquals('$.Status', 1), closeCase)
      .when(Condition.numberEquals('$.Status', 0), escalateCase.next(jobFailed)),
  );
       */
    new StateMachine(this, 'StateMachine', {
      definition: chain,
    });

  }
}
