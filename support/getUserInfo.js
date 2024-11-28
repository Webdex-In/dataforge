import axios from "axios";

export const fetchUserData = async (userId) => {
  try {
    if (!userId) {
      throw new Error("Not a valid user");
    }
    const response = await axios.post("/api/v1/get/userInfo", { userId });
    // Check if response contains user data
    if (response.data.resData) {
      return response.data.resData; // Return the user data if found
    } else {
      throw new Error("No user data found");
    }
  } catch (error) {
    // Handle errors and throw with a message
    throw new Error(error.response?.data?.error || error.message);
  }
};

export const getCreditInfo = async (userId) => {
  try {
    if (!userId) {
      throw new Error("Not a valid user");
    }
    const credit = await fetchUserData(userId);
    if (parseInt(credit.totalCredit) == 0 ) {
      return false; // Return false
    }
    return true; // Return true;
  } catch (error) {

    console.error("Error in getCredit:", error.message);
    return null;
  }
};

export const getCreditCount = async (userId) => {
  try {
    // Check if userId is provided
    if (!userId) {
      throw new Error("Not a valid user");
    }

    // Fetch user data based on userId
    const credit = await fetchUserData(userId);

    // Return total credit or null if not available
    return parseInt(credit?.totalCredit || null);
  } catch (error) {
    // Log any errors that occur during the process
    console.error("Error in getCredit:", error.message);
    return null;
  }
};

export const getAccessToken = async (userId) => {
  try {
    // Check if userId is provided
    if (!userId) {
      throw new Error("Not a valid user");
    }

    // Fetch user data based on userId
    const credit = await fetchUserData(userId);
    // Return total credit or null if not available
    return credit?.ApiKey || null;
  } catch (error) {
    // Log any errors that occur during the process
    console.error("Error in getCredit:", error.message);
    return null;
  }
};