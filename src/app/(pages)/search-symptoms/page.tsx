"use client";
import Header from "@/app/layout/header";
import React, { useState } from "react";
import { IoSearch } from "react-icons/io5";
import Footer from "@/app/layout/footer";
import ImageContainer from "@/app/components/search-symptoms/background";
import { getSymptomInfo } from "@/services/symptom-search/symptomService";

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
      const symptoms = inputValue.split(",").map((s) => s.trim().toLowerCase());
      const data: SymptomResponse = await getSymptomInfo(symptoms);
      setResult(data);
    } catch (error) {
      console.error(error);
      setError("Could not fetch results. Make sure the AI backend is running.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col relative bg-[#EEFFFE]">
      <Header background="[#EEFFFE]" title="Search Symptoms" />

      <div className="absolute inset-0">
        <div className="sticky top-0 h-screen">
          <ImageContainer />
        </div>
      </div>

      <div className="md:h-[30vh] h-[20%]" />
      <div className="flex z-10 flex-col gap-6 relative md:px-[15%] px-[30px] mb-20">
        <h1 className="md:text-7xl text-4xl">
          Welcome to <span className="text-[#519496]">BSDOC</span>
        </h1>
        <p className="text-gray-600 text-lg">
          Enter symptoms (comma-separated) and let our AI assist you:
        </p>
        <div className="relative flex items-center shadow-md border-[1px] rounded-xl px-6 bg-white">
          <input
            type="text"
            placeholder="Example: fever, headache, cold"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="w-full h-14 border-none placeholder:text-base md:placeholder:text-xl outline-none text-lg text-[#2D383D]"
            style={{ lineHeight: "2rem" }}
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
          <div className="bg-white shadow-md p-6 mt-8 rounded-xl border-[1px]">
            <h2 className="text-2xl font-semibold mb-4">
              Likely Common Conditions:
            </h2>
            {result.likely_common_conditions.map((condition, index) => (
              <div key={index} className="mb-6 border-b pb-4">
                <h3 className="text-xl font-bold mb-2">{condition.disease}</h3>
                <p className="mb-1">Commonality: {condition.commonality}</p>
                <p>Medications: {condition.informational_medications}</p>
                <div className="mt-2">
                  <p className="font-semibold mb-1">Precautions:</p>
                  <ul className="list-disc list-inside text-gray-700">
                    {condition.precautions.map((precaution, i) => (
                      <li key={i}>{precaution}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}

            <h2 className="text-2xl font-semibold mt-8 mb-4">
              Other Possible Conditions:
            </h2>
            {result.other_possible_conditions.map((condition, index) => (
              <div key={index} className="mb-6 border-b pb-4">
                <h3 className="text-xl font-bold mb-2">{condition.disease}</h3>
                <p className="mb-1">Commonality: {condition.commonality}</p>
                <p>Medications: {condition.informational_medications}</p>
                <div className="mt-2">
                  <p className="font-semibold mb-1">Precautions:</p>
                  <ul className="list-disc list-inside text-gray-700">
                    {condition.precautions.map((precaution, i) => (
                      <li key={i}>{precaution}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}

            <p className="text-gray-500 text-sm mt-6">{result.note}</p>
          </div>
        )}
      </div>

      <div className="z-20">
        <Footer />
      </div>
    </div>
  );
};

export default SearchSymptomsPage;
