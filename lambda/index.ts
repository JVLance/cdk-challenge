import { CDKChallengeHandler } from './index.types'

export const handler:CDKChallengeHandler = async ({dynamic}) => {
    return {
        body: `<h1>The saved string is ${dynamic}</h1>`
    };
};

