interface returningData {
    body: string
}

export type CDKChallengeHandler = (event: { dynamic : string}) => Promise<returningData>