import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Shield, Upload, Download, Users } from "lucide-react"

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b bg-background">
        <div className="flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold">File Sharing Platform</span>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" className="hidden sm:inline-flex">
              <Link href="/login">Sign in</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Sign up</Link>
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                  Secure File Sharing Made Simple
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl">
                  Upload, share, and manage your files with confidence. Our platform provides secure access controls and
                  easy collaboration.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-2 sm:space-x-4">
                <Button asChild size="lg" className="w-full sm:w-auto">
                  <Link href="/register">
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
                  <Link href="/login">Sign in</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full bg-gray-50 py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="mx-auto grid max-w-5xl items-center gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col justify-center space-y-4 rounded-lg border bg-background p-6 shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Upload className="h-6 w-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Easy File Upload</h3>
                  <p className="text-gray-500">Quickly upload files of any type with our intuitive interface.</p>
                </div>
              </div>
              <div className="flex flex-col justify-center space-y-4 rounded-lg border bg-background p-6 shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Shield className="h-6 w-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Secure Sharing</h3>
                  <p className="text-gray-500">Control who can access your files with granular permissions.</p>
                </div>
              </div>
              <div className="flex flex-col justify-center space-y-4 rounded-lg border bg-background p-6 shadow-sm sm:col-span-2 lg:col-span-1">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Download className="h-6 w-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Fast Downloads</h3>
                  <p className="text-gray-500">Access and download your files from anywhere, anytime.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-2">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Collaborate with Your Team</h2>
                  <p className="max-w-[600px] text-gray-500 md:text-xl">
                    Share files with your team members and control exactly what they can do with them.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button asChild size="lg">
                    <Link href="/register">
                      Get Started
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="rounded-lg border bg-background p-8 shadow-sm">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Users className="h-10 w-10" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t bg-background py-6 md:py-8">
        <div className="container flex flex-col items-center justify-center gap-4 px-4 md:px-6">
          <p className="flex items-center gap-1 text-center text-sm text-muted-foreground">
            Made with <span className="text-red-500">❤</span> by Ajinkya
          </p>
          <p className="text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} File Sharing Platform. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
