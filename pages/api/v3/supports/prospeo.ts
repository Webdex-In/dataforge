const API_BASE_URL = 'https://api.prospeo.io';
const API_KEY = process.env.NEXT_PUBLIC_PROSPEO_API_KEY;

/**
 * Makes an API call to the specified endpoint with provided data.
 * @param endpoint - API endpoint to call (e.g., '/email-finder').
 * @param data - Payload to send in the API request.
 * @returns A Promise resolving to the API response data.
 */
export async function callApi(endpoint: string, data: object): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-KEY': API_KEY!,
      },
      body: JSON.stringify(data),
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error(`API call failed: ${response.statusText}`, responseData);
      throw new Error(responseData.message || 'API call failed');
    }

    return responseData;
  } catch (error) {
    console.error('Error in callApi:', error);
    throw new Error('Internal server error');
  }
}
