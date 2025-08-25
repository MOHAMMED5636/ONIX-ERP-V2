import React from 'react';
import { Routes, Route } from "react-router-dom";
import ExcelTableDemo from "../components/ExcelTable/ExcelTableDemo";

export default function ExcelTable() {
  return (
    <Routes>
      <Route path="/" element={<ExcelTableDemo />} />
    </Routes>
  );
}

