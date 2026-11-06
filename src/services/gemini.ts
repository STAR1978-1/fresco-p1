const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
// Se utiliza el modelo oficial gemini-1.5-flash
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]);
    };
    reader.onerror = (err) => reject(err);
  });
};

export interface ScannedFood {
  name: string;
  daysLeft: number;
  quantity: string;
}

export async function analyzeFoodImage(file: File): Promise<ScannedFood> {
  const base64Data = await fileToBase64(file);

  const prompt = `Analiza la foto del alimento. Identifícalo y estima sus días de vida útil restantes.
  Responde ÚNICAMENTE en formato JSON con la siguiente estructura exacta:
  {
    "name": "Nombre del alimento en español",
    "daysLeft": número_de_dias_estimados,
    "quantity": "cantidad estimada (ej. 1 kg, 500g, 3 unidades)"
  }`;

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [
          { text: prompt },
          { inline_data: { mime_type: file.type, data: base64Data } }
        ]
      }],
      generationConfig: {
        response_mime_type: "application/json"
      }
    })
  });

  const data = await response.json();

  if (!response.ok || !data.candidates) {
    throw new Error(data.error?.message || "Respuesta inválida de la API de Gemini");
  }

  const jsonText = data.candidates[0].content.parts[0].text;
  return JSON.parse(jsonText) as ScannedFood;
}
