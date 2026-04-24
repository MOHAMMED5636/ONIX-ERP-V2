import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ContractList from "../components/contracts/ContractList";
import CreateContract from "../components/contracts/CreateContract";
import { useAuth } from "../contexts/AuthContext";

const CONTRACT_VIEW_ONLY_ROLES = ["MANAGER", "PROJECT_MANAGER"];

function CreateContractRoute() {
  const { user } = useAuth();
  if (CONTRACT_VIEW_ONLY_ROLES.includes(user?.role)) {
    return <Navigate to="/contracts" replace />;
  }
  return <CreateContract />;
}

export default function Contracts() {
  return (
    <Routes>
      <Route path="/" element={<ContractList />} />
      <Route path="create" element={<CreateContractRoute />} />
    </Routes>
  );
} 