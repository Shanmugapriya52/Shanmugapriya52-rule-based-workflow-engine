export default function Input({ label, error, helperText, children, ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      {children ? (
        children
      ) : (
        <input
          {...props}
          className={`border border-gray-300 bg-white text-gray-900 placeholder-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all duration-200 shadow-sm hover:shadow-md ${
            error ? "border-red-500 focus:ring-red-500 focus:border-red-500" : ""
          }`}
        />
      )}
      {error && (
        <p className="text-xs text-red-600 mt-1">{error}</p>
      )}
      {helperText && !error && (
        <p className="text-xs text-gray-600 mt-1">{helperText}</p>
      )}
    </div>
  );
}