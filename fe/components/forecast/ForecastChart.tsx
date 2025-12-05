"use client";

import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { ForecastData } from '@/types/ForecastType';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface ForecastChartProps {
  forecastData: ForecastData[];
}

export default function ForecastChart({ forecastData }: ForecastChartProps) {
  // Sort data by date ascending and group by date
  const sortedData = [...forecastData]?.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  // Group data by date
  const groupedData = sortedData.reduce((acc, data) => {
    const dateKey = data.date;
    if (!acc[dateKey]) {
      acc[dateKey] = { real: null, forecast: null };
    }
    acc[dateKey][data.type as 'real' | 'forecast'] = data;
    return acc;
  }, {} as Record<string, { real: ForecastData | null; forecast: ForecastData | null }>);

  // Prepare chart data
  const labels = Object.keys(groupedData).map(dateKey => {
    const date = new Date(dateKey);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  });

  const realSalesData = Object.values(groupedData).map(group => group.real?.total || 0);
  const forecastSalesData = Object.values(groupedData).map(group => group.forecast?.total || 0);

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Real Sales',
        data: realSalesData,
        backgroundColor: 'rgba(59, 130, 246, 0.8)', // Blue color
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1,
      },
      {
        label: 'Forecast Sales',
        data: forecastSalesData,
        backgroundColor: 'rgba(156, 163, 175, 0.8)', // Gray color
        borderColor: 'rgb(156, 163, 175)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Menu Forecast Analysis',
        font: {
          size: 16,
          weight: 'bold' as const,
        },
      },
      tooltip: {
        callbacks: {
          afterLabel: function(context: any) {
            const dataIndex = context.dataIndex;
            const dateKey = Object.keys(groupedData)[dataIndex];
            const group = groupedData[dateKey];
            
            let tooltipText = '';
            if (context.datasetIndex === 0 && group.real) {
              // Real sales dataset
              const realItems = group.real.items.filter(item => item.type === 'real');
              tooltipText = `\nReal Menu Items: ${realItems.length}`;
            } else if (context.datasetIndex === 1 && group.forecast) {
              // Forecast sales dataset
              const forecastItems = group.forecast.items.filter(item => item.type === 'forecast');
              tooltipText = `\nForecast Menu Items: ${forecastItems.length}`;
            }
            return tooltipText;
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Date',
        },
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Total Menu Sales',
        },
      },
    },
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
  };

  if (forecastData.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center py-8">
          <p className="text-gray-500">No menu forecast data available</p>
        </div>
      </div>
    );
  }

  // Calculate summary statistics
  const totalRealSales = sortedData
    .filter(data => data.type === 'real')
    .reduce((sum, data) => sum + data.total, 0);
    
  const totalForecastSales = sortedData
    .filter(data => data.type === 'forecast')
    .reduce((sum, data) => sum + data.total, 0);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="h-96 w-full">
        <Bar data={chartData} options={options} />
      </div>
      
      {/* Summary Statistics */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">
            {totalRealSales}
          </div>
          <div className="text-sm text-blue-700">Total Real Menu Sales</div>
        </div>
        
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-gray-600">
            {totalForecastSales}
          </div>
          <div className="text-sm text-gray-700">Total Forecast Menu Sales</div>
        </div>
        
        {/* <div className="text-center p-4 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">
            {Object.keys(groupedData).length}
          </div>
          <div className="text-sm text-green-700">Total Date Points</div>
        </div> */}
      </div>
    </div>
  );
} 