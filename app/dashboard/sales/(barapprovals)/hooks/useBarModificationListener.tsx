/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase } from "@/app/_lib/supabase";
import { useEffect } from "react";

export function useBarModificationListener(
  selectedTable: number | null,
  salesRepId: string | undefined,
  onModificationReceived: (changes: any[]) => void
) {
  useEffect(() => {
    if (!selectedTable || !salesRepId) return;

    const channel = supabase
      .channel(`bar-mods-table-${selectedTable}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "bar_fulfillments",
          filter: `table_id=eq.${selectedTable}`,
        },
        (payload) => {
          // Only notify if this was a barman modification
          if (payload.new.modified_at && payload.new.modified_by) {
            console.log("Bar modified your order:", payload.new);
            onModificationReceived([payload.new]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedTable, salesRepId, onModificationReceived]);
}
