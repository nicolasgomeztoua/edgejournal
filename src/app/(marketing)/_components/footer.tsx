import Link from "next/link";
import { TrendingUp, Twitter, Github, Linkedin } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-background/50 backdrop-blur-xl">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <Link className="flex items-center gap-2" href="/">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <span className="font-bold text-xl tracking-tight">EdgeJournal</span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">
              The professional trading journal for traders who want to find their edge.
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-8 lg:col-span-3 lg:grid-cols-4">
            <div>
              <h3 className="font-semibold text-foreground">Product</h3>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li><Link href="#features" className="hover:text-primary">Features</Link></li>
                <li><Link href="#ai" className="hover:text-primary">AI Insights</Link></li>
                <li><Link href="#pricing" className="hover:text-primary">Pricing</Link></li>
                <li><Link href="/changelog" className="hover:text-primary">Changelog</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-foreground">Resources</h3>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li><Link href="/blog" className="hover:text-primary">Blog</Link></li>
                <li><Link href="/docs" className="hover:text-primary">Documentation</Link></li>
                <li><Link href="/help" className="hover:text-primary">Help Center</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-foreground">Company</h3>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li><Link href="/about" className="hover:text-primary">About</Link></li>
                <li><Link href="/careers" className="hover:text-primary">Careers</Link></li>
                <li><Link href="/legal" className="hover:text-primary">Privacy</Link></li>
                <li><Link href="/legal" className="hover:text-primary">Terms</Link></li>
              </ul>
            </div>
            
             <div>
              <h3 className="font-semibold text-foreground">Social</h3>
              <div className="mt-4 flex gap-4">
                <Link href="#" className="text-muted-foreground hover:text-primary">
                  <Twitter className="h-5 w-5" />
                  <span className="sr-only">Twitter</span>
                </Link>
                <Link href="#" className="text-muted-foreground hover:text-primary">
                  <Github className="h-5 w-5" />
                  <span className="sr-only">GitHub</span>
                </Link>
                <Link href="#" className="text-muted-foreground hover:text-primary">
                  <Linkedin className="h-5 w-5" />
                  <span className="sr-only">LinkedIn</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-12 border-t border-border/40 pt-8 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} EdgeJournal. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
