import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, Users, Calendar, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";

const BatchesView = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/teacher-dashboard')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">All Batches</h1>
              <p className="text-sm text-muted-foreground">Manage your teaching batches</p>
            </div>
          </div>
          <Button className="bg-primary hover:bg-primary/90">
            <Plus className="mr-2 w-4 h-4" />
            Create New Batch
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {batches.map((batch, index) => (
            <Card 
              key={index} 
              className="glass-card border-border/50 hover:border-primary/50 transition-all cursor-pointer animate-scale-in"
              style={{ animationDelay: `${index * 0.1}s` }}
              onClick={() => navigate('/teacher-dashboard')}
            >
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <CardTitle className="text-lg">{batch.name}</CardTitle>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    batch.status === 'active' 
                      ? 'bg-secondary/20 text-secondary' 
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {batch.status}
                  </span>
                </div>
                <CardDescription>{batch.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="w-4 h-4" />
                      <span>Students</span>
                    </div>
                    <span className="font-medium">{batch.students}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <TrendingUp className="w-4 h-4" />
                      <span>Avg Progress</span>
                    </div>
                    <span className="font-medium">{batch.progress}%</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>Duration</span>
                    </div>
                    <span className="font-medium">{batch.duration}</span>
                  </div>
                </div>
                <Button 
                  className="w-full mt-4" 
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('/task-assignment');
                  }}
                >
                  Assign Task
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

const batches = [
  {
    name: "Batch 3A - Full Stack Development",
    description: "Advanced web development with MERN stack",
    students: 28,
    progress: 84,
    duration: "Jan - Jun 2024",
    status: "active"
  },
  {
    name: "Batch 2B - Backend Specialization",
    description: "Microservices and API development",
    students: 24,
    progress: 92,
    duration: "Sep - Dec 2023",
    status: "active"
  },
  {
    name: "Batch 1C - DevOps Fundamentals",
    description: "CI/CD, Docker, and Kubernetes",
    students: 20,
    progress: 78,
    duration: "Jan - Apr 2024",
    status: "active"
  },
  {
    name: "Batch 4D - Frontend Masters",
    description: "React, TypeScript, and modern tooling",
    students: 30,
    progress: 100,
    duration: "May - Aug 2023",
    status: "completed"
  },
  {
    name: "Batch 5E - Data Engineering",
    description: "Big data and data pipelines",
    students: 18,
    progress: 65,
    duration: "Feb - Jul 2024",
    status: "active"
  },
];

export default BatchesView;
