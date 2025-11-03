import React, { useState, useCallback, useMemo } from 'react';
import { PopulationData, UrbanSprawlPrediction } from './types';
import Header from './components/Header';
import PopulationChart from './components/PopulationChart';
import StatCard from './components/StatCard';
import Map from './components/Map';
import { analyzePopulationData, predictUrbanSprawl } from './services/geminiService';

const gtaPopulationData: PopulationData[] = [
  { year: 1991, population: 3.8 },
  { year: 1996, population: 4.6 },
  { year: 2001, population: 5.1 },
  { year: 2006, population: 5.5 },
  { year: 2011, population: 6.0 },
  { year: 2016, population: 6.4 },
  { year: 2021, population: 6.7 },
  { year: 2031, population: 7.5, projected: true },
  { year: 2041, population: 9.5, projected: true },
];

const cityPopulationData: { [key: string]: PopulationData[] } = {
  'GTA': gtaPopulationData,
  'Toronto': [
    { year: 1991, population: 2.2 }, { year: 1996, population: 2.4 }, { year: 2001, population: 2.5 },
    { year: 2006, population: 2.6 }, { year: 2011, population: 2.7 }, { year: 2016, population: 2.8 },
    { year: 2021, population: 2.9 }, { year: 2031, population: 3.2, projected: true }, { year: 2041, population: 3.5, projected: true },
  ],
  'Mississauga': [
    { year: 1991, population: 0.45 }, { year: 1996, population: 0.55 }, { year: 2001, population: 0.61 },
    { year: 2006, population: 0.67 }, { year: 2011, population: 0.71 }, { year: 2016, population: 0.72 },
    { year: 2021, population: 0.73 }, { year: 2031, population: 0.78, projected: true }, { year: 2041, population: 0.85, projected: true },
  ],
  'Brampton': [
    { year: 1991, population: 0.23 }, { year: 1996, population: 0.26 }, { year: 2001, population: 0.32 },
    { year: 2006, population: 0.43 }, { year: 2011, population: 0.52 }, { year: 2016, population: 0.59 },
    { year: 2021, population: 0.65 }, { year: 2031, population: 0.75, projected: true }, { year: 2041, population: 0.88, projected: true },
  ],
  'Hamilton': [
    { year: 1991, population: 0.45 }, { year: 1996, population: 0.47 }, { year: 2001, population: 0.49 },
    { year: 2006, population: 0.50 }, { year: 2011, population: 0.52 }, { year: 2016, population: 0.53 },
    { year: 2021, population: 0.57 }, { year: 2031, population: 0.62, projected: true }, { year: 2041, population: 0.68, projected: true },
  ],
  'Markham': [
    { year: 1991, population: 0.15 }, { year: 1996, population: 0.18 }, { year: 2001, population: 0.21 },
    { year: 2006, population: 0.26 }, { year: 2011, population: 0.30 }, { year: 2016, population: 0.32 },
    { year: 2021, population: 0.34 }, { year: 2031, population: 0.38, projected: true }, { year: 2041, population: 0.42, projected: true },
  ],
  'Vaughan': [
    { year: 1991, population: 0.11 }, { year: 1996, population: 0.14 }, { year: 2001, population: 0.18 },
    { year: 2006, population: 0.24 }, { year: 2011, population: 0.29 }, { year: 2016, population: 0.31 },
    { year: 2021, population: 0.33 }, { year: 2031, population: 0.37, projected: true }, { year: 2041, population: 0.41, projected: true },
  ],
};

// Stat Icons
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
const TrendingUpIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>;
const CalendarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;

// Urban Sprawl Icons
const AreaGrowthIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4h4m12 4V4h-4M8 20v-4H4m12 4v-4h4m-4-6l-4-4-4 4m8 8l-4 4-4-4" /></svg>;
const DensityIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>;
const InfrastructureIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>;


