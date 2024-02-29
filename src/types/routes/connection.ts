export interface createConnectionBody {
    apiKey: string;
    privateKey: string;
    domain: string;
    tenantId: string;
    clientId: string;
    clientSecret: string;
}

export interface deleteConnectionBody {
    apiKey: string;
    privateKey: string;
}