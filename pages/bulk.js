import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';
import BulkUpload from '../components/BulkUpload';
import BulkResultDisplay from '../components/BulkResultDisplay';
import { processBulkData, saveBulkProcessedData } from '../utils/bulkApiService';
import { getCreditInfo } from "../support/getUserInfo";
import { useUser } from "@clerk/nextjs";

export default function BulkProcessing() {
  const [results, setResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [creditCount, setCreditCount] = useState(0);
  const { user } = useUser();

  useEffect(() => {
    // Fetch user's credit data when component mounts or user ID changes
    const fetchData = async () => {
      try {
        setIsLoading(true); // Set loading state
        const credit = await getCreditInfo(user.id); // Get credit data
        setCreditCount(Math.max(credit, 0)); // Ensure credit count is not negative
      } catch (err) {
        console.error("Failed to fetch credit data:", err);
      } finally {
        setIsLoading(false); // Turn off loading once fetch is done
      }
    };

    if (user?.id) {
      fetchData(); // Fetch data when the user is available
    }
  }, [user?.id]); // Dependency array to rerun effect if user ID changes

  const handleBulkProcessing = async (data) => {
    if (creditCount <= 0) {
      setResults({ error: "Insufficient credits. Please check your credit balance and try again." });
      return;
    }

    setIsLoading(true);
    setProgress(0);
    try {
      const processedData = await processBulkData(data, (progress) => {
        setProgress(progress);
      });
      setResults(processedData);
      saveBulkProcessedData(processedData);
    } catch (error) {
      console.error("Bulk processing error:", error);
      setResults({ error: "An error occurred during bulk processing." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4 text-purple-dark">Bulk Processing</h2>
          
          {/* Conditional Rendering: Display message if credit count is zero or below */}
          {creditCount <= 0 ? (
            <div className="text-center text-red-600 font-semibold text-lg">
              Insufficient credits. Please recharge your credits to continue with bulk processing.
            </div>
          ) : (
            <BulkUpload setResult={handleBulkProcessing} setIsLoading={setIsLoading} />
          )}
        </div>

        {/* Progress bar and loading indicator */}
        {isLoading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white shadow-lg rounded-lg p-6 mb-6"
          >
            <div className="flex flex-col items-center">
              <h3 className="text-lg font-semibold text-purple-dark mb-4">Processing your bulk data...</h3>
              <div className="w-full bg-gray-200 rounded-full h-4 dark:bg-gray-700 mb-2">
                <div 
                  className="bg-purple-light h-4 rounded-full transition-all duration-300 ease-in-out"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600">Processing... {progress.toFixed(2)}% complete</p>
            </div>
          </motion.div>
        )}

        {/* Display results or error message */}
        {results && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {results.error ? (
              <p className="text-center text-red-600 font-semibold text-lg">{results.error}</p>
            ) : (
              <BulkResultDisplay results={results} />
            )}
          </motion.div>
        )}
      </motion.div>
    </Layout>
  );
}
