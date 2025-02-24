import { createAzure } from '@ai-sdk/azure';
import { env } from "@/env";

export const azure = createAzure({
    resourceName: env.AZURE_RESOURCE_NAME,
    apiKey: env.AZURE_API_KEY,
});