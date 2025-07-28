import React from "react";
import { Routes, Route } from "react-router-dom";
import TaskList from "../components/tasks/TaskList";
import CreateTask from "../components/tasks/CreateTask";
import Navbar from "../layout/Navbar";

export default function Task() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<TaskList />} />
        <Route path="create" element={<CreateTask />} />
      </Routes>
    </>
  );
} 