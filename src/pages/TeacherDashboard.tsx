import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users, AlertTriangle, TrendingUp, CheckCircle2, Clock, GitBranch } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BatchHealthChart } from "@/components/dashboard/BatchHealthChart";
import { StudentTable } from "@/components/dashboard/StudentTable";

const TeacherDashboard = () => {
  const navigate = useNavigate();

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
              <h1 className="text-xl font-bold">Teacher Dashboard</h1>
              <p className="text-sm text-muted-foreground">Batch 3A - Full Stack Development</p>
            </div>
          </div>
          <Button className="bg-primary hover:bg-primary/90">
            <GitBranch className="mr-2 w-4 h-4" />
            View All Batches
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8 space-y-6">
        {/* AI Insights Banner */}
        <Card className="glass-card border-primary/30 bg-primary/5 animate-fade-in">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1">AI Summary</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Batch 3A is showing strong progress in backend development but struggling with API testing concepts. 
                  Consider a 10-minute recap session on Jest mocks and integration testing patterns. 
                  3 students have broken their commit streaks this week.
                </p>
                <div className="flex gap-2">
                  <Button size="sm" className="bg-primary hover:bg-primary/90">
                    Schedule Review Session
                  </Button>
                  <Button size="sm" variant="outline">
                    View Detailed Report
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <Card key={index} className="glass-card border-border/50 animate-scale-in" style={{ animationDelay: `${index * 0.1}s` }}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  <span className="text-2xl font-bold">{stat.value}</span>
                </div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                {stat.subtext && (
                  <p className={`text-xs mt-1 ${stat.subtextColor || 'text-muted-foreground'}`}>
                    {stat.subtext}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Batch Health */}
          <Card className="glass-card border-border/50 lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Batch Health
              </CardTitle>
              <CardDescription>Overall engagement and progress metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <BatchHealthChart />
            </CardContent>
          </Card>

          {/* Alerts & Notifications */}
          <Card className="glass-card border-border/50 lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-warning" />
                Student Alerts
              </CardTitle>
              <CardDescription>Students requiring attention</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {alerts.map((alert, index) => (
                <div key={index} className={`p-4 rounded-lg border ${alert.severity === 'high' ? 'bg-destructive/10 border-destructive/30' : 'bg-warning/10 border-warning/30'}`}>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-medium">{alert.student}</h4>
                      <p className="text-sm text-muted-foreground">{alert.issue}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      alert.severity === 'high' ? 'bg-destructive/20 text-destructive' : 'bg-warning/20 text-warning'
                    }`}>
                      {alert.severity}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{alert.details}</p>
                  <Button size="sm" variant="outline" className="text-xs">
                    Send Check-in Message
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Student Progress Table */}
        <Card className="glass-card border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Student Progress
            </CardTitle>
            <CardDescription>Detailed view of individual student metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <StudentTable />
          </CardContent>
        </Card>

        {/* Topic Coverage Analysis */}
        <Card className="glass-card border-border/50">
          <CardHeader>
            <CardTitle>Curriculum Topic Coverage</CardTitle>
            <CardDescription>How well students are mastering each topic area</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topics.map((topic, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{topic.name}</span>
                    <span className="text-sm text-muted-foreground">{topic.coverage}% coverage</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${topic.coverage >= 80 ? 'bg-secondary' : topic.coverage >= 60 ? 'bg-primary' : 'bg-warning'}`}
                      style={{ width: `${topic.coverage}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">{topic.details}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const stats = [
  { icon: Users, label: "Active Students", value: "28", subtext: "2 inactive this week", color: "text-primary" },
  { icon: CheckCircle2, label: "Avg Completion", value: "84%", subtext: "+3% vs last week", subtextColor: "text-secondary", color: "text-secondary" },
  { icon: Clock, label: "Avg Response Time", value: "2.4h", subtext: "to student queries", color: "text-info" },
  { icon: AlertTriangle, label: "Need Attention", value: "5", subtext: "students at risk", subtextColor: "text-warning", color: "text-warning" },
];

const alerts = [
  {
    student: "Marcus Johnson",
    issue: "Commit streak broken (7 days inactive)",
    details: "Last activity: Nov 8. Was working on microservices project.",
    severity: "high"
  },
  {
    student: "Emma Wilson",
    issue: "Struggling with API testing",
    details: "Multiple failed test attempts. May need 1-on-1 session.",
    severity: "medium"
  },
  {
    student: "David Park",
    issue: "Low code review participation",
    details: "Only 2 PR reviews in past 2 weeks.",
    severity: "medium"
  },
];

const topics = [
  { name: "Authentication & Authorization", coverage: 92, details: "JWT, OAuth, Session management - Strong mastery" },
  { name: "RESTful API Design", coverage: 88, details: "HTTP methods, Status codes, Best practices" },
  { name: "Database Design", coverage: 85, details: "SQL, NoSQL, Relations, Migrations" },
  { name: "API Testing", coverage: 58, details: "Jest, Integration tests - Needs improvement" },
  { name: "Docker & Containerization", coverage: 75, details: "Dockerfile, docker-compose, Multi-stage builds" },
  { name: "Microservices Architecture", coverage: 68, details: "Service communication, Message queues - In progress" },
];

export default TeacherDashboard;
