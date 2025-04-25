'use client';
// Removed ChangeEvent import based on previous errors
import React, { useState, useEffect } from 'react';
import CheckBox from './checkbox';
import TextBox from './TextBox'; // Assuming TextBoxProps are defined in TextBox.tsx
import { getSymptomInfo } from '@/services/symptom-search/symptomService';
import SymptomCheckboxGroups from './SymptomCheckboxGroups';
import { useUser } from '@supabase/auth-helpers-react';
import { supabase } from '@/lib/supabase';
import { symptomGroups } from './symptomGroup';

// Interfaces from your "new" code
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

// Interface for the 'records' table data, derived from your "old" code
interface RecordData {
  user_id: string;
  date: string;
  weight: number | null;
  age: number | null;
  symptoms: string[];
  health_conditions: string[]; // Expects string array
}

// Constants from your "new" code
const MAX_SYMPTOM_SELECTION = 10;
const MAX_PER_CATEGORY = 4;

// Spinner component from your "new" code
const Spinner: React.FC = () => (
  <div className="flex justify-center items-center h-32">
    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500" />
  </div>
);

// symptomCategoryMap from your "new" code
const symptomCategoryMap: Record<string, string> = Object.entries(
  symptomGroups
).reduce((acc: Record<string, string>, [category, symptoms]) => {
  symptoms.forEach((symptom) => {
    acc[symptom] = category;
  });
  return acc;
}, {});

