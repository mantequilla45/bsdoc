'use client';
import React, { useState, memo } from 'react';
import CheckBox from './checkbox';
import { Gender, TextBox } from './elements';
import { getSymptomInfo } from '@/services/symptom-search/symptomService';
import { symptomGroups } from './symptomGroup';

// ✅ Memoized, named component
const SymptomCheckboxGroups = memo(function SymptomCheckboxGroups({
  selectedSymptoms,
  setSelectedSymptoms,
}: {
  selectedSymptoms: string[];
  setSelectedSymptoms: React.Dispatch<React.SetStateAction<string[]>>;
}) {
  return (
    <div className="w-full border-t border-gray-300 py-6 space-y-6">
      <h2 className="text-2xl font-semibold">Symptoms</h2>
      <div className="flex flex-col gap-8 max-h-[500px] overflow-y-auto pr-2">
        {Object.entries(symptomGroups).map(([group, symptoms]) => (
          <div key={group}>
            <h3 className="text-lg font-medium text-[#2D383D] mb-2">{group}</h3>
            <div className="grid md:grid-cols-2 gap-3 text-sm text-gray-700">
              {symptoms.map((symptom, i) => (
                <CheckBox
                  key={i}
                  item={symptom.replace(/_/g, ' ')}
                  checked={selectedSymptoms.includes(symptom)}
                  onChange={() =>
                    setSelectedSymptoms((prev) =>
                      prev.includes(symptom)
                        ? prev.filter((s) => s !== symptom)
                        : [...prev, symptom]
                    )
                  }
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

const AdvancedSearchForm = () => {
  enum Category {
    Cardiovascular = 'Cardiovascular',
    EndocrineMetabolic = 'Endocrine and Metabolic',
    Autoimmune = 'Autoimmune',
    KidneyRenal = 'Kidney and Renal',
    Cancer = 'Cancer',
  }

  interface SymptomCondition {
    name: string;
    category: Category;
  }

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

  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [result, setResult] = useState<SymptomResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAssess = async () => {
    const allSelected = [...selectedSymptoms, ...selectedConditions];
    if (allSelected.length === 0) return;

    try {
      setLoading(true);
      setError('');
      const data = await getSymptomInfo(allSelected);
      setResult(data);
    } catch (err) {
      console.error(err);
      setError('An error occurred while fetching predictions.');
    } finally {
      setLoading(false);
    }
  };

  const conditions: SymptomCondition[] = [
    { name: 'Hypertension', category: Category.Cardiovascular },
    { name: 'Coronary Artery Disease', category: Category.Cardiovascular },
    { name: 'Heart Failure', category: Category.Cardiovascular },
    { name: 'Arrhythmia', category: Category.Cardiovascular },
    { name: 'Stroke', category: Category.Cardiovascular },
    { name: 'Peripheral Artery Disease', category: Category.Cardiovascular },
    { name: 'Hypothyroidism', category: Category.EndocrineMetabolic },
    { name: 'Hyperthyroidism', category: Category.EndocrineMetabolic },
    { name: 'Obesity', category: Category.EndocrineMetabolic },
    { name: "Cushing's Syndrome", category: Category.EndocrineMetabolic },
    { name: 'Diabetes Mellitus (Type 1 and Type 2)', category: Category.EndocrineMetabolic },
    { name: 'Polycystic Ovary Syndrome (PCOS)', category: Category.EndocrineMetabolic },
    { name: 'Rheumatoid Arthritis', category: Category.Autoimmune },
    { name: 'Psoriasis', category: Category.Autoimmune },
    { name: "Hashimoto's Thyroiditis", category: Category.Autoimmune },
    { name: 'Multiple Sclerosis', category: Category.Autoimmune },
    { name: "Graves' Disease", category: Category.Autoimmune },
    { name: 'Systemic Lupus Erythematosus (SLE)', category: Category.Autoimmune },
    { name: 'Chronic Kidney Disease', category: Category.KidneyRenal },
    { name: 'Polycystic Kidney Disease', category: Category.KidneyRenal },
    { name: 'Kidney Stones', category: Category.KidneyRenal },
    { name: 'Nephrotic Syndrome', category: Category.KidneyRenal },
    { name: 'Acute Kidney Injury', category: Category.KidneyRenal },
    { name: 'End-Stage Renal Disease', category: Category.KidneyRenal },
    { name: 'Breast Cancer', category: Category.Cancer },
    { name: 'Prostate Cancer', category: Category.Cancer },
    { name: 'Lung Cancer', category: Category.Cancer },
    { name: 'Colorectal Cancer', category: Category.Cancer },
    { name: 'Leukemia', category: Category.Cancer },
    { name: 'Pancreatic Cancer', category: Category.Cancer },
  ];

  const groupConditionsByCategory = (items: SymptomCondition[]): Record<Category, string[]> => {
    return items.reduce((acc, { name, category }) => {
      if (!acc[category]) acc[category] = [];
      acc[category].push(name);
      return acc;
    }, {} as Record<Category, string[]>);
  };

  const ConditionSection = () => {
    const grouped = groupConditionsByCategory(conditions);
    return (
      <div className="w-full border-t border-gray-300 py-6 space-y-6">
        <h2 className="text-2xl font-semibold">Underlying Health Conditions</h2>
        <div className="grid md:grid-cols-2 gap-8">
          {Object.entries(grouped).map(([category, items]) => (
            <div key={category}>
              <h3 className="text-lg font-medium text-[#333] mb-3">{category}</h3>
              <div className="grid sm:grid-cols-2 gap-2 text-sm text-gray-700">
                {items.map((item, i) => (
                  <CheckBox
                    key={i}
                    item={item}
                    checked={selectedConditions.includes(item)}
                    onChange={() => {
                      setSelectedConditions((prev) =>
                        prev.includes(item)
                          ? prev.filter((c) => c !== item)
                          : [...prev, item]
                      );
                    }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full h-full p-6 md:p-12 bg-white rounded-xl shadow">
      <div className="mb-6">
        <h1 className="text-3xl md:text-4xl font-bold text-[#2D383D]">
          BSDOC Advanced Symptoms Search
        </h1>
        <p className="text-sm md:text-base text-gray-600 mt-1">
          Please fill the following form with the symptoms you are feeling.
        </p>
      </div>

      <div className="grid md:grid-cols-4 sm:grid-cols-2 gap-4 mb-10">
        <TextBox title="Name" />
        <TextBox title="Age" />
        <TextBox title="Weight" />
        <Gender />
      </div>

      <div className="space-y-10">
        <SymptomCheckboxGroups
          selectedSymptoms={selectedSymptoms}
          setSelectedSymptoms={setSelectedSymptoms}
        />
        <ConditionSection />
      </div>

      <div className="flex justify-end items-center gap-6 mt-10">
        <CheckBox item="Add Record" />
        <button
          onClick={handleAssess}
          className="px-6 py-3 bg-[#A3E7EA] hover:bg-[#9AE0E3] active:bg-[#91D7DA] rounded-md font-semibold transition-all duration-200 active:scale-95"
        >
          Assess
        </button>
      </div>

      {loading && <p className="text-blue-500 mt-4">Analyzing symptoms...</p>}
      {error && <p className="text-red-500 mt-4">{error}</p>}
      {result && (
        <div className="bg-white shadow-lg p-8 mt-8 rounded-xl border space-y-6">
          <h2 className="text-2xl font-bold text-gray-800">Search Results</h2>
          <p className="text-gray-600">{result.recommendation_note}</p>

          <div>
            <h3 className="text-xl font-semibold text-green-700 border-b-2 pb-2">
              🏥 Most Likely Conditions
            </h3>
            <div className="grid md:grid-cols-2 gap-4 mt-4">
              {result.likely_common_conditions.map((condition, index) => (
                <div key={index} className="bg-gray-100 p-4 rounded-lg shadow-md">
                  <h4 className="text-lg font-bold text-blue-700">{condition.disease}</h4>
                  <p className="text-sm">Commonality: {condition.commonality}</p>
                  <p className="text-sm font-semibold mt-2">💊 Medications:</p>
                  <p className="text-sm text-gray-700">{condition.informational_medications}</p>
                  <p className="text-sm font-semibold mt-2">🛑 Precautions:</p>
                  <ul className="list-disc list-inside text-sm text-gray-700">
                    {condition.precautions.map((precaution, i) => (
                      <li key={i}>{precaution}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedSearchForm;
