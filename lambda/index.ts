import { CDKChallengeHandler } from './index.types'

export const handler:CDKChallengeHandler = async ({dynamic}) => {
    return `The saved string is ${dynamic}`;
};

