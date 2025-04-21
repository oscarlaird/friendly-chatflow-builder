
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/use-toast";

interface RequestWorkflowModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RequestWorkflowModal({ open, onOpenChange }: RequestWorkflowModalProps) {
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  async function handleSubmit() {
    if (!value.trim()) {
      toast({
        title: "Please enter a description or Loom link.",
        variant: "destructive"
      });
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase
        .from("feedback")
        .insert({
          content: value,
          type: "workflow_request",
          uid: user?.id || null,
        });
      if (error) throw error;
      toast({
        title: "Workflow requested!",
        description: "We'll review your request and follow up if needed.",
        duration: 5000,
      });
      setValue("");
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
    setLoading(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request a Custom Workflow</DialogTitle>
          <DialogDescription>
            Let us know about your workflow needs, or share a Loom recording!
          </DialogDescription>
        </DialogHeader>
        <Textarea
          placeholder="Describe your workflow or paste a Loom recording link..."
          value={value}
          onChange={e => setValue(e.target.value)}
        />
        <div className="text-xs text-muted-foreground mt-2">
          We will get this workflow up for you within 12 hours or might reach to you for more information.
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit} disabled={loading || !value.trim()}>
            {loading ? "Submitting..." : "Request Workflow"}
          </Button>
          <DialogClose asChild>
            <Button variant="outline" type="button">Cancel</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
