export const CommitHeatmap = () => {
  // Generate mock data for the last 12 weeks
  const weeks = 12;
  const daysPerWeek = 7;
  
  const generateHeatmapData = () => {
    const data = [];
    for (let week = 0; week < weeks; week++) {
      const weekData = [];
      for (let day = 0; day < daysPerWeek; day++) {
        // Random commit count (0-10)
        const commits = Math.floor(Math.random() * 11);
        weekData.push(commits);
      }
      data.push(weekData);
    }
    return data;
  };

  const heatmapData = generateHeatmapData();
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getColorIntensity = (commits: number) => {
    if (commits === 0) return 'bg-muted/30';
    if (commits <= 2) return 'bg-primary/30';
    if (commits <= 5) return 'bg-primary/60';
    if (commits <= 8) return 'bg-primary/80';
    return 'bg-primary';
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 items-start">
        <div className="flex flex-col gap-2 text-xs text-muted-foreground pt-6">
          {days.map((day, index) => (
            <div key={index} className="h-3 flex items-center">
              {index % 2 === 1 && day}
            </div>
          ))}
        </div>
        
        <div className="flex gap-1 flex-1">
          {heatmapData.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-1">
              {week.map((commits, dayIndex) => (
                <div
                  key={`${weekIndex}-${dayIndex}`}
                  className={`w-3 h-3 rounded-sm ${getColorIntensity(commits)} transition-all hover:scale-125 cursor-pointer group relative`}
                  title={`${commits} commits`}
                >
                  <div className="absolute hidden group-hover:block bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-popover text-xs rounded shadow-lg whitespace-nowrap z-10">
                    {commits} commits
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span>Less</span>
        <div className="flex gap-1">
          <div className="w-3 h-3 rounded-sm bg-muted/30" />
          <div className="w-3 h-3 rounded-sm bg-primary/30" />
          <div className="w-3 h-3 rounded-sm bg-primary/60" />
          <div className="w-3 h-3 rounded-sm bg-primary/80" />
          <div className="w-3 h-3 rounded-sm bg-primary" />
        </div>
        <span>More</span>
      </div>
    </div>
  );
};
