import Link from 'next/link';
import { Github, Twitter, MessageCircle } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-purple-600" />
              <span className="text-xl font-bold">Domie</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              The future of Web3 domain trading with SEO-optimized landing pages and community-powered deals.
            </p>
            <div className="flex gap-3">
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                <Github className="h-5 w-5" />
              </a>
              <a href="https://discord.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                <MessageCircle className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Marketplace */}
          <div>
            <h3 className="font-semibold mb-4">Marketplace</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/discover" className="hover:text-primary">
                  Discover Domains
                </Link>
              </li>
              <li>
                <Link href="/deals" className="hover:text-primary">
                  Community Deals
                </Link>
              </li>
              <li>
                <Link href="/portfolio" className="hover:text-primary">
                  My Portfolio
                </Link>
              </li>
              <li>
                <Link href="/analytics" className="hover:text-primary">
                  Analytics
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold mb-4">Resources</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="https://doma.dev" target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                  DOMA Protocol
                </a>
              </li>
              <li>
                <a href="https://xmtp.org" target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                  XMTP Docs
                </a>
              </li>
              <li>
                <a href="https://privy.io" target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                  Privy Auth
                </a>
              </li>
              <li>
                <Link href="/docs" className="hover:text-primary">
                  Documentation
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/terms" className="hover:text-primary">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-primary">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="hover:text-primary">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © 2025 Domie. Built for DOMA Protocol Track 5.
          </p>
          <p className="text-sm text-muted-foreground">
            Made with ❤️ for the Web3 community
          </p>
        </div>
      </div>
    </footer>
  );
}
