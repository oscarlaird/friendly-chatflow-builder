
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarProvider } from '@/components/ui/sidebar';
import { ArrowRight, Globe, Lock, SearchCheck, Brain, Building2, Coffee } from 'lucide-react';

const examplePrompts = [
  "Qualify leads in Sales Nav",
  "Find new AI competitors on crunchbase",
  "Build a list of instagram accounts to reach out to",
  "Draft emails with my availability for warm intros"
];

const pricingTiers = [
  {
    name: "Free",
    price: "$0",
    period: "month",
    tagline: "Get a taste of what AGI is like",
    features: [
      "Access to full sweet of common integrations",
      "Limited browser automation run time",
      "Limited open research capabilities",
      "Limited to 1 parallel workflow running",
      "Ability to automate actions within all browser applications"
    ]
  },
  {
    name: "Plus",
    price: "$50",
    period: "month",
    tagline: "Start saving hours with AGI",
    features: [
      "Everything in free",
      "Extended limits on browser automation",
      "Access to latest AI models",
      "Access to newest features",
      "Access to Stealth Mode"
    ]
  },
  {
    name: "Premium",
    price: "$200",
    period: "month",
    tagline: "Experience AGI with no limitations",
    features: [
      "Everything in plus",
      "Unlimited browser automation run time",
      "Unlimited research",
      "Unlimited Parallel workflow runs",
      "1:1 support when needed"
    ]
  }
];

const faqs = [
  {
    question: "Is Mill Free To Use?",
    answer: "Yes, Mill offers a free tier that gives you access to basic features and automation capabilities."
  },
  {
    question: "Is Mill Safe for me to use?",
    answer: "Mill is built with security and safety as top priorities. We use industry-standard encryption and security practices."
  },
  {
    question: "How do you make sure Mill does not hallucinate?",
    answer: "Mill uses advanced AI models with built-in validation and verification systems to ensure accuracy."
  },
  {
    question: "How does Mill use my Data?",
    answer: "We prioritize your privacy. Your data is only used to perform the tasks you request and improve our service."
  },
  {
    question: "How does the Chrome Extension Work?",
    answer: "Our Chrome extension securely connects to Mill to enable browser automation while maintaining your privacy and security."
  }
];

const AppSidebar = () => {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Research</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <a href="/blog">
                  <Brain className="h-4 w-4" />
                  <span>Blog</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Safety</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <a href="/safety">
                  <Lock className="h-4 w-4" />
                  <span>Safety Stance</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <a href="/security">
                  <Globe className="h-4 w-4" />
                  <span>Security & Privacy</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Company</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <a href="/about">
                  <Building2 className="h-4 w-4" />
                  <span>About Us</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <a href="/contact">
                  <Coffee className="h-4 w-4" />
                  <span>Contact</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default function Landing() {
  const [prompt, setPrompt] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/app');
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <main className="flex-1 overflow-auto">
          <nav className="flex items-center justify-between p-6 border-b">
            <h1 className="text-2xl font-bold">Mill</h1>
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate('/auth')}>
                Log in
              </Button>
              <Button onClick={() => navigate('/auth')}>
                Sign up
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </nav>

          <div className="max-w-5xl mx-auto px-6 py-24 space-y-24">
            {/* Hero Section */}
            <section className="text-center space-y-8">
              <h1 className="text-4xl md:text-6xl font-bold tracking-tighter">
                What Can I Automate For You?
              </h1>
              
              <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
                <div className="enhanced-input-container">
                  <Input
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Tell me what you want to automate..."
                    className="enhanced-input"
                  />
                  <Button type="submit" size="icon">
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </form>

              <div className="flex flex-wrap justify-center gap-3">
                {examplePrompts.map((example, index) => (
                  <button
                    key={index}
                    onClick={() => setPrompt(example)}
                    className="prompt-badge-mini"
                  >
                    <SearchCheck className="mr-2 h-3 w-3" />
                    {example}
                  </button>
                ))}
              </div>
            </section>

            {/* Value Proposition */}
            <section className="text-center space-y-6">
              <h2 className="text-3xl md:text-5xl font-bold">
                Automate Hours Away. Unlock Ingenuity.
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Transform work with mill. Mill is your personal assistant. It's like finding magic, but it's real and it works for you.
              </p>
            </section>

            {/* Use Cases */}
            <section className="space-y-12">
              <h2 className="text-3xl font-bold text-center">Use Cases</h2>
              {/* Add use case cards here */}
            </section>

            {/* Pricing */}
            <section className="space-y-12">
              <h2 className="text-3xl font-bold text-center">Pricing</h2>
              <div className="grid md:grid-cols-3 gap-8">
                {pricingTiers.map((tier, index) => (
                  <div key={index} className="rounded-lg border p-8 space-y-6">
                    <h3 className="text-2xl font-bold">{tier.name}</h3>
                    <div className="text-4xl font-bold">
                      {tier.price}
                      <span className="text-lg text-muted-foreground">/{tier.period}</span>
                    </div>
                    <p className="text-muted-foreground">{tier.tagline}</p>
                    <ul className="space-y-4">
                      {tier.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <SearchCheck className="h-4 w-4 text-green-500" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Button className="w-full">Get Started</Button>
                  </div>
                ))}
              </div>
            </section>

            {/* FAQs */}
            <section className="space-y-12">
              <h2 className="text-3xl font-bold text-center">Frequently Asked Questions</h2>
              <div className="grid gap-6 max-w-3xl mx-auto">
                {faqs.map((faq, index) => (
                  <div key={index} className="space-y-2">
                    <h3 className="text-xl font-semibold">{faq.question}</h3>
                    <p className="text-muted-foreground">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* CTA */}
            <section className="text-center space-y-6">
              <h2 className="text-3xl font-bold">Get Started with Mill Today</h2>
              <Button size="lg" onClick={() => navigate('/auth')}>
                Sign up now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </section>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
