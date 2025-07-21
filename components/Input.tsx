import React from "react";

interface InputProps {
  name: string;
  error: string | undefined;
}

const Input: React.FC<InputProps> = ({ name, error }) => {
  return (
    <div>
      <label
        htmlFor={name}
        className="block text-sm font-medium text-gray-700"
      >
        {name.charAt(0).toUpperCase() + name.slice(1)}
      </label>
      <input
        id={name}
        name={name}
        type="text"
        autoComplete={name}
        className={`mt-1 block w-full px-4 py-3 bg-gray-50 border ${
          error ? "border-red-500" : "border-gray-300"
        } rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900`}
        placeholder={`Enter your ${name}`}
      />
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
};

export default Input;
