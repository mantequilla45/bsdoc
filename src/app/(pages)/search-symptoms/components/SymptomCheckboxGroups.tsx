'use client';
import React from 'react';
import CheckBox from './checkbox';
import { symptomGroups } from './symptomGroup';

interface Props {
  selectedSymptoms: string[];
  setSelectedSymptoms: React.Dispatch<React.SetStateAction<string[]>>;
}

// ✅ Memoized functional component with proper export
const SymptomCheckboxGroups = React.memo(function SymptomCheckboxGroups({
  selectedSymptoms,
  setSelectedSymptoms,
}: Props) {
  return (
    <div className="w-full border-t border-gray-300 py-6 space-y-6">
      <h2 className="text-2xl font-semibold">Symptoms</h2>
      <div
        className="flex flex-col gap-8 max-h-[500px] overflow-y-auto pr-2"
        style={{ scrollBehavior: 'smooth' }}
      >
        {Object.entries(symptomGroups).map(([group, symptoms]) => (
          <div key={group}>
            <h3 className="text-lg font-medium text-[#2D383D] mb-2">{group}</h3>
            <div className="grid md:grid-cols-2 gap-3 text-sm text-gray-700">
              {symptoms.map((symptom) => (
                <CheckBox
                  key={symptom}
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
}, areEqual);

// ✅ Memoization check
function areEqual(prev: Props, next: Props): boolean {
  return JSON.stringify(prev.selectedSymptoms) === JSON.stringify(next.selectedSymptoms);
}

export default SymptomCheckboxGroups;
