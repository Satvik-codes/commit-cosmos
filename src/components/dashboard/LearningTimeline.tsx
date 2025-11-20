import { GitCommit, Award, Zap, Star } from "lucide-react";

interface LearningTimelineProps {
  activities: any[];
}

export const LearningTimeline = ({ activities = [] }: LearningTimelineProps) => {
  const milestones = activities
    .slice(0, 10)
    .map((activity, index) => {
      const icons = [GitCommit, Award, Zap, Star];
      const colors = ["text-primary", "text-secondary", "text-accent"];
      
      return {
        date: new Date(activity.occurred_at).toLocaleDateString(),
        title: activity.activity_type === 'commit' 
          ? `Commit: ${activity.commit_message?.substring(0, 50) || 'No message'}`
          : `${activity.activity_type}: ${activity.metadata?.title || 'Activity'}`,
        description: activity.activity_type === 'commit'
          ? `${activity.additions || 0} additions, ${activity.deletions || 0} deletions`
          : activity.metadata?.state || '',
        icon: icons[index % icons.length],
        color: colors[index % colors.length]
      };
    });

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
