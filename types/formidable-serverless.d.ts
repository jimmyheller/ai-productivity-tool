// This is an alternative approach if the first one doesn't work
declare module 'formidable-serverless' {
    // Import formidable for types
    import * as formidable from 'formidable';

    // Re-export everything from formidable
    export * from 'formidable';

    // Export IncomingForm with the same interface as formidable.IncomingForm
    export const IncomingForm: typeof formidable.IncomingForm;
}