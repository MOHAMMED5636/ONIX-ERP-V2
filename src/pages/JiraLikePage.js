import React from 'react';
import { Routes, Route } from "react-router-dom";
import JiraLikeTable from "../components/JiraTable/JiraLikeTable";

export default function JiraLikePage() {
  return (
    <Routes>
      <Route path="/" element={<JiraLikeTable />} />
    </Routes>
  );
}



