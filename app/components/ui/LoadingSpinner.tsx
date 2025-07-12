export default function LoadingSpinner() {
  return (
    <div className="py-4 text-foreground flex items-center justify-center">
      <div className="relative">
        {/* Outer spinning ring */}
        <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>

        {/* Inner pulsing dot */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
      </div>

      <span className="ml-3 text-sm font-medium animate-pulse">Loading...</span>
    </div>
  );
}
