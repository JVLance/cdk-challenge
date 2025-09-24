import { SSM } from '@aws-sdk/client-ssm';

import { CDKChallengeHandler } from './index.types'

const ssm = new SSM();
const DYNAMIC_STRING_PARAMETER_NAME = process.env.DYNAMIC_STRING_PARAMETER_NAME

export const handler:CDKChallengeHandler = async () => {

    const result  = await ssm.getParameter({ Name: DYNAMIC_STRING_PARAMETER_NAME });
    const dynamic = result.Parameter?.Value;

    return `The saved string is ${dynamic}`;
};

