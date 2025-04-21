
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface RequestWorkflowModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RequestWorkflowModal({ open, onOpenChange }: RequestWorkflowModalProps) {
  const { toast } = useToast();
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const submitRequest = async () => {
    if (!text.trim()) {
      toast({ title: "Please provide some details!", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("feedback").insert({
      type: "workflow_request",
      content: text,
    });
    setLoading(false);

    if (error) {
      toast({ title: "Error submitting request", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Workflow request sent!", description: "We'll get back to you soon." });
      setText("");
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request a Workflow</DialogTitle>
          <DialogDescription>
            Paste a short brief about your workflow, or share a Loom recording link describing what you'd like to automate.
          </DialogDescription>
        </DialogHeader>
        <Textarea
          placeholder="Describe your workflow or paste a Loom link here..."
          value={text}
          onChange={e => setText(e.target.value)}
          rows={4}
        />
        <div className="mt-4 text-sm text-gray-500">
          We'll get this workflow up for you within <b>12 hours</b> or reach out to you if we need more information.
        </div>
        <DialogFooter>
          <Button
            onClick={submitRequest}
            disabled={loading}
            className="bg-[hsl(var(--dropbox-blue))]"
          >
            {loading ? "Submitting..." : "Request workflow now"}
          </Button>
          <DialogClose asChild>
            <Button variant="ghost" type="button">Cancel</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
