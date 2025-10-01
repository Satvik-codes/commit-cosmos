import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export const StudentTable = () => {
  const students = [
    { 
      name: "Alex Rivera", 
      commits: 342, 
      projects: 8, 
      grade: 87, 
      trend: "up",
      lastActive: "2h ago",
      status: "active"
    },
    { 
      name: "Sarah Chen", 
      commits: 298, 
      projects: 7, 
      grade: 92, 
      trend: "up",
      lastActive: "1h ago",
      status: "active"
    },
    { 
      name: "Marcus Johnson", 
      commits: 156, 
      projects: 5, 
      grade: 78, 
      trend: "down",
      lastActive: "7d ago",
      status: "inactive"
    },
    { 
      name: "Priya Patel", 
      commits: 401, 
      projects: 9, 
      grade: 95, 
      trend: "up",
      lastActive: "30m ago",
      status: "active"
    },
    { 
      name: "Emma Wilson", 
      commits: 234, 
      projects: 6, 
      grade: 73, 
      trend: "down",
      lastActive: "5h ago",
      status: "warning"
    },
    { 
      name: "David Park", 
      commits: 289, 
      projects: 7, 
      grade: 85, 
      trend: "stable",
      lastActive: "3h ago",
      status: "active"
    },
  ];

  const getTrendIcon = (trend: string) => {
    if (trend === "up") return <TrendingUp className="w-4 h-4 text-secondary" />;
    if (trend === "down") return <TrendingDown className="w-4 h-4 text-destructive" />;
    return <Minus className="w-4 h-4 text-muted-foreground" />;
  };

  const getStatusBadge = (status: string) => {
    if (status === "active") return <Badge variant="outline" className="bg-secondary/10 text-secondary border-secondary/30">Active</Badge>;
    if (status === "inactive") return <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30">Inactive</Badge>;
    return <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30">At Risk</Badge>;
  };

  return (
    <div className="rounded-lg border border-border/50 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30">
            <TableHead>Student</TableHead>
            <TableHead className="text-center">Commits</TableHead>
            <TableHead className="text-center">Projects</TableHead>
            <TableHead className="text-center">Avg Grade</TableHead>
            <TableHead className="text-center">Trend</TableHead>
            <TableHead className="text-center">Last Active</TableHead>
            <TableHead className="text-center">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.map((student, index) => (
            <TableRow 
              key={index}
              className="hover:bg-muted/20 transition-colors cursor-pointer"
            >
              <TableCell className="font-medium">{student.name}</TableCell>
              <TableCell className="text-center">{student.commits}</TableCell>
              <TableCell className="text-center">{student.projects}</TableCell>
              <TableCell className="text-center">
                <span className={`font-medium ${
                  student.grade >= 90 ? 'text-secondary' :
                  student.grade >= 80 ? 'text-primary' :
                  'text-warning'
                }`}>
                  {student.grade}%
                </span>
              </TableCell>
              <TableCell className="text-center">
                <div className="flex justify-center">
                  {getTrendIcon(student.trend)}
                </div>
              </TableCell>
              <TableCell className="text-center text-sm text-muted-foreground">
                {student.lastActive}
              </TableCell>
              <TableCell className="text-center">
                {getStatusBadge(student.status)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
