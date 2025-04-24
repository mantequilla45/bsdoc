'use client';
import React from 'react';
import CheckBox from './checkbox';
import { symptomGroups } from './symptomGroup';

interface Props {
  selectedSymptoms: string[];
  onCheckboxChange: (symptom: string, checked: boolean) => void;
}

// ✅ Memoized functional component
const SymptomCheckboxGroups = React.memo(function SymptomCheckboxGroups({
  selectedSymptoms,
  onCheckboxChange,
}: Props) {
  // ✅ Fix: Provide explicit type to accumulator object
  const symptomCategoryMap: Record<string, string> = Object.entries(symptomGroups).reduce(
    (acc: Record<string, string>, [category, symptoms]) => {
      symptoms.forEach((symptom) => {
        acc[symptom] = category;
      });
      return acc;
    },
    {} as Record<string, string>
  );

  const tooManySelected = selectedSymptoms.length > 10;

  return (
    <div className="w-full border-t border-gray-300 py-6 space-y-6">
      <h2 className="text-2xl font-semibold text-[#2D383D]">Symptoms</h2>

      <div className="flex flex-col gap-2">
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
          <span className="text-lg">⚠️</span>
          <p className="text-sm leading-snug">
            You can only select up to <span className="font-semibold">4 symptoms</span> per category.
          </p>
        </div>
        <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-md">
          <span className="text-lg">⚠️</span>
          <p className="text-sm leading-snug">
            Selecting too many unrelated symptoms may lead to <span className="font-semibold">inaccurate results</span>. Try to be as specific as possible.
          </p>
        </div>
        {tooManySelected && (
          <div className="flex items-start gap-2 p-3 bg-orange-50 border border-orange-200 text-orange-700 rounded-md">
            <span className="text-lg">⚠️</span>
            <p className="text-sm leading-snug">
              You&apos;ve selected more than <span className="font-semibold">10 symptoms</span>. This may reduce result quality. Try to focus on your most prominent symptoms to prevent the model from providing inaccurate results.
            </p>
          </div>
        )}
      </div>

      <div
        className="flex flex-col gap-6 max-h-[500px] overflow-y-auto pr-2"
        style={{ scrollBehavior: 'smooth' }}
      >
        {Object.entries(symptomGroups).map(([group, symptoms]) => {
          const currentCategoryCount = selectedSymptoms.filter(
            (s) => symptomCategoryMap[s] === group
          ).length;

          return (
            <div
              key={group}
              className="p-4 rounded-lg border border-gray-200 shadow-sm bg-gray-50 space-y-2"
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {group} ({currentCategoryCount}/4)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-sm text-gray-700">
                {symptoms.map((symptom) => {
                  const isChecked = selectedSymptoms.includes(symptom);
                  const disableCheckbox =
                    !isChecked && currentCategoryCount >= 4;

                  return (
                    <CheckBox
                      key={symptom}
                      item={symptom.replace(/_/g, ' ')}
                      checked={isChecked}
                      onChange={(checked) => onCheckboxChange(symptom, checked)}
                      disabled={disableCheckbox}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}, areEqual);

// ✅ Memoization check
function areEqual(prev: Props, next: Props): boolean {
  return JSON.stringify(prev.selectedSymptoms) === JSON.stringify(next.selectedSymptoms);
}

export default SymptomCheckboxGroups;