// Main Component combining your "new" structure with "old" record saving logic
const AdvancedSearchForm: React.FC<{
  setResult: React.Dispatch<React.SetStateAction<SymptomResponse | null>>;
}> = ({ setResult }) => {
  // State variables from your "new" code
  const user = useUser();
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [submittedSymptoms, setSubmittedSymptoms] = useState<string[]>([]);
  const [loading, setLoading] = useState(false); // For assessment API call
  const [error, setError] = useState('');
  const [isLoadingProfile, setIsLoadingProfile] = useState(true); // For initial profile load
  const [addRecord, setAddRecord] = useState(false);
  const [warning, setWarning] = useState('');
  const [underlyingConditions, setUnderlyingConditions] = useState('');
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  // Added state for record saving errors specifically
  const [recordSaveError, setRecordSaveError] = useState('');

  // useEffect hook exactly as in your "new" code (handles autofill + initial loading)
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setIsLoadingProfile(false);
        setName(''); setAge(''); setWeight('');
        return;
      }
      // Set loading ON (initial state is true, but this ensures it's true if user appears later)
      setIsLoadingProfile(true);
      setError(''); // Clear previous errors
      try {
        const [profileResponse, medicalResponse] = await Promise.all([
          supabase
            .from('profiles')
            .select('first_name, last_name')
            .eq('id', user.id)
            .single(),
          supabase
            .from('medical_details')
            .select('age, weight')
            .eq('user_id', user.id)
            .single(),
        ]);
        const { data: profile, error: profileError } = profileResponse;
        const { data: medical, error: medicalError } = medicalResponse;
        if (profileError) console.error("Error fetching profile:", profileError);
        if (medicalError) console.error("Error fetching medical details:", medicalError);
        // Set state for autofill
        setName(profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : '');
        setAge(medical?.age?.toString() ?? '');
        setWeight(medical?.weight?.toString() ?? '');
      } catch (err) {
        console.error("Error fetching profile/medical details:", err);
        setError("Failed to load user details.");
        setName(''); setAge(''); setWeight('');
      } finally {
        // Set loading OFF
        setIsLoadingProfile(false);
      }
    };
    fetchProfile();
  }, [user]);

  // handleCheckboxChange from your "new" code
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

  // handleAssess function merging "new" assessment logic with "old" record saving logic
  const handleAssess = async () => {
    // Validation from "new" code
    if (selectedSymptoms.length === 0) {
        setWarning('⚠️ Please select at least one symptom.');
        return;
    }
    setWarning(''); // Clear symptom warning
    setRecordSaveError(''); // Clear previous record save error
    setError(''); // Clear previous general error

    // --- Immediate Record Save logic (adapted from your "old" code) ---
    if (user && addRecord) {
      const currentDate = new Date().toISOString().split('T')[0];
      const parsedAge = age ? parseInt(age, 10) : null;
      const parsedWeight = weight ? parseInt(weight, 10) : null;

      // Validation for age/weight format
      if (age && isNaN(parsedAge as number)) {
        setRecordSaveError("❌ Invalid age format for record saving. Please enter a number.");
      }
      if (weight && isNaN(parsedWeight as number)) {
        setRecordSaveError("❌ Invalid weight format for record saving. Please enter a number.");
      }

      // *** Adaption: Parse underlyingConditions string to string array ***
      const parsedHealthConditions = underlyingConditions
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      // Construct data object matching RecordData interface
      const recordData: RecordData = {
        user_id: user.id,
        date: currentDate,
        weight: !isNaN(parsedWeight as number) ? parsedWeight : null,
        age: !isNaN(parsedAge as number) ? parsedAge : null,
        symptoms: [...selectedSymptoms], // Use current selected symptoms
        health_conditions: parsedHealthConditions, // Use parsed array
      };

      console.log(
        '[Attempting Record Insert into "records"] Data prepared:',
        JSON.stringify(recordData, null, 2)
      );

      // Use .insert() as requested to allow multiple records per user/day
      supabase
        .from('records')
        .insert([recordData]) // Assumes 'records' has its own auto-gen PK
        .then(({ data: insertData, error: recordError }) => {
          if (recordError) {
            console.error(
              '[Record Insert Error - "records" table] Raw Error Object:',
              recordError
            );
            const errorMessage =
              recordError.message || 'Unknown error during record insert.';
            if (recordError.message.includes("duplicate key value violates unique constraint")) {
                 setRecordSaveError(`❌ Failed to save record: Primary key conflict. Check 'records' table configuration.`);
            } else {
                 setRecordSaveError(`❌ Failed to save record: ${errorMessage}`);
            }
          } else {
            console.log(
              '[Record Inserted into "records" table] Success Data:',
              insertData
            );
            console.log('[Record Inserted into "records" table] ✔️');
          }
        });
    }
    // --- End Immediate Record Save logic ---

    // --- Symptom Analysis API Call and 'symptom_results' Save (from your "new" code) ---
    setLoading(true); // Start assessment loading AFTER potential record save initiated

    try {
      const symptomsToAnalyze = [...selectedSymptoms]; // Snapshot symptoms for analysis
      const data: SymptomResponse = await getSymptomInfo(symptomsToAnalyze);

      setSubmittedSymptoms(symptomsToAnalyze); // Update UI
      setResult(data); // Pass result to parent
      setSelectedSymptoms([]); // Clear selection

      // Save analysis results if user is logged in and addRecord is checked
      if (user && addRecord) {
          const cleanLikely = data.likely_common_conditions.map((cond: Condition) => ({
                disease: cond.disease, commonality: cond.commonality, final_score: cond.final_score,
                precautions: cond.precautions, informational_medications: cond.informational_medications,
              }));
          const cleanOther = data.other_possible_conditions.map((cond: Condition) => ({
                disease: cond.disease, commonality: cond.commonality, final_score: cond.final_score,
                precautions: cond.precautions, informational_medications: cond.informational_medications,
              }));

           const payload: {
               user_id: string; input_symptoms: string[]; likely_conditions: object[];
               other_conditions: object[]; underlying_conditions?: Record<string, boolean>;
           } = {
               user_id: user.id, input_symptoms: symptomsToAnalyze, likely_conditions: cleanLikely,
               other_conditions: cleanOther,
           };

            // Process underlyingConditions for 'symptom_results' format
            if (underlyingConditions.trim()) {
                const parsedForSymptomResults = underlyingConditions.split(',').map((s) => s.trim().toLowerCase().replace(/\s+/g, '_'))
                    .filter((s) => s.length > 0).reduce((acc: Record<string, boolean>, item) => { acc[item] = true; return acc; }, {});
                payload.underlying_conditions = parsedForSymptomResults;
              }

           // Insert into 'symptom_results' table
           const { error: insertError } = await supabase.from('symptom_results').insert([payload]);

           if (insertError) {
               console.error("[🔥 Insert Error - 'symptom_results']", insertError.message);
               setError('❌ Failed to save symptom results to database. See console.'); // Set general error
           } else {
               console.log("✅ Successfully inserted to symptom_results.");
           }
      }
       // --- End Save Results to 'symptom_results' ---

    } catch (err) {
      console.error('[Assessment or Result Save Error]', err);
      setError('❌ An error occurred during symptom analysis or saving results.');
    } finally {
      setLoading(false); // Stop assessment loading
    }
     // --- End Symptom Analysis ---
  };

  // JSX structure from your "new" code, with prop errors fixed
  return (
    <div className="w-full h-full p-6 md:p-12 bg-white rounded-xl shadow">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl md:text-4xl font-bold text-[#2D383D]">
          BSDOC Advanced Symptoms Search
        </h1>
        <p className="text-sm md:text-base text-gray-600 mt-1">
          Please fill the following form with the symptoms you are feeling.
        </p>
      </div>

      {/* Profile Info Section with Initial Loading Spinner */}
      {isLoadingProfile ? (
        <Spinner />
      ) : (
        <div className="grid md:grid-cols-3 sm:grid-cols-1 gap-4 mb-10">
          <TextBox
            title="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={!!user}
            // readOnly removed
            // type removed
          />
          <TextBox
            title="Age"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            disabled={!!user}
             // readOnly removed
            // type removed
          />
          <TextBox
            title="Weight (kg)"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            disabled={!!user}
             // readOnly removed
            // type removed
          />
        </div>
      )}

      {/* Main Form Content */}
      <div className="space-y-10">
        {/* Symptom Checkboxes */}
        <SymptomCheckboxGroups
          selectedSymptoms={selectedSymptoms}
          onCheckboxChange={handleCheckboxChange}
        />

        {/* Symptom Selection Warning */}
        {warning && (
          <div className="text-red-600 text-sm font-semibold -mt-6">{warning}</div>
        )}

        {/* Submitted Symptoms Display */}
        {submittedSymptoms.length > 0 && (
          <div className="border-t pt-6">
            <h2 className="text-xl font-semibold mb-2">
              Submitted Symptoms for Last Assessment:
            </h2>
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

        {/* Underlying Conditions Input */}
        <div className="mt-6">
          <TextBox
            title="Underlying Health Conditions (Optional)"
            value={underlyingConditions}
            onChange={(e) => setUnderlyingConditions(e.target.value)}
            placeholder="E.g. diabetes, hypertension, asthma (comma separated)"
          />
           {/* Display Record Save Error for format issues */}
           {recordSaveError && recordSaveError.includes("format") && (
               <p className="text-red-500 text-xs mt-1">{recordSaveError}</p>
           )}
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end items-center gap-6 mt-10">
        {/* Only show checkbox if user is logged in */}
        {user && (
           <CheckBox
              item="Add to my records"
              checked={addRecord}
              onChange={() => setAddRecord(!addRecord)}
            />
        )}
        {/* Assess Button */}
        <button
          onClick={handleAssess}
          className={`px-6 py-3 bg-[#A3E7EA] hover:bg-[#9AE0E3] active:bg-[#91D7DA] rounded-md font-semibold transition-all duration-200 active:scale-95 ${
             (loading || selectedSymptoms.length === 0) ? 'opacity-50 cursor-not-allowed' : '' // Disable button visually
          }`}
          disabled={loading || selectedSymptoms.length === 0} // Disable button functionally during assessment loading or if no symptoms
        >
          {loading ? 'Assessing...' : 'Assess'}
        </button>
      </div>

      {/* Loading/Error Display Area */}
      <div className="mt-4 text-right h-5"> {/* Reserve space for messages */}
           {/* Display Record Save Error (non-format related) */}
           {recordSaveError && !recordSaveError.includes("format") && (
               <p className="text-amber-600 text-sm">{recordSaveError}</p>
           )}
           {/* Display ASSESSMENT loading message */}
           {loading && <p className="text-blue-500 text-sm">Analyzing symptoms...</p>}
           {/* Display General Error (assessment or symptom_results save error) */}
           {error && <p className="text-red-500 text-sm">{error}</p>}
      </div>
    </div>
  );
};

export default AdvancedSearchForm;