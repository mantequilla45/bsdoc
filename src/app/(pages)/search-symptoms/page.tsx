'use client';

import Header from "@/app/layout/header";
import React, { useState } from 'react';
import { IoSearch } from "react-icons/io5";
import Footer from "@/app/layout/footer";
import { motion, AnimatePresence } from "framer-motion";
import AdvancedSearchForm from "@/app/(pages)/search-symptoms/components/adv-search-form";
import ImageContainer from "@/app/(pages)/search-symptoms/components/background";
import { getSymptomInfo } from "@/services/symptom-search/symptomService";
import { symptomGroups } from '../../(pages)/search-symptoms/components/symptomGroup';
import rawSynonyms from '../search-symptoms/data/symptom_synonyms.json';
import stringSimilarity from 'string-similarity';

const symptomSynonyms = rawSynonyms as Record<string, string>;

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

const formatSymptomLabel = (symptom: string) =>
  symptom.replace(/_/g, ' ').toLowerCase();

const normalizeSymptom = (symptom: string) =>
  symptom.trim().toLowerCase().replace(/\s+/g, '_');

const expandSymptom = (symptom: string): { resolved: string; match?: string } => {
  const norm = normalizeSymptom(symptom);

  // Direct match from synonym map
  if (symptomSynonyms[norm]) {
    return { resolved: symptomSynonyms[norm], match: norm };
  }

  // Fuzzy match from synonym keys
  const synonymKeys = Object.keys(symptomSynonyms);
  const fuzzySynonymMatch = stringSimilarity.findBestMatch(norm, synonymKeys).bestMatch;
  if (fuzzySynonymMatch.rating > 0.8) {
    const mapped = symptomSynonyms[fuzzySynonymMatch.target];
    return { resolved: mapped, match: fuzzySynonymMatch.target };
  }

  // Fuzzy match from all valid symptoms
  const allSymptoms = Object.values(symptomGroups).flat();
  const fuzzySymptomMatch = stringSimilarity.findBestMatch(norm, allSymptoms).bestMatch;
  if (fuzzySymptomMatch.rating > 0.8) {
    return { resolved: fuzzySymptomMatch.target, match: norm };
  }

  return { resolved: norm };
};

const SearchSymptomsPage = () => {
  const [isAdvancedSearchEnabled, setIsAdvancedSearchEnabled] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [manualResult, setManualResult] = useState<SymptomResponse | null>(null);
  const [advancedResult, setAdvancedResult] = useState<SymptomResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [suggestions, setSuggestions] = useState<{ original: string; suggested: string; match?: string }[]>([]);

  const allSymptoms = Object.values(symptomGroups).flat();

  const handleSuggestionClick = (original: string, suggested: string) => {
    const updated = inputValue
      .split(',')
      .map(item => normalizeSymptom(item) === original ? formatSymptomLabel(suggested) : item.trim())
      .join(', ');
    setInputValue(updated);
    setSuggestions([]);
  };

  const handleSearch = async () => {
    if (!inputValue.trim()) return;

    setLoading(true);
    setError("");
    setManualResult(null);
    setSuggestions([]);

    const rawSymptoms = inputValue.split(",").map(s => s.trim());
    const valid: string[] = [];
    const suggestionList: { original: string; suggested: string; match?: string }[] = [];

    for (const rawSym of rawSymptoms) {
      const norm = normalizeSymptom(rawSym);
      const { resolved } = expandSymptom(rawSym);

      if (allSymptoms.includes(resolved)) {
        valid.push(resolved);
      } else {
        const keysToCheck = [...Object.keys(symptomSynonyms), ...allSymptoms];
        const { bestMatch } = stringSimilarity.findBestMatch(norm, keysToCheck);
        if (bestMatch.rating > 0.5) {
          const mapped = symptomSynonyms[bestMatch.target] ?? bestMatch.target;
          suggestionList.push({ original: norm, suggested: mapped, match: bestMatch.target });
        } else {
          suggestionList.push({ original: norm, suggested: '' });
        }
      }
    }

    if (suggestionList.length > 0) {
      setSuggestions(suggestionList);
      setLoading(false);
      return;
    }

    try {
      const data: SymptomResponse = await getSymptomInfo(valid);
      setManualResult(data);
    } catch (err) {
      console.error(err);
      setError("Could not fetch results. Make sure the AI backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSearch = () => {
    setIsAdvancedSearchEnabled((prev) => {
      if (prev) setAdvancedResult(null);
      else setManualResult(null);
      return !prev;
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#EEFFFE]">
      <motion.div className="bg-[#EEFFFE] flex-grow relative">
        <Header background="#EEFFFE" title="Search Symptoms" />
        <div className="absolute inset-0">
          <div className="sticky top-0 h-screen">
            <ImageContainer />
          </div>
        </div>

        <div className="md:mx-auto min-h-screen flex max-w-[1300px] py-28 md:px-10 px-[25px]">
          <main className="z-10 w-full flex flex-col md:mt-[200px] mt-[100px] gap-4">
            <h1 className="md:text-7xl text-4xl">
              Welcome to <span className="text-[#519496]">BSDOC</span>
            </h1>

            <div className="flex items-center gap-4">
              <p className="md:pl-7 pl-4">Advanced Search</p>
              <button
                onClick={handleToggleSearch}
                className={`w-12 h-6 rounded-full transition duration-300 border-[1px] ${isAdvancedSearchEnabled ? 'bg-blue-500 border-blue-800' : 'bg-gray-300 border-[#777777]'} relative`}
              >
                <span
                  className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full transform transition-transform duration-300 ease-in-out ${isAdvancedSearchEnabled ? 'translate-x-1 bg-white' : '-translate-x-5 bg-[#777777]'}`}
                />
              </button>
            </div>

            <AnimatePresence mode="wait">
              {isAdvancedSearchEnabled ? (
                <motion.div
                  key="advanced-search"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                  className="w-full bg-white shadow-md rounded-xl border"
                >
                  <AdvancedSearchForm setResult={setAdvancedResult} />
                </motion.div>
              ) : (
                <motion.div
                  key="basic-search"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                >
                  <div className="space-y-3">
                    <div className="relative md:py-4 py-1 md:pl-10 shadow-md border rounded-xl px-6 bg-white text-gray-500 text-[35px] flex items-center">
                      <input
                        type="text"
                        placeholder="Search Symptoms..."
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                        className={`w-full h-12 border-none placeholder:text-base md:placeholder:text-xl outline-none text-lg flex items-center ${inputValue ? 'text-[#2D383D]' : 'text-gray-500'}`}
                        style={{ lineHeight: "2rem" }}
                      />
                      <button onClick={handleSearch}>
                        <IoSearch className="text-gray-500 hover:scale-110 active:scale-90 transition duration-300 md:scale-100 scale-[.80]" />
                      </button>
                    </div>
                  </div>
                  <p className="text-gray-600 mt-4">Introducing a new way to search.</p>
                </motion.div>
              )}
            </AnimatePresence>

            {loading && <p className="text-blue-500 mt-4">Analyzing symptoms...</p>}
            {error && <p className="text-red-500 mt-4">{error}</p>}

            {suggestions.length > 0 && (
              <div className="bg-yellow-100 text-yellow-900 p-4 rounded-md border mt-4">
                <p className="font-semibold mb-2">Invalid symptoms detected:</p>
                <ul className="list-disc ml-5 space-y-1">
                  {suggestions.map(({ original, suggested, match }) => (
                    <li key={original}>
                      {formatSymptomLabel(original)} &rarr; {suggested ? (
                        <button
                          onClick={() => handleSuggestionClick(original, suggested)}
                          className="text-blue-700 underline hover:text-blue-900"
                        >
                          Did you mean: {match && match !== suggested ? `"${formatSymptomLabel(match)}" → ` : ''}{formatSymptomLabel(suggested)}?
                        </button>
                      ) : (
                        <span className="text-red-600">Invalid input</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {!isAdvancedSearchEnabled && manualResult && <ResultDisplay result={manualResult} />}
            {isAdvancedSearchEnabled && advancedResult && <ResultDisplay result={advancedResult} />}
          </main>
        </div>
      </motion.div>
      <Footer />
    </div>
  );
};

const ResultDisplay = ({ result }: { result: SymptomResponse }) => (
  <div className="bg-white shadow-lg p-8 mt-8 rounded-xl border space-y-6">
    <h2 className="text-2xl font-bold text-gray-800">Search Results</h2>
    <p className="text-gray-600">{result.recommendation_note}</p>
    <div>
      <h3 className="text-xl font-semibold text-green-700 border-b-2 pb-2">🏥 Most Likely Conditions</h3>
      <div className="grid md:grid-cols-2 gap-4 mt-4">
        {result.likely_common_conditions.map((condition) => (
          <ConditionCard key={condition.disease} condition={condition} highlight="blue" />
        ))}
      </div>
    </div>
    <div>
      <h3 className="text-xl font-semibold text-yellow-700 border-b-2 pb-2">🤔 Other Possible Conditions</h3>
      <div className="grid md:grid-cols-2 gap-4 mt-4">
        {result.other_possible_conditions.map((condition) => (
          <ConditionCard key={condition.disease} condition={condition} highlight="orange" />
        ))}
      </div>
    </div>
    <p className="text-gray-500 text-sm mt-6 italic">{result.note}</p>
  </div>
);

const ConditionCard = ({
  condition,
  highlight,
}: {
  condition: Condition;
  highlight: "blue" | "orange";
}) => (
  <div className="bg-gray-100 p-4 rounded-lg shadow-md">
    <h4 className={`text-lg font-bold text-${highlight}-700`}>{condition.disease}</h4>
    <p className="text-sm text-gray-600">Commonality: {condition.commonality}</p>
    <p className="text-sm font-semibold mt-2">💊 Medications:</p>
    <p className="text-sm text-gray-700">{condition.informational_medications}</p>
    <p className="text-sm font-semibold mt-2">🛑 Precautions:</p>
    <ul className="list-disc list-inside text-sm text-gray-700">
      {condition.precautions.map((precaution) => (
        <li key={precaution}>{precaution}</li>
      ))}
    </ul>
  </div>
);

export default SearchSymptomsPage;
