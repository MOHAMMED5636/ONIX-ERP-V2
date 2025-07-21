import React from "react";
import { Routes, Route } from "react-router-dom";
import ContractList from "../components/contracts/ContractList";
import CreateContract from "../components/contracts/CreateContract";

export default function Contracts() {
  return (
    <Routes>
      <Route path="/" element={<ContractList />} />
      <Route path="create" element={<CreateContract />} />
    </Routes>
  );
} 