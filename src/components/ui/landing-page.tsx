import React, { useState, useEffect } from "react"
import { motion } from "motion/react"
import {
  Menu,
  X,
  ArrowRight,
  ChevronRight,
  Mail,
  MapPin,
  Phone,
  Instagram,
  Twitter,
  Linkedin,
  Facebook,
  Github,
  ArrowUpRight,
  Sparkles,
  Zap,
  Palette,
  Code,
  LineChart,
  MessageSquare,
  ShieldCheck,
  FileText,
  Globe,
  AlertCircle
} from "lucide-react"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Textarea } from "@/src/components/ui/textarea"
import { Link } from "react-router-dom"

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemFadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
}

export function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className={`sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 ${scrollY > 50 ? "shadow-md" : ""}`}
      >
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center space-x-3">
              <motion.div
                whileHover={{ rotate: 5, scale: 1.1 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center"
              >
                <ShieldCheck className="h-5 w-5 text-primary-foreground" />
              </motion.div>
              <span className="font-bold text-xl">Paperloo</span>
            </Link>
          </div>
          <nav className="hidden md:flex gap-8">
            <Link to="#features" className="text-sm font-medium transition-colors hover:text-primary">
              Features
            </Link>
            <Link to="#how-it-works" className="text-sm font-medium transition-colors hover:text-primary">
              How it Works
            </Link>
            <Link to="#pricing" className="text-sm font-medium transition-colors hover:text-primary">
              Pricing
            </Link>
          </nav>
          <div className="hidden md:flex items-center gap-3">
            <Link to="/login">
              <Button variant="outline" size="sm" className="rounded-full">
                Log In
              </Button>
            </Link>
            <Link to="/signup">
              <Button size="sm" className="rounded-full">
                Get Started
              </Button>
            </Link>
          </div>
          <button className="flex md:hidden" onClick={toggleMenu}>
            <Menu className="h-6 w-6" />
            <span className="sr-only">Toggle menu</span>
          </button>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-background md:hidden"
        >
          <div className="container mx-auto flex h-16 items-center justify-between px-4">
            <div className="flex items-center gap-3">
              <Link to="/" className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center">
                  <ShieldCheck className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="font-bold text-xl">Paperloo</span>
              </Link>
            </div>
            <button onClick={toggleMenu}>
              <X className="h-6 w-6" />
              <span className="sr-only">Close menu</span>
            </button>
          </div>
          <motion.nav
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="container mx-auto grid gap-3 pb-8 pt-6 px-4"
          >
            {["Features", "How it Works", "Pricing"].map((item, index) => (
              <motion.div key={index} variants={itemFadeIn}>
                <Link
                  to={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
                  className="flex items-center justify-between rounded-xl px-3 py-2 text-lg font-medium hover:bg-accent"
                  onClick={toggleMenu}
                >
                  {item}
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </motion.div>
            ))}
            <motion.div variants={itemFadeIn} className="flex flex-col gap-3 pt-4">
              <Link to="/login" className="w-full">
                <Button variant="outline" className="w-full rounded-full">
                  Log In
                </Button>
              </Link>
              <Link to="/signup" className="w-full">
                <Button className="w-full rounded-full">Get Started</Button>
              </Link>
            </motion.div>
          </motion.nav>
        </motion.div>
      )}

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 overflow-hidden">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid gap-12 lg:grid-cols-[1fr_500px] items-center">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeIn}
                className="flex flex-col justify-center space-y-8"
              >
                <div className="space-y-4">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="inline-flex items-center rounded-full bg-muted px-4 py-1.5 text-sm font-medium"
                  >
                    <Zap className="mr-2 h-4 w-4 text-primary" />
                    Compliance for Web Agencies
                  </motion.div>
                  <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.2 }}
                    className="text-5xl font-bold tracking-tighter sm:text-6xl xl:text-7xl/none"
                  >
                    Automate Client Compliance in{" "}
                    <span className="bg-gradient-to-r from-primary to-indigo-500 bg-clip-text text-transparent">
                      Minutes
                    </span>
                  </motion.h1>
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.4 }}
                    className="max-w-[600px] text-muted-foreground md:text-xl"
                  >
                    Generate, host, and embed legally-structured privacy policies, terms, and cookie banners for all your client sites.
                  </motion.p>
                </div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.6 }}
                  className="flex flex-col gap-4 sm:flex-row"
                >
                  <Link to="/signup">
                    <Button size="lg" className="rounded-full px-8 h-14 text-lg group">
                      Start Free Trial
                      <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                  <Button variant="outline" size="lg" className="rounded-full px-8 h-14 text-lg">
                    View Demo
                  </Button>
                </motion.div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                className="relative hidden lg:block"
              >
                <div className="absolute -inset-4 bg-gradient-to-tr from-primary/20 to-indigo-500/20 blur-3xl rounded-full" />
                <div className="relative bg-card border rounded-3xl shadow-2xl overflow-hidden p-8">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="h-3 w-3 rounded-full bg-red-500" />
                    <div className="h-3 w-3 rounded-full bg-yellow-500" />
                    <div className="h-3 w-3 rounded-full bg-green-500" />
                  </div>
                  <div className="space-y-4">
                    <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
                    <div className="h-4 w-full bg-muted rounded animate-pulse" />
                    <div className="h-4 w-5/6 bg-muted rounded animate-pulse" />
                    <div className="pt-8 border-t">
                      <div className="flex justify-between items-center">
                        <div className="h-8 w-32 bg-primary/10 rounded" />
                        <div className="h-8 w-24 bg-primary rounded" />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-24 bg-muted/30">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Built for Modern Agencies</h2>
              <p className="text-muted-foreground text-lg max-w-[800px] mx-auto">
                Everything you need to manage compliance across dozens or hundreds of client sites.
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              {[
                {
                  icon: <FileText className="h-10 w-10 text-primary" />,
                  title: "Dynamic Questionnaires",
                  description: "Per-site forms that capture exactly what data is collected and how it's used."
                },
                {
                  icon: <Globe className="h-10 w-10 text-primary" />,
                  title: "Jurisdiction Engine",
                  description: "Auto-detect GDPR, CCPA, PIPEDA, and more based on business and user locations."
                },
                {
                  icon: <AlertCircle className="h-10 w-10 text-primary" />,
                  title: "Regulation Alerts",
                  description: "Get notified when laws change. One-click regenerate to stay compliant."
                }
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  whileHover={{ y: -10 }}
                  className="bg-card border rounded-3xl p-8 shadow-sm"
                >
                  <div className="mb-6">{feature.icon}</div>
                  <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full border-t py-12 bg-background">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-6 w-6 text-primary" />
              <span className="font-bold text-xl">Paperloo</span>
            </div>
            <div className="flex gap-8 text-sm text-muted-foreground">
              <Link to="#" className="hover:text-primary">Privacy Policy</Link>
              <Link to="#" className="hover:text-primary">Terms of Service</Link>
              <Link to="#" className="hover:text-primary">Contact</Link>
            </div>
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} Paperloo. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
