// app/components/dashboard/avg-time-spent-list.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"; // <-- 1. Import ScrollArea
import Image from "next/image";
import { Clock, Eye } from "lucide-react";

// Dữ liệu giả với 15 mục để kiểm tra cuộn
const timeSpentData = Array(15).fill({
  id: "ID ABT4245",
  date: "Apr 1, 2025",
  views: 5,
  time: "90 phút",
  avatar: "/avatars/main-avatar.png",
});

export default function AvgTimeSpentList() {
  return (
    <Card className="bg-card/50 border-0 text-foreground flex flex-col h-full min-h-0 avg-time-spent-list-container">
      <CardHeader>
        <CardTitle className="font-medium">AVG time spent</CardTitle>
      </CardHeader>
      {/* 2. Loại bỏ các thuộc tính cuộn khỏi CardContent */}
      <CardContent className="flex-grow pr-2 min-h-0"> 
        {/* 3. Bọc nội dung bằng ScrollArea */}
        <ScrollArea className="h-full" style={{ maxHeight: "820px" }}>
          <div className="space-y-3">
            {timeSpentData.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-3 bg-white/5 p-2 rounded-lg"
                style={{ minHeight: "60px" }}
              >
                <Image
                  src={item.avatar}
                  alt={item.id}
                  width={40}
                  height={40}
                  className="object-cover"
                />
                <div className="flex-grow">
                  <p className="font-semibold text-sm">{item.id}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{item.date}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      <span>{item.views}</span>
                    </div>
                  </div>
                </div>
                <span className="text-sm font-semibold">{item.time}</span>
              </div>
            ))}
          </div>
          <ScrollBar /> {/* 4. Thêm thanh cuộn */}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}