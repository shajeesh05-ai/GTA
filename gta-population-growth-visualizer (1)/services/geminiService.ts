import { GoogleGenAI, Type } from "@google/genai";
import { PopulationData, UrbanSprawlPrediction } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const analyzePopulationData = async (data: PopulationData[], location: string): Promise<string> => {
  const locationName = location === 'GTA' ? 'the Greater Toronto Area (GTA)' : location;
  const prompt = `
    You are an expert urban planning and demographics analyst.
    Analyze the following population data for ${locationName} and provide a brief, insightful summary of the growth trend.
    The data includes historical figures and future projections.
    Population numbers are in millions.
    
    Data:
    ${JSON.stringify(data, null, 2)}
    
    Your summary should be concise, easy to read for a general audience, and highlight key takeaways, such as the rate of growth and the implications of the projected numbers. Format your output as simple text.
    `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to generate analysis from Gemini API.");
  }
};


export const predictUrbanSprawl = async (data: PopulationData[], location: string): Promise<UrbanSprawlPrediction> => {
    const locationName = location === 'GTA' ? 'the Greater Toronto Area (GTA)' : location;
    const expertContext = `
    Predicting urban sprawl involves analyzing demographic, economic, and spatial data. Key indicators include population growth, job growth, land use, transportation infrastructure, zoning regulations, and proximity to services and natural features. For the Greater Toronto Area, a major constraint is the Ontario Greenbelt, a protected area of green space, farmland, and natural heritage sites which limits outward expansion in many areas. Therefore, growth is often channeled towards designated intensification areas or along major transportation corridors like Highways 401, 407, and 400.
    `;
    
    const prompt = `
    Act as an expert geo-spatial and urban planning analyst. Based on the expert context and population data for ${locationName}, predict future urban sprawl. The population data is a primary indicator of future demand.

    Expert Context:
    ${expertContext}

    Population Data for ${locationName} (in millions):
    ${JSON.stringify(data, null, 2)}

    Your task is to provide a structured JSON output. Based on the projected population increase and the provided context (especially transportation corridors and Greenbelt constraints), provide estimates for the following:
    1. "urbanAreaGrowth": A string for the estimated percentage increase in physical urban footprint by 2041 (e.g., "15-20%").
    2. "populationDensityChange": A short descriptive string (e.g., "Moderate Increase", "High Increase", "Significant Densification").
    3. "infrastructureStrain": A qualitative rating (e.g., "Moderate", "High", "Very High").
    4. "summary": A concise paragraph (4-6 sentences) explaining your predictions, referencing population data and the principles from the expert context.
    5. "factorsConsidered": An array of 4-5 strings listing key factors you considered (e.g., "High projected population growth", "Proximity to major highways", "Ontario Greenbelt legislation").
    6. "growthHotspots": An array of 2-3 short, specific, map-searchable strings identifying potential high-growth areas within or adjacent to ${locationName}. For example: 'Northwest Brampton', 'Vaughan Metropolitan Centre', 'East Markham near Hwy 404'.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        urbanAreaGrowth: { type: Type.STRING },
                        populationDensityChange: { type: Type.STRING },
                        infrastructureStrain: { type: Type.STRING },
                        summary: { type: Type.STRING },
                        factorsConsidered: { 
                            type: Type.ARRAY,
                            items: { type: Type.STRING }
                        },
                        growthHotspots: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING }
                        }
                    },
                    required: ["urbanAreaGrowth", "populationDensityChange", "infrastructureStrain", "summary", "factorsConsidered", "growthHotspots"]
                },
            }
        });

        const jsonText = response.text.trim();
        const prediction = JSON.parse(jsonText);

        if (prediction && prediction.summary && prediction.growthHotspots && Array.isArray(prediction.growthHotspots)) {
          return prediction as UrbanSprawlPrediction;
        } else {
          throw new Error("Invalid JSON structure received from API.");
        }
    } catch (error) {
        console.error("Error calling Gemini API for urban sprawl prediction:", error);
        throw new Error("Failed to generate urban sprawl prediction from Gemini API.");
    }
};
