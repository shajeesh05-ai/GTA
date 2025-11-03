export interface PopulationData {
  year: number;
  population: number;
  projected?: boolean;
}

export interface UrbanSprawlPrediction {
    urbanAreaGrowth: string;
    populationDensityChange: string;
    infrastructureStrain: string;
    summary: string;
    factorsConsidered: string[];
    growthHotspots: string[];
}
