"use client";

import React, { useState } from "react";
import Header from "@/app/layout/header";
import Footer from "@/app/layout/footer";
import { IoSearch } from "react-icons/io5";
import { getSymptomInfo } from "@/services/symptom-search/symptomService";
import Background from "@/app/(pages)/search-symptoms/components/background";

// Define TypeScript interfaces
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
      const symptoms = inputValue
        .split(",")
        .map((s) => s.trim().toLowerCase());
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
    <div className="min-h-screen flex flex-col relative bg-[#EEFFFE]">
      <Header background="[#EEFFFE]" title="Search Symptoms" />

      {/* Integrated Background Component */}
      <div className="absolute inset-0 -z-10">
        <Background />
      </div>

      <div className="md:h-[30vh] h-[20%]" />
      <div className="flex z-10 flex-col gap-6 relative md:px-[15%] px-[30px] mb-20">
        <h1 className="md:text-7xl text-4xl font-bold">
          Welcome to <span className="text-[#519496]">BSDOC</span>
        </h1>
        <p className="text-gray-600 text-lg">
          Enter symptoms (comma-separated) and let our AI assist you:
        </p>

        <div className="relative flex items-center shadow-md border rounded-xl px-6 bg-white">
          <input
            type="text"
            placeholder="Example: fever, headache, cold"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="w-full h-14 border-none outline-none text-lg text-[#2D383D] placeholder:text-base md:placeholder:text-xl"
          />
          <button
            onClick={handleSearch}
            className="hover:scale-110 active:scale-90 transition duration-300"
          >
            <IoSearch size={28} className="text-gray-500" />
          </button>
        </div>

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
