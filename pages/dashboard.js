import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { format, subDays, parseISO } from 'date-fns';
import { getUsageData, getBulkEnrichmentData } from '../utils/creditSystem';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function Dashboard() {
  const [usageData, setUsageData] = useState(null);
  const [bulkData, setBulkData] = useState(null);
  const [startDate, setStartDate] = useState(subDays(new Date(), 30));
  const [endDate, setEndDate] = useState(new Date());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const fetchData = async () => {
      try {
        const usage = await getUsageData(format(startDate, 'yyyy-MM-dd'), format(endDate, 'yyyy-MM-dd'));
        const bulk = await getBulkEnrichmentData(format(startDate, 'yyyy-MM-dd'), format(endDate, 'yyyy-MM-dd'));
        
        // console.log('Fetched usage data:', usage);
        // console.log('Fetched bulk data:', bulk);
        setUsageData(usage);
        setBulkData(bulk);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    fetchData();
  }, [startDate, endDate]);

  const chartData = {
    labels: usageData?.dailyCredits?.map(day => format(parseISO(day.date), 'MMM dd')) || [],
    datasets: [
      {
        label: 'Credits Used',
        data: usageData?.dailyCredits?.map(day => day.credits) || [],
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Daily Credit Usage',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0
        }
      }
    }
  };

  // Calculate credit totals
  const linkedinCount = usageData?.totalUsage?.linkedinProfiles || 0;
  const validEmailsCount = usageData?.totalUsage?.validEmails || 0;
  const phoneCount = usageData?.totalUsage?.phoneNumbers || 0;

  // Calculate credits per service
  const linkedinCredits = linkedinCount * 1;      // 1 credit per LinkedIn profile
  const emailCredits = validEmailsCount * 2;      // 2 credits per valid email
  const phoneCredits = phoneCount * 15;           // 15 credits per phone number

  // Calculate total credits
  const totalCredits = linkedinCredits + emailCredits + phoneCredits;

  // Format the date consistently for both server and client
  const formattedDate = mounted ? format(new Date(), 'yyyy-MM-dd HH:mm:ss') : '';

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          {mounted && (
            <p className="text-sm text-gray-500">
              Last updated: {formattedDate}
            </p>
          )}
        </div>

        {/* Credit Usage Summary */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Credit Usage Summary</h2>
            <p className="text-2xl font-bold text-purple-600">
              {totalCredits} Total Credits Used
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">LinkedIn Profiles</p>
              <p className="text-lg font-semibold">{linkedinCount} profiles</p>
              <div className="flex justify-between text-sm mt-2">
                <span className="text-gray-500">Rate: 1 credit each</span>
                <span className="font-medium">{linkedinCredits} credits</span>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Verified Emails</p>
              <p className="text-lg font-semibold">{validEmailsCount} emails</p>
              <div className="flex justify-between text-sm mt-2">
                <span className="text-gray-500">Rate: 2 credits each</span>
                <span className="font-medium">{emailCredits} credits</span>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Phone Numbers</p>
              <p className="text-lg font-semibold">{phoneCount} numbers</p>
              <div className="flex justify-between text-sm mt-2">
                <span className="text-gray-500">Rate: 15 credits each</span>
                <span className="font-medium">{phoneCredits} credits</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bulk Processing Statistics */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Bulk Processing Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Files Processed</p>
              <p className="text-lg font-semibold">{bulkData?.files || 0}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-500">Total Entries</p>
              <p className="text-lg font-semibold">{bulkData?.entries || 0}</p>
            </div>
          </div>
        </div>

        {/* Daily Usage Chart */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Daily Credit Usage</h2>
          <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                Start Date
              </label>
              <input
                type="date"
                id="startDate"
                value={format(startDate, 'yyyy-MM-dd')}
                onChange={(e) => setStartDate(new Date(e.target.value))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
            </div>
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                End Date
              </label>
              <input
                type="date"
                id="endDate"
                value={format(endDate, 'yyyy-MM-dd')}
                onChange={(e) => setEndDate(new Date(e.target.value))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
            </div>
          </div>
          <div className="h-96">
            {mounted && <Bar options={chartOptions} data={chartData} />}
          </div>
        </div>

        {/* Credit Cost Reference */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Credit Cost Reference</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Credit Cost
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">LinkedIn Profile Enrichment</td>
                  <td className="px-6 py-4 whitespace-nowrap">1 credit</td>
                  <td className="px-6 py-4">Per profile enriched</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">Verified Email</td>
                  <td className="px-6 py-4 whitespace-nowrap">2 credits</td>
                  <td className="px-6 py-4">Per verified email (individual or company)</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">Phone Number</td>
                  <td className="px-6 py-4 whitespace-nowrap">15 credits</td>
                  <td className="px-6 py-4">Per phone number found</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}
