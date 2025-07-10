// app/components/dashboard/group-type-chart.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { visitorAnalyticsLogicConfig } from '@/lib/contracts' 
import { useReadContracts } from 'wagmi'
import { useEffect } from "react";

const data = [
  { name: "Mexico", value: 45 },
  { name: "United States", value: 25 },
  { name: "Canada", value: 15 },
  { name: "Other", value: 15 },
];

// Ánh xạ tới các biến CSS màu của bạn
const COLORS = [
  "hsl(var(--chart-4))", // Light green
  "hsl(var(--chart-3))", // Purple-blue
  "hsl(var(--chart-2))", // Cyan
  "hsl(var(--secondary))", // Dark Gray for "Other"
];

const ORIGINS_TO_QUERY = ["Asian", "Africa", "Europe", "other"];

const legendData = [
    { name: "Mexico", color: "bg-chart-4" },
    { name: "United States", color: "bg-chart-3" },
    { name: "Canada", color: "bg-chart-2" },
    { name: "Other", color: "bg-green-300" }, // Màu Other trong UI là xanh lá cây nhạt, chúng ta sẽ dùng chart-4
];


export default function GroupTypeChart() {
  const { data: originCounts, isLoading, isError, error, isSuccess } = useReadContracts({
    // Cho phép wagmi cache dữ liệu và tự động fetch lại sau một khoảng thời gian
    query: {
      refetchInterval: 5000, // Fetch lại mỗi 5 giây
    },
    // Tạo một mảng các yêu cầu đọc, mỗi yêu cầu cho một quốc gia
    contracts: ORIGINS_TO_QUERY.map((origin) => ({
      ...visitorAnalyticsLogicConfig, // Dùng địa chỉ và ABI đã định nghĩa
      functionName: "countByOrigin", // Tên hàm trong Smart Contract
      args: [origin], // Tham số truyền vào hàm
    })),
  });

  // --- PHẦN LOGGING ĐỂ DEBUG ---
  useEffect(() => {
    // console.log("--- GroupTypeChart Hook Status ---");
    // console.log("Is Loading:", isLoading);
    // console.log("Is Success:", isSuccess);
    // console.log("Is Error:", isError);
    if (isError) {
      console.error("Error fetching contract data:", error);
    }
    if (isSuccess) {
      // console.log("Data fetched successfully:", originCounts);
    }
   // console.log("---------------------------------");
  }, [isLoading, isSuccess, isError, error, originCounts]);
  // -----------------------------

  // 5. Xử lý và định dạng dữ liệu trả về để Recharts có thể sử dụng
  const chartData =
    originCounts?.map((countResult, index) => ({
      name: ORIGINS_TO_QUERY[index],
      // Dữ liệu trả về từ contract là một BigInt, cần chuyển nó thành Number
      // Nếu kết quả không tồn tại (đang load hoặc lỗi), mặc định là 0
      value: countResult.status === "success" ? Number(countResult.result) : 0,
    })) || []; // Nếu originCounts chưa có, trả về mảng rỗng

  // 6. Xử lý trạng thái loading và error để UI thân thiện hơn
  if (isLoading) {
    return (
      <Card className="bg-white/10 border-0 text-foreground h-full min-h-0 flex items-center justify-center">
        <p>Loading Group Type...</p>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="bg-white/10 border-0 text-destructive h-full min-h-0 flex items-center justify-center">
        <p>Error loading data.</p>
      </Card>
    );
  }
  return (
    <Card className="bg-white/10 border-0 text-foreground h-full min-h-0">
      <CardHeader>
        <CardTitle className="font-extrabold">Nhóm quốc gia</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center h-[calc(100%-4rem)]">
        <div className="w-full h-full flex-grow"> {/* Sử dụng h-full và flex-grow */}
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%" // Canh giữa theo chiều ngang
                cy="50%" // Canh giữa theo chiều dọc
                // --- 2. TĂNG BÁN KÍNH ---
                innerRadius={60} // Tăng bán kính trong
                outerRadius={100} // Tăng bán kính ngoài
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
                nameKey="name"
                stroke="none"
                cornerRadius={20}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-2 grid grid-cols-2 gap-x-2 gap-y-2 text-[12px] ">
          {chartData.map((entry, index) => (
            <div key={entry.name} className="flex items-center gap-2">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              ></span>
              <span>{entry.name}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}