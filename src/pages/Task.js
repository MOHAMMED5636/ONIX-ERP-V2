import React from "react";
import { Routes, Route } from "react-router-dom";
import TaskList from "../components/tasks/TaskList";
import CreateTask from "../components/tasks/CreateTask";

export default function Task() {
  return (
    <>
      <Routes>
        <Route path="/" element={<TaskList />} />
        <Route path="create" element={<CreateTask />} />
      </Routes>
    </>
  );
} 