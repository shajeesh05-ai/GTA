
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, DotProps } from 'recharts';
import { PopulationData } from '../types';

interface PopulationChartProps {
  data: PopulationData[];
}

const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-gray-900/80 p-4 border border-gray-600 rounded-lg shadow-xl backdrop-blur-sm">
        <p className="font-bold text-white">{`Year: ${label}`}</p>
        <p className="text-cyan-400">{`Population: ${payload[0].value} Million`}</p>
        {data.projected && <p className="text-sm text-yellow-400 mt-1">(Projected)</p>}
      </div>
    );
  }
  return null;
};

const CustomizedDot: React.FC<DotProps & { payload: PopulationData }> = (props) => {
    const { cx, cy, payload } = props;
    if (payload.projected) {
        return (
            <svg x={cx ? +cx - 6 : 0} y={cy ? +cy - 6 : 0} width="12" height="12" fill="#facc15" viewBox="0 0 1024 1024">
                <path d="M908.1 353.1l-253.9-36.9L540.7 86.1c-3.1-6.3-8.2-11.4-14.5-14.5-15.8-7.8-35-1.3-42.9 14.5L369.8 316.2l-253.9 36.9c-7 1-13.4 4.3-18.3 9.3a32.05 32.05 0 0 0 .6 45.3l183.7 179.1-43.4 252.9a31.95 31.95 0 0 0 46.4 33.7L512 754l227.1 119.4c6.2 3.3 13.4 4.4 20.3 3.2 17.4-3 29.1-19.5 26.1-36.9l-43.4-252.9 183.7-179.1c5-4.9 8.3-11.3 9.3-18.3 2.7-17.5-9.5-33.7-27-36.3z" />
            </svg>
        );
    }
    return <circle cx={cx} cy={cy} r={4} stroke="#06b6d4" fill="#06b6d4" strokeWidth={2} />;
};


const PopulationChart: React.FC<PopulationChartProps> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={data}
        margin={{
          top: 5,
          right: 20,
          left: -10,
          bottom: 5,
        }}
      >
        <defs>
          <linearGradient id="colorPopulation" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#4a5568" />
        <XAxis 
          dataKey="year" 
          stroke="#9ca3af" 
          tick={{ fontSize: 12 }} 
        />
        <YAxis 
          stroke="#9ca3af" 
          tick={{ fontSize: 12 }} 
          label={{ value: 'Millions', angle: -90, position: 'insideLeft', fill: '#9ca3af' }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ fontSize: '14px' }} />
        <Area 
          type="monotone" 
          dataKey="population" 
          stroke="#06b6d4" 
          strokeWidth={3} 
          fillOpacity={1} 
          fill="url(#colorPopulation)"
          name="Population (Millions)"
          dot={<CustomizedDot />}
          activeDot={{ r: 8, fill: '#06b6d4' }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default PopulationChart;
