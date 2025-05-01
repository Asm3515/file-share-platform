import { Heart } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t py-4 text-center text-sm text-muted-foreground">
      <div className="container mx-auto flex items-center justify-center gap-1">
        Made with <Heart className="h-4 w-4 fill-red-500 text-red-500" /> by Ajinkya
      </div>
    </footer>
  )
}
