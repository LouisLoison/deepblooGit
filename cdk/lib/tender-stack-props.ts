import { StackProps } from '@aws-cdk/core';

export interface TenderStackProps extends StackProps {
  readonly documentStackArn: string;
  readonly documentStackName: string;
}