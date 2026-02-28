import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Keyboard } from "lucide-react";

const shortcuts = [
  { keys: ["Ctrl", "K"], description: "Open Command Palette / Quick Search" },
  { keys: ["Ctrl", "Shift", "P"], description: "Add New Pilgrim" },
  { keys: ["Ctrl", "Shift", "D"], description: "Go to Dashboard" },
  { keys: ["Ctrl", "Shift", "U"], description: "Go to Users" },
  { keys: ["Ctrl", "Shift", "L"], description: "Go to Leads" },
  { keys: ["?"], description: "Show Keyboard Shortcuts" },
  { keys: ["Esc"], description: "Close any dialog" },
];

export function KeyboardShortcutsDialog() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "?" && !e.ctrlKey && !e.metaKey && !(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault();
        setOpen(true);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Keyboard Shortcuts
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 mt-2">
          {shortcuts.map((s) => (
            <div key={s.description} className="flex items-center justify-between py-2 border-b last:border-0">
              <span className="text-sm text-muted-foreground">{s.description}</span>
              <div className="flex gap-1">
                {s.keys.map((k) => (
                  <kbd key={k} className="px-2 py-1 text-xs bg-muted rounded border font-mono font-semibold">
                    {k}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
