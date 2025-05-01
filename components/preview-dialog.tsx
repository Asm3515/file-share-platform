"use client"

import { Dialog, DialogContent } from "@/components/ui/dialog"
import { FilePreview } from "@/components/file-preview"

interface PreviewDialogProps {
  file: any
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PreviewDialog({ file, open, onOpenChange }: PreviewDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0">
        {file && <FilePreview file={file} onClose={() => onOpenChange(false)} />}
      </DialogContent>
    </Dialog>
  )
}
