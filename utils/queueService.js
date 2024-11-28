import { enrichData, saveProcessedData } from './apiService';

const RATE_LIMIT = 5; // Requests per second
const INTERVAL = 1000; // 1 second in milliseconds

export async function processBulkData(data, progressCallback) {
  const results = [];
  let processed = 0;

  for (let i = 0; i < data.length; i += RATE_LIMIT) {
    const batch = data.slice(i, i + RATE_LIMIT);
    const batchPromises = batch.map(item => enrichData(item, {
      findIndividualEmail: true,
      getCompanyEmails: true,
      enrichLinkedIn: true,
      findPhoneNumber: true
    }).catch(error => {
      console.error('Error processing item:', item, error);
      return { ...item, error: 'Processing failed' };
    }));

    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);

    // Save each processed item
    batchResults.forEach(result => {
      if (!result.error) {
        saveProcessedData(result);
      }
    });

    processed += batch.length;
    progressCallback((processed / data.length) * 100);

    if (i + RATE_LIMIT < data.length) {
      await new Promise(resolve => setTimeout(resolve, INTERVAL));
    }
  }

  return results;
}