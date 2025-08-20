import React from 'react';
import { CheckIcon } from "@heroicons/react/24/outline";

const CompanySelectionIndicator = ({ selectedCompany }) => {
  if (!selectedCompany) return null;

  return (
    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-green-100 rounded-lg">
          <CheckIcon className="h-5 w-5 text-green-600" />
        </div>
        <div>
          <p className="text-sm font-medium text-green-800">Company Selected for Employee Creation</p>
          <p className="text-lg font-semibold text-green-900">{selectedCompany}</p>
        </div>
      </div>
    </div>
  );
};

export default CompanySelectionIndicator;

