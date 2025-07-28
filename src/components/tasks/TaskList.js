import React, { useState } from "react";
import TabBar from "./TabBar";
import ActionControls from "./ActionControls";
import MainTable from "./MainTable";
import KanbanBoard from "./KanbanBoard";

export default function TaskList() {
  const [activeTab, setActiveTab] = useState("main-table");
  return (
    <div className="w-full bg-white flex flex-col">
      <TabBar activeTab={activeTab} setActiveTab={setActiveTab} />
      <ActionControls />
      {activeTab === "main-table" && <MainTable />}
      {activeTab === "kanban" && <KanbanBoard />}
      {/* Other tabs (Cards, Kanban, etc.) will be added here */}
    </div>
  );
} 