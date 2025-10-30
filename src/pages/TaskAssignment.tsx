import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, CheckCircle2, Clock, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

const TaskAssignment = () => {
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
              <h1 className="text-xl font-bold">Task Management</h1>
              <p className="text-sm text-muted-foreground">Assign and track student tasks</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Create New Task */}
          <Card className="glass-card border-border/50 lg:col-span-1">
            <CardHeader>
              <CardTitle>Create New Task</CardTitle>
              <CardDescription>Assign a task to your batch</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="task-title">Task Title</Label>
                  <Input 
                    id="task-title" 
                    placeholder="e.g., Build REST API"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="task-description">Description</Label>
                  <Textarea 
                    id="task-description" 
                    placeholder="Detailed task requirements..."
                    rows={4}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="due-date">Due Date</Label>
                  <Input 
                    id="due-date" 
                    type="date"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="batch">Assign to Batch</Label>
                  <select 
                    id="batch"
                    className="w-full px-3 py-2 rounded-md border border-input bg-background"
                  >
                    <option>Batch 3A - Full Stack Development</option>
                    <option>Batch 2B - Backend Specialization</option>
                    <option>Batch 1C - DevOps Fundamentals</option>
                  </select>
                </div>
                <Button className="w-full bg-primary hover:bg-primary/90">
                  Assign Task
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Active Tasks */}
          <Card className="glass-card border-border/50 lg:col-span-2">
            <CardHeader>
              <CardTitle>Active Tasks</CardTitle>
              <CardDescription>Track student progress on assigned tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {tasks.map((task, index) => (
                <Card key={index} className="border-border/30">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{task.title}</CardTitle>
                        <CardDescription>{task.batch}</CardDescription>
                      </div>
                      <Badge variant="outline">{task.dueDate}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">{task.description}</p>
                    
                    {/* Progress Stats */}
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-secondary" />
                        <div>
                          <p className="text-xs text-muted-foreground">Completed</p>
                          <p className="text-lg font-bold text-secondary">{task.completed}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-primary" />
                        <div>
                          <p className="text-xs text-muted-foreground">In Progress</p>
                          <p className="text-lg font-bold text-primary">{task.inProgress}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <XCircle className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Not Started</p>
                          <p className="text-lg font-bold">{task.notStarted}</p>
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Overall Progress</span>
                        <span>{Math.round((task.completed / task.totalStudents) * 100)}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-primary to-secondary"
                          style={{ width: `${(task.completed / task.totalStudents) * 100}%` }}
                        />
                      </div>
                    </div>

                    {/* Student List */}
                    <div className="mt-4 space-y-2">
                      <p className="text-sm font-medium">Student Status</p>
                      <div className="max-h-40 overflow-y-auto space-y-1">
                        {task.students.map((student, idx) => (
                          <div key={idx} className="flex items-center justify-between text-sm p-2 rounded bg-muted/30">
                            <span>{student.name}</span>
                            <Badge 
                              variant={
                                student.status === 'completed' ? 'default' : 
                                student.status === 'in-progress' ? 'secondary' : 
                                'outline'
                              }
                              className={
                                student.status === 'completed' ? 'bg-secondary/20 text-secondary border-secondary/30' :
                                student.status === 'in-progress' ? 'bg-primary/20 text-primary border-primary/30' :
                                ''
                              }
                            >
                              {student.status === 'completed' ? 'Completed' : 
                               student.status === 'in-progress' ? 'In Progress' : 
                               'Not Started'}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

const tasks = [
  {
    title: "Build E-Commerce REST API",
    batch: "Batch 3A - Full Stack Development",
    description: "Create a RESTful API with authentication, product management, and order processing",
    dueDate: "Dec 20, 2024",
    totalStudents: 28,
    completed: 12,
    inProgress: 10,
    notStarted: 6,
    students: [
      { name: "Sarah Chen", status: "completed" },
      { name: "Marcus Johnson", status: "not-started" },
      { name: "Emma Wilson", status: "in-progress" },
      { name: "David Park", status: "completed" },
      { name: "Priya Patel", status: "in-progress" },
      { name: "Alex Rivera", status: "completed" },
    ]
  },
  {
    title: "Implement Microservices Architecture",
    batch: "Batch 2B - Backend Specialization",
    description: "Design and implement a microservices system with at least 5 services",
    dueDate: "Dec 15, 2024",
    totalStudents: 24,
    completed: 8,
    inProgress: 14,
    notStarted: 2,
    students: [
      { name: "John Smith", status: "in-progress" },
      { name: "Lisa Anderson", status: "completed" },
      { name: "Mike Chen", status: "in-progress" },
      { name: "Rachel Green", status: "completed" },
    ]
  },
];

export default TaskAssignment;
