"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Clock,
  Zap,
  Shield,
  TrendingUp,
  Users,
  DollarSign,
  ArrowRight,
  Menu,
  X,
} from "lucide-react"
import Link from "next/link"
import { VersionToggle } from "@/components/VersionToggle"

export default function PuddleLanding() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      <VersionToggle />
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-slate-800 border-b border-slate-700">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="text-2xl font-bold text-blue-600">PUDDL3</div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                <a href="#how-it-works" className="text-white hover:text-blue-400 transition-colors">
                  How It Works
                </a>
                <a href="#benefits" className="text-white hover:text-blue-400 transition-colors">
                  Benefits
                </a>
              </div>
            </div>

            <div className="hidden md:flex items-center space-x-3">
              <Link href="/login">
                <Button variant="ghost" className="text-white hover:text-blue-400">
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  Get Started
                </Button>
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button variant="ghost" size="sm" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                {isMenuOpen ? <X className="h-6 w-6 text-white" /> : <Menu className="h-6 w-6 text-white" />}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden">
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-slate-800 border-t border-slate-700">
                <a href="#how-it-works" className="block px-3 py-2 text-white hover:text-blue-400">
                  How It Works
                </a>
                <a href="#benefits" className="block px-3 py-2 text-white hover:text-blue-400">
                  Benefits
                </a>
                <Link href="/login" className="block px-3 py-2 text-white hover:text-blue-400">
                  Sign In
                </Link>
                <Link href="/register">
                  <Button className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white">
                    Get Started
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Main content with gradient background */}
      <div className="relative overflow-hidden" style={{
        background: 'linear-gradient(to bottom, #111827 0%, #111827 40%, #1e3a5f 60%, #111827 80%)'
      }}>
        {/* Hero Section */}
        <section className="relative">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-40 relative z-10">
            <div className="max-w-3xl mx-auto text-center space-y-8">
              <div className="space-y-4">
                <h1 className="text-5xl lg:text-7xl font-bold text-white">
                  Pay by the <span className="text-blue-400">Second</span>
                </h1>
                <p className="text-xl lg:text-2xl text-gray-300 max-w-2xl mx-auto">
                  <span className="text-green-400">Real-time</span> payroll.
                  Stream wages to your team the moment they earn them.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Link href="/register">
                  <Button size="lg" className="px-8 py-6 text-lg bg-blue-600 hover:bg-blue-700 text-white">
                    Get Started <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-32 relative">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold mb-4 text-white">
                How It <span className="text-blue-400">Works</span>
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-12 max-w-4xl mx-auto">
              <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-blue-500/20 rounded-2xl flex items-center justify-center border border-blue-400/30 mx-auto">
                  <Clock className="h-10 w-10 text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-white">1. Clock In</h3>
                <p className="text-gray-300">
                  Workers clock in and wages start accumulating immediately.
                </p>
              </div>

              <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-green-500/20 rounded-2xl flex items-center justify-center border border-green-400/30 mx-auto">
                  <DollarSign className="h-10 w-10 text-green-400" />
                </div>
                <h3 className="text-xl font-semibold text-white">2. Wages Stream</h3>
                <p className="text-gray-300">
                  Earnings accumulate in real-time, visible to both employer and worker.
                </p>
              </div>

              <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-yellow-500/20 rounded-2xl flex items-center justify-center border border-yellow-400/30 mx-auto">
                  <Zap className="h-10 w-10 text-yellow-400" />
                </div>
                <h3 className="text-xl font-semibold text-white">3. Instant Transfer</h3>
                <p className="text-gray-300">
                  Workers access earned wages instantly. No more waiting for payday.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section id="benefits" className="py-32 relative">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-white">
                  From Burden → <span className="text-blue-400">Benefit</span>
                </h2>
                <p className="text-xl text-gray-300">
                  Transform payroll from a cost center into a competitive advantage.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-blue-500/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-blue-400/30 mx-auto">
                    <Users className="h-8 w-8 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2 text-white text-lg">Reduce Turnover</h3>
                    <p className="text-gray-300">Workers stay longer when they have instant access to their earnings.</p>
                  </div>
                </div>

                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-blue-500/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-blue-400/30 mx-auto">
                    <Shield className="h-8 w-8 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2 text-white text-lg">Flexible Payment</h3>
                    <p className="text-gray-300">
                      Pay on your schedule, not the calendar's.
                    </p>
                  </div>
                </div>

                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-blue-500/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-blue-400/30 mx-auto">
                    <TrendingUp className="h-8 w-8 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2 text-white text-lg">Zero Cost to Employers</h3>
                    <p className="text-gray-300">
                      Offer instant pay as a benefit at no cost to your business.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-32 text-white relative">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <div className="max-w-3xl mx-auto space-y-8">
              <h2 className="text-3xl lg:text-4xl font-bold">Ready to Stream Wages?</h2>
              <p className="text-xl text-gray-300">
                Get started in minutes. Your workers will thank you.
              </p>
              <Link href="/register">
                <Button
                  size="lg"
                  className="px-12 py-6 text-xl font-bold bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-400 hover:to-blue-600 text-white shadow-xl transition-all transform hover:scale-105"
                >
                  Get Started Free
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="bg-slate-800 border-t border-slate-700 py-6">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex flex-col items-center md:items-start space-y-2">
              <div className="text-2xl font-bold text-blue-400">PUDDL3</div>
              <p className="text-sm text-gray-400">The future of payroll is real-time</p>
            </div>
            <p className="text-sm text-gray-400">&copy; 2026 Puddle. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
