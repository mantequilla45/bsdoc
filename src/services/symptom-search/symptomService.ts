export const getSymptomInfo = async (symptoms: string[]) => {
  const response = await fetch("http://127.0.0.1:8000/symptom-info", {
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
  