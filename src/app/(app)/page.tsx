import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Search, MessageCircle, Users, TrendingUp, Shield, Zap } from "lucide-react"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <Badge variant="secondary" className="mb-4">
            Built on DOMA Protocol
          </Badge>
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            The Future of Domain Trading
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Discover, trade, and own premium Web3 domains with SEO-optimized landing pages, 
            XMTP messaging, and community-powered deals.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/discover">
              <Button size="lg" className="gap-2">
                Explore Domains
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/deals">
              <Button size="lg" variant="outline">
                Community Deals
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Why Choose Domanzo?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <Search className="h-8 w-8 mb-2 text-primary" />
              <CardTitle>Custom Landing Pages</CardTitle>
              <CardDescription>
                Create stunning, no-code landing pages for your domains with full branding control
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <MessageCircle className="h-8 w-8 mb-2 text-primary" />
              <CardTitle>XMTP Messaging</CardTitle>
              <CardDescription>
                Negotiate directly with owners using decentralized messaging and smart trade cards
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Users className="h-8 w-8 mb-2 text-primary" />
              <CardTitle>Community Deals</CardTitle>
              <CardDescription>
                Pool funds with others to buy premium domains through fractionalization
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <TrendingUp className="h-8 w-8 mb-2 text-primary" />
              <CardTitle>Advanced Analytics</CardTitle>
              <CardDescription>
                Track views, offers, and market trends with comprehensive analytics
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Shield className="h-8 w-8 mb-2 text-primary" />
              <CardTitle>Secure Trading</CardTitle>
              <CardDescription>
                On-chain transactions with DOMA orderbook integration for safe trading
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Zap className="h-8 w-8 mb-2 text-primary" />
              <CardTitle>Instant Transfer</CardTitle>
              <CardDescription>
                Buy domains in one click with instant NFT transfer upon purchase
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <p className="text-5xl font-bold mb-2">1,234</p>
            <p className="text-muted-foreground">Domains Listed</p>
          </div>
          <div>
            <p className="text-5xl font-bold mb-2">567</p>
            <p className="text-muted-foreground">Active Traders</p>
          </div>
          <div>
            <p className="text-5xl font-bold mb-2">89 ETH</p>
            <p className="text-muted-foreground">Trading Volume</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <Card className="bg-gradient-to-r from-primary/10 to-purple-600/10 border-primary/20">
          <CardContent className="p-12 text-center">
            <h2 className="text-4xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join the future of Web3 domain trading today
            </p>
            <Link href="/discover">
              <Button size="lg" className="gap-2">
                Browse Domains
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>
    </main>
  )
}
