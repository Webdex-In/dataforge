import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { monthlyPlans, annualPlans, faqs } from "../services/pricing-data";

const PricingComponent = () => {
  const router = useRouter();
  const [billingCycle, setBillingCycle] = useState("monthly");
  const plans = billingCycle === "monthly" ? monthlyPlans : annualPlans;

  // Handle plan selection
  const handlePlanClick = async (plan) => {
    const data = {
      productId: plan.productId,
      name: plan.name,
      price: plan.price,
      credits: plan.credits,
    };

    // console.log(data);
    try {
      const response = await axios.post("/api/checkout", data);

        if (response.data.url == "true") {
          router.push("/");
        }
        router.push(response.data.url);
    
    } catch (error) {
      console.error("Error during checkout:", error);
    }
  };

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    if (query.get("success")) console.log("Order placed!");
    if (query.get("canceled")) console.log("Order canceled.");
  }, []);

  return (
    <main className="py-20">
      {/* Pricing Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-purple-dark mb-4">
          Simple, Transparent Pricing
        </h1>
        <p className="text-xl text-purple-light">
          Choose the plan that's right for you
        </p>
      </div>

      {/* Billing Toggle */}
      <div className="flex justify-center mb-12">
        <div className="bg-purple-light p-1 rounded-lg inline-flex">
          <button
            onClick={() => setBillingCycle("monthly")}
            className={`px-4 py-2 rounded-md ${
              billingCycle === "monthly"
                ? "bg-white text-purple-dark"
                : "text-gray-500"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle("annual")}
            className={`px-4 py-2 rounded-md ${
              billingCycle === "annual"
                ? "bg-white text-purple-dark"
                : "text-gray-500"
            }`}
          >
            Annual (Save 20%)
          </button>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`${
              plan.name === "Pro"
                ? "bg-gradient-to-b from-purple-light/10 to-white border-purple-dark"
                : "bg-white border-gray-200"
            } rounded-lg shadow-lg overflow-visible border relative transition-all duration-300 hover:shadow-xl`}
          >
            {plan.name === "Pro" && (
              <div className="absolute -top-5 left-1/2 transform -translate-x-1/2">
                <span className="bg-purple-dark text-white px-6 py-2 rounded-full">
                  Most Popular
                </span>
              </div>
            )}
            <div className={`p-8 ${plan.name === "Pro" ? "pt-10" : "pb-8"}`}>
              <h2 className="text-2xl font-bold text-purple-dark">
                {plan.name}
              </h2>
              <p className="text-purple-light mt-2 min-h-[48px]">
                {plan.description}
              </p>
              <div className="mt-4">
                <span className="text-5xl font-bold text-purple-dark">
                  ${plan.price}
                </span>
                <span className="text-purple-light">/month</span>
              </div>
              <p className="text-purple-dark font-semibold mt-2">
                {plan.credits.toLocaleString()} credits/month
              </p>

              <div className="mt-8 space-y-4">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-start">
                    <Check className="h-5 w-5 mr-3 flex-shrink-0 text-purple-dark" />
                    <span className="text-purple-light">{feature}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => handlePlanClick(plan)}
                className="mt-8 w-full py-3 px-4 rounded-lg bg-purple-dark text-white"
              >
                Get Started
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
};

export default PricingComponent;
