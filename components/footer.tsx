import { Heart } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t bg-background py-4 md:py-6">
      <div className="container flex flex-col items-center justify-center gap-2 px-4 md:px-6">
        <p className="flex items-center gap-1 text-center text-sm text-muted-foreground">
          Made with <Heart className="h-4 w-4 fill-red-500 text-red-500" /> by Ajinkya
        </p>
        <p className="text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} File Sharing Platform. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
