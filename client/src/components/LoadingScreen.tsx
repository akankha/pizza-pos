interface LoadingScreenProps {
  message?: string;
  variant?: "light" | "dark" | "auto";
  showSpinner?: boolean;
}

export default function LoadingScreen({
  message = "Loading...",
  variant = "auto",
  showSpinner = true,
}: LoadingScreenProps) {
  const getBgClass = () => {
    switch (variant) {
      case "light":
        return "bg-slate-50";
      case "dark":
        return "bg-slate-800";
      case "auto":
      default:
        return "bg-slate-50 dark:bg-slate-800";
    }
  };

  const getTextClass = () => {
    switch (variant) {
      case "light":
        return "text-gray-600";
      case "dark":
        return "text-slate-300";
      case "auto":
      default:
        return "text-gray-600 dark:text-slate-300";
    }
  };

  return (
    <div
      className={`h-screen w-screen ${getBgClass()} flex items-center justify-center animate-fade-in`}
    >
      <div className="flex flex-col items-center gap-5 animate-scale-in">
        {showSpinner && (
          <div className="relative w-16 h-16">
            {/* Outer pulse ring */}
            <div className="absolute inset-0 rounded-full border-4 border-[#FF6B35]/20 animate-pulse" />
            {/* Middle rotating ring */}
            <div
              className="absolute inset-1 rounded-full border-4 border-transparent border-t-[#FF6B35] animate-spin"
              style={{ animationDuration: "1s" }}
            />
            {/* Inner rotating ring (opposite direction) */}
            <div
              className="absolute inset-3 rounded-full border-4 border-transparent border-b-[#FF6B35]/60 animate-spin"
              style={{
                animationDuration: "0.8s",
                animationDirection: "reverse",
              }}
            />
            {/* Center dot */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2 h-2 bg-[#FF6B35] rounded-full" />
            </div>
          </div>
        )}
        <div className={`text-base font-medium ${getTextClass()}`}>
          {message}
        </div>
      </div>
    </div>
  );
}
