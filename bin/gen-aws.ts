#!/usr/bin/env node
import * as cdk from '@aws-cdk/core';
import { NetworkStack     } from '../lib/network-stack';
import { SecurityStack    } from '../lib/security-stack';
import { ApplicationStack } from '../lib/application-stack';

const env =  { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION }

const app = new cdk.App();
const network     = new NetworkStack(app, "NetworkStack", { env: env });
const security    = new SecurityStack(app, "SecurityStack", { env: env });
const application = new ApplicationStack(app, "ApplicationStack", { env: env, security: security, network: network });
