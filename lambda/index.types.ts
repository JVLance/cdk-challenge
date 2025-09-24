interface ReturningData {
    body: string
}

export type CDKChallengeHandler = (event: { dynamic : string}) => Promise<ReturningData>