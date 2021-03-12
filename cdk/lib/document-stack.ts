import { Chain, Choice, Condition, StateMachine, IStateMachine,  LogLevel, Pass, Parallel } from '@aws-cdk/aws-stepfunctions';
import { LambdaInvoke } from '@aws-cdk/aws-stepfunctions-tasks';
import { AssetCode, Function, Runtime, LayerVersion } from '@aws-cdk/aws-lambda';
import { Construct, Stack, StackProps, Duration } from '@aws-cdk/core';
import { Secret } from '@aws-cdk/aws-secretsmanager';
import { Vpc } from '@aws-cdk/aws-ec2';
import s3 = require('@aws-cdk/aws-s3');
import logs = require('@aws-cdk/aws-logs');


export class DocumentStack extends Stack {
  public documentMachine: IStateMachine

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props)

    const environment = {
      NODE_ENV: "dev",
    }

    const secretArn = 'arn:aws:secretsmanager:eu-west-1:669031476932:secret:aurora-creds-faJRvx'
    const dbEnv = {
      DB_HOST: "serverless-test.cluster-cxvdonhye3yz.eu-west-1.rds.amazonaws.com",
      DB_SECRET: secretArn,
    }

    const documentsBucketArn = 'arn:aws:s3:::textractpipelinestack-documentsbucket9ec9deb9-mla8aarhzynj'
    const documentsBucket = s3.Bucket.fromBucketArn(this, 'DocumentsBucket', documentsBucketArn);

    const dbSecret = Secret.fromSecretAttributes(this, 'dbSecret', {
      secretArn,

      // If the secret is encrypted using a KMS-hosted CMK, either import or reference that key:
      // encryptionKey,
    });

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

    const stepDocumentDownload = new Function(this, 'downloadDocument', {
      runtime: Runtime.NODEJS_12_X,
      code: new AssetCode('../lambda/function/stepDocumentDownload'),
      handler: 'index.handler',
      memorySize: 500,
      reservedConcurrentExecutions: 30,
      timeout: Duration.seconds(60),
      vpc,
      environment: {
        ...environment,
        ...dbEnv,
        DOCUMENTS_BUCKET: documentsBucket.bucketName,
      }
    });

    const stepDocumentStore = new Function(this, 'storeDocument', {
      runtime: Runtime.NODEJS_12_X,
      code: new AssetCode('../lambda/function/stepDocumentStore'),
      handler: 'index.handler',
      memorySize: 500,
      reservedConcurrentExecutions: 30,
      timeout: Duration.seconds(60),
      vpc,
      environment: {
        ...environment,
        ...dbEnv,
      }
    });


    const stepPdfToImg = new Function(this, 'PdfToImg', {
      runtime: Runtime.NODEJS_12_X,
      code: new AssetCode('../lambda/function/pdftoimg'),
      handler: 'index.handler',
      memorySize: 1500,
      reservedConcurrentExecutions: 20,
      timeout: Duration.seconds(60),
      environment: {
        DOCUMENTS_BUCKET: documentsBucket.bucketName,
      }
    })

    const stepPdfToBoxes = new Function(this, 'PdfToBoxes', {
      runtime: Runtime.PYTHON_3_8,
      code: new AssetCode('../lambda/function/pdftobboxtext'),
      handler: 'lambda_function.lambda_handler',
      memorySize: 1720,
      reservedConcurrentExecutions: 20,
      timeout: Duration.seconds(120),
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
      reservedConcurrentExecutions: 20,
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
      reservedConcurrentExecutions: 20,
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
      reservedConcurrentExecutions: 20,
      timeout: Duration.seconds(60),
      environment: {
        DOCUMENTS_BUCKET: documentsBucket.bucketName,
      }
    })

    stepDocumentDownload.addLayers(nodeLayer, deepblooLayer)
    stepPdfToImg.addLayers(ghostscripLayer, nodeLayer, deepblooLayer)
    stepDocumentStore.addLayers(nodeLayer, deepblooLayer)
    stepPdfToBoxes.addLayers(pythonModulesLayer, helperLayer)
    stepHtmlToPdf.addLayers(pythonModulesLayer, helperLayer)
    stepZipExtraction.addLayers(pythonModulesLayer, helperLayer)
    stepTextToSentences.addLayers(pythonModulesLayer, helperLayer)

    dbSecret.grantRead(stepDocumentDownload)
    dbSecret.grantRead(stepDocumentStore)
    documentsBucket.grantReadWrite(stepDocumentDownload)
    documentsBucket.grantReadWrite(stepHtmlToPdf)
    documentsBucket.grantReadWrite(stepPdfToImg)
    documentsBucket.grantReadWrite(stepPdfToBoxes)
    documentsBucket.grantReadWrite(stepZipExtraction)
    documentsBucket.grantReadWrite(stepTextToSentences)

    const downloadTask = new LambdaInvoke(this, 'Download Task', {
      lambdaFunction: stepDocumentDownload,
      // inputPath: '$.convertedData',
      resultPath: '$.document',
      payloadResponseOnly: true,
    })


    const pdfToImgTask = new LambdaInvoke(this, 'Pdf to Image', {
      lambdaFunction: stepPdfToImg,
      inputPath: '$.document',
      resultPath: '$.pdf2img',
      payloadResponseOnly: true,
    })

    // Store task for each document that we want to save.(Cannot duplicate same Task)

    const documentStorePdfTask = new LambdaInvoke(this, 'Document Pdf Store', {
      lambdaFunction: stepDocumentStore,
      inputPath: '$.document',
      resultPath: '$.document',
      payloadResponseOnly: true,
    })

    const documentStorePdfBboxTask = new LambdaInvoke(this, 'Document Pdf Bbox Store', {
      lambdaFunction: stepDocumentStore,
      inputPath: '$.document',
      resultPath: '$.document',
      payloadResponseOnly: true,
    })

    const documentStorePdfSentencesTask = new LambdaInvoke(this, 'Document Pdf Sentences Store', {
      lambdaFunction: stepDocumentStore,
      inputPath: '$.document',
      resultPath: '$.document',
      payloadResponseOnly: true,
    })

    const documentStorePdfImageTask = new LambdaInvoke(this, 'Document Pdf Image Store', {
      lambdaFunction: stepDocumentStore,
      inputPath: '$.document',
      resultPath: '$.document',
      payloadResponseOnly: true,
    })

    const pdfToBoxesTask = new LambdaInvoke(this, 'Pdf to Boxes', {
      lambdaFunction: stepPdfToBoxes,
      inputPath: '$.document',
      resultPath: '$.document',
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

    const parallelProcessPdf = new Parallel(this, 'Pdf parallel process', {})
      .branch(documentStorePdfBboxTask)
      .branch(textToSentencesTask
        .next(documentStorePdfSentencesTask))

    const processPdf = new Parallel(this, 'Pdf process', {})
      .branch(documentStorePdfTask)
      .branch(pdfToImgTask
        .next(documentStorePdfImageTask))
      .branch(pdfToBoxesTask
        .next(parallelProcessPdf) // maybe later will accept all type of document text (docx, jpg, ...)
      )

    const processHtml = htmlToPdfTask
      .next(processPdf)

    const processImg = new Pass(this, 'Img process')

    const processZip = new Parallel(this, 'Zip process', {})
      .branch(zipExtractionTask)

    const documentProcess = Chain.start(downloadTask)
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

    const logGroup = new logs.LogGroup(this, 'DocumentLogGroup');

    this.documentMachine = new StateMachine(this, 'DocumentProcess', {
      definition: documentProcess,
      logs: {
        destination: logGroup,
        level: LogLevel.ERROR,
      },
      tracingEnabled: true,
    });
  }
}
