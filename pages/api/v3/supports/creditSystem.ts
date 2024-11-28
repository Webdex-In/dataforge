import axios from 'axios';

const BASEURL_V3 = process.env.NEXT_PUBLIC_BASE_URL_V3

const CREDIT_COSTS = {
  linkedinProfile: 1,  
  validEmail: 2,      
  phoneNumber: 15,    
};

export  function calculateCredits(usage) {
  return (
    usage.linkedinProfiles * CREDIT_COSTS.linkedinProfile +
    usage.validEmails * CREDIT_COSTS.validEmail +
    usage.phoneNumbers * CREDIT_COSTS.phoneNumber
  );
}

export async  function trackUsage(userId,type, count = 1) {
  const usage = {};
  const date = new Date().toISOString().split('T')[0];

  if (!usage[date]) {
    usage[date] = {
      linkedinProfiles: 0,
      validEmails: 0,
      phoneNumbers: 0,
    };
  }

  usage[date][type] += count;
  const formattedUsage = formatUsageData(usage);

  const payload = {
    userId:userId,
    usage: formattedUsage,
    dataType :"individual"
  };

  try {
    // Send a POST request to the API
    const response = await axios.post(`${BASEURL_V3}/api/v3/create/trackUsage`, payload);
  } catch (error) {
    console.error('Error tracking usage:', error);
  }
  // localStorage.setItem('usage', JSON.stringify(usage));


}


export function formatUsageData(usage) {
  const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format

  // Initialize the usage object for the API request
  const formattedUsage = {
    linkedinProfiles: 0,
    validEmails: 0,
    phoneNumbers: 0,
  };

  // Check if there is usage data for today
  if (usage[today]) {
    const dailyUsage = usage[today];

    // Add the values for each type, ensuring validEmails is an integer
    formattedUsage.linkedinProfiles += dailyUsage.linkedinProfiles || 0;

    // Remove any unwanted `[object Object]` entries and parse validEmails as an integer
    const validEmailCount = String(dailyUsage.validEmails)
      .replace(/\[object Object\]/g, '') // Remove any instances of [object Object]
      .replace(/[^0-9]/g, ''); // Remove any non-numeric characters

    formattedUsage.validEmails += parseInt(validEmailCount) || 0; // Ensure it's an integer
    formattedUsage.phoneNumbers += dailyUsage.phoneNumbers || 0;
  }

  return formattedUsage;
}




export async function getUsageData(startDate, endDate) {

  try {
    // Send a POST request to the API
    const response = await axios.post(`${BASEURL_V3}/api/v1/get/getUsage`);

      // const usage = JSON.parse(localStorage.getItem('usage') || '{}');
  const usage = response.data

  const filteredUsage = Object.entries(usage)
    .filter(([date]) => date >= startDate && date <= endDate)
    .reduce((acc, [date, data]) => {
      acc[date] = data;
      return acc;
    }, {});

  const totalUsage = Object.values(filteredUsage).reduce(
    (acc, day) => {
      Object.keys(day).forEach((key) => {
        acc[key] = (acc[key] || 0) + day[key];
      });
      return acc;
    },
    {}
  );

  const dailyCredits = Object.entries(filteredUsage).map(([date, data]) => ({
    date,
    credits: calculateCredits(data),
  }));

  return {
    totalUsage,
    dailyCredits,
    totalCredits: calculateCredits(totalUsage),
  };
  } catch (error) {
    console.error('Error tracking usage:', error);
  }


}

function transformData(data) {
  // Extract the first (and only) key from the input object
  const dateKey = Object.keys(data)[0];
  const usageData = data[dateKey];

  // Return the reformatted data
  return {
    
          files: usageData.files,
          entries: usageData.entries
  };
}
// Keep the bulk enrichment tracking for file statistics only
export async function trackBulkEnrichment(fileCount, entryCount) {
  const bulkData = JSON.parse(localStorage.getItem('bulkEnrichment') || '{}');
  const date = new Date().toISOString().split('T')[0];

  if (!bulkData[date]) {
    bulkData[date] = { files: 0, entries: 0 };
  }

  bulkData[date].files += fileCount;
  bulkData[date].entries += entryCount;

  const formattedUsage = transformData(bulkData);

  const payload = {
    userId:"test",
    usage: formattedUsage,
    dataType :"bulkEnrichment"
  };
  // console.log(payload)

  try {
    // Send a POST request to the API
    const response = await axios.post(`${BASEURL_V3}/api/v1/create/trackUsage`, payload);
  } catch (error) {
    console.error('Error tracking usage:', error);
  }

  // localStorage.setItem('bulkEnrichment', JSON.stringify(bulkData));
}

// export function getBulkEnrichmentData(startDate, endDate) {
//   const bulkData = JSON.parse(localStorage.getItem('bulkEnrichment') || '{}');
//   const filteredData = Object.entries(bulkData)
//     .filter(([date]) => date >= startDate && date <= endDate)
//     .reduce((acc, [date, data]) => {
//       acc[date] = data;
//       return acc;
//     }, {});

// return null;
// }