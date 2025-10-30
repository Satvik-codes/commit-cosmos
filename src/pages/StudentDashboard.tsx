import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, GitCommit, Trophy, TrendingUp, Target, Calendar, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { RadarChart } from "@/components/dashboard/RadarChart";
import { LearningTimeline } from "@/components/dashboard/LearningTimeline";
import { CommitHeatmap } from "@/components/dashboard/CommitHeatmap";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const StudentDashboard = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Logged out successfully");
      navigate('/');
    } catch (error: any) {
      toast.error("Failed to logout");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">Student Dashboard</h1>
              <p className="text-sm text-muted-foreground">Welcome back, Alex Rivera</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary/10 border border-secondary/20">
              <GitCommit className="w-4 h-4 text-secondary" />
              <span className="text-sm font-medium">24-day streak</span>
            </div>
            <Button variant="outline" size="icon" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8 space-y-6">
        {/* Assigned Tasks */}
        <Card className="glass-card border-primary/30 bg-primary/5 animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Assigned Tasks
            </CardTitle>
            <CardDescription>Tasks assigned by your teacher</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {assignedTasks.map((task, index) => (
                <div 
                  key={index} 
                  className="p-4 rounded-lg border border-border/50 bg-card/50 hover:border-primary/50 transition-all"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium">{task.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ml-4 ${
                      task.status === 'completed' 
                        ? 'bg-secondary/20 text-secondary border border-secondary/30' 
                        : task.status === 'in-progress'
                        ? 'bg-primary/20 text-primary border border-primary/30'
                        : 'bg-muted text-muted-foreground border border-border'
                    }`}>
                      {task.status === 'completed' ? 'Completed' : 
                       task.status === 'in-progress' ? 'In Progress' : 
                       'Not Started'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Due: {task.dueDate}</span>
                    {task.status === 'not-started' && (
                      <Button size="sm" className="bg-primary hover:bg-primary/90">
                        Start Task
                      </Button>
                    )}
                    {task.status === 'in-progress' && (
                      <Button size="sm" variant="outline">
                        Continue
                      </Button>
                    )}
                    {task.status === 'completed' && (
                      <span className="text-secondary text-sm flex items-center gap-1">
                        <Trophy className="w-4 h-4" />
                        Completed
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <Card key={index} className="glass-card border-border/50 animate-scale-in" style={{ animationDelay: `${index * 0.1}s` }}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <stat.icon className="w-5 h-5 text-primary" />
                  <span className="text-2xl font-bold">{stat.value}</span>
                </div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                {stat.trend && (
                  <p className="text-xs text-secondary mt-1">↑ {stat.trend}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Skill Radar */}
          <Card className="glass-card border-border/50 lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Skill Radar
              </CardTitle>
              <CardDescription>Your technical competencies</CardDescription>
            </CardHeader>
            <CardContent>
              <RadarChart />
            </CardContent>
          </Card>

          {/* Learning Timeline */}
          <Card className="glass-card border-border/50 lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-secondary" />
                Learning Journey
              </CardTitle>
              <CardDescription>Your coding story with key milestones</CardDescription>
            </CardHeader>
            <CardContent>
              <LearningTimeline />
            </CardContent>
          </Card>
        </div>

        {/* Commit Activity */}
        <Card className="glass-card border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Commit Activity
            </CardTitle>
            <CardDescription>Your coding consistency over the past months</CardDescription>
          </CardHeader>
          <CardContent>
            <CommitHeatmap />
          </CardContent>
        </Card>

        {/* Recent Feedback */}
        <Card className="glass-card border-border/50">
          <CardHeader>
            <CardTitle>Latest AI Feedback</CardTitle>
            <CardDescription>Automated mentor insights on your recent work</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentFeedback.map((feedback, index) => (
              <div key={index} className="p-4 rounded-lg bg-muted/30 border border-border/30 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium">{feedback.project}</h4>
                    <p className="text-sm text-muted-foreground">{feedback.date}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    feedback.grade >= 90 ? 'bg-secondary/20 text-secondary' :
                    feedback.grade >= 80 ? 'bg-primary/20 text-primary' :
                    'bg-warning/20 text-warning'
                  }`}>
                    {feedback.grade}%
                  </span>
                </div>
                <div className="space-y-2 text-sm">
                  {feedback.points.map((point, i) => (
                    <p key={i} className="flex items-start gap-2">
                      <span className={point.type === 'success' ? 'text-secondary' : point.type === 'warning' ? 'text-warning' : 'text-destructive'}>
                        {point.type === 'success' ? '✅' : point.type === 'warning' ? '⚠️' : '❌'}
                      </span>
                      <span>{point.text}</span>
                    </p>
                  ))}
                </div>
                <div className="pt-2 border-t border-border/30">
                  <p className="text-sm font-medium text-primary">Next Step:</p>
                  <p className="text-sm text-muted-foreground">{feedback.nextStep}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const assignedTasks = [
  {
    title: "Build E-Commerce REST API",
    description: "Create a RESTful API with authentication, product management, and order processing",
    dueDate: "Dec 20, 2024",
    status: "in-progress"
  },
  {
    title: "Implement Microservices Architecture",
    description: "Design and implement a microservices system with at least 5 services",
    dueDate: "Dec 15, 2024",
    status: "not-started"
  },
  {
    title: "Write Unit Tests",
    description: "Add comprehensive unit tests for your latest project",
    dueDate: "Dec 10, 2024",
    status: "completed"
  },
];

const stats = [
  { icon: GitCommit, label: "Total Commits", value: "342", trend: "+12 this week" },
  { icon: Trophy, label: "Projects Completed", value: "8", trend: "+2 this month" },
  { icon: TrendingUp, label: "Average Grade", value: "87%", trend: "+5% improvement" },
  { icon: Target, label: "Skills Mastered", value: "12", trend: "+3 new skills" },
];

const recentFeedback = [
  {
    project: "E-Commerce API",
    date: "Nov 15, 2024",
    grade: 92,
    points: [
      { type: 'success', text: 'Authentication (JWT) implemented robustly with proper token refresh' },
      { type: 'success', text: 'RESTful API design follows best practices' },
      { type: 'warning', text: 'Logging is present but lacks structured error levels' },
    ],
    nextStep: "Add Winston or Pino for structured logging with log levels (info, warn, error)"
  },
  {
    project: "Microservices Architecture",
    date: "Nov 10, 2024",
    grade: 85,
    points: [
      { type: 'success', text: 'Docker containerization properly configured' },
      { type: 'warning', text: 'Only 4/5 microservices found; user-service is missing' },
      { type: 'success', text: 'Inter-service communication using RabbitMQ is excellent' },
    ],
    nextStep: "Initialize user-service using 'nest new user-service' and define User entity with TypeORM"
  },
];

export default StudentDashboard;
