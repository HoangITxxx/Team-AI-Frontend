import Image from "next/image";
import Sidebar from "../components/dashboard/sidebar";
import VisitorsMap from "../components/dashboard/visitors-map";
import GroupTypeChart from "../components/dashboard/group-type-chart";
import FlowChart from "../components/dashboard/flow-chart";
import AvgTimeSpentList from "../components/dashboard/avg-time-spent-list";
//Demo test
// import DataHistoryList from "../components/dashboard/data-history-list";

export default function DashboardPage() {
  return (
    <div className="relative w-full h-full">

      {/* Background image với Next Image */}
      <div className="absolute inset-0 -z-10">
        <Image 
          src="/avatars/background (1).jpg"
          alt="Background"
          fill
          priority // để load ngay khi trang render (do đây là background)
          className="object-cover"
        />
      </div>

      <div className="absolute inset-0 bg-black/40 -z-10"></div>

      <main className="w-full h-full flex items-center justify-center p-4 md:p-6">
        <div className="w-full max-w-screen-2xl h-[100vh] max-h-[990px] p-10 grid grid-cols-1 lg:grid-cols-12 gap-6 bg-secondary/20 rounded-2xl border border-white/5 backdrop-blur-lg">
          
          <div className="lg:col-span-3">
            <Sidebar />
          </div>

          <div className="lg:col-span-9 grid grid-cols-1 lg:grid-cols-3 gap-6 h-full min-h-0">
            <div className="lg:col-span-2 grid grid-cols-2 grid-rows-2 gap-4 h-full min-h-0">
              <VisitorsMap />
              <GroupTypeChart />
              <div className="col-span-2">
                <FlowChart />
              </div>
            </div>
            <div className="lg:col-span-1 h-full min-h-0 flex flex-col">
              <AvgTimeSpentList />
              {/* <DataHistoryList /> */}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
