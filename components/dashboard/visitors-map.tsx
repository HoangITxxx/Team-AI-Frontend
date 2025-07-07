// app/components/dashboard/visitors-map.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";

const visitorsOnMap = [
  { src: "/avatars/avatar1.png", top: "15%", left: "45%" },
  { src: "/avatars/avatar2.png", top: "25%", left: "75%" },
  { src: "/avatars/avatar3.png", top: "60%", left: "80%" },
  { src: "/avatars/main-avatar.png", top: "70%", left: "65%" },
  { src: "/avatars/avatar4.png", top: "55%", left: "35%" },
  { src: "/avatars/avatar5.png", top: "40%", left: "15%" },
  { src: "/avatars/avatar6.png", top: "80%", left: "20%" },
];

export default function VisitorsMap() {
  return (
    <Card className="bg-white/10 border-0 text-foreground h-full p-2">
      <CardHeader>
        <CardTitle className="font-extrabold pb-2">Visitors</CardTitle>
        <span className="text-xs px-2 py-0.5 rounded-lg bg-white/10 border border-white/10 backdrop-blur-sm w-28">
  Real-time map
</span>

      </CardHeader>
      <CardContent className="relative h-80 ">
        {/* Map Background */}
        <div className="absolute inset-0 bg-gray-700/50 rounded-lg p-2 flex flex-col gap-3">
            <div className="h-1/3 grid grid-cols-3 gap-2">
                <div className="bg-black/20 rounded"></div>
                <div className="col-span-2 bg-black/20 rounded"></div>
            </div>
             <div className="h-2/3 grid grid-cols-4 gap-2">
                <div className="bg-black/20 rounded"></div>
                <div className="col-span-2 bg-black/20 rounded"></div>
                <div className="bg-black/20 rounded"></div>
            </div>
            <div className="h-2/3 grid grid-cols-4 gap-3">
                <div className="bg-black/20 rounded"></div>
                <div className="col-span-2 bg-black/20 rounded"></div>
                <div className="bg-black/20 rounded"></div>
            </div>
        </div>
        
        {/* Visitor Avatars */}
        {visitorsOnMap.map((visitor, index) => (
          <Image
            key={index}
            src={visitor.src}
            alt={`Visitor ${index + 1}`}
            width={32}
            height={32}
            className="rounded-full absolute border-2 border-white/50"
            style={{ top: visitor.top, left: visitor.left }}
          />
        ))}
      </CardContent>
    </Card>
  );
}