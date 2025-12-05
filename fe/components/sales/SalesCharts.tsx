"use client";

import { SalesType } from "@/types/SalesType";

interface SalesChartsProps {
  sales: SalesType[];
}

// Generate dummy data for charts
const generateDummyData = () => {
  const currentDate = new Date();
  const last30Days = [];
  const last12Months = [];
  const menuItems = [
    "Nasi Goreng", "Ayam Bakar", "Gado-Gado", "Soto Ayam", "Rendang", 
    "Mie Ayam", "Bakso", "Gudeg", "Pecel Lele", "Satay"
  ];

  // Generate daily data for last 30 days
  for (let i = 29; i >= 0; i--) {
    const date = new Date(currentDate);
    date.setDate(date.getDate() - i);
    last30Days.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      fullDate: date.toISOString().split('T')[0],
      sales: Math.floor(Math.random() * 50) + 10
    });
  }

  // Generate monthly data for last 12 months
  for (let i = 11; i >= 0; i--) {
    const date = new Date(currentDate);
    date.setMonth(date.getMonth() - i);
    last12Months.push({
      month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      sales: Math.floor(Math.random() * 300) + 100
    });
  }

  // Generate menu items data
  const menuItemsData = menuItems.map(item => ({
    name: item,
    sales: Math.floor(Math.random() * 100) + 20,
    percentage: Math.floor(Math.random() * 15) + 5
  }));

  return { last30Days, last12Months, menuItemsData };
};

export default function SalesCharts({ sales }: SalesChartsProps) {
  const { last30Days, last12Months, menuItemsData } = generateDummyData();
  
  // Find max values for scaling
  const maxDailySales = Math.max(...last30Days.map(d => d.sales));
  const maxMonthlySales = Math.max(...last12Months.map(d => d.sales));
  const maxMenuSales = Math.max(...menuItemsData.map(d => d.sales));

  return (
    <div className="space-y-6">
      {/* Sales by Date Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Sales Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Daily Sales (Last 30 Days)</h3>
            <div className="text-sm text-gray-500">
              Total: {last30Days.reduce((sum, day) => sum + day.sales, 0)} transactions
            </div>
          </div>
          
          <div className="h-64 flex items-end justify-between space-x-1">
            {last30Days.map((day, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div
                  className="w-full bg-blue-500 rounded-t-sm hover:bg-blue-600 transition-colors"
                  style={{
                    height: `${(day.sales / maxDailySales) * 200}px`,
                    minHeight: '4px'
                  }}
                  title={`${day.date}: ${day.sales} sales`}
                />
                <div className="text-xs text-gray-500 mt-1 transform rotate-45 origin-left">
                  {index % 5 === 0 ? day.date : ''}
                </div>
              </div>
            ))}
          </div>
        </div>


      {/* Sales by Menu Items */}
        {/* Menu Items Bar Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Sales by Menu Items</h3>
            <div className="text-sm text-gray-500">
              Top 10 Items
            </div>
          </div>
          
          <div className="space-y-3">
            {menuItemsData.slice(0, 8).map((item, index) => (
              <div key={index} className="flex items-center">
                <div className="w-24 text-sm text-gray-700 font-medium truncate">
                  {item.name}
                </div>
                <div className="flex-1 mx-3">
                  <div className="bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-purple-500 h-3 rounded-full transition-all duration-300"
                      style={{
                        width: `${(item.sales / maxMenuSales) * 100}%`
                      }}
                    />
                  </div>
                </div>
                <div className="w-12 text-sm text-gray-600 text-right">
                  {item.sales}
                </div>
              </div>
            ))}
          </div>
        </div>  
      </div>


      {/* Time-based Analysis */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales Trends Analysis</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Daily Average */}
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {Math.round(last30Days.reduce((sum, day) => sum + day.sales, 0) / 30)}
            </div>
            <div className="text-sm text-gray-500">Daily Average</div>
            <div className="text-xs text-green-600 mt-1">+12% from last month</div>
          </div>
          
          {/* Monthly Average */}
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {Math.round(last12Months.reduce((sum, month) => sum + month.sales, 0) / 12)}
            </div>
            <div className="text-sm text-gray-500">Monthly Average</div>
            <div className="text-xs text-green-600 mt-1">+8% from last year</div>
          </div>
          
          {/* Best Selling Item */}
          <div className="text-center">
            <div className="text-lg font-bold text-purple-600 mb-2">
              {menuItemsData.sort((a, b) => b.sales - a.sales)[0]?.name}
            </div>
            <div className="text-sm text-gray-500">Best Selling Item</div>
            <div className="text-xs text-purple-600 mt-1">
              {menuItemsData.sort((a, b) => b.sales - a.sales)[0]?.sales} sales
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 