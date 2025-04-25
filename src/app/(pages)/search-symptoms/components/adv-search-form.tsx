'use client';
import React, { useState, useEffect } from 'react';
import CheckBox from './checkbox';
import TextBox from './TextBox';
import { getSymptomInfo } from '@/services/symptom-search/symptomService';
import SymptomCheckboxGroups from './SymptomCheckboxGroups';
import { useUser } from '@supabase/auth-helpers-react';
import { supabase } from '@/lib/supabase';
import { symptomGroups } from './symptomGroup';

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

const MAX_SYMPTOM_SELECTION = 10;
const MAX_PER_CATEGORY = 4;

const Spinner: React.FC = () => (
  <div className="flex justify-center items-center h-32">
    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500" />
  </div>
);

const symptomCategoryMap: Record<string, string> = Object.entries(symptomGroups).reduce(
  (acc: Record<string, string>, [category, symptoms]) => {
    symptoms.forEach((symptom) => {
      acc[symptom] = category;
    });
    return acc;
  },
  {}
);

const AdvancedSearchForm: React.FC<{
  setResult: React.Dispatch<React.SetStateAction<SymptomResponse | null>>;
}> = ({ setResult }) => {
  const user = useUser();
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [submittedSymptoms, setSubmittedSymptoms] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [addRecord, setAddRecord] = useState(false);
  const [warning, setWarning] = useState('');
  const [underlyingConditions, setUnderlyingConditions] = useState('');
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

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

      if (profile) setName(`${profile.first_name} ${profile.last_name}`);
      if (medical) {
        setAge(medical.age?.toString() ?? '');
        setWeight(medical.weight?.toString() ?? '');
      }

      setIsLoadingProfile(false);
    };

    fetchProfile();
  }, [user]);

  const handleCheckboxChange = (symptom: string, checked: boolean) => {
    const category = symptomCategoryMap[symptom] || 'Uncategorized';
    const updated = checked
      ? [...selectedSymptoms, symptom]
      : selectedSymptoms.filter((s) => s !== symptom);

    if (checked && updated.length > MAX_SYMPTOM_SELECTION) {
      setWarning(`⚠️ You can only select up to ${MAX_SYMPTOM_SELECTION} symptoms.`);
      return;
    }

    const categoryCount = updated.filter((s) => symptomCategoryMap[s] === category).length;
    if (checked && categoryCount > MAX_PER_CATEGORY) {
      setWarning(`⚠️ Limit of ${MAX_PER_CATEGORY} symptoms from "${category}" category reached.`);
      return;
    }

    setSelectedSymptoms(updated);
    setWarning('');
  };

  const handleAssess = async () => {
    if (selectedSymptoms.length === 0) return;

    try {
      setLoading(true);
      setError('');

      const symptomsToSave = [...selectedSymptoms];
      const data = await getSymptomInfo(symptomsToSave);

      setSubmittedSymptoms(symptomsToSave);
      setResult(data);
      setSelectedSymptoms([]);

      if (user && addRecord) {
        const cleanLikely = data.likely_common_conditions.map((cond: Condition) => ({
          disease: cond.disease,
          commonality: cond.commonality,
          final_score: cond.final_score,
          precautions: cond.precautions,
          informational_medications: cond.informational_medications,
        }));

        const cleanOther = data.other_possible_conditions.map((cond: Condition) => ({
          disease: cond.disease,
          commonality: cond.commonality,
          final_score: cond.final_score,
          precautions: cond.precautions,
          informational_medications: cond.informational_medications,
        }));

        const payload: {
          user_id: string;
          input_symptoms: string[];
          likely_conditions: object[];
          other_conditions: object[];
          underlying_conditions?: Record<string, boolean>;
        } = {
          user_id: user.id,
          input_symptoms: symptomsToSave,
          likely_conditions: cleanLikely,
          other_conditions: cleanOther,
        };

        if (underlyingConditions.trim()) {
          const parsed = underlyingConditions
            .split(',')
            .map((s) => s.trim().toLowerCase().replace(/\s+/g, '_'))
            .filter((s) => s.length > 0)
            .reduce((acc: Record<string, boolean>, item) => {
              acc[item] = true;
              return acc;
            }, {});
          payload.underlying_conditions = parsed;
        }

        const { error: insertError } = await supabase
          .from('symptom_results')
          .insert([payload]);

        if (insertError) {
          console.error("[🔥 Insert Error]", insertError.message);
          setError('❌ Failed to save to database. See console for more info.');
          return;
        }

        console.log("✅ Successfully inserted to Supabase.");
      }
    } catch (err) {
      console.error(err);
      setError('❌ An error occurred while analyzing or saving.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-full p-6 md:p-12 bg-white rounded-xl shadow">
      <div className="mb-6">
        <h1 className="text-3xl md:text-4xl font-bold text-[#2D383D]">BSDOC Advanced Symptoms Search</h1>
        <p className="text-sm md:text-base text-gray-600 mt-1">
          Please fill the following form with the symptoms you are feeling.
        </p>
      </div>

      {isLoadingProfile ? (
        <Spinner />
      ) : (
        <div className="grid md:grid-cols-4 sm:grid-cols-2 gap-4 mb-10">
          <TextBox title="Name" value={name} onChange={() => {}} disabled />
          <TextBox title="Age" value={age} onChange={() => {}} disabled />
          <TextBox title="Weight" value={weight} onChange={() => {}} disabled />
        </div>
      )}

      <div className="space-y-10">
        <SymptomCheckboxGroups
          selectedSymptoms={selectedSymptoms}
          onCheckboxChange={handleCheckboxChange}
        />

        {warning && (
          <div className="text-red-600 text-sm font-semibold -mt-6">{warning}</div>
        )}

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

        <div className="mt-6">
          <TextBox
            title="Underlying Health Conditions (Optional)"
            value={underlyingConditions}
            onChange={(e) => setUnderlyingConditions(e.target.value)}
            placeholder="E.g. diabetes, hypertension, asthma (comma separated)"
          />
        </div>
      </div>

      <div className="flex justify-end items-center gap-6 mt-10">
        <CheckBox
          item="Add Record"
          checked={addRecord}
          onChange={() => setAddRecord(!addRecord)}
        />
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
