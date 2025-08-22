import { Clock, CheckCircle, XCircle, Package } from "lucide-react";

interface StatsCardsProps {
  counts: {
    all: number;
    pending: number;
    given: number;
    cancelled: number;
  };
}

export default function BarStatsCards({ counts }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
      <div className="bg-white rounded-lg shadow p-3 sm:p-4 lg:p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Package className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-blue-600" />
          </div>
          <div className="ml-2 sm:ml-3 lg:ml-4 min-w-0">
            <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">
              Total
            </p>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
              {counts.all}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-3 sm:p-4 lg:p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Clock className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-yellow-600" />
          </div>
          <div className="ml-2 sm:ml-3 lg:ml-4 min-w-0">
            <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">
              Pending
            </p>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-yellow-600">
              {counts.pending}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-3 sm:p-4 lg:p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-green-600" />
          </div>
          <div className="ml-2 sm:ml-3 lg:ml-4 min-w-0">
            <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">
              Given
            </p>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-green-600">
              {counts.given}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-3 sm:p-4 lg:p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <XCircle className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-red-600" />
          </div>
          <div className="ml-2 sm:ml-3 lg:ml-4 min-w-0">
            <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">
              Cancelled
            </p>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-red-600">
              {counts.cancelled}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
