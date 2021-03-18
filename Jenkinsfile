pipeline {
  agent any

  environment {
    ENV = "${env.BRANCH_NAME == "develop" ? "dev" : env.BRANCH_NAME == "master" ? "prod" : env.BRANCH_NAME.matches("^release/.*") ? "stage" : "test"}"
    TEST_BUILD = ""
    GIT_USERNAME = sh(script: "git show -s --format='%aN' ${env.GIT_COMMIT}", returnStdout: true).toString().trim()

    TOPLEVEL = sh(script: '''pwd''', returnStdout: true).toString().trim()
    CUR_DATE=sh(script: "date +%F", returnStdout: true).toString().trim()
    IS_JENKINS_BUILD = "1"
    TMPDIR = "/var/lib/jenkins/tmp/"
    REPO = sh(script: "basename -s .git `git config --get remote.origin.url`", returnStdout: true).toString().trim()
  }

      stages {
        stage('Cleanup & Deps install') {
          steps {
            sh '''
              # ./tools/delete-untracked-files.sh

              # (echo $DIR_PATH | grep -Eq "(backend|frontend)"; if [[ $? = 0 ]] ; then yarn; fi) ||true
	      . tools/jenkins-env.sh
              set -xe;

              npm install
           '''
          }
          post {
            failure {
              slackSend channel: "#${env.ENV}", color: 'danger', message: "[${env.ENV.toUpperCase()}] ${env.BRANCH_NAME} deps ❌(last commit by ${env.GIT_USERNAME}): failure (<${env.BUILD_URL}/console|Open>)"
            }
          }
        }

        stage('Linting') {
          steps {
            sh '''
	      . tools/jenkins-env.sh
              set -xe;
              npm run lint
            '''
          }
          post {
            failure {
              slackSend channel: "#${env.ENV}", color: 'danger', message: "[${env.ENV.toUpperCase()}] ${env.BRANCH_NAME} lint ❌(last commit by ${env.GIT_USERNAME}): failure (<${env.BUILD_URL}/console|Open>)"
            }
          }
        }

        stage('Unit Test') {
          steps {
            sh '''
	      . tools/jenkins-env.sh
              set -xe;
	      (cd lambda/libjs && npm install)
              npm run test:unit
            '''
          }
          post {
            failure {
              slackSend channel: "#${env.ENV}", color: 'danger', message: "[${env.ENV.toUpperCase()}] ${env.BRANCH_NAME} unit test failed ❌(last commit by ${env.GIT_USERNAME}): failure (<${env.BUILD_URL}/console|Open>)"
            }
          }
        }

        stage('Build') {
          steps {
            sh '''
              set -xe;
	      . tools/jenkins-env.sh
              npm run build
            '''
          }
          post {
            failure {
              slackSend channel: "#${env.ENV}", color: 'danger', message: "[${env.ENV.toUpperCase()}] ${env.BRANCH_NAME} build failed ❌(last commit by ${env.GIT_USERNAME}): failure (<${env.BUILD_URL}/console|Open>)"
            }
          }
        }


        stage('Manual Judgment') {
          when {
            environment name: 'ENV', value: 'prod'
          }
          steps {
            input 'Manual judgment: upload and apply in prod ?'
          }
        }

        stage("Apply") {
          when {
            not {
                environment name: 'ENV', value: 'test'
            }
          }
          steps {
            sh '''
	      . tools/jenkins-env.sh
              set -xe;

              if [ "$TEST_BUILD" ] ; then
                exit
              fi

              echo "Deploy in ${ENV}"
              # $(./tools/assume_role.sh $ENV)
	      ssh deepbloo@172.31.1.146 ". ~/.nvm/nvm.sh ; cd platform/back && git pull && npm install && nohup npm run restart >> backend-nohup.log 2>&1"
              sleep 10
              aws cloudfront create-invalidation --distribution-id EEY9ER5MY2XRN --paths '/*'
              npm run deploy-all
            '''
          }
          post {
            success {
              slackSend channel: "#${env.ENV}", color: 'good', message: "[${env.ENV.toUpperCase()}] *${env.ENV}_${env.CUR_DATE}_${env.BUILD_NUMBER}* deployed ✅ (last commit by ${env.GIT_USERNAME}): success (<${env.BUILD_URL}/console|Open>)"
            }
            failure {
              slackSend channel: "#${env.ENV}", color: 'danger', message: "[${env.ENV.toUpperCase()}] ${env.BRANCH_NAME} apply ❌(last commit by ${env.GIT_USERNAME}): failure (<${env.BUILD_URL}/console|Open>)"
            }
          }
        }

        stage("Cleanup") {
          steps {
            sh '''
	      git clean -fdx .
            '''
          }
       }
     }
}
