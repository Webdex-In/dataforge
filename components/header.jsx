import { UserButton } from "@clerk/nextjs";
import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { getCreditCount } from "/support/getUserInfo";
import { Star } from "lucide-react";
import Link from "next/link";

const Header = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [creditCount, setCreditCount] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useUser();

  useEffect(() => {
    // Set isMounted to true when the component is mounted
    setIsMounted(true);

    const fetchData = async () => {
      if (!user?.id) return; // Don't fetch if user id is not available

      try {
        setIsLoading(true); // Set loading state
        const credit = await getCreditCount(user.id); // Get credit data
        setCreditCount(credit); // Update creditCount state with fetched data
      } catch (err) {
        setError("Failed to fetch credit data"); // Handle errors
        console.error(err);
      } finally {
        setIsLoading(false); // Turn off loading once the fetch is complete
      }
    };

    if (user?.id) {
      fetchData(); // Fetch credit data when user is available
    }
  }, [user?.id]);

  return (
    <header className="flex justify-end items-center shadow-lg p-4">
      {/* Right section: User button and credit display */}

      <div className="mx-10 flex items-center space-x-4">
        <Link href="/pricing">Buy Credits </Link>
        {/* Display credit count if available */}
        {isLoading ? (
          <span>Loading ...</span>
        ) : error ? (
          <span>{error}</span>
        ) : (
          <div className="flex  justify-center items-center gap-2 border-2 border-purple-light/5 px-5 py-1 rounded-full bg-purple-light/45 shadow-sm">
            <Star className="text-yellow-200 w-4 h-4" fill="yellow" />
            <span className="text-sm font-semibold text-purple-dark">
            {isNaN(creditCount) || creditCount < 0 ? 0 : creditCount}
            </span>
          </div>
        )}

        {/* User button component */}
        {isMounted && <UserButton />}
      </div>
    </header>
  );
};

export default Header;
