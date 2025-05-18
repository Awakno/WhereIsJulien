import React from "react";


const ErrorAlert: React.FC<ErrorAlertProps> = ({ error }) => {
  if (!error) return null;
  return (
    <div
      className="bg-red-800 border border-red-600 text-white px-4 py-3 rounded-lg relative mb-6 w-full max-w-md"
      role="alert"
    >
      <strong className="font-bold">Error:</strong>
      <span className="block sm:inline"> {error}</span>
    </div>
  );
};

export default ErrorAlert;
