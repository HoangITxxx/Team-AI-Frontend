// app/components/dashboard/time-spent-item.tsx
import Image from "next/image";
import { Clock, Eye } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

// Định nghĩa kiểu dữ liệu cho props để code an toàn hơn
type TimeSpentItemProps = {
  item: {
    id: string;
    displayId: string;
    date: string;
    views: number;
    time: string;
    avatar: string;
  };
};

export function TimeSpentItem({ item }: TimeSpentItemProps) {
  return (
    // Đây chính là phần styling bị thiếu: nền, bo góc, padding
    <div className="flex items-center gap-3 bg-white/5 p-2 rounded-lg">
      <Image
        src={item.avatar}
        alt={item.displayId}
        width={40}
        height={40}
        className="object-cover rounded-md" // Bo góc cho avatar
      />
      <div className="flex-grow">
        <p className="font-semibold text-sm">{item.displayId}</p>
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
  );
}

// Chúng ta cũng nên tạo một component skeleton cho item ở đây
export const ItemSkeleton = () => (
    <div className="flex items-center gap-3 bg-white/5 p-2 rounded-lg">
      <Skeleton className="h-10 w-10 rounded-md" />
      <div className="flex-grow space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-3 w-32" />
      </div>
      <Skeleton className="h-4 w-16" />
    </div>
);