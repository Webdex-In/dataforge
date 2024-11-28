import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Layout from "../components/Layout";
import EnrichmentForm from "../components/EnrichmentForm";
import IndividualResultDisplay from "../components/IndividualResultDisplay";
import {
  enrichIndividualData,
  saveIndividualProcessedData,
} from "../utils/individualApiService";
import { getCreditInfo } from "../support/getUserInfo";
import { useUser } from "@clerk/nextjs";

export default function Home() {
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [getCredit, setGetCredit] = useState(false);
  const { user } = useUser();

  useEffect(() => {
    // Define an async function inside useEffect to handle async calls
    const fetchData = async () => {
      try {
        setIsLoading(true); // Set loading state
        const credit = await getCreditInfo(user.id); // Get credit data
        setGetCredit(credit); // Update state with credit data
      } catch (err) {
        setError("Failed to fetch credit data"); // Handle errors
        console.error(err);
      } finally {
        setIsLoading(false); // Turn off loading once fetch is done
      }
    };

    if (user?.id) {
      fetchData(); // Fetch data when the user is available
    }
  }, [user?.id]); // Dependency array to rerun effect if user ID changes


  const handleEnrichment = async (formData, searchOptions) => {
    if (!getCredit) {
      setError("Credit exceeded. Please check your credit balance.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const enrichedData = await enrichIndividualData(formData, searchOptions);
      if (Object.keys(enrichedData).length === 0) {
        setError(
          "No data could be enriched. Please check your inputs and try again."
        );
      } else {
        setResult(enrichedData);
        saveIndividualProcessedData(enrichedData, formData);
      }
    } catch (error) {
      console.error("Enrichment error:", error);
      setError(`An error occurred during enrichment: ${error.message}`);
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
          <EnrichmentForm
            setResult={handleEnrichment}
            setIsLoading={setIsLoading}
            setError={setError}
          />
        </div>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-4"
          >
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#ACA2CD]"></div>
            <p className="mt-2 text-gray-600">
              Processing... This may take a few moments.
            </p>
          </motion.div>
        )}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-4"
            role="alert"
          >
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </motion.div>
        )}
        {result && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8"
          >
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">
              Enrichment Results
            </h2>
            <IndividualResultDisplay result={result} />
          </motion.div>
        )}
      </motion.div>
    </Layout>
  );
}
