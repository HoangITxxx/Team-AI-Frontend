"use client";

import { useMemo, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useReadContract, useWatchContractEvent } from 'wagmi';
import { readContract } from '@wagmi/core'; // Import hàm readContract thủ công
import { config } from '@/lib/wagmi'; // Import wagmi config
import { visitorAnalyticsLogicConfig } from '@/lib/contracts';

// Custom hook này bây giờ chỉ tính toán và trả về dữ liệu dựa trên state được truyền vào
function useChartCalculations(contractData: [bigint[], bigint[]] | undefined, dayKeys: number[], monthLabels: string[]) {
  return useMemo(() => {
    if (!contractData || contractData.length !== 2) {
      return { chartData: [], totalFlow: 0, currentMonthFlow: 0, previousMonthFlow: 0 };
    }
    const [flowIns, flowOuts] = contractData;
    const totalFlow = flowIns.reduce((sum, val) => sum + Number(val), 0) + flowOuts.reduce((sum, val) => sum + Number(val), 0);
    
    const monthlyTotalFlow: Record<string, number> = {};
    dayKeys.forEach((key, index) => {
      const date = new Date(Number(key) * 86400 * 1000);
      const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!monthlyTotalFlow[yearMonth]) monthlyTotalFlow[yearMonth] = 0;
      monthlyTotalFlow[yearMonth] += Number(flowIns[index]) + Number(flowOuts[index]);
    });
    
    let currentMonthFlow = 0;
    let previousMonthFlow = 0;
    if (monthLabels.length > 0) {
      const currentMonthKey = monthLabels[monthLabels.length - 1];
      currentMonthFlow = monthlyTotalFlow[currentMonthKey] || 0;
      if (monthLabels.length > 1) {
        const previousMonthKey = monthLabels[monthLabels.length - 2];
        previousMonthFlow = monthlyTotalFlow[previousMonthKey] || 0;
      }
    }
    
    const chartData = monthLabels.map((yearMonth, index) => {
      const currentMonthTotal = monthlyTotalFlow[yearMonth] || 0;
      let previousMonthTotal = 0;
      if (index > 0) {
        const previousYearMonth = monthLabels[index - 1];
        previousMonthTotal = monthlyTotalFlow[previousYearMonth] || 0;
      }
      const date = new Date(yearMonth + '-01');
      return {
        name: date.toLocaleString('default', { month: 'short' }),
        current: currentMonthTotal,
        previous: previousMonthTotal,
      };
    });
    
    return { 
      chartData, 
      currentMonthFlow, 
      previousMonthFlow,
      totalFlow
    };
  }, [contractData, dayKeys, monthLabels]);
}


// Component chính
export default function FlowChart() {
  // State để lưu trữ dữ liệu contract
  const [contractData, setContractData] = useState<[bigint[], bigint[]] | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  // Tính toán dayKeys và monthLabels
  const { dayKeys, monthLabels } = useMemo(() => {
    const keys = [];
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    sixMonthsAgo.setDate(1);
    for (let d = new Date(sixMonthsAgo); d <= date; d.setDate(d.getDate() + 1)) {
        keys.push(Math.floor(d.getTime() / 1000 / 86400));
    }
    const labels = new Set<string>();
    for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const yearMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        labels.add(yearMonth);
    }
    return { dayKeys: keys, monthLabels: Array.from(labels) };
  }, []);

  // Lấy dữ liệu ban đầu bằng useEffect
  useEffect(() => {
    async function fetchInitialData() {
      console.log("Fetching initial data...");
      try {
        const data = await readContract(config, {
          ...visitorAnalyticsLogicConfig,
          functionName: 'getFlowDataForDays',
          args: [dayKeys],
        }) as [bigint[], bigint[]];
        console.log("Initial data received:", data);
        setContractData(data);
      } catch (error) {
        console.error("Failed to fetch initial data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchInitialData();
  }, []); // Chạy một lần duy nhất

  // Lắng nghe sự kiện để fetch lại thủ công
  const handleRefetch = async () => {
    console.log("Event detected. Manually refetching data...");
    // Tính toán lại dayKeys ngay trước khi fetch
    const currentDayKeys = [];
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    sixMonthsAgo.setDate(1);
    for (let d = new Date(sixMonthsAgo); d <= currentDate; d.setDate(d.getDate() + 1)) {
        currentDayKeys.push(Math.floor(d.getTime() / 1000 / 86400));
    }

    try {
      const newData = await readContract(config, {
        ...visitorAnalyticsLogicConfig,
        functionName: 'getFlowDataForDays',
        args: [currentDayKeys],
      }) as [bigint[], bigint[]];
      console.log("Refetched data received:", newData);
      setContractData(newData); // Cập nhật state với dữ liệu mới
    } catch (error) {
      console.error("Failed to refetch data:", error);
    }
  };

  useWatchContractEvent({
    ...visitorAnalyticsLogicConfig,
    eventName: 'VisitRecorded',
    onLogs: handleRefetch,
  });

  useWatchContractEvent({
    ...visitorAnalyticsLogicConfig,
    eventName: 'VisitorLeftMap',
    onLogs: handleRefetch,
  });
  
  // Dùng hook tính toán để có được dữ liệu cho UI
  const { chartData, currentMonthFlow, previousMonthFlow , totalFlow } = useChartCalculations(contractData, dayKeys, monthLabels);

  if (isLoading) {
    return (
       <Card className="bg-white/10 border-0 text-foreground h-full min-h-0 flex items-center justify-center">
        <p>Loading Chart Data...</p>
      </Card>
    )
  }
  
  return (
    <Card className="bg-white/10 border-0 text-foreground h-full min-h-0">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="font-medium ">Flow In/Out</CardTitle>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>Tổng <span className="text-foreground font-semibold">{totalFlow}</span></span>
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 bg-chart-2 rounded-full"></span>
              Tháng hiện tại<span className="text-foreground font-semibold">{currentMonthFlow}</span>
            </span>
            <span className="flex items-center gap-2 pr-16">
              <span className="h-0.5 w-3 bg-foreground"></span>
              Tháng trước<span className="text-foreground font-semibold">{previousMonthFlow}</span>
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="h-[calc(100%-4rem)]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))'
              }}
              formatter={(value, name) => [value, name === 'current' ? "This Month's Total Flow" : "Previous Month's Total Flow"]}
            />
            <Line type="monotone" dataKey="previous" stroke="hsl(var(--foreground))" strokeWidth={2} dot={false} strokeDasharray="5 5" name="previous" />
            <Line type="monotone" dataKey="current" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={false} name="current" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}