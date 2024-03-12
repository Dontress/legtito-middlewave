export interface catchDocumentBody {
    eventType: string;
    files: { generated: [ data: string, fileName: string] };
}