import { Chain, Choice, Condition, Fail, StateMachine, IStateMachine,  LogLevel, Map, Succeed, Pass, Parallel, Wait, WaitTime } from '@aws-cdk/aws-stepfunctions';
import { LambdaInvoke } from '@aws-cdk/aws-stepfunctions-tasks';
import { AssetCode, Function, Runtime, LayerVersion } from '@aws-cdk/aws-lambda';
import { S3EventSource, } from '@aws-cdk/aws-lambda-event-sources';
import { Construct, Stack, StackProps, Duration, CfnOutput } from '@aws-cdk/core';
import { Secret } from '@aws-cdk/aws-secretsmanager';
import { Vpc } from '@aws-cdk/aws-ec2';
import s3 = require('@aws-cdk/aws-s3');
// import iam = require('@aws-cdk/aws-iam');
import logs = require('@aws-cdk/aws-logs');


export class DocumentStack extends Stack {
  public documentMachine: IStateMachine
  //  public cfnName: CfnOutput;

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
      reservedConcurrentExecutions: 1, // to change at 30
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
      memorySize: 1500,
      reservedConcurrentExecutions: 1, // to change at 30
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
      reservedConcurrentExecutions: 1, // to change at 30
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
      reservedConcurrentExecutions: 1, // to change at 30
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
      reservedConcurrentExecutions: 1, // to change at 30
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
      reservedConcurrentExecutions: 1, // to change at 30
      timeout: Duration.seconds(60),
      environment: {
        DOCUMENTS_BUCKET: documentsBucket.bucketName,
      }
    })

    stepDocumentDownload.addLayers(nodeLayer, deepblooLayer)
    stepPdfToImg.addLayers(ghostscripLayer, nodeLayer, deepblooLayer)
    stepPdfToBoxes.addLayers(pythonModulesLayer, helperLayer)
    stepHtmlToPdf.addLayers(pythonModulesLayer, helperLayer)
    stepZipExtraction.addLayers(pythonModulesLayer, helperLayer)
    stepTextToSentences.addLayers(pythonModulesLayer, helperLayer)

    dbSecret.grantRead(stepDocumentDownload)
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

    const processPdf = new Parallel(this, 'Pdf process', {})
      .branch(pdfToImgTask)
      .branch(pdfToBoxesTask
        .next(textToSentencesTask) // maybe later will accept all type of document text (docx, jpg, ...)
      )

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

    const logGroup = new logs.LogGroup(this, 'DocumentLogGroup');

    const documentMap = new Map(this, 'Document Map', {
      inputPath: '$.mergedData',
      itemsPath: '$.newSourceUrls',
      resultPath: '$.downloadedData',
      maxConcurrency: 2,
    }).iterator(documentIterator);

    // this.chain = Chain.start(downloadTask)
    //   .next(new Choice(this, 'Document type ?')
    //     .when(Condition.stringEquals('$.document.contentType', 'text/html'), processHtml)
    //     .when(Condition.or(
    //       Condition.stringEquals('$.document.contentType', 'image/png'),
    //       Condition.stringEquals('$.document.contentType', 'image/jpeg'),
    //     ), processImg)
    //     .when(Condition.stringEquals('$.document.contentType', 'application/pdf'), processPdf)
    //     .when(Condition.stringEquals('$.document.contentType', 'application/msword'), processDoc)
    //     .when(Condition.stringEquals('$.document.contentType',
    //       'application/vnd.openxmlformats-officedocument.wordprocessingml.document'), processDocx)
    //     .when(Condition.stringEquals('$.document.contentType', 'application/zip'), processZip)
    //     .otherwise(new Pass(this, 'Document type unknown'))
    //     .afterwards()
    //   )
    // const logGroup = new logs.LogGroup(this, 'DocumentProcessLogGroup');

    this.documentMachine = new StateMachine(this, 'DocumentProcess', {
      definition: documentMap,
      logs: {
        destination: logGroup,
        level: LogLevel.ERROR,
      },
      tracingEnabled: true,
    });

    // pass the arn of this stack
    /*
     this.cfnArn = new CfnOutput(this, "DocumentProcessArn", {
      value: stateMachine.stateMachineArn,
      exportName: "ExportedDocumentProcessArn"
    });

     // pass the name of this stack
     this.cfnName = new CfnOutput(this, "DocumentProcessName", {
      value: stateMachine.stateMachineName,
      exportName: "ExportedDocumentProcessName"
    });
     */
  }
}
