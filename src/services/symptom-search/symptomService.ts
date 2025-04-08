export const getSymptomInfo = async (symptoms: string[]) => {
  const response = await fetch("https://symptom-search-bsdoc.onrender.com/symptom-info", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ symptoms }),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch symptom info");
  }

  return response.json();
};
