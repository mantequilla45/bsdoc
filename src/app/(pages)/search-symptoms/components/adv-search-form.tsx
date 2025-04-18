'use client';
import React, { useState, useEffect } from 'react';
import CheckBox from './checkbox';
import { TextBox } from './elements';
import { getSymptomInfo } from '@/services/symptom-search/symptomService';
import SymptomCheckboxGroups from './SymptomCheckboxGroups';
import { useUser } from '@supabase/auth-helpers-react';
import { supabase } from '@/lib/supabase';

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

const Spinner = () => (
  <div className="flex justify-center items-center h-32">
    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500" />
  </div>
);

const AdvancedSearchForm = ({
  setResult,
}: {
  setResult: React.Dispatch<React.SetStateAction<SymptomResponse | null>>;
}) => {
  const user = useUser();

  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [submittedSymptoms, setSubmittedSymptoms] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        console.warn('[Debug] No user is signed in.');
        setIsLoadingProfile(false);
        return;
      }

      console.info(`[Debug] Fetching data for user ID: ${user.id}`);
      setIsLoadingProfile(true);

      const { data: profile } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', user.id)
        .single();

      const { data: medical } = await supabase
        .from('medical_details')
        .select('age, weight')
        .eq('user_id', user.id)
        .single();

      if (profile) {
        const fullName = `${profile.first_name} ${profile.last_name}`;
        setName(fullName);
      }

      if (medical) {
        setAge(medical.age?.toString() || '');
        setWeight(medical.weight?.toString() || '');
      }

      setIsLoadingProfile(false);
    };

    fetchProfile();
  }, [user]);

  const handleAssess = async () => {
    const allSelected = [...selectedSymptoms, ...selectedConditions];
    if (allSelected.length === 0) return;

    try {
      setLoading(true);
      setError('');
      const data = await getSymptomInfo(allSelected);
      setSubmittedSymptoms(selectedSymptoms);
      setResult(data);
      setSelectedSymptoms([]);
      setSelectedConditions([]);
    } catch (err) {
      console.error(err);
      setError('An error occurred while fetching predictions.');
    } finally {
      setLoading(false);
    }
  };

  enum Category {
    Cardiovascular = 'Cardiovascular',
    EndocrineMetabolic = 'Endocrine and Metabolic',
    Autoimmune = 'Autoimmune',
    KidneyRenal = 'Kidney and Renal',
    Cancer = 'Cancer',
  }

  const conditions = [
    { name: 'Hypertension', category: Category.Cardiovascular },
    { name: 'Stroke', category: Category.Cardiovascular },
    { name: 'Diabetes Mellitus (Type 1 and Type 2)', category: Category.EndocrineMetabolic },
    { name: 'Polycystic Ovary Syndrome (PCOS)', category: Category.EndocrineMetabolic },
    { name: 'Systemic Lupus Erythematosus (SLE)', category: Category.Autoimmune },
    { name: 'End-Stage Renal Disease', category: Category.KidneyRenal },
    { name: 'Lung Cancer', category: Category.Cancer },
  ];

  const groupConditionsByCategory = () =>
    conditions.reduce((acc: Record<string, string[]>, { name, category }) => {
      if (!acc[category]) acc[category] = [];
      acc[category].push(name);
      return acc;
    }, {});

  const ConditionSection = () => {
    const grouped = groupConditionsByCategory();
    return (
      <div className="w-full border-t border-gray-300 py-6 space-y-6">
        <h2 className="text-2xl font-semibold">Underlying Health Conditions</h2>
        <div className="grid md:grid-cols-2 gap-8">
          {Object.entries(grouped).map(([category, items]) => (
            <div key={category}>
              <h3 className="text-lg font-medium text-[#333] mb-3">{category}</h3>
              <div className="grid sm:grid-cols-2 gap-2 text-sm text-gray-700">
                {items.map((item) => (
                  <CheckBox
                    key={item}
                    item={item}
                    checked={selectedConditions.includes(item)}
                    onChange={() =>
                      setSelectedConditions((prev) =>
                        prev.includes(item)
                          ? prev.filter((c) => c !== item)
                          : [...prev, item]
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

      {isLoadingProfile ? (
        <Spinner />
      ) : (
        <div className="grid md:grid-cols-4 sm:grid-cols-2 gap-4 mb-10">
          <TextBox title="Name" value={name} onChange={(e) => setName(e.target.value)} readOnly={!!user} />
          <TextBox title="Age" value={age} onChange={(e) => setAge(e.target.value)} readOnly={!!user} />
          <TextBox title="Weight" value={weight} onChange={(e) => setWeight(e.target.value)} readOnly={!!user} />
        </div>
      )}

      <div className="space-y-10">
        <SymptomCheckboxGroups
          selectedSymptoms={selectedSymptoms}
          setSelectedSymptoms={setSelectedSymptoms}
        />
        <ConditionSection />

        {submittedSymptoms.length > 0 && (
          <div className="border-t pt-6">
            <h2 className="text-xl font-semibold mb-2">Previously Selected Symptoms:</h2>
            <div className="flex flex-wrap gap-2">
              {submittedSymptoms.map((symptom) => (
                <div
                  key={symptom}
                  className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                >
                  {symptom.replace(/_/g, ' ')}
                </div>
              ))}
            </div>
          </div>
        )}
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
    </div>
  );
};

export default AdvancedSearchForm;
