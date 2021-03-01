# Deepbloo Document Process :page_facing_up:

## Requirements
* `npm >= 7.0.15`
* `pipenv, version 2020.11.4`

## Get started
### Build
```bash
git clone https://github.com/deepbloo-team/deepbloo-document-process.git
cd deepbloo-document-process/
npm install
```

### Clean
```bash
npm run clean
```

## Deploy on CDK :cloud:
```bash
cd cdk && npm run deploy <STACK_NAME>
```

## Launch SAM :construction_worker:
```bash
npm run sam <STACK_NAME> <LAMBDA_NAME> <PATH_TO_EVENT>
```

## Launch unit tests and coverage :white_check_mark:
### Unit tests
```bash
npm install
cd lambda/test/
pipenv shell
cd ../../
npm run tests_run
```

### Coverage
Same commands of [Unit tests](#unit-tests) except the last one.<br>
```bash
npm run cov
```
