const API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const API_URL = "https://api.groq.com/openai/v1/chat/completions";

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
  });
};

export interface ScannedFood {
  name: string;
  daysLeft: number;
  quantity: string;
}

export async function analyzeFoodImage(file: File): Promise<ScannedFood> {
  const base64Image = await fileToBase64(file);

  const prompt = `Analiza la foto del alimento. Identifícalo y estima sus días de vida útil restantes.
  Responde ÚNICAMENTE en formato JSON con la siguiente estructura exacta:
  {
    "name": "Nombre del alimento en español",
    "daysLeft": 5,
    "quantity": "cantidad estimada (ej. 1 kg, 500g, 3 unidades)"
  }`;

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "llama-3.2-11b-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            { type: "image_url", image_url: { url: base64Image } }
          ]
        }
      ],
      response_format: { type: "json_object" }
    })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || "Error al conectar con la API de Groq");
  }

  const content = data.choices[0].message.content;
  return JSON.parse(content) as ScannedFood;
}
