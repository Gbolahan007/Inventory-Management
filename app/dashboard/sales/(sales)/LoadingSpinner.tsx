interface LoadingSpinnerProps {
  isDarkMode: boolean;
}

export function LoadingSpinner({ isDarkMode }: LoadingSpinnerProps) {
  return (
    <div
      className={`min-h-screen ${
        isDarkMode ? "bg-gray-900" : "bg-gray-50"
      } flex items-center justify-center`}
    >
      <div className="text-center">
        <div
          className={`animate-spin rounded-full h-32 w-32 border-b-2 ${
            isDarkMode ? "border-gray-100" : "border-gray-900"
          } mx-auto`}
        ></div>
        <p className={`mt-4 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
          Loading POS System...
        </p>
      </div>
    </div>
  );
}
