import * as cdk from '@aws-cdk/core';
import events = require('@aws-cdk/aws-events');
import iam = require('@aws-cdk/aws-iam');
import { S3EventSource, SqsEventSource, SnsEventSource, DynamoEventSource } from '@aws-cdk/aws-lambda-event-sources';
import sns = require('@aws-cdk/aws-sns');
import snsSubscriptions = require("@aws-cdk/aws-sns-subscriptions");
import sqs = require('@aws-cdk/aws-sqs');
import dynamodb = require('@aws-cdk/aws-dynamodb');
import lambda = require('@aws-cdk/aws-lambda');
import s3 = require('@aws-cdk/aws-s3');
// import {LambdaFunction} from "@aws-cdk/aws-events-targets";
// import * as efs from '@aws-cdk/aws-efs';
// import * as ec2 from '@aws-cdk/aws-ec2';

export class TextractPipelineStack extends cdk.Stack {
//  readonly nodeLayerArn: lambda.ILayerVersion;

  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here
    
    //**********SNS Topics******************************
    const jobCompletionTopic = new sns.Topic(this, 'JobCompletion');

    //**********IAM Roles******************************
    const textractServiceRole = new iam.Role(this, 'TextractServiceRole', {
      assumedBy: new iam.ServicePrincipal('textract.amazonaws.com')
    });
    textractServiceRole.addToPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        resources: [jobCompletionTopic.topicArn],
        actions: ["sns:Publish"]
      })
    );


    //**********S3 Batch Operations Role******************************
    const s3BatchOperationsRole = new iam.Role(this, 'S3BatchOperationsRole', {
      assumedBy: new iam.ServicePrincipal('batchoperations.s3.amazonaws.com')
    });

    //**********S3 Bucket******************************
    //S3 bucket for input documents and output
    const contentBucket = new s3.Bucket(this, 'DocumentsBucket', { versioned: false});

    const outputBucket = new s3.Bucket(this, 'OutputBucket', { versioned: false});
    new cdk.CfnOutput(this, 'CONTENT_BUCKET', { value: contentBucket.bucketArn });
    new cdk.CfnOutput(this, 'OUTPUT_BUCKET', { value: outputBucket.bucketArn });

    const existingContentBucket = new s3.Bucket(this, 'ExistingDocumentsBucket', { versioned: false});
    existingContentBucket.grantReadWrite(s3BatchOperationsRole)

    const inventoryAndLogsBucket = new s3.Bucket(this, 'InventoryAndLogsBucket', { versioned: false});
    inventoryAndLogsBucket.grantReadWrite(s3BatchOperationsRole)

    /***********   EFS Shared Filesystem ***************/
    /*
    const vpc = ec2.Vpc.fromLookup(this, 'VPC', { vpcName: 'Default VPC' });
    // const vpcSubnets = vpc.selectSubnets();
    const fileSystem = new efs.FileSystem(this, 'LambdaShare', {
      vpc,
      //  vpcSubnets,
      encrypted: true,
      lifecyclePolicy: efs.LifecyclePolicy.AFTER_14_DAYS,
      performanceMode: efs.PerformanceMode.GENERAL_PURPOSE,
      throughputMode: efs.ThroughputMode.BURSTING
    });

    const accessPoint = fileSystem.addAccessPoint('LambdaAccessPoint', {
      path: '/',
      createAcl: {
        ownerUid: '1001',
        ownerGid: '1001',
	permissions: '750',
      },
      posixUser: {
        uid: '1001',
        gid: '1001',
      },
    });
    */

    //**********DynamoDB Table*************************
    //DynamoDB table with links to output in S3
    const outputTable = new dynamodb.Table(this, 'OutputTable', {
      partitionKey: { name: 'documentId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'outputType', type: dynamodb.AttributeType.STRING }
    });

    //DynamoDB table with links to output in S3
    const documentsTable = new dynamodb.Table(this, 'DocumentsTable', {
      partitionKey: { name: 'documentId', type: dynamodb.AttributeType.STRING },
      stream: dynamodb.StreamViewType.NEW_IMAGE
    });

    //**********SQS Queues*****************************
    //DLQ
    const dlq = new sqs.Queue(this, 'DLQ', {
      visibilityTimeout: cdk.Duration.seconds(30), retentionPeriod: cdk.Duration.seconds(1209600)
    });

    //Input Queue for sync jobs
    const syncJobsQueue = new sqs.Queue(this, 'SyncJobs', {
      visibilityTimeout: cdk.Duration.seconds(30), retentionPeriod: cdk.Duration.seconds(1209600), deadLetterQueue : { queue: dlq, maxReceiveCount: 50}
    });

    //Input Queue for async jobs
    const asyncJobsQueue = new sqs.Queue(this, 'AsyncJobs', {
      visibilityTimeout: cdk.Duration.seconds(60), retentionPeriod: cdk.Duration.seconds(1209600), deadLetterQueue : { queue: dlq, maxReceiveCount: 50}
    });

    //Queue
    const jobResultsQueue = new sqs.Queue(this, 'JobResults', {
      visibilityTimeout: cdk.Duration.seconds(900), retentionPeriod: cdk.Duration.seconds(1209600), deadLetterQueue : { queue: dlq, maxReceiveCount: 50}
    });

    //ES send queue
    const esIndexQueue = new sqs.Queue(this, 'ElasticIndexDocument', {
      visibilityTimeout: cdk.Duration.seconds(60), retentionPeriod: cdk.Duration.seconds(1209600), deadLetterQueue : { queue: dlq, maxReceiveCount: 50}
    });

    //PDF2Img send queue
    const pdftoimgQueue = new sqs.Queue(this, 'PdfToImg', {
      visibilityTimeout: cdk.Duration.seconds(60), retentionPeriod: cdk.Duration.seconds(1209600), deadLetterQueue : { queue: dlq, maxReceiveCount: 50}
    });
    
    //HTML2BoundingBox send queue
    const htmltoboundingboxQueue = new sqs.Queue(this, 'HtmlToBoundingBoxQueue', {
      visibilityTimeout: cdk.Duration.seconds(60), retentionPeriod: cdk.Duration.seconds(1209600), deadLetterQueue : { queue: dlq, maxReceiveCount: 50}
    });

    //PDFtoBBOX send queue
    const pdfToBoundingBoxAndTextQueue = new sqs.Queue(this, 'PdfToBoundingBoxAndTextQueue', {
      visibilityTimeout: cdk.Duration.seconds(60), retentionPeriod: cdk.Duration.seconds(1209600), deadLetterQueue : { queue: dlq, maxReceiveCount: 50}
    });

    const zipExtractionQueue = new sqs.Queue(this, 'zipExtractionQueue', {
      visibilityTimeout: cdk.Duration.seconds(60), retentionPeriod: cdk.Duration.seconds(1209600), deadLetterQueue : { queue: dlq, maxReceiveCount: 50}
    })



    //Trigger
    //jobCompletionTopic.subscribeQueue(jobResultsQueue);
    jobCompletionTopic.addSubscription(
      new snsSubscriptions.SqsSubscription(jobResultsQueue)
    );

    //**********Lambda Functions******************************

    // Helper Layer with helper functions
    const helperLayer = new lambda.LayerVersion(this, 'HelperLayer', {
      code: lambda.Code.fromAsset('../lambda/layer/helper'),
      compatibleRuntimes: [lambda.Runtime.PYTHON_3_8],
      license: 'Apache-2.0',
      description: 'Helper layer.',
    });

    // Textractor helper layer
    const textractorLayer = new lambda.LayerVersion(this, 'Textractor', {
      code: lambda.Code.fromAsset('../lambda/layer/textractor'),
      compatibleRuntimes: [lambda.Runtime.PYTHON_3_8],
      license: 'Apache-2.0',
      description: 'Textractor layer.',
    });

    // Python libs helper layer
    const pythonModulesLayer = new lambda.LayerVersion(this, 'PythonModules', {
      code: lambda.Code.fromAsset('../lambda/layer/pipenv'),
      compatibleRuntimes: [lambda.Runtime.PYTHON_3_8],
      license: 'Apache-2.0, MIT',
      description: 'Pipenv-installed pypi modules layer.',
    });

    // Ghostscript imported layer
    // const ghostscriptLayer = lambda.LayerVersion.fromLayerVersionArn("arn:aws:lambda:eu-west-1:764866452798:layer:ghostscript:8");

    // Node libs helper layer
    const nodeModulesLayer = new lambda.LayerVersion(this, 'NodeModules', {
      code: lambda.Code.fromAsset('../lambda/layer/npm'),
      compatibleRuntimes: [lambda.Runtime.NODEJS_12_X],
      license: 'Apache-2.0, MIT',
      description: 'Old backend and dependencies layer.',
    });

    // this.nodeLayerArn = nodeModulesLayer;

    // new cdk.CfnOutput(this, 'NODE_LAYER_ARN', { value: nodeModulesLayer.layerVersionArn });


    //------------------------------------------------------------

    // S3 Event processor
    const s3Processor = new lambda.Function(this, 'S3Processor', {
      runtime: lambda.Runtime.PYTHON_3_8,
      code: lambda.Code.asset('../lambda/function/s3processor'),
      handler: 'lambda_function.lambda_handler',
      // vpc,
      // allowPublicSubnet: true,
      // filesystem: lambda.FileSystem.fromEfsAccessPoint(accessPoint, '/mnt/data'),
      environment: {
        SYNC_QUEUE_URL: syncJobsQueue.queueUrl,
        ASYNC_QUEUE_URL: asyncJobsQueue.queueUrl,
        PDFTOIMG_QUEUE_URL: pdftoimgQueue.queueUrl,
        DOCUMENTS_TABLE: documentsTable.tableName,
        OUTPUT_TABLE: outputTable.tableName
      }
    });
    //Layer
    s3Processor.addLayers(helperLayer)
    //Trigger
    s3Processor.addEventSource(new S3EventSource(contentBucket, {
      events: [ s3.EventType.OBJECT_CREATED ],
      filters: [{ prefix: 'tenders/'}]
    }));
    //Permissions
    documentsTable.grantReadWriteData(s3Processor)
    syncJobsQueue.grantSendMessages(s3Processor)
    asyncJobsQueue.grantSendMessages(s3Processor)
    pdftoimgQueue.grantSendMessages(s3Processor)

    //------------------------------------------------------------

    // S3 Batch Operations Event processor 
    const s3BatchProcessor = new lambda.Function(this, 'S3BatchProcessor', {
      runtime: lambda.Runtime.PYTHON_3_8,
      code: lambda.Code.asset('../lambda/function/s3batchprocessor'),
      handler: 'lambda_function.lambda_handler',
      environment: {
        DOCUMENTS_TABLE: documentsTable.tableName,
        OUTPUT_TABLE: outputTable.tableName
      },
      reservedConcurrentExecutions: 1,
    });
    //Layer
    s3BatchProcessor.addLayers(helperLayer)
    //Permissions
    documentsTable.grantReadWriteData(s3BatchProcessor)
    s3BatchProcessor.grantInvoke(s3BatchOperationsRole)
    s3BatchOperationsRole.addToPolicy(
      new iam.PolicyStatement({
        actions: ["lambda:*"],
        resources: ["*"]
      })
    );
    //------------------------------------------------------------

    // Document processor (Router to Sync/Async Pipeline)
    const documentProcessor = new lambda.Function(this, 'TaskProcessor', {
      runtime: lambda.Runtime.PYTHON_3_8,
      code: lambda.Code.asset('../lambda/function/documentprocessor'),
      handler: 'lambda_function.lambda_handler',
      environment: {
        PDFTOIMG_QUEUE_URL: pdftoimgQueue.queueUrl,
        SYNC_QUEUE_URL: syncJobsQueue.queueUrl,
        ASYNC_QUEUE_URL: asyncJobsQueue.queueUrl,
        HTMLTOBOUNDINGBOX_QUEUE_URL: htmltoboundingboxQueue.queueUrl,
        PDFTOBOUNDINGBOXANDTEXT_QUEUE_URL: pdfToBoundingBoxAndTextQueue.queueUrl
      }
    });
    //Layer
    documentProcessor.addLayers(helperLayer)
    //Trigger
    documentProcessor.addEventSource(new DynamoEventSource(documentsTable, {
      startingPosition: lambda.StartingPosition.TRIM_HORIZON
    }));

    //Permissions
    documentsTable.grantReadWriteData(documentProcessor)
    syncJobsQueue.grantSendMessages(documentProcessor)
    asyncJobsQueue.grantSendMessages(documentProcessor)
    pdftoimgQueue.grantSendMessages(documentProcessor)
    htmltoboundingboxQueue.grantSendMessages(documentProcessor)
    pdfToBoundingBoxAndTextQueue.grantSendMessages(documentProcessor)
    zipExtractionQueue.grantSendMessages(documentProcessor)

    //------------------------------------------------------------

    // Sync Jobs Processor (Process jobs using sync APIs)
    const syncProcessor = new lambda.Function(this, 'SyncProcessor', {
      runtime: lambda.Runtime.PYTHON_3_8,
      code: lambda.Code.asset('../lambda/function/syncprocessor'),
      handler: 'lambda_function.lambda_handler',
      reservedConcurrentExecutions: 1,
      timeout: cdk.Duration.seconds(25),
      environment: {
        OUTPUT_TABLE: outputTable.tableName,
        DOCUMENTS_TABLE: documentsTable.tableName,
        AWS_DATA_PATH : "models"
      }
    });
    //Layer
    syncProcessor.addLayers(helperLayer)
    syncProcessor.addLayers(textractorLayer)
    //Trigger
    syncProcessor.addEventSource(new SqsEventSource(syncJobsQueue, {
      batchSize: 1
    }));
    //Permissions
    contentBucket.grantReadWrite(syncProcessor)
    existingContentBucket.grantReadWrite(syncProcessor)
    outputTable.grantReadWriteData(syncProcessor)
    documentsTable.grantReadWriteData(syncProcessor)
    syncProcessor.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ["textract:*"],
        resources: ["*"]
      })
    );

    //------------------------------------------------------------

    // Async Job Processor (Start jobs using Async APIs)
    const asyncProcessor = new lambda.Function(this, 'ASyncProcessor', {
      runtime: lambda.Runtime.PYTHON_3_8,
      code: lambda.Code.asset('../lambda/function/asyncprocessor'),
      handler: 'lambda_function.lambda_handler',
      reservedConcurrentExecutions: 1,
      timeout: cdk.Duration.seconds(50),
      memorySize: 128,
      environment: {
        ASYNC_QUEUE_URL: asyncJobsQueue.queueUrl,
        SNS_TOPIC_ARN : jobCompletionTopic.topicArn,
        SNS_ROLE_ARN : textractServiceRole.roleArn,
        AWS_DATA_PATH : "models"
      }
    });
    //asyncProcessor.addEnvironment("SNS_TOPIC_ARN", textractServiceRole.topicArn)

    //Layer
    asyncProcessor.addLayers(helperLayer)
    //Triggers
    // Run async job processor every 5 minutes
    //Enable code below after test deploy
    /* const rule = new events.Rule(this, 'Rule', {
       schedule: events.Schedule.expression('rate(2 minutes)')
     });
     rule.addTarget(new LambdaFunction(asyncProcessor));
    */
    //Run when a job is successfully complete
    // disabled as it seems unusefull
    // asyncProcessor.addEventSource(new SnsEventSource(jobCompletionTopic))
    //
    asyncProcessor.addEventSource(new SqsEventSource(asyncJobsQueue, {
      batchSize: 1
    }));

    //Permissions
    contentBucket.grantRead(asyncProcessor)
    existingContentBucket.grantReadWrite(asyncProcessor)
    asyncJobsQueue.grantConsumeMessages(asyncProcessor)
    asyncProcessor.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ["iam:PassRole"],
        resources: [textractServiceRole.roleArn]
      })
    );
    asyncProcessor.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ["textract:*"],
        resources: ["*"]
      })
    );
    //------------------------------------------------------------

    // Async Jobs Results Processor
    const jobResultProcessor = new lambda.Function(this, 'JobResultProcessor', {
      runtime: lambda.Runtime.PYTHON_3_8,
      code: lambda.Code.asset('../lambda/function/jobresultprocessor'),
      handler: 'lambda_function.lambda_handler',
      memorySize: 1500,
      reservedConcurrentExecutions: 20,
      timeout: cdk.Duration.seconds(900),
      environment: {
        ELASTIC_QUEUE_URL: esIndexQueue.queueUrl,
        OUTPUT_BUCKET: outputBucket.bucketName,
        OUTPUT_TABLE: outputTable.tableName,
        DOCUMENTS_TABLE: documentsTable.tableName,
        AWS_DATA_PATH : "models"
      }
    });
    //Layer
    jobResultProcessor.addLayers(helperLayer)
    jobResultProcessor.addLayers(textractorLayer)
    //Triggers
    jobResultProcessor.addEventSource(new SqsEventSource(jobResultsQueue, {
      batchSize: 1
    }));
    //Permissions
    outputTable.grantReadWriteData(jobResultProcessor)
    documentsTable.grantReadWriteData(jobResultProcessor)
    contentBucket.grantRead(jobResultProcessor)
    outputBucket.grantReadWrite(jobResultProcessor)
    existingContentBucket.grantRead(jobResultProcessor)
    esIndexQueue.grantSendMessages(jobResultProcessor)
    jobResultProcessor.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ["textract:*"],
        resources: ["*"]
      })
    );

    // Elastic search Indexer
    const appsearchIndexer = new lambda.Function(this, 'AppsearchIndexer', {
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.asset('../lambda/function/appsearchindexer'),
      handler: 'index.handler',
      memorySize: 1500,
      reservedConcurrentExecutions: 20,
      timeout: cdk.Duration.seconds(50),
      environment: {
        /*
        ELASTIC_HOST: "a85bb760f6f74e4bbb19f9928e3ba878.eu-west-1.aws.found.io",
        ELASTIC_PORT: "9243",
        ELASTIC_USER: "elastic",
        OUTPUT_TABLE: outputTable.tableName,
        DOCUMENTS_TABLE: documentsTable.tableName,
        ASYNC_QUEUE_URL: asyncJobsQueue.queueUrl,
        */
      }
    });
    //Layer
    appsearchIndexer.addLayers(nodeModulesLayer)
    //Triggers
    appsearchIndexer.addEventSource(new SqsEventSource(esIndexQueue, {
      batchSize: 1
    }));
    //Permissions
    //outputTable.grantReadWriteData(appsearchIndexer)
    //documentsTable.grantReadWriteData(appsearchIndexer)
    //contentBucket.grantReadWrite(appsearchIndexer)
    outputBucket.grantRead(appsearchIndexer)
    //existingContentBucket.grantReadWrite(appsearchIndexer)

    // Pdf to Image converter
    const pdfToImg = new lambda.Function(this, 'Pdf2Img', {
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.asset('../lambda/function/pdftoimg'),
      handler: 'lambda_function.lambda_handler',
      memorySize: 1500,
      reservedConcurrentExecutions: 20,
      timeout: cdk.Duration.seconds(30),
      environment: {
        PDFTOIMG_QUEUE_URL: pdftoimgQueue.queueUrl,
        OUTPUT_BUCKET: outputBucket.bucketName,
        OUTPUT_TABLE: outputTable.tableName,
        DOCUMENTS_TABLE: documentsTable.tableName,
      }
    });
    //Layer
    // pdfToImg.addLayers(ghostscriptLayer)
    // pdfToImg.addLayers(textractorLayer)
    pdfToImg.addLayers(nodeModulesLayer)
    //Triggers
    pdfToImg.addEventSource(new SqsEventSource(syncJobsQueue, {
      batchSize: 1
    }));

    /*
    s3Processor.addEventSource(new S3EventSource(contentBucket, {
      events: [ s3.EventType.OBJECT_CREATED ],
      filters: [ { prefix: 'tenders/', suffix: 'pdf' } ]
    }));
    */

    //Permissions
    outputTable.grantReadWriteData(pdfToImg)
    documentsTable.grantReadWriteData(pdfToImg)
    contentBucket.grantRead(pdfToImg)
    outputBucket.grantReadWrite(pdfToImg)
    existingContentBucket.grantRead(pdfToImg)


    // Async Job Processor (Start jobs using Async APIs)
    const htmlToBoundingBox = new lambda.Function(this, 'HtmlToBoundingBox', {
      runtime: lambda.Runtime.PYTHON_3_8,
      code: lambda.Code.asset('../lambda/function/htmltoboundingbox'),
      handler: 'lambda_function.lambda_handler',
      reservedConcurrentExecutions: 1,
      timeout: cdk.Duration.seconds(50),
      memorySize: 1280,
      environment: {
        OUTPUT_BUCKET: outputBucket.bucketName,
        OUTPUT_TABLE: outputTable.tableName,
        PDFTOBOUNDINGBOXANDTEXT_QUEUE_URL: pdfToBoundingBoxAndTextQueue.queueUrl
      }
    });

    //Layer
    htmlToBoundingBox.addLayers(pythonModulesLayer)
    htmlToBoundingBox.addLayers(helperLayer)

    htmlToBoundingBox.addEventSource(new SqsEventSource(htmltoboundingboxQueue, {
      batchSize: 1
    }));

    //Permissions
    contentBucket.grantRead(htmlToBoundingBox)
    existingContentBucket.grantReadWrite(htmlToBoundingBox)
    outputBucket.grantReadWrite(htmlToBoundingBox)
    htmltoboundingboxQueue.grantConsumeMessages(htmlToBoundingBox)
    //--------------
    // PDF Generator
    /*
    const pdfGenerator = new lambda.Function(this, 'PdfGenerator', {
      runtime: lambda.Runtime.JAVA_8,
      code: lambda.Code.asset('../lambda/function/pdfgenerator'),
      handler: 'DemoLambdaV2::handleRequest',
      memorySize: 3000,
      timeout: cdk.Duration.seconds(900),
    });
    contentBucket.grantReadWrite(pdfGenerator)
    existingContentBucket.grantReadWrite(pdfGenerator)
    pdfGenerator.grantInvoke(syncProcessor)
    pdfGenerator.grantInvoke(asyncProcessor)
    */

    // Zip extraction lambda
    const zipExtraction = new lambda.Function(this, 'zipExtraction', {
      runtime: lambda.Runtime.PYTHON_3_8,
      code: lambda.Code.asset('../lambda/function/zipExtraction'),
      handler: 'lambda_function.lambda_handler',
      reservedConcurrentExecutions: 1,
      timeout: cdk.Duration.seconds(50),
      memorySize: 1280,
      environment: {
        OUTPUT_BUCKET: outputBucket.bucketName,
        OUTPUT_TABLE: outputTable.tableName,
        ELASTIC_QUEUE_URL: esIndexQueue.queueUrl,
      }
    });

    zipExtraction.addLayers(pythonModulesLayer);
    zipExtraction.addLayers(helperLayer);
    zipExtraction.addEventSource(new SqsEventSource(zipExtractionQueue, {
      batchSize: 1
    }));
    // Permissions
    zipExtractionQueue.grantSendMessages(zipExtraction)
    contentBucket.grantRead(zipExtraction)
    existingContentBucket.grantReadWrite(zipExtraction)
    outputBucket.grantReadWrite(zipExtraction)

    // Async Job Processor (Start jobs using Async APIs)
    const pdfToBoundingBox = new lambda.Function(this, 'PdfToBboxAndText', {
      runtime: lambda.Runtime.PYTHON_3_8,
      code: lambda.Code.asset('../lambda/function/pdftobboxtext'),
      handler: 'lambda_function.lambda_handler',
      reservedConcurrentExecutions: 1,
      timeout: cdk.Duration.seconds(50),
      memorySize: 1280,
      environment: {
        OUTPUT_BUCKET: outputBucket.bucketName,
        OUTPUT_TABLE: outputTable.tableName,
        ELASTIC_QUEUE_URL: esIndexQueue.queueUrl,
        TEXTRACT_ONLY: "false", // "true" or "false"
        MIN_CHAR_NEEDED: "10", // if nb char found in PDF is inferior -> call textract
        EXTRACT_PDF_LINES: "true",
      }
    });

     //Layer
    pdfToBoundingBox.addLayers(pythonModulesLayer)
    pdfToBoundingBox.addLayers(helperLayer)

    pdfToBoundingBox.addEventSource(new SqsEventSource(pdfToBoundingBoxAndTextQueue, {
      batchSize: 1
    }));

    // Permissions
    contentBucket.grantRead(pdfToBoundingBox)
    existingContentBucket.grantReadWrite(pdfToBoundingBox)
    outputBucket.grantReadWrite(pdfToBoundingBox)
    pdfToBoundingBoxAndTextQueue.grantConsumeMessages(pdfToBoundingBox)
    // Allow to write to the pdf queue
    pdfToBoundingBoxAndTextQueue.grantSendMessages(htmlToBoundingBox)
    // Allow to write pdf in textract queue
    esIndexQueue.grantSendMessages(pdfToBoundingBox)
  }
}
