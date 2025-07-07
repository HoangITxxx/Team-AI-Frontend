// app/components/dashboard/sidebar.tsx
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Pencil, Users, Clock, Globe, Smile, UserPlus, User, Hourglass, History  } from "lucide-react";


// Dữ liệu giả cho các visitor khác
const otherVisitors = [
  { src: "/avatars/avatar5.png", alt: "Visitor 1" },
  { src: "/avatars/avatar2.png", alt: "Visitor 2" },
  { src: "/avatars/avatar3.png", alt: "Visitor 3" },
  { src: "/avatars/avatar4.png", alt: "Visitor 4" },
  { src: "/avatars/avatar6.png", alt: "Visitor 5", emotion: "Happy", active: true },
];

  const badgeClasses = "flex items-center justify-between rounded-full bg-white/10 backdrop-blur-sm border border-white/20 px-3 py-2 text-sm text-foreground";
  const labelClasses = "text-[8px] text-white/70";
  const mainContentClasses = "flex items-center gap-2";

export default function Sidebar() {
  return (
    <div className="bg-card/50 border-0 flex flex-col h-full text-foreground space-y-4 p-5">
      {/* Header */}
      <div className="flex justify-between items-center">
        {/* <Avatar>
          <AvatarImage src="/avatars/admin.png" alt="Admin" />
          <AvatarFallback>AD</AvatarFallback>
        </Avatar> */}
        <div className="bg-white/10 p-2 rounded-full relative">
          <svg
            className="w-8 h-8"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="starGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style={{ stopColor: "#93c5fd" }} /> {/* Xanh lam */}
                <stop offset="100%" style={{ stopColor: "#f3f4f6" }} /> {/* Trắng nhẹ */}
              </linearGradient>
            </defs>
            <path
              d="M12 2L15.09 8.26L22 9.27L17.5 14.14L18.64 21L12 17.77L5.36 21L6.5 14.14L2 9.27L8.91 8.26L12 2Z"
              fill="url(#starGradient)"
            />
          </svg>
          {/* Đổ bóng */}
          <div
            className="absolute bottom-0 right-0 w-2 h-2 bg-gray-700 rounded-full transform translate-x-1/2 translate-y-1/2 opacity-50 blur-sm"
            style={{ filter: "blur(2px)" }}
          />
        </div>
      </div>

      {/* Main Profile */}
      <div className="flex flex-col items-center space-y-2 mt-4">
        <div className="relative">
          <Image
            src="/avatars/avatar1.png"
            alt="Main Visitor"
            width={130}
            height={130}
            className="rounded-full border-4 border-white/20 object-cover bg-orange-300"
          />
        </div>
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold">ID 001FPSATT01</h2>
          <Pencil className="h-4 w-4 text-muted-foreground cursor-pointer" />
        </div>
      </div>

      {/* Appearance Info */}
      <div className="space-y-2">
        <h3 className="font-medium">Appearance Info</h3>
        <p className="text-sm text-muted-foreground">
          The woman is wearing a blue shirt, an oval face, and a hat.
        </p>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-3 pt-2">
      {/* Middle Age */}
      <div className={badgeClasses}>
        <div className={mainContentClasses}>
          <UserPlus className="h-4 w-4" />
          <span className="font-semibold">Middle</span>
        </div>
        <span className={labelClasses}>Age</span>
      </div>

      {/* Female */}
      <div className={badgeClasses}>
        <div className={mainContentClasses}>
          <User className="h-4 w-4" />
          <span className="font-semibold">Female</span>
        </div>
        <span className={labelClasses}>Gender</span>
      </div>

      {/* Time Linger */}
      <div className={badgeClasses}>
        <div className={mainContentClasses}>
          <Hourglass className="h-4 w-4" />
          <span className="font-semibold">90 Phút</span>
        </div>
        <span className={labelClasses}>Time linger</span>
      </div>

      {/* Arrival */}
      <div className={badgeClasses}>
        <div className={mainContentClasses}>
          <History className="h-4 w-4" />
          <span className="font-semibold">5</span>
        </div>
        <span className={labelClasses}>Arrival</span>
      </div>

      {/* Origin */}
      <div className={badgeClasses}>
        <div className={mainContentClasses}>
          <Globe className="h-4 w-4" />
          <span className="font-semibold">Asia</span>
        </div>
        <span className={labelClasses}>Origin</span>
      </div>

      {/* Emotions */}
      <div className={badgeClasses}>
        <div className={mainContentClasses}>
          <Smile className="h-4 w-4" />
          <span className="font-semibold">Happy</span>
        </div>
        <span className={labelClasses}>Emotions</span>
      </div>
    </div>

      {/* Visitor Info */}
      <div className="space-y-3 pt-4">
  <h3 className="font-medium">Visitor Info</h3>
  <div className="grid grid-cols-5 gap-2">
    {otherVisitors.map((visitor, index) => (
      <Image
        key={index}
        src={visitor.src}
        alt={visitor.alt}
        width={60}
        height={60}
        className={`rounded-lg transition-all ${
          visitor.active ? 'ring-2 ring-yellow-400' : 'opacity-75'
        }`}
      />
    ))}
  </div>
  {otherVisitors.find(v => v.active) && (
  <div className="flex flex-col items-center mt-4">
    <div className="relative p-[3px] rounded-full">
      <div className="w-[110px] h-[110px] rounded-lg overflow-hidden">
        <Image
          src={otherVisitors.find(v => v.active)!.src}
          alt={otherVisitors.find(v => v.active)!.alt}
          width={110}
          height={110}
          className="object-cover rounded-lg"
        />
      </div>
    </div>
    <span className="mt-2 text-base sm:text-lg font-semibold px-6 py-2 rounded-full border border-white/30 bg-yellow-100 backdrop-blur-sm text-pink-500 shadow">
      {otherVisitors.find(v => v.active)!.emotion}
    </span>
  </div>
)}



</div>

    </div>
  );
}