import React from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "@/components/nav/Sidebar";
import { Topbar } from "@/components/nav/Topbar";
import { LastLocationRedirector } from "@/components/nav/LastLocationRedirector";
import GlobalShortcuts from "@/components/nav/GlobalShortcuts";
import DemoBanner from "@/components/nav/DemoBanner";

export const AppShell: React.FC = () => {
  return (
    <div className="h-screen w-screen grid grid-cols-[260px_1fr] grid-rows-[56px_1fr]">
      <aside className="row-span-2 bg-zinc-950 text-zinc-100">
        <Sidebar />
      </aside>
      <header className="bg-white border-b">
        <Topbar />
      </header>
      <main className="overflow-auto bg-zinc-50">
        <Outlet />
      </main>
      <LastLocationRedirector />
      <GlobalShortcuts />
      <DemoBanner />
    </div>
  );
};