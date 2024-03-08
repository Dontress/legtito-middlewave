export interface createPushApiBody {
    apiKey: string;
    privateKey: string;
    domain: string;
    connectionName: string;
    triggerEvent: string;
    siteDisplayName: string;
}