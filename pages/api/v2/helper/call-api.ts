import axios, { AxiosResponse } from 'axios';

const BASE_URL =process.env.NEXT_PUBLIC_PROSPEO_BASE_URL;
const API_KEY = process.env.NEXT_PUBLIC_PROSPEO_API_KEY;

interface ApiResponse {
  [key: string]: any; // Define based on the expected response structure
}

const callApi = async (route: string, data: Record<string, any>): Promise<ApiResponse> => {
  const url = `${BASE_URL}${route}`;
  const payloadData = {
    first_name: data.firstName,
    last_name: data.lastName,
    company: data.company,
    url:data.url,
    limit: 10,
    profile_only:data.profile_only,
    };


  try {
    const response: AxiosResponse<ApiResponse> = await axios.post(url, payloadData, {
      headers: {
        "Content-Type": "application/json",
        "X-KEY": API_KEY,
      },
    });

    return response.data;
  } catch (error) {
    console.error("API call failed:", error);
    throw error; 
  }
};

export default callApi;
