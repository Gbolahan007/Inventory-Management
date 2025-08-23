"use client";
const LoadingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center relative overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white opacity-10 animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 6 + 2}px`,
              height: `${Math.random() * 6 + 2}px`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${Math.random() * 3 + 2}s`,
            }}
          />
        ))}
      </div>

      {/* Main loading container */}
      <div className="relative z-10 text-center">
        {/* Logo/Brand area */}
        <div className="mb-8">
          <div className="w-20 h-20 mx-auto mb-4 relative">
            {/* Outer rotating ring */}
            <div className="absolute inset-0 border-4 border-purple-500/30 rounded-full animate-spin">
              <div className="absolute top-0 left-1/2 w-2 h-2 bg-purple-400 rounded-full transform -translate-x-1/2 -translate-y-1"></div>
            </div>

            {/* Inner counter-rotating ring */}
            <div className="absolute inset-2 border-4 border-blue-400/40 rounded-full animate-spin-reverse">
              <div className="absolute bottom-0 right-1/2 w-1.5 h-1.5 bg-blue-300 rounded-full transform translate-x-1/2 translate-y-1"></div>
            </div>

            {/* Center pulsing dot */}
            <div className="absolute inset-1/2 w-2 h-2 bg-white rounded-full transform -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
          </div>

          {/* Brand name */}
          <h1 className="text-3xl font-bold text-white mb-2 tracking-wide">
            BarFlow
          </h1>
          <p className="text-purple-300 text-sm font-medium">
            Restaurant Management System
          </p>
        </div>

        {/* Loading progress */}
        <div className="mb-8">
          <div className="w-64 h-2 bg-white/10 rounded-full mx-auto mb-4 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full animate-loading-bar origin-left"></div>
          </div>

          {/* Loading text with dots animation */}
          <div className="text-white/80 text-lg font-medium flex items-center justify-center space-x-1">
            <span>Loading</span>
            <div className="flex space-x-1">
              <div
                className="w-1 h-1 bg-white rounded-full animate-bounce"
                style={{ animationDelay: "0ms" }}
              ></div>
              <div
                className="w-1 h-1 bg-white rounded-full animate-bounce"
                style={{ animationDelay: "150ms" }}
              ></div>
              <div
                className="w-1 h-1 bg-white rounded-full animate-bounce"
                style={{ animationDelay: "300ms" }}
              ></div>
            </div>
          </div>
        </div>

        {/* Loading status messages */}
        <div className="space-y-2 text-purple-200/60 text-sm">
          <div
            className="flex items-center justify-center space-x-2 animate-fade-in-up"
            style={{ animationDelay: "0.5s" }}
          >
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>Initializing system...</span>
          </div>
          <div
            className="flex items-center justify-center space-x-2 animate-fade-in-up"
            style={{ animationDelay: "1s" }}
          >
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
            <span>Loading restaurant data...</span>
          </div>
          <div
            className="flex items-center justify-center space-x-2 animate-fade-in-up"
            style={{ animationDelay: "1.5s" }}
          >
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            <span>Setting up your workspace...</span>
          </div>
        </div>

        {/* Subtle hint text */}
        <div className="mt-16 text-white/40 text-xs">
          <p>Preparing your dashboard experience</p>
        </div>
      </div>

      {/* Floating elements for extra visual appeal */}
      <div className="absolute top-20 left-20 w-32 h-32 bg-purple-500/5 rounded-full blur-xl animate-float"></div>
      <div className="absolute bottom-20 right-20 w-24 h-24 bg-blue-500/5 rounded-full blur-xl animate-float-delayed"></div>
      <div className="absolute top-1/2 left-10 w-16 h-16 bg-indigo-500/5 rounded-full blur-xl animate-float-slow"></div>

      <style jsx>{`
        @keyframes spin-reverse {
          from {
            transform: rotate(360deg);
          }
          to {
            transform: rotate(0deg);
          }
        }

        @keyframes loading-bar {
          0% {
            transform: scaleX(0);
          }
          50% {
            transform: scaleX(0.7);
          }
          100% {
            transform: scaleX(1);
          }
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(180deg);
          }
        }

        @keyframes float-delayed {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-15px) rotate(-180deg);
          }
        }

        @keyframes float-slow {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-10px) rotate(90deg);
          }
        }

        .animate-spin-reverse {
          animation: spin-reverse 2s linear infinite;
        }

        .animate-loading-bar {
          animation: loading-bar 3s ease-in-out infinite;
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
          opacity: 0;
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite;
        }

        .animate-float-slow {
          animation: float-slow 10s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default LoadingPage;
