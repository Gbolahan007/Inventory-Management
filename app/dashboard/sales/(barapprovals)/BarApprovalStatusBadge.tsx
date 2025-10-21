interface StatusBadgeProps {
  status: string;
}

export default function BarApprovalStatusBadge({ status }: StatusBadgeProps) {
  const statusConfig = {
    fulfilled: {
      label: "Fulfilled",
      class:
        "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
    },
    partial: {
      label: "Partial",
      class:
        "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
    },
    returned: {
      label: "Returned",
      class: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
    },
    pending: {
      label: "Pending",
      class: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    },
  };

  const config =
    statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium ${config.class}`}
    >
      {config.label}
    </span>
  );
}
