"use client";
import Header from "@/app/layout/header";
import React, { useState } from 'react';
import { IoSearch } from "react-icons/io5";
import Footer from "@/app/layout/footer";
import { motion, AnimatePresence } from "framer-motion";
import AdvancedSearchForm from "@/app/(pages)/search-symptoms/components/adv-search-form";
import ImageContainer from "@/app/(pages)/search-symptoms/components/background";
import { getSymptomInfo } from "@/services/symptom-search/symptomService";

// Type Definitions
interface Condition {
  disease: string;
  commonality: string;
  final_score: number;
  precautions: string[];
  informational_medications: string;
}

interface SymptomResponse {
  input_symptoms: string[];
  recommendation_note: string;
  likely_common_conditions: Condition[];
  other_possible_conditions: Condition[];
  note: string;
}

const SearchSymptomsPage = () => {
  const [isAdvancedSearchEnabled, setIsAdvancedSearchEnabled] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [result, setResult] = useState<SymptomResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    if (!inputValue.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const symptoms = inputValue.split(",").map((s) => s.trim().toLowerCase());
      const data: SymptomResponse = await getSymptomInfo(symptoms);
      setResult(data);
    } catch (err) {
      console.error(err);
      setError("Could not fetch results. Make sure the AI backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      <motion.div
        className="bg-[#EEFFFE] flex-grow relative"
        animate={{ height: isAdvancedSearchEnabled ? '100%' : '100vh' }}
        transition={{
          duration: 0.5,
          ease: "easeInOut"
        }}
      >
        <Header background="[#EEFFFE]" title="Search Symptoms" />

        {/* Image container with sticky positioning */}
        <div className="absolute inset-0">
          <div className="sticky top-0 h-screen">
            <ImageContainer />
          </div>
        </div>

        {/* Main content */}
        <div className="md:h-[20vh] h-[20%]" />
        <div className={`flex z-10 flex-col gap-5 relative md:px-[15%] px-[30px] mb-20`}>
          <h1 className="md:text-7xl text-4xl">
            Welcome to <span className="text-[#519496]">BSDOC</span>
          </h1>
          <div className="flex items-center gap-4">
            <p className="md:pl-7 pl-4">Advanced Search</p>
            <button
              onClick={() => setIsAdvancedSearchEnabled(!isAdvancedSearchEnabled)}
              className={`w-12 h-6 rounded-full transition duration-300 border-[1px] ${isAdvancedSearchEnabled ? 'bg-blue-500 border-blue-800' : 'bg-gray-300 border-[#777777]'} relative`}
            >
              <span
                className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full transform transition-transform duration-300 ease-in-out
                ${isAdvancedSearchEnabled ? 'translate-x-1 bg-white' : '-translate-x-5 bg-[#777777]'}`}
              />
            </button>
          </div>
          <AnimatePresence mode="wait">
            {isAdvancedSearchEnabled ? (
              <motion.div
                key="advanced-search"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: "50vh", opacity: 0 }}
                transition={{
                  duration: 0.6,
                  ease: "easeInOut"
                }}
                className="w-[100%] bg-white shadow-md rounded-xl border-[1px]"
              >
                <AdvancedSearchForm />
              </motion.div>
            ) : (
              <motion.div
                key="basic-search"
                initial={{ height: "full", opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{
                  duration: 0.4,
                  ease: "easeInOut"
                }}
              >
                <div className="space-y-3">
                  <div className="relative md:py-4 py-1 md:pl-10 shadow-md border-[1px] rounded-xl px-6 bg-white text-gray-500 text-[35px] flex items-center">
                    <input
                      type="text"
                      placeholder="Search Symptoms..."
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                      className={`w-full h-12 border-none placeholder:text-base md:placeholder:text-xl outline-none text-lg flex items-center ${inputValue ? 'text-[#2D383D] font-normal' : 'text-gray-500 font-light'}`}
                      style={{ lineHeight: "2rem" }}
                    />
                    <button onClick={handleSearch}>
                      <IoSearch className="text-gray-500 hover:scale-110 active:scale-90 transition duration-300 md:scale-100 scale-[.80]" />
                    </button>
                  </div>
                </div>
                <p className="text-gray-600 mt-4">
                  Introducing a new way to diagnose your sickness.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {loading && <p className="text-blue-500 mt-4">Analyzing symptoms...</p>}
          {error && <p className="text-red-500 mt-4">{error}</p>}

          {result && (
            <div className="bg-white shadow-lg p-8 mt-8 rounded-xl border space-y-6">
              <h2 className="text-2xl font-bold text-gray-800">Search Results</h2>
              <p className="text-gray-600">{result.recommendation_note}</p>

              {/* Likely Common Conditions */}
              <div>
                <h3 className="text-xl font-semibold text-green-700 border-b-2 pb-2">
                  🏥 Most Likely Conditions
                </h3>
                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  {result.likely_common_conditions.map((condition, index) => (
                    <ConditionCard key={index} condition={condition} highlight="blue" />
                  ))}
                </div>
              </div>

              {/* Other Possible Conditions */}
              <div>
                <h3 className="text-xl font-semibold text-yellow-700 border-b-2 pb-2">
                  🤔 Other Possible Conditions
                </h3>
                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  {result.other_possible_conditions.map((condition, index) => (
                    <ConditionCard key={index} condition={condition} highlight="orange" />
                  ))}
                </div>
              </div>

              <p className="text-gray-500 text-sm mt-6 italic">{result.note}</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Footer with higher z-index to ensure it's above the floating background */}
      <div className="z-20">
        <Footer />
      </div>
    </div>
  );
};

const ConditionCard = ({
  condition,
  highlight,
}: {
  condition: Condition;
  highlight: "blue" | "orange";
}) => (
  <div className="bg-gray-100 p-4 rounded-lg shadow-md">
    <h4 className={`text-lg font-bold text-${highlight}-700`}>
      {condition.disease}
    </h4>
    <p className="text-sm text-gray-600">Commonality: {condition.commonality}</p>
    <p className="text-sm font-semibold mt-2">💊 Medications:</p>
    <p className="text-sm text-gray-700">{condition.informational_medications}</p>
    <p className="text-sm font-semibold mt-2">🛑 Precautions:</p>
    <ul className="list-disc list-inside text-sm text-gray-700">
      {condition.precautions.map((precaution, i) => (
        <li key={i}>{precaution}</li>
      ))}
    </ul>
  </div>
);

export default SearchSymptomsPage;
