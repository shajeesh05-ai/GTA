import React, { useState, useEffect } from 'react';
import { UrbanSprawlPrediction } from '../types';

interface MapProps {
    location: string;
    onLocationChange: (location: string) => void;
    prediction: UrbanSprawlPrediction | null;
}

const Map: React.FC<MapProps> = ({ location, onLocationChange, prediction }) => {
  const [mapUrl, setMapUrl] = useState<string>('');
  const [inputValue, setInputValue] = useState<string>(location);
  const [focusedHotspot, setFocusedHotspot] = useState<string | null>(null);

  const gtaCities = ['Toronto', 'Mississauga', 'Brampton', 'Hamilton', 'Markham', 'Vaughan'];
  
  // Reset focused hotspot if the main location or the prediction changes
  useEffect(() => {
    setFocusedHotspot(null);
  }, [location, prediction]);

  useEffect(() => {
    let newQuery: string;
    let newZoom: number;

    if (focusedHotspot) {
        // Zoom into a specific predicted hotspot
        newQuery = `${focusedHotspot}, ${location}`;
        newZoom = 14;
    } else {
        // Default view for the selected city/region
        newQuery = location === 'GTA' ? 'Greater Toronto Area' : `${location}, Ontario, Canada`;
        newZoom = location === 'GTA' ? 9 : 12;
    }
    
    const encodedQuery = encodeURIComponent(newQuery);
    setMapUrl(`https://maps.google.com/maps?t=&z=${newZoom}&ie=UTF8&iwloc=&output=embed&q=${encodedQuery}`);
    
    // Sync input field if location is changed from outside
    if (inputValue !== location) {
        setInputValue(location);
    }
  }, [location, focusedHotspot]);
  
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLocationChange(inputValue || 'GTA');
  };

  const handleCityClick = (city: string) => {
    setInputValue(city);
    onLocationChange(city);
  }

  return (
    <div className="bg-gray-800 p-4 sm:p-6 rounded-xl shadow-2xl border border-gray-700">
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
        <h2 className="text-xl sm:text-2xl font-bold text-cyan-300 flex-shrink-0">Geographic Area</h2>
        <form onSubmit={handleFormSubmit} className="flex w-full sm:w-auto sm:max-w-xs">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Search city or reset to GTA..."
              className="bg-gray-900 border border-gray-600 text-gray-200 text-sm rounded-l-md focus:ring-cyan-500 focus:border-cyan-500 block w-full p-2.5 transition"
              aria-label="Search for a city"
            />
            <button
              type="submit"
              className="bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-2.5 px-4 rounded-r-md transition-colors duration-300"
              aria-label="Search map"
            >
              Search
            </button>
        </form>
      </div>
      
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="text-sm text-gray-400 font-medium mr-2">Quick Look:</span>
        <button
            onClick={() => handleCityClick('GTA')}
            className={`text-xs sm:text-sm font-semibold py-1 px-3 rounded-full transition-colors duration-300 ${location === 'GTA' ? 'bg-cyan-600 text-white' : 'bg-gray-700 hover:bg-cyan-700 text-gray-200'}`}
          >
            GTA
        </button>
        {gtaCities.map((city) => (
          <button
            key={city}
            onClick={() => handleCityClick(city)}
            className={`text-xs sm:text-sm font-semibold py-1 px-3 rounded-full transition-colors duration-300 ${location === city ? 'bg-cyan-600 text-white' : 'bg-gray-700 hover:bg-cyan-700 text-gray-200'}`}
          >
            {city}
          </button>
        ))}
      </div>

      <div className="aspect-video w-full bg-gray-900 rounded-lg overflow-hidden border border-gray-700">
          <iframe
          key={mapUrl} // Re-renders the iframe when the URL changes
          src={mapUrl}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen={false}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title={`Map of ${location}`}
          aria-label={`Map of ${location}`}
          ></iframe>
      </div>
      
      {prediction?.growthHotspots && prediction.growthHotspots.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-700">
              <h3 className="text-lg font-bold text-teal-300 mb-3 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"></path></svg>
                Explore Predicted Growth Hotspots
              </h3>
              <div className="flex flex-wrap gap-2">
                  {prediction.growthHotspots.map((hotspot) => (
                      <button 
                          key={hotspot}
                          onClick={() => setFocusedHotspot(hotspot)}
                          className={`text-xs sm:text-sm font-semibold py-1.5 px-3 rounded-full transition-all duration-200 transform hover:scale-105 ${focusedHotspot === hotspot ? 'bg-teal-500 text-white shadow-lg' : 'bg-gray-700 hover:bg-teal-700 text-gray-200'}`}
                      >
                          {hotspot}
                      </button>
                  ))}
                  {focusedHotspot && (
                      <button
                          onClick={() => setFocusedHotspot(null)}
                          className="text-xs sm:text-sm font-semibold py-1.5 px-3 rounded-full bg-gray-600 hover:bg-gray-500 text-white transition-colors duration-200"
                      >
                          &times; Reset View
                      </button>
                  )}
              </div>
          </div>
      )}
    </div>
  );
};

export default Map;
