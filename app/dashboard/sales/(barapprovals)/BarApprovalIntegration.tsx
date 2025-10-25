"use client";

import { useEffect } from "react";
import { setupBarApprovalListener } from "./utils/handleBarApprovalUpdate";

interface BarApprovalIntegrationProps {
  tableId: number;
  tableBarRequestStatus: string | null;
  lastApprovedRequestId: string | null;
  onSaleComplete?: () => void;
}

export function BarApprovalIntegration({
  tableId,
  tableBarRequestStatus,
  lastApprovedRequestId,
}: BarApprovalIntegrationProps) {
  // Set up listener for bar approvals
  useEffect(() => {
    if (!tableId) return;

    const unsubscribe = setupBarApprovalListener(
      tableId,
      tableBarRequestStatus,
      lastApprovedRequestId
    );

    return () => {
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, [tableId, tableBarRequestStatus, lastApprovedRequestId]);

  // ✅ REMOVED the auto-reset effect - it was resetting on every render!

  return null;
}
