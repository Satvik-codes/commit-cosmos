export const BatchHealthChart = () => {
  const metrics = [
    { label: 'Engagement', value: 84, color: 'bg-secondary' },
    { label: 'Completion', value: 78, color: 'bg-primary' },
    { label: 'Code Quality', value: 88, color: 'bg-secondary' },
    { label: 'Collaboration', value: 72, color: 'bg-primary' },
  ];

  return (
    <div className="space-y-6">
      {metrics.map((metric, index) => (
        <div key={index} className="space-y-2 animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">{metric.label}</span>
            <span className="text-muted-foreground">{metric.value}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full ${metric.color} transition-all duration-1000 ease-out`}
              style={{ 
                width: `${metric.value}%`,
                animationDelay: `${index * 0.1}s`
              }}
            />
          </div>
        </div>
      ))}

      <div className="pt-4 mt-4 border-t border-border/50">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Overall Health Score</span>
          <span className="text-2xl font-bold text-primary">81%</span>
        </div>
        <p className="text-xs text-muted-foreground">
          Batch is performing well overall. Focus on improving collaboration metrics.
        </p>
      </div>
    </div>
  );
};