export default function App() {
  const [selectedLocation, setSelectedLocation] = useState<string>('GTA');
  const [analysis, setAnalysis] = useState<string>('');
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState<boolean>(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  
  const [urbanSprawlPrediction, setUrbanSprawlPrediction] = useState<UrbanSprawlPrediction | null>(null);
  const [isLoadingSprawl, setIsLoadingSprawl] = useState<boolean>(false);
  const [sprawlError, setSprawlError] = useState<string | null>(null);

  const displayData = useMemo(() => {
    return cityPopulationData[selectedLocation] || gtaPopulationData;
  }, [selectedLocation]);

  const handleLocationChange = (location: string) => {
    const validLocation = cityPopulationData[location] ? location : 'GTA';
    setSelectedLocation(validLocation);
    setAnalysis('');
    setAnalysisError(null);
    setUrbanSprawlPrediction(null);
    setSprawlError(null);
  };

  const handleAnalysis = useCallback(async () => {
    setIsLoadingAnalysis(true);
    setAnalysisError(null);
    setAnalysis('');
    try {
      const result = await analyzePopulationData(displayData, selectedLocation);
      setAnalysis(result);
    } catch (e) {
      setAnalysisError('Failed to get analysis. Please try again.');
      console.error(e);
    } finally {
      setIsLoadingAnalysis(false);
    }
  }, [displayData, selectedLocation]);

  const handleSprawlPrediction = useCallback(async () => {
    setIsLoadingSprawl(true);
    setSprawlError(null);
    setUrbanSprawlPrediction(null);
    try {
        const result = await predictUrbanSprawl(displayData, selectedLocation);
        setUrbanSprawlPrediction(result);
    } catch (e) {
        setSprawlError('Failed to get urban sprawl prediction. Please try again.');
        console.error(e);
    } finally {
        setIsLoadingSprawl(false);
    }
  }, [displayData, selectedLocation]);
  
  const latestData = displayData.filter(d => !d.projected).slice(-1)[0];
  const firstData = displayData.filter(d => !d.projected)[0];
  const growth = firstData.population > 0 ? (((latestData.population - firstData.population) / firstData.population) * 100).toFixed(1) : '0.0';

  const locationName = selectedLocation === 'GTA' ? 'the Greater Toronto Area' : selectedLocation;

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
      <main className="container mx-auto px-4 py-8 md:px-8 md:py-12">
        <Header />

        <div className="mt-8">
            <Map 
              location={selectedLocation} 
              onLocationChange={handleLocationChange}
              prediction={urbanSprawlPrediction}
            />
        </div>
        
        <div className="mt-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              Statistics for <span className="text-cyan-400">{locationName}</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <StatCard title={`Latest Population (${latestData.year})`} value={`${latestData.population} M`} icon={<UsersIcon />} />
              <StatCard title={`Growth (${firstData.year}-${latestData.year})`} value={`+${growth}%`} icon={<TrendingUpIcon />} />
              <StatCard title={`Projected (${displayData.slice(-1)[0].year})`} value={`${displayData.slice(-1)[0].population} M`} icon={<CalendarIcon />} />
            </div>
        </div>

        <div className="mt-8 p-4 bg-gray-800/50 border border-gray-700 rounded-xl">
            <h2 className="text-2xl font-bold text-white mb-3 text-center">AI Insights</h2>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                <button
                onClick={handleAnalysis}
                disabled={isLoadingAnalysis || isLoadingSprawl}
                className="bg-cyan-500 hover:bg-cyan-600 disabled:bg-cyan-800 disabled:cursor-not-allowed text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg w-full sm:w-auto"
                >
                {isLoadingAnalysis ? 'Analyzing...' : `Analyze Population`}
                </button>
                <button
                onClick={handleSprawlPrediction}
                disabled={isLoadingSprawl || isLoadingAnalysis}
                className="bg-teal-500 hover:bg-teal-600 disabled:bg-teal-800 disabled:cursor-not-allowed text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg w-full sm:w-auto"
                >
                {isLoadingSprawl ? 'Predicting...' : `Predict Urban Sprawl`}
                </button>
            </div>
        </div>

        <div className="mt-8 bg-gray-800 p-4 sm:p-6 rounded-xl shadow-2xl border border-gray-700">
           <h2 className="text-xl sm:text-2xl font-bold text-cyan-300 mb-4">Population Growth Trend for {locationName} (in Millions)</h2>
           <div className="h-80 sm:h-96">
             <PopulationChart data={displayData} />
           </div>
        </div>
        
        {analysisError && <div className="mt-6 p-4 bg-red-900/50 text-red-300 border border-red-700 rounded-lg text-center">{analysisError}</div>}
        {sprawlError && <div className="mt-6 p-4 bg-red-900/50 text-red-300 border border-red-700 rounded-lg text-center">{sprawlError}</div>}
        
        {analysis && (
          <div className="mt-8 bg-gray-800 p-6 rounded-xl shadow-2xl border border-gray-700">
            <h3 className="text-2xl font-bold text-cyan-300 mb-4">Gemini Analysis for {locationName}</h3>
            <div className="prose prose-invert max-w-none text-gray-300 whitespace-pre-wrap">{analysis}</div>
          </div>
        )}
        
        {urbanSprawlPrediction && (
          <>
            <div className="mt-8 bg-gray-800 p-6 rounded-xl shadow-2xl border border-gray-700">
              <h3 className="text-2xl font-bold text-teal-300 mb-4">Gemini Urban Sprawl Prediction for {locationName}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                  <StatCard title="Projected Urban Area Growth" value={urbanSprawlPrediction.urbanAreaGrowth} icon={<AreaGrowthIcon />} />
                  <StatCard title="Population Density Change" value={urbanSprawlPrediction.populationDensityChange} icon={<DensityIcon />} />
                  <StatCard title="Infrastructure Strain" value={urbanSprawlPrediction.infrastructureStrain} icon={<InfrastructureIcon />} />
              </div>
              <div className="prose prose-invert max-w-none text-gray-300 whitespace-pre-wrap">{urbanSprawlPrediction.summary}</div>
            </div>
            
            {urbanSprawlPrediction.factorsConsidered && (
                <div className="mt-8 bg-gray-800 p-6 rounded-xl shadow-2xl border border-gray-700">
                    <h3 className="text-xl font-bold text-teal-300 mb-4">Key Factors Considered for Prediction</h3>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-gray-300">
                        {urbanSprawlPrediction.factorsConsidered.map((factor, index) => (
                            <li key={index} className="flex items-start">
                                <svg className="w-5 h-5 mr-2 mt-1 text-teal-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                <span>{factor}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
          </>
        )}


      </main>
       <footer className="text-center py-6 text-gray-500 text-sm">
        <p>Data sourced from historical census and provincial projections. City data is illustrative.</p>
        <p>&copy; {new Date().getFullYear()} GTA Population Insights. All rights reserved.</p>
      </footer>
    </div>
  );
}
