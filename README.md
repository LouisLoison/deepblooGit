# Deepbloo Document Process :page_facing_up:

## Requirements
* `npm >= 7.0.15`
* `pipenv, version 2020.11.4`

## Get started
### Build
```bash
git clone https://github.com/deepbloo-team/platform.git
cd platform/
npm run local:install
```

### Test
```bash
npm run test:unit
```

### Start backend
```
cd back/
NODE_ENV=local DEBUG=1 npm run start
```
It will use the DEV environment database as of now

### Start backend, waiting debugger 

```
cd back/
NODE_ENV=local DEBUG=1 npm run start:brk

```

### Start frontend dev server
```
cd front/
npm run serve

```
It will use the local backend, and be accessible at http://localhost:8080/#/tenders

### Clean
```bash
npm run clean
```

## Deploy on CDK :cloud:
```bash
npm run deploy <STACK_NAME>
```

## Launch SAM :construction_worker:
```bash
npm run sam <STACK_NAME> <LAMBDA_NAME> <PATH_TO_EVENT>
```

## Launch unit tests and coverage :white_check_mark:
### Unit tests
```bash
npm install
npm run tests_run
npm run tests:unit
```

### Coverage
Same commands of [Unit tests](#unit-tests) except the last one.<br>
```bash
npm run cov
```
