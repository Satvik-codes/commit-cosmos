import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { GitBranch, Code2, TrendingUp, Zap } from "lucide-react";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20" />
      
      {/* Gradient orbs */}
      <div className="absolute top-20 right-20 w-96 h-96 bg-primary/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-secondary/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />

      <div className="relative z-10">
        {/* Navigation */}
        <nav className="container mx-auto px-6 py-8 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <GitBranch className="w-8 h-8 text-primary" />
            <span className="text-2xl font-bold">SPYGIT</span>
          </div>
          <Button variant="outline" onClick={() => navigate('/auth')}>
            Sign In
          </Button>
        </nav>

        {/* Hero Section */}
        <section className="container mx-auto px-6 py-20 text-center">
          <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
            <div className="inline-block">
              <span className="px-4 py-2 rounded-full glass-card text-sm font-medium text-primary border border-primary/20">
                From Code Commits to Career Readiness
              </span>
            </div>
            
            <h1 className="text-6xl md:text-7xl font-bold leading-tight">
              Your Mentorship
              <span className="block bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Cockpit & Coding Dojo
              </span>
            </h1>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Transform GitHub activity into transparent, insightful learning journeys. 
              Bridge the gap between code commits and curriculum outcomes with AI-powered precision.
            </p>

            {/* Role Selection */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
              <Button 
                size="lg" 
                className="text-lg px-8 py-6 bg-primary hover:bg-primary/90 text-primary-foreground group"
                onClick={() => navigate('/teacher-dashboard')}
              >
                <TrendingUp className="mr-2 w-5 h-5 group-hover:scale-110 transition-transform" />
                I am a Teacher
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="text-lg px-8 py-6 border-2 border-primary/50 hover:bg-primary/10 group"
                onClick={() => navigate('/student-dashboard')}
              >
                <Code2 className="mr-2 w-5 h-5 group-hover:scale-110 transition-transform" />
                I am a Student
              </Button>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-6 mt-20 max-w-5xl mx-auto">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="glass-card p-6 rounded-2xl hover:scale-105 transition-transform duration-300 animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-4 mx-auto">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Live Activity Visualization */}
        <section className="container mx-auto px-6 py-20">
          <div className="glass-card rounded-3xl p-8 max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Live Coding Activity</h2>
                <p className="text-muted-foreground">Real-time commits flowing into the platform</p>
              </div>
              <Zap className="w-8 h-8 text-primary animate-pulse" />
            </div>
            
            <div className="space-y-3">
              {mockActivity.map((activity, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-4 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors animate-fade-in"
                  style={{ animationDelay: `${index * 0.2}s` }}
                >
                  <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{activity.student}</span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-sm text-muted-foreground">{activity.repo}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{activity.commit}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{activity.time}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

const features = [
  {
    icon: TrendingUp,
    title: "Intelligent Dashboard",
    description: "Role-based command center with real-time batch health monitoring and AI-generated insights"
  },
  {
    icon: Code2,
    title: "Automated Code Mentor",
    description: "AI-powered grading with detailed breakdowns and actionable next-step suggestions"
  },
  {
    icon: GitBranch,
    title: "Learning Journey",
    description: "Visual timeline transforming commits into a compelling narrative of growth and milestones"
  }
];

const mockActivity = [
  { student: "Sarah Chen", repo: "e-commerce-api", commit: "Implemented JWT authentication", time: "2m ago" },
  { student: "Marcus Johnson", repo: "microservices-app", commit: "Added user-service with PostgreSQL", time: "5m ago" },
  { student: "Priya Patel", repo: "testing-workshop", commit: "Created Jest tests for API endpoints", time: "8m ago" },
  { student: "Alex Rivera", repo: "fullstack-project", commit: "Integrated Stripe payment gateway", time: "12m ago" },
];

export default Landing;
