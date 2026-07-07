import { useForm } from "react-hook-form";
import { useStartRecording } from "@/entities/recording";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/shared/ui/form";
import { Input } from "@/shared/ui/input";
import { Switch } from "@/shared/ui/switch";

type StartRecordingDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type StartRecordingFormValues = {
  targetBaseUrl: string;
  urlPathPattern: string;
  captureCommonHeaders: boolean;
  persist: boolean;
};

const DEFAULT_VALUES: StartRecordingFormValues = {
  targetBaseUrl: "",
  urlPathPattern: "",
  captureCommonHeaders: true,
  persist: false,
};

export function StartRecordingDialog({ open, onOpenChange }: StartRecordingDialogProps) {
  const form = useForm<StartRecordingFormValues>({
    defaultValues: DEFAULT_VALUES,
  });
  const startRecordingMutation = useStartRecording();

  const handleOpenChange = (nextOpen: boolean) => {
    onOpenChange(nextOpen);

    if (!nextOpen && !startRecordingMutation.isPending) {
      form.reset(DEFAULT_VALUES);
    }
  };

  const handleSubmit = form.handleSubmit(async (values) => {
    await startRecordingMutation.mutateAsync({
      targetBaseUrl: values.targetBaseUrl,
      filters: values.urlPathPattern ? { urlPathPattern: values.urlPathPattern } : undefined,
      captureHeaders: values.captureCommonHeaders ? { Accept: {}, "Content-Type": {} } : undefined,
      persist: values.persist,
    });

    form.reset(DEFAULT_VALUES);
    onOpenChange(false);
  });

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Start recording</DialogTitle>
          <DialogDescription>Proxy real traffic through WireMock and turn it into reusable stub mappings.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="space-y-5" onSubmit={handleSubmit}>
            <FormField
              control={form.control}
              name="targetBaseUrl"
              rules={{
                required: "Target base URL is required.",
                validate: (value) =>
                  value.startsWith("http://") || value.startsWith("https://")
                    ? true
                    : "Use a full URL starting with http:// or https://.",
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target base URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://api.example.com" {...field} />
                  </FormControl>
                  <FormDescription>WireMock will proxy requests to this upstream server while recording.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="urlPathPattern"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL path pattern</FormLabel>
                  <FormControl>
                    <Input placeholder="/api/.*" {...field} />
                  </FormControl>
                  <FormDescription>Optional regex filter to record only a subset of paths.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="captureCommonHeaders"
              render={({ field }) => (
                <FormItem className="rounded-lg border p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <FormLabel>Capture common headers</FormLabel>
                      <FormDescription>Add the Accept and Content-Type headers to generated mappings.</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="persist"
              render={({ field }) => (
                <FormItem className="rounded-lg border p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <FormLabel>Persist generated mappings automatically</FormLabel>
                      <FormDescription>When enabled, WireMock will save generated mappings as recording finishes.</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button disabled={startRecordingMutation.isPending} type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                Cancel
              </Button>
              <Button disabled={startRecordingMutation.isPending} type="submit">
                {startRecordingMutation.isPending ? "Starting..." : "Start recording"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
