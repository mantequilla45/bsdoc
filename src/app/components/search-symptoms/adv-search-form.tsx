import { useState } from 'react';



const AdvancedSearchForm = () => {
    const TextBox = ({ title }: { title: string }) => {
        return (
            <div className="flex flex-col gap-3 w-full">
                <p className="text-2xl">{title}</p>
                <input
                    placeholder="Your Answer"
                    className="mb-2 py-3 px-6 rounded-xl placeholder:font-light border-[1px] 
                    border-gray-300 w-[80%] 
                    focus:border-gray-400 focus:outline-none"
                />
            </div>
        );
    }

    const CircleCheckbox = ({ checked, onChange }: { checked: boolean; onChange: (checked: boolean) => void }) => {
        return (
            <input
                type="checkbox"
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
                className="w-6 h-6 appearance-none border-2 border-gray-300 rounded-full cursor-pointer bg-white
                      checked:bg-blue-500 checked:border-blue-600 
                      hover:border-indigo-400
                      transition-all duration-200 ease-in-out
                      relative
                      after:content-[''] after:absolute after:top-1/2 after:left-1/2
                      after:w-[10px] after:h-[10px] after:rounded-full
                      after:bg-white after:-translate-x-1/2 after:-translate-y-1/2
                      checked:after:block after:hidden"
            />
        );
    };

    const CheckBox = () => {
        return (
            <input
                type="checkbox"
                className="w-5 h-5 appearance-none border-2 border-gray-300 rounded-md cursor-pointer
                            checked:bg-blue-500 checked:border-blue-500 
                            hover:border-blue-600 hover:shadow-sm
                            transition-all duration-200 ease-in-out
                            relative
                            after:content-[''] after:absolute after:top-[2px] after:left-[5px]
                            after:w-[6px] after:h-[10px] after:border-r-2 after:border-b-2
                            after:border-white after:rotate-45
                            checked:after:block after:hidden"
            />
        );
    }

    const Gender = () => {
        const [selectedGender, setSelectedGender] = useState<'male' | 'female' | null>(null);
        return (
            <div className="flex flex-col w-full">
                <p className="text-2xl mb-6">Gender</p>
                <div className="flex flex-row gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <CircleCheckbox
                            checked={selectedGender === 'male'}
                            onChange={() => setSelectedGender('male')}
                        />
                        <p>Male</p>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <CircleCheckbox
                            checked={selectedGender === 'female'}
                            onChange={() => setSelectedGender('female')}
                        />
                        <p>Female</p>
                    </label>
                </div>
            </div>
        );
    };

    enum Category {
        Respiratory = 'Respiratory',
        PainAndDiscomfort = 'Pain & Discomfort',
        Digestive = 'Digestive',
        TemperatureRelated = 'Temperature Related',
        General = 'General',
        SkinRelated = 'Skin Related',
        MentalNeurological = 'Mental/Neurological',
        Cardiovascular = 'Cardiovascular',
        EndocrineMetabolic = 'Endocrine and Metabolic',
        Autoimmune = 'Autoimmune',
        KidneyRenal = 'Kidney and Renal',
        Cancer = 'Cancer'
    }

    interface SymptomCondition {
        name: string;
        category: Category;
    }

    const symptoms: SymptomCondition[] = [
        // Respiratory
        { name: 'Dry Cough', category: Category.Respiratory },
        { name: 'Cough with Phlegm', category: Category.Respiratory },
        { name: 'Runny Nose', category: Category.Respiratory },
        { name: 'Sore Throat', category: Category.Respiratory },
        { name: 'Shortness of Breath', category: Category.Respiratory },
        { name: 'Wheezing', category: Category.Respiratory },

        // Pain & Discomfort
        { name: 'Headache', category: Category.PainAndDiscomfort },
        { name: 'Body Pain', category: Category.PainAndDiscomfort },
        { name: 'Muscle Aches', category: Category.PainAndDiscomfort },
        { name: 'Joint Pain', category: Category.PainAndDiscomfort },
        { name: 'Chest Pain', category: Category.PainAndDiscomfort },
        { name: 'Abdominal Pain', category: Category.PainAndDiscomfort },

        // Digestive
        { name: 'Nausea', category: Category.Digestive },
        { name: 'Vomiting', category: Category.Digestive },
        { name: 'Diarrhea', category: Category.Digestive },
        { name: 'Constipation', category: Category.Digestive },
        { name: 'Loss of Appetite', category: Category.Digestive },
        { name: 'Bloating', category: Category.Digestive },

        // Temperature Related
        { name: 'Fever', category: Category.TemperatureRelated },
        { name: 'Chills', category: Category.TemperatureRelated },
        { name: 'Night Sweats', category: Category.TemperatureRelated },
        { name: 'Hot Flashes', category: Category.TemperatureRelated },
        { name: 'Cold Sweats', category: Category.TemperatureRelated },
        { name: 'Shivering', category: Category.TemperatureRelated },

        // General
        { name: 'Fatigue', category: Category.General },
        { name: 'Dizziness', category: Category.General },
        { name: 'Weakness', category: Category.General },
        { name: 'Sleep Problems', category: Category.General },
        { name: 'Loss of Balance', category: Category.General },
        { name: 'Blurred Vision', category: Category.General },

        // Skin Related
        { name: 'Rash', category: Category.SkinRelated },
        { name: 'Itching', category: Category.SkinRelated },
        { name: 'Sweating', category: Category.SkinRelated },
        { name: 'Skin Discoloration', category: Category.SkinRelated },
        { name: 'Hives', category: Category.SkinRelated },
        { name: 'Dry Skin', category: Category.SkinRelated },

        // Mental/Neurological
        { name: 'Confusion', category: Category.MentalNeurological },
        { name: 'Memory Problems', category: Category.MentalNeurological },
        { name: 'Anxiety', category: Category.MentalNeurological },
        { name: 'Depression', category: Category.MentalNeurological },
        { name: 'Mood Changes', category: Category.MentalNeurological },
        { name: 'Irritability', category: Category.MentalNeurological }
    ];


    const conditions: SymptomCondition[] = [

        // Cardiovascular Conditions
        { name: 'Hypertension', category: Category.Cardiovascular },
        { name: 'Coronary Artery Disease', category: Category.Cardiovascular },
        { name: 'Heart Failure', category: Category.Cardiovascular },
        { name: 'Arrhythmia', category: Category.Cardiovascular },
        { name: 'Stroke', category: Category.Cardiovascular },
        { name: 'Peripheral Artery Disease', category: Category.Cardiovascular },

        // Endocrine and Metabolic Conditions
        { name: 'Diabetes Mellitus (Type 1 and Type 2)', category: Category.EndocrineMetabolic },
        { name: 'Hypothyroidism', category: Category.EndocrineMetabolic },
        { name: 'Hyperthyroidism', category: Category.EndocrineMetabolic },
        { name: 'Polycystic Ovary Syndrome (PCOS)', category: Category.EndocrineMetabolic },
        { name: 'Obesity', category: Category.EndocrineMetabolic },
        { name: 'Cushing\'s Syndrome', category: Category.EndocrineMetabolic },

        // Autoimmune Conditions
        { name: 'Rheumatoid Arthritis', category: Category.Autoimmune },
        { name: 'Systemic Lupus Erythematosus (SLE)', category: Category.Autoimmune },
        { name: 'Psoriasis', category: Category.Autoimmune },
        { name: 'Hashimoto\'s Thyroiditis', category: Category.Autoimmune },
        { name: 'Multiple Sclerosis', category: Category.Autoimmune },
        { name: 'Graves\' Disease', category: Category.Autoimmune },

        // Kidney and Renal Conditions
        { name: 'Chronic Kidney Disease', category: Category.KidneyRenal },
        { name: 'Polycystic Kidney Disease', category: Category.KidneyRenal },
        { name: 'Kidney Stones', category: Category.KidneyRenal },
        { name: 'Nephrotic Syndrome', category: Category.KidneyRenal },
        { name: 'Acute Kidney Injury', category: Category.KidneyRenal },
        { name: 'End-Stage Renal Disease', category: Category.KidneyRenal },

        // Cancer
        { name: 'Breast Cancer', category: Category.Cancer },
        { name: 'Prostate Cancer', category: Category.Cancer },
        { name: 'Lung Cancer', category: Category.Cancer },
        { name: 'Colorectal Cancer', category: Category.Cancer },
        { name: 'Leukemia', category: Category.Cancer },
        { name: 'Pancreatic Cancer', category: Category.Cancer }
    ];

    const groupSymptomsByCategory = (symptoms: SymptomCondition[]) => {
        const grouped = {} as Record<Category, string[]>;

        symptoms.forEach(symptom => {
            if (!grouped[symptom.category]) {
                grouped[symptom.category] = [];
            }
            grouped[symptom.category].push(symptom.name);
        });

        return grouped;
    };

    const SymptomsConditions = ({ title }: { title: string }) => {
        const groupedSymptoms = groupSymptomsByCategory(title === "Symptoms" ? symptoms : conditions);
        return (
            <div className="flex flex-col gap-3 w-full gap-5 border-t-[1px] border-black py-7">
                <p className="text-2xl">{title}</p>
                <div className="flex flex-row grid grid-cols-2 gap-10">
                    {Object.entries(groupedSymptoms).map(([category, items]) => (
                        <div key={category} className="px-5 space-y-3">
                            <p className="text-xl font-regular">
                                {category}
                            </p>
                            <div className={`grid grid-cols-2 gap-4 font-light`}>
                                {items.map((item, index) => (
                                    <div key={index} className="flex flex-row items-center gap-4">
                                        <CheckBox />
                                        <p>{item}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        );
    };

    return (
        <div className="flex flex-col w-full h-full p-16">
            <div>
                <p className="text-4xl">
                    BSDOC Advanced Symptoms Search
                </p>
                <p>
                    Please fill the following form with the symptoms you are feeling.
                </p>
            </div>
            <div className="flex flex-row justify-between my-10">
                <TextBox title="Name" />
                <TextBox title="Age" />
                <TextBox title="Weight" />
                <Gender />
            </div>
            <div className="space-y-10">
                <SymptomsConditions title="Symptoms" />
                <SymptomsConditions title="Underlying Health Conditions" />
            </div>
            <div className="flex flex-row justify-end items-center gap-6 w-full">
                <div className="flex flex-row gap-3">
                    <CheckBox />
                    <p>Add Record</p>
                </div>
                <div className="cursor-pointer px-6 p-3 rounded-md bg-[#A3E7EA] hover:bg-[#9AE0E3] active:bg-[#91D7DA] duration-300 active:scale-95">
                    Assess
                </div>
            </div>
        </div>
    );
}

export default AdvancedSearchForm;