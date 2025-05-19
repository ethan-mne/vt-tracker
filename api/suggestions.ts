import type { NextApiRequest, NextApiResponse } from "next";

interface Suggestion {
  description: string;
  place_id: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ predictions: Suggestion[] } | { error: string }>
) {
  const apiKey = process.env.VITE_GOOGLE_MAPS_API_KEY;
  const input = req.query.input as string;

  if (!input) return res.status(400).json({ error: "Paramètre 'input' manquant" });
  if (!apiKey) return res.status(500).json({ error: "Clé API non configurée" });

  try {
    const url = new URL("https://maps.googleapis.com/maps/api/place/autocomplete/json");
    url.searchParams.set("input", input);
    url.searchParams.set("key", apiKey);
    url.searchParams.set("types", "address");
    url.searchParams.set("language", "fr");

    const response = await fetch(url.toString());
    const data = await response.json();

    if (data.status !== "OK") {
      return res.status(400).json({ error: data.error_message || "Erreur de l'API Google" });
    }

    const predictions: Suggestion[] = data.predictions.map((p: any) => ({
      description: p.description,
      place_id: p.place_id
    }));

    return res.status(200).json({ predictions });

  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}