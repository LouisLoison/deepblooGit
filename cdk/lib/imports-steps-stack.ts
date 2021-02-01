import { Chain, Choice, Condition, Fail, StateMachine, LogLevel, Map, Succeed, Pass, Parallel, Wait, WaitTime } from '@aws-cdk/aws-stepfunctions';
import { LambdaInvoke } from '@aws-cdk/aws-stepfunctions-tasks';
import { AssetCode, Function, Runtime, LayerVersion } from '@aws-cdk/aws-lambda';
import { S3EventSource, } from '@aws-cdk/aws-lambda-event-sources';
import { Construct, Stack, StackProps, Duration } from '@aws-cdk/core';
import { Secret } from '@aws-cdk/aws-secretsmanager';
import { Vpc } from '@aws-cdk/aws-ec2';
import s3 = require('@aws-cdk/aws-s3');
// import iam = require('@aws-cdk/aws-iam');
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

    const elasticSecretArn = "arn:aws:secretsmanager:eu-west-1:669031476932:secret:elastic-fnVFZr"

    const dbSecret = Secret.fromSecretAttributes(this, 'dbSecret', {
      secretArn,

      // If the secret is encrypted using a KMS-hosted CMK, either import or reference that key:
      // encryptionKey,
    });
    const appsearchSecret = Secret.fromSecretAttributes(this, 'appsearchSecret', {
      secretArn: appsearchSecretArn,
    });

    const elasticSecret = Secret.fromSecretAttributes(this, 'elasticSecret', {
      secretArn: elasticSecretArn,
    });

    const documentsBucketArn = 'arn:aws:s3:::textractpipelinestack-documentsbucket9ec9deb9-mla8aarhzynj'
    const documentsBucket = s3.Bucket.fromBucketArn(this, 'DocumentsBucket', documentsBucketArn);

    const sftpBucket = new s3.Bucket(this, 'sftpBucketDev', { versioned: false });

    const imageMagicLayer = LayerVersion.fromLayerVersionArn(this, 'ImageMagickLayer',"arn:aws:lambda:eu-west-1:669031476932:layer:image-magick:1")
    //    const nodeLayer = LayerVersion.fromLayerVersionArn(scope, `${id}Layer`, props.nodeLayerArn)
    const vpc = Vpc.fromVpcAttributes(this, 'Vpc', {
      vpcId: 'vpc-f7456f91',
      availabilityZones: ['eu-west-1a', 'eu-west-1b', 'eu-west-1c'],
      // publicSubnetIds: ['subnet-225d2a6a', 'subnet-a8d677f2', 'subnet-aff99dc9'],
      // publicSubnetIds: ['subnet-xxxxxx', 'subnet-xxxxxx', 'subnet-xxxxxx'],
      privateSubnetIds: ['subnet-0d44e4d2296bfd59f', 'subnet-0530f274ce7351e90', 'subnet-0530f274ce7351e90'],
    });

    // Helper Layer with helper functions
    const helperLayer = new LayerVersion(this, 'HelperLayer', {
      code: new AssetCode('../lambda/layer/helper'),
      compatibleRuntimes: [Runtime.PYTHON_3_8],
      license: 'Apache-2.0',
      description: 'Helper layer.',
    });

    // Textractor helper layer
    const textractorLayer = new LayerVersion(this, 'Textractor', {
      code: new AssetCode('../lambda/layer/textractor'),
      compatibleRuntimes: [Runtime.PYTHON_3_8],
      license: 'Apache-2.0',
      description: 'Textractor layer.',
    });

    const ghostscripLayer = new LayerVersion(this, 'GhostScript layer', { 
      code: new AssetCode('../lambda/layer/gs'),
      compatibleRuntimes: [Runtime.PYTHON_3_8, Runtime.NODEJS_12_X],
      license: 'Apache-2.0',
      description: 'GhostScript layer.',
    });

    // Python libs helper layer
    const pythonModulesLayer = new LayerVersion(this, 'PythonModules', {
      code: new AssetCode('../lambda/layer/pipenv'),
      compatibleRuntimes: [Runtime.PYTHON_3_8],
      license: 'Apache-2.0, MIT',
      description: 'Pipenv-installed pypi modules layer.',
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
      reservedConcurrentExecutions: 20,
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
      reservedConcurrentExecutions: 20,
      timeout: Duration.seconds(60),
      environment: {
        ...environment,
        ...appsearchEnv,
        ELASTIC_SECRET: elasticSecretArn,
      }
    });

    const stepDocumentDownload = new Function(this, 'downloadDocument', {
      runtime: Runtime.NODEJS_12_X,
      code: new AssetCode('../lambda/function/stepDocumentDownload'),
      handler: 'index.handler',
      memorySize: 500,
      reservedConcurrentExecutions: 40,
      timeout: Duration.seconds(60),
      vpc,
      environment: {
        ...environment,
        ...dbEnv,
        DOCUMENTS_BUCKET: documentsBucket.bucketName,
      }
    });

    const stepPdfToImg = new Function(this, 'PdfToImg', {
      runtime: Runtime.NODEJS_12_X,
      code: new AssetCode('../lambda/function/pdftoimg'),
      handler: 'index.handler',
      memorySize: 500,
      reservedConcurrentExecutions: 40,
      timeout: Duration.seconds(60),
      environment: {
        DOCUMENTS_BUCKET: documentsBucket.bucketName,
      }
    })

    const stepPdfToBoxes = new Function(this, 'PdfToBoxes', {
      runtime: Runtime.PYTHON_3_8,
      code: new AssetCode('../lambda/function/pdftobboxtext'),
      handler: 'lambda_function.lambda_handler',
      memorySize: 500,
      reservedConcurrentExecutions: 40,
      timeout: Duration.seconds(60),
      environment: {
        DOCUMENTS_BUCKET: documentsBucket.bucketName,
        // ELASTIC_QUEUE_URL: esIndexQueue.queueUrl,
        TEXTRACT_ONLY: "false", // "true" or "false"
        MIN_CHAR_NEEDED: "10", // if nb char found in PDF is inferior -> call textract
        EXTRACT_PDF_LINES: "true", // false -> extract by words, true -> extract by lines
      }
    })

    const stepHtmlToPdf = new Function(this, 'HtmlToPdf', {
      runtime: Runtime.PYTHON_3_8,
      code: new AssetCode('../lambda/function/htmltopdf'),
      handler: 'lambda_function.lambda_handler',
      memorySize: 500,
      reservedConcurrentExecutions: 40,
      timeout: Duration.seconds(60),
      environment: {
        DOCUMENTS_BUCKET: documentsBucket.bucketName,
      }
    })

    const stepZipExtraction = new Function(this, 'ZipExtraction', {
      runtime: Runtime.PYTHON_3_8,
      code: new AssetCode('../lambda/function/zipExtraction'),
      handler: 'lambda_function.lambda_handler',
      memorySize: 500,
      reservedConcurrentExecutions: 40,
      timeout: Duration.seconds(60),
      environment: {
        DOCUMENTS_BUCKET: documentsBucket.bucketName,
      }
    })

    const stepTextToSentences = new Function(this, 'textToSentences', {
      runtime: Runtime.PYTHON_3_8,
      code: new AssetCode('../lambda/function/textToSentences'),
      handler: 'lambda_function.lambda_handler',
      memorySize: 500,
      reservedConcurrentExecutions: 40,
      timeout: Duration.seconds(60),
      environment: {
        DOCUMENTS_BUCKET: documentsBucket.bucketName,
      }
    })

    stepTenderConvert.addLayers(nodeLayer, deepblooLayer)
    stepTenderAnalyze.addLayers(nodeLayer, deepblooLayer)
    stepTenderStore.addLayers(nodeLayer, deepblooLayer)
    stepTenderMerge.addLayers(nodeLayer, deepblooLayer)
    stepTenderIndex.addLayers(nodeLayer, deepblooLayer)
    stepDocumentDownload.addLayers(nodeLayer, deepblooLayer)
    stepPdfToImg.addLayers(ghostscripLayer, imageMagicLayer, nodeLayer, deepblooLayer)
    stepPdfToBoxes.addLayers(pythonModulesLayer, helperLayer)
    stepHtmlToPdf.addLayers(pythonModulesLayer, helperLayer)
    stepZipExtraction.addLayers(pythonModulesLayer, helperLayer)
    stepTextToSentences.addLayers(pythonModulesLayer, helperLayer)

    dbSecret.grantRead(stepTenderAnalyze)
    dbSecret.grantRead(stepTenderStore)
    dbSecret.grantRead(stepTenderMerge)
    dbSecret.grantRead(stepDocumentDownload)
    appsearchSecret.grantRead(stepTenderIndex)
    elasticSecret.grantRead(stepTenderIndex)
    documentsBucket.grantReadWrite(stepDocumentDownload)
    documentsBucket.grantReadWrite(stepHtmlToPdf)
    documentsBucket.grantReadWrite(stepPdfToImg)
    documentsBucket.grantReadWrite(stepPdfToBoxes)
    documentsBucket.grantReadWrite(stepZipExtraction)
    documentsBucket.grantReadWrite(stepTextToSentences)

    const convertTenderTask = new LambdaInvoke(this, 'Tender Conversion Task', {
      lambdaFunction: stepTenderConvert,
      inputPath: '$.tenderData',
      resultPath: '$.convertedData',
      // outputPath: '$.Payload',
      payloadResponseOnly: true,
    }).addRetry({
      backoffRate: 3,
      interval: Duration.seconds(3),
      maxAttempts: 4
    })

    const analyzeTenderTask = new LambdaInvoke(this, 'Tender Analyze Task', {
      lambdaFunction: stepTenderAnalyze,
      // inputPath: '$.convertedData',
      // resultPath: '$.analyzedData',
      payloadResponseOnly: true,
    }).addRetry({
      backoffRate: 3,
      interval: Duration.seconds(4),
      maxAttempts: 4
    })


    const storeTenderTask = new LambdaInvoke(this, 'Tender Store Task', {
      lambdaFunction: stepTenderStore,
      resultPath: '$.storedData',
      payloadResponseOnly: true,
    }).addRetry({
      backoffRate: 3,
      interval: Duration.seconds(5),
      maxAttempts: 4
    });



    const mergeTenderTask = new LambdaInvoke(this, 'Tender Merge Task', {
      lambdaFunction: stepTenderMerge,
      // inputPath: '$.storedData',
      resultPath: '$.mergedData',
      payloadResponseOnly: true,
    }).addRetry({
      backoffRate: 4,
      interval: Duration.seconds(3),
      maxAttempts: 4
    });



    const stepTenderIndexTask = new LambdaInvoke(this, 'Appsearch Index Task', {
      lambdaFunction: stepTenderIndex,
      resultPath: '$.appsearchResult',
      payloadResponseOnly: true,
    }).addRetry({
      backoffRate: 5,
      interval: Duration.seconds(3),
      maxAttempts: 4
    });

    const downloadFail = new Fail(this, 'documentFail', {
      error: 'WorkflowFailure',
      cause: "Download task failed"
    });

    const downloadTask = new LambdaInvoke(this, 'Download Task', {
      lambdaFunction: stepDocumentDownload,
      // inputPath: '$.convertedData',
      resultPath: '$.document',
      payloadResponseOnly: true,
    }).addCatch(downloadFail);


    const pdfToImgTask = new LambdaInvoke(this, 'Pdf to Image', {
      lambdaFunction: stepPdfToImg,
      inputPath: '$.document',
      resultPath: '$.pdf2img',
      payloadResponseOnly: true,
    })

    const pdfToBoxesTask = new LambdaInvoke(this, 'Pdf to Boxes', {
      lambdaFunction: stepPdfToBoxes,
      inputPath: '$.document',
      resultPath: '$.pdf2bbox',
      payloadResponseOnly: true,
    })

    const htmlToPdfTask = new LambdaInvoke(this, 'Html To Pdf', {
      lambdaFunction: stepHtmlToPdf,
      inputPath: '$.document',
      resultPath: '$.document',
      payloadResponseOnly: true,
    })

    const zipExtractionTask = new LambdaInvoke(this, 'Zip Extraction', {
      lambdaFunction: stepZipExtraction,
      inputPath: '$.document',
      resultPath: '$.document',
      payloadResponseOnly: true,
    })

    const textToSentencesTask = new LambdaInvoke(this, 'Text to Sentences', {
      lambdaFunction: stepTextToSentences,
      inputPath: '$.document',
      resultPath: '$.document',
      payloadResponseOnly: true,
    })

    const processDoc = new Pass(this, 'Doc/docx process')

    const processDocx = new Pass(this, 'Docx process')

    const processPdf = new Parallel(this, 'Pdf process', {})
      .branch(pdfToImgTask)
      .branch(pdfToBoxesTask)
      .next(textToSentencesTask) // maybe later will accept all type of document text (docx, jpg, ...)

    const processHtml = htmlToPdfTask
      .next(processPdf)

    const processImg = new Pass(this, 'Img process')

    const processZip = new Parallel(this, 'Zip process', {})
      .branch(zipExtractionTask)

    const documentIterator = downloadTask
      .next(new Choice(this, 'Document type ?')
        .when(Condition.stringEquals('$.document.contentType', 'text/html'), processHtml)
        .when(Condition.or(
          Condition.stringEquals('$.document.contentType', 'image/png'),
          Condition.stringEquals('$.document.contentType', 'image/jpeg'),
        ), processImg)
        .when(Condition.stringEquals('$.document.contentType', 'application/pdf'), processPdf)
        .when(Condition.stringEquals('$.document.contentType', 'application/msword'), processDoc)
        .when(Condition.stringEquals('$.document.contentType',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document'), processDocx)
        .when(Condition.stringEquals('$.document.contentType', 'application/zip'), processZip)
        .otherwise(new Pass(this, 'Document type unknown'))
        .afterwards()
      )

    const documentMap = new Map(this, 'Document Map', {
      inputPath: '$.mergedData',
      itemsPath: '$.newSourceUrls',
      resultPath: '$.downloadedData',
      maxConcurrency: 2,
    }).iterator(documentIterator);

    const noInterest = new Succeed(this, 'No interest', { comment: "e.g. tender has no CPV match" })
    const fullSucceed = new Succeed(this, 'Completed', { comment: "Tender fully available" })

    const initialWait = new Wait(this, 'Waiting for our turn', {
      time: WaitTime.secondsPath('$.startDelay')
    })

    const chain = Chain.start(initialWait)
      .next(convertTenderTask)
      .next(analyzeTenderTask)
      .next(new Choice(this, 'Has interest ?')
        .when(Condition.numberLessThan('$.formatedData.status', 20), noInterest)
        .otherwise(storeTenderTask
          .next(mergeTenderTask)
          .next(stepTenderIndexTask)
          .next(new Choice(this, 'Has documents ?')
            .when(Condition.booleanEquals('$.mergedData.hasDocuments', true), documentMap
              .next(fullSucceed)
            ).otherwise(fullSucceed)
          )
        )
      )


    const logGroup = new logs.LogGroup(this, 'MyLogGroup');

    const stateMachine = new StateMachine(this, 'StateMachine', {
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
