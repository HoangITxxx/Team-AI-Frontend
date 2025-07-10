// app/components/components-child-dashboard/person-item.tsx

import Image from "next/image";
import { User, Zap } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type PersonItemProps = {
  personId: number; // Chỉ số của người trong danh sách
};

export function PersonItem({ personId }: PersonItemProps) {
  // Mảng màu nền ngẫu nhiên để các item trông khác nhau
  const bgColors = [
    "bg-sky-500/20 text-sky-300", 
    "bg-emerald-500/20 text-emerald-300", 
    "bg-amber-500/20 text-amber-300",
    "bg-rose-500/20 text-rose-300", 
    "bg-violet-500/20 text-violet-300"
  ];

  return (
    <div className="flex items-center gap-3 bg-white/5 p-2 rounded-lg">
      <div className={cn(
        "flex h-10 w-10 items-center justify-center rounded-md",
        bgColors[personId % bgColors.length]
      )}>
        <User className="h-6 w-6" />
      </div>
      <div className="flex-grow">
        <p className="font-semibold text-sm">Visitor #{personId + 1}</p>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
           <Zap className="h-3 w-3 text-yellow-400" />
           <span>Đang hoạt động</span>
        </div>
      </div>
       <Image
          src="/avatars/avatar1.png"
          alt={`avatar ${personId + 1}`}
          width={40}
          height={40}
          className="rounded-full object-cover"
        />
    </div>
  );
}

export const PersonItemSkeleton = () => (
    <div className="flex items-center gap-3 bg-white/5 p-2 rounded-lg">
      <Skeleton className="h-10 w-10 rounded-md" />
      <div className="flex-grow space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-3 w-20" />
      </div>
      <Skeleton className="h-10 w-10 rounded-full" />
    </div>
);