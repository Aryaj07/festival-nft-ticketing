export function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center">
      <div className="relative w-12 h-12">
        {/* Outer ring */}
        <div className="absolute w-full h-full rounded-full border-4 border-purple-200 opacity-25"></div>
        {/* Spinning inner ring */}
        <div className="absolute w-full h-full rounded-full border-4 border-t-purple-600 animate-spin"></div>
        {/* Center dot */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-purple-600 rounded-full"></div>
      </div>
      <span className="ml-3 text-lg font-medium text-purple-600">Loading...</span>
    </div>
  );
} 