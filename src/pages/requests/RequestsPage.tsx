import { useSearchParams } from "react-router-dom";
import { useClearRequestJournal } from "@/entities/serve-event";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/shared/ui/alert-dialog";
import { Button } from "@/shared/ui/button";
import { PageHeader } from "@/shared/ui/page-header";
import { RequestDetailDrawer } from "@/widgets/request-detail-drawer";
import { RequestTable } from "@/widgets/request-table";

export function RequestsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const clearRequestJournal = useClearRequestJournal();
  const selectedRequestId = searchParams.get("detail");

  function setDetailParam(requestId: string | null) {
    const nextSearchParams = new URLSearchParams(searchParams);

    if (requestId) {
      nextSearchParams.set("detail", requestId);
    } else {
      nextSearchParams.delete("detail");
    }

    setSearchParams(nextSearchParams, { replace: true });
  }

  async function handleClearJournal() {
    await clearRequestJournal.mutateAsync();
    setDetailParam(null);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Requests"
        description="Inspect the WireMock request journal"
        actions={
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={clearRequestJournal.isPending}>
                {clearRequestJournal.isPending ? "Clearing..." : "Clear journal"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent size="sm">
              <AlertDialogHeader>
                <AlertDialogTitle>Clear the request journal?</AlertDialogTitle>
                <AlertDialogDescription>
                  This removes every recorded request from WireMock.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction variant="destructive" onClick={() => void handleClearJournal()}>
                  Clear journal
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        }
      />

      <RequestTable selectedId={selectedRequestId} onRowClick={(requestId) => setDetailParam(requestId)} />

      <RequestDetailDrawer
        open={Boolean(selectedRequestId)}
        requestId={selectedRequestId}
        onOpenChange={(open) => {
          if (!open) {
            setDetailParam(null);
          }
        }}
      />
    </div>
  );
}
