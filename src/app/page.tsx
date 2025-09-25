import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Shield, Code, Zap, Users, Github, Book, Play, ArrowRight } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Navigation */}
      <nav className="border-b border-gray-800 backdrop-blur-sm bg-gray-950/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-chart-3 rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">BP</span>
              </div>
              <span className="font-bold text-xl">BuildProof</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-400 hover:text-gray-100 transition-colors">Features</a>
              <a href="#docs" className="text-gray-400 hover:text-gray-100 transition-colors">Docs</a>
              <a href="#examples" className="text-gray-400 hover:text-gray-100 transition-colors">Examples</a>
              <Button size="sm">
                <Github className="w-4 h-4 mr-2" />
                GitHub
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-background" />
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-grid-16" />
        <div className="relative container mx-auto px-4 py-24 lg:py-32">
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center rounded-full border border-gray-700 bg-gray-800/40 px-3 py-1 text-sm">
                <span className="text-blue-400">●</span>
                <span className="ml-2">Latest OpenZeppelin v5.4.0</span>
              </div>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
                <span className="bg-gradient-to-r from-primary to-chart-3 bg-clip-text text-transparent">Build</span>Proof
              </h1>
              <p className="text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                A modern Solidity smart contract project built with Foundry.
                <br className="hidden sm:block" />
                Secure, efficient, and professionally crafted for blockchain development.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button size="lg" className="px-8 py-3 text-lg">
                <Play className="w-5 h-5 mr-2" />
                Get Started
              </Button>
              <Button variant="outline" size="lg" className="px-8 py-3 text-lg">
                <Book className="w-5 h-5 mr-2" />
                Documentation
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="container mx-auto px-4 py-16 lg:py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">Built for Modern Development</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Comprehensive tooling and best practices for secure smart contract development
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="group border-border/40 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
            <CardHeader className="pb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="group-hover:text-primary transition-colors">Security First</CardTitle>
              <CardDescription>
                Built with OpenZeppelin contracts and comprehensive security analysis including Slither integration
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="group border-border/40 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
            <CardHeader className="pb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-chart-3/20 to-chart-3/10 rounded-lg flex items-center justify-center mb-4">
                <Code className="h-6 w-6 text-chart-3" />
              </div>
              <CardTitle className="group-hover:text-primary transition-colors">Modern Tooling</CardTitle>
              <CardDescription>
                Foundry for smart contracts, Next.js for UI, TypeScript, and premium dark theme components
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="group border-border/40 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
            <CardHeader className="pb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-chart-2/20 to-chart-2/10 rounded-lg flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-chart-2" />
              </div>
              <CardTitle className="group-hover:text-primary transition-colors">Optimized</CardTitle>
              <CardDescription>
                Gas-optimized contracts with comprehensive testing suite and automated coverage reports
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="group border-border/40 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
            <CardHeader className="pb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-chart-4/20 to-chart-4/10 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-chart-4" />
              </div>
              <CardTitle className="group-hover:text-primary transition-colors">Professional</CardTitle>
              <CardDescription>
                GitHub Actions CI/CD, comprehensive documentation, and production-ready deployment workflows
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-gradient-to-b from-muted/30 to-background py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Project Statistics</h2>
            <p className="text-muted-foreground">Current project metrics and versions</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center border-border/40 bg-card/50 backdrop-blur-sm">
              <CardHeader className="pb-6">
                <CardTitle className="text-4xl font-bold bg-gradient-to-r from-primary to-chart-3 bg-clip-text text-transparent">100%</CardTitle>
                <CardDescription className="text-lg">Test Coverage Target</CardDescription>
              </CardHeader>
            </Card>
            <Card className="text-center border-border/40 bg-card/50 backdrop-blur-sm">
              <CardHeader className="pb-6">
                <CardTitle className="text-4xl font-bold bg-gradient-to-r from-chart-2 to-primary bg-clip-text text-transparent">v5.4.0</CardTitle>
                <CardDescription className="text-lg">OpenZeppelin Version</CardDescription>
              </CardHeader>
            </Card>
            <Card className="text-center border-border/40 bg-card/50 backdrop-blur-sm">
              <CardHeader className="pb-6">
                <CardTitle className="text-4xl font-bold bg-gradient-to-r from-chart-3 to-chart-4 bg-clip-text text-transparent">0.8.26</CardTitle>
                <CardDescription className="text-lg">Solidity Version</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="border-t border-border/40 py-16 lg:py-24">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">Ready to Build?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Start your next blockchain project with BuildProof's comprehensive development environment
          </p>
          <Button size="lg" className="px-8 py-3 text-lg group">
            Get Started Now
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </div>
  )
}