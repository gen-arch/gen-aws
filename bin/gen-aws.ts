#!/usr/bin/env node
import * as cdk from '@aws-cdk/core';
import { NetworkStack     } from '../lib/network-stack';
import { SecurityStack    } from '../lib/security-stack';
import { ApplicationStack } from '../lib/application-stack';

const mgmt =  { account: "681514512350", region: "ap-northeast-1" }
const prod =  { account: "724972949663", region: "ap-northeast-1" }
const dev  =  { account: "241384218407", region: "ap-northeast-1" }

const env = prod
const app = new cdk.App();
const network     = new NetworkStack(app,     "NetworkStack",     { env: env });
const security    = new SecurityStack(app,    "SecurityStack",    { env: env });
const application = new ApplicationStack(app, "ApplicationStack", { env: env, security: security, network: network});
