import React from "react";
import { Routes, Route } from "react-router-dom";
import PayrollList from "../components/payroll/PayrollList";
import PayrollSettings from "../components/payroll/PayrollSettings";
import PayrollRunDetails from "../components/payroll/PayrollRunDetails";
import CreatePayrollRun from "../components/payroll/CreatePayrollRun";

export default function Payroll() {
  return (
    <Routes>
      <Route path="/" element={<PayrollList />} />
      <Route path="settings" element={<PayrollSettings />} />
      <Route path="create" element={<CreatePayrollRun />} />
      <Route path="runs/:id" element={<PayrollRunDetails />} />
    </Routes>
  );
}
