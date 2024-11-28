import { useEffect, useState } from 'react'
import { KeyIcon, EyeIcon, EyeOffIcon, ClipboardIcon, CheckIcon } from 'lucide-react'
import Layout from '../components/Layout'
import axios from 'axios'
import { useUser } from "@clerk/nextjs";
import { getAccessToken } from "../support/getUserInfo"; // You may need to update this import based on your actual function.
import { useRouter } from 'next/navigation';

export default function Component() {
  const [token, setToken] = useState('')    // This will hold the generated token
  const [showToken, setShowToken] = useState(false)  // Controls showing or hiding the token
  const [copied, setCopied] = useState(false) // Controls if the token was copied
  const [loading, setLoading] = useState(false) // For showing loading state
  const [error, setError] = useState('') // For showing error messages
  const { user } = useUser(); // Get the user info from Clerk
  const [accessToken, setAccessToken] = useState('') // For storing the fetched access token
const router = useRouter();

  // Fetch the access token (or credit info) on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const credit = await getAccessToken(user.id); // Get access token or other related data
        setAccessToken(credit);  // Set the access token data
      } catch (err) {
        setError('Failed to fetch access token data'); // Handle errors
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchData(); // Fetch access token when the user is available
    }
  }, [user?.id]);

  // Handle the token generation request
  const handleGenerateToken = async (e) => {
    e.preventDefault(); // Prevent page reload on form submit
    try {
      setLoading(true);
      setError('');
      const response = await axios.post('/api/v1/create/accesstoken', {
        userId: user.id,
      });
      setToken(response.data.apiKey); // Set the generated token
      router.refresh();

    } catch (err) {
      setError('Failed to create token'); // Handle errors
      console.error('Error creating token:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle token copy to clipboard
  const handleCopyToken = () => {
    navigator.clipboard.writeText(token); // Copy the token to clipboard
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); // Reset copy state after 2 seconds
  };

  return (
    <Layout>
      <div className="flex p-4 justify-center items-center">
        <div className="w-full max-w-5xl p-6 bg-white rounded-2xl shadow-xl border border-[#ACA2CD]">
          <h1 className="text-2xl font-bold mb-6 text-[#415285] text-center">Access Token Generator</h1>

          <div className="space-y-6">
            <label htmlFor="name" className="block text-lg font-medium text-[#415285] mb-2">
              Token Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              className="w-full px-4 py-3 bg-white border border-[#ACA2CD] rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#415285] focus:border-transparent text-[#415285] placeholder-[#ACA2CD] text-lg transition duration-200"
              placeholder="Enter a name for your token"
            />
          </div>

          <button
            onClick={handleGenerateToken}
            type="submit"
            className="w-full my-4 bg-[#415285] text-white font-medium py-3 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ACA2CD] transition duration-200 ease-in-out flex items-center justify-center hover:bg-[#ACA2CD] hover:text-[#415285] text-lg"
          >
            <KeyIcon className="w-6 h-6 mr-2" />
            {loading ? 'Generating...' : 'Generate Token'}
          </button>

          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

          {accessToken && (
            <div className="mt-8 p-6 bg-[#F8F7FB] rounded-2xl border border-[#ACA2CD]">
              <h3 className="text-xl font-semibold mb-4 text-[#415285]">Your Access Token</h3>
              <div className="flex items-center space-x-3">
                <input
                  type={showToken ? 'text' : 'password'}
                  value={token || accessToken}  // Show either the generated token or the fetched token
                  readOnly
                  className="flex-grow px-4 py-3 bg-white border border-[#ACA2CD] rounded-xl shadow-sm focus:outline-none text-[#415285] text-lg"
                />
                <button
                  onClick={() => setShowToken(!showToken)}
                  className="p-3 bg-[#415285] rounded-xl hover:bg-[#ACA2CD] focus:outline-none focus:ring-2 focus:ring-[#ACA2CD] transition duration-200 ease-in-out"
                  aria-label={showToken ? "Hide token" : "Show token"}
                >
                  {showToken ? (
                    <EyeOffIcon className="w-6 h-6 text-white" />
                  ) : (
                    <EyeIcon className="w-6 h-6 text-white" />
                  )}
                </button>
                <button
                  onClick={handleCopyToken}
                  className="p-3 bg-[#415285] rounded-xl hover:bg-[#ACA2CD] focus:outline-none focus:ring-2 focus:ring-[#ACA2CD] transition duration-200 ease-in-out"
                  aria-label="Copy token to clipboard"
                >
                  {copied ? (
                    <CheckIcon className="w-6 h-6 text-white" />
                  ) : (
                    <ClipboardIcon className="w-6 h-6 text-white" />
                  )}
                </button>
              </div>
              {copied && (
                <p className="text-sm text-[#415285] mt-2 font-medium">Copied to clipboard!</p>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
