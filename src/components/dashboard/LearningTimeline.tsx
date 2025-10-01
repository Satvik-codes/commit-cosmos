import { GitCommit, Award, Zap, Star } from "lucide-react";

export const LearningTimeline = () => {
  const milestones = [
    {
      date: "Nov 15, 2024",
      title: "Project 'E-Commerce API' Completed",
      description: "Mastered JWT authentication & Stripe integration",
      icon: Award,
      color: "text-secondary"
    },
    {
      date: "Nov 1, 2024",
      title: "Major Refactor - SOLID Principles",
      description: "Demonstrated understanding of clean architecture",
      icon: Zap,
      color: "text-primary"
    },
    {
      date: "Oct 20, 2024",
      title: "First Pull Request Merged",
      description: "Contributed to team project with proper Git workflow",
      icon: GitCommit,
      color: "text-primary"
    },
    {
      date: "Oct 5, 2024",
      title: "Microservices Foundation",
      description: "Successfully deployed first containerized application",
      icon: Star,
      color: "text-secondary"
    }
  ];

  return (
    <div className="space-y-4 relative">
      <div className="absolute left-4 top-8 bottom-8 w-0.5 bg-border" />
      
      {milestones.map((milestone, index) => (
        <div key={index} className="flex gap-4 relative animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
          <div className={`w-8 h-8 rounded-full bg-card border-2 border-current ${milestone.color} flex items-center justify-center flex-shrink-0 z-10`}>
            <milestone.icon className="w-4 h-4" />
          </div>
          <div className="flex-1 pb-4">
            <div className="p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
              <p className="text-xs text-muted-foreground mb-1">{milestone.date}</p>
              <h4 className="font-medium mb-1">{milestone.title}</h4>
              <p className="text-sm text-muted-foreground">{milestone.description}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
