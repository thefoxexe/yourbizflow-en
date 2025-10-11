import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/customSupabaseClient";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Helmet } from "react-helmet";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const TimeTracking = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [timeEntries, setTimeEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEntryDialogOpen, setIsEntryDialogOpen] = useState(false);
  const [isEmployeeDialogOpen, setIsEmployeeDialogOpen] = useState(false);
  const [newEntry, setNewEntry] = useState({
    project_id: "",
    employee_id: "",
    description: "",
    duration_hours: "",
    duration_minutes: "",
    entry_date: new Date().toISOString().split("T")[0],
  });
  const [newEmployee, setNewEmployee] = useState({
    name: "",
    position: "",
    gross_salary: "",
    hire_date: new Date().toISOString().split("T")[0],
  });

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const [projectsRes, entriesRes, employeesRes] = await Promise.all([
      supabase
        .from("projects")
        .select("id, name, hourly_rate")
        .eq("user_id", user.id),
      supabase
        .from("time_entries")
        .select("*, project:projects(name), employee:employees(name)")
        .eq("user_id", user.id)
        .order("start_time", {
          ascending: false,
        }),
      supabase.from("employees").select("id, name").eq("user_id", user.id),
    ]);
    if (projectsRes.error || entriesRes.error || employeesRes.error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Unable to load data.",
      });
    } else {
      setProjects(projectsRes.data);
      setTimeEntries(entriesRes.data);
      setEmployees(employeesRes.data);
    }
    setLoading(false);
  }, [user, toast]);
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  const formatDuration = (seconds) => {
    if (seconds === null || isNaN(seconds)) return "00:00";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h.toString().padStart(2, "0")}h ${m
      .toString()
      .padStart(2, "0")}m`;
  };
  const getDurationFromEntry = (entry) => {
    if (!entry.start_time || !entry.end_time) return "N/A";
    const start = new Date(entry.start_time);
    const end = new Date(entry.end_time);
    const diffSeconds = Math.floor((end - start) / 1000);
    return formatDuration(diffSeconds);
  };
  const handleAddManualEntry = async () => {
    const {
      project_id,
      employee_id,
      description,
      duration_hours,
      duration_minutes,
      entry_date,
    } = newEntry;
    if (
      !project_id ||
      !employee_id ||
      (!duration_hours && !duration_minutes) ||
      !entry_date
    ) {
      toast({
        variant: "destructive",
        title: "Required fields",
        description: "Project, employee, duration and date are required.",
      });
      return;
    }
    const totalSeconds =
      (parseInt(duration_hours, 10) || 0) * 3600 +
      (parseInt(duration_minutes, 10) || 0) * 60;
    const entryDate = new Date(entry_date);
    const startTime = new Date(entryDate.setHours(0, 0, 0, 0));
    const endTime = new Date(startTime.getTime() + totalSeconds * 1000);
    const { error } = await supabase.from("time_entries").insert({
      user_id: user.id,
      project_id,
      employee_id,
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      description,
    });
    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "The time entry could not be saved.",
      });
    } else {
      toast({
        title: "Success",
        description: "Manual entry added.",
      });
      setIsEntryDialogOpen(false);
      setNewEntry({
        project_id: "",
        employee_id: "",
        description: "",
        duration_hours: "",
        duration_minutes: "",
        entry_date: new Date().toISOString().split("T")[0],
      });
      fetchData();
    }
  };

  const handleAddEmployee = async () => {
    if (!newEmployee.name) {
      toast({ variant: "destructive", title: "Name required" });
      return;
    }
    const { data, error } = await supabase
      .from("employees")
      .insert({
        ...newEmployee,
        user_id: user.id,
        gross_salary: Number(newEmployee.gross_salary) || null,
      })
      .select()
      .single();
    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "The employee could not be added.",
      });
    } else {
      toast({ title: "Success", description: "Employee added." });
      setEmployees((prev) => [...prev, data]);
      setNewEntry((prev) => ({ ...prev, employee_id: data.id }));
      setIsEmployeeDialogOpen(false);
      setNewEmployee({
        name: "",
        position: "",
        gross_salary: "",
        hire_date: new Date().toISOString().split("T")[0],
      });
    }
  };

  const handleDeleteEntry = async (entryId) => {
    const { error } = await supabase
      .from("time_entries")
      .delete()
      .eq("id", entryId);
    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "The entry could not be deleted.",
      });
    } else {
      toast({
        title: "Success",
        description: "Entry deleted.",
      });
      fetchData();
    }
  };
  return (
    <div className="space-y-8">
      <Helmet>
        <title>Time Management - YourBizFlow</title>
        <meta
          name="description"
          content="Track your employees' time spent on projects for accurate billing and better resource management."
        />
      </Helmet>
      <motion.div
        initial={{
          opacity: 0,
          y: 20,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Time management
          </h1>
          <p className="text-muted-foreground">
            Track time spent on your projects for invoicing.
          </p>
        </div>
        <Button onClick={() => setIsEntryDialogOpen(true)}>
          <More className="w-4 h-4 mr-2" />
          Add an entry
        </Button>
      </motion.div>

      <motion.div
        initial={{
          opacity: 0,
          y: 20,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          delay: 0.2,
        }}
      >
        <div className="hidden md:block bg-card/50 backdrop-blur-sm border rounded-xl overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold text-foreground">Time Entries</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left p-4 font-semibold text-muted-foreground">
                    Project
                  </th>
                  <th className="text-left p-4 font-semibold text-muted-foreground">
                    Employee
                  </th>
                  <th className="text-left p-4 font-semibold text-muted-foreground">
                    Description
                  </th>
                  <th className="text-left p-4 font-semibold text-muted-foreground">
                    Date
                  </th>
                  <th className="text-left p-4 font-semibold text-muted-foreground">
                    Duration
                  </th>
                  <th className="text-right p-4 font-semibold text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading
                  ? [...Array(5)].map((_, i) => (
                      <tr key={i} className="border-b border-white/5">
                        <td colSpan="6" className="p-4">
                          <div className="h-8 bg-muted/50 rounded animate-pulse"></div>
                        </td>
                      </tr>
                    ))
                  : timeEntries.map((entry, index) => (
                      <motion.tr
                        key={entry.id}
                        initial={{
                          opacity: 0,
                          y: 10,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                        }}
                        transition={{
                          delay: index * 0.05,
                        }}
                        className="border-b border-white/5 hover:bg-white/5"
                      >
                        <td className="p-4 font-medium">
                          {entry.project?.name || "Project deleted"}
                        </td>
                        <td className="p-4 text-muted-foreground">
                          {entry.employee?.name || "Employee removed"}
                        </td>
                        <td className="p-4 text-muted-foreground">
                          {entry.description}
                        </td>
                        <td className="p-4 text-muted-foreground">
                          {new Date(entry.start_time).toLocaleDateString(
                            "fr-FR"
                          )}
                        </td>
                        <td className="p-4 font-semibold">
                          {getDurationFromEntry(entry)}
                        </td>
                        <td className="p-4 text-right">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleDeleteEntry(entry.id)}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </td>
                      </motion.tr>
                    ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="md:hidden space-y-4">
          {loading
            ? [...Array(3)].map((_, i) => (
                <Card key={i} className="bg-card/50 animate-pulse h-32" />
              ))
            : timeEntries.map((entry) => (
                <Card key={entry.id} className="bg-card/50">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>
                          {entry.project?.name || "Project deleted"}
                        </CardTitle>
                        <CardDescription>
                          {entry.employee?.name || "Employee removed"}
                        </CardDescription>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="-mt-2 -mr-2"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem
                            onClick={() => handleDeleteEntry(entry.id)}
                            className="text-red-500 focus:text-red-500"
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-2">
                      {entry.description}
                    </p>
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-semibold">
                        {getDurationFromEntry(entry)}
                      </span>
                      <span className="text-muted-foreground">
                        {new Date(entry.start_time).toLocaleDateString("fr-FR")}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
        </div>
      </motion.div>

      <Dialog open={isEntryDialogOpen} onOpenChange={setIsEntryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add manual entry</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="project">Project</Label>
              <select
                id="project"
                value={newEntry.project_id}
                onChange={(e) =>
                  setNewEntry({
                    ...newEntry,
                    project_id: e.target.value,
                  })
                }
                className="w-full mt-1 border rounded-md p-2 bg-background text-foreground"
              >
                <option value="">Select a project</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="employee">Employee</Label>
              <div className="flex items-center gap-2">
                <select
                  id="employee"
                  value={newEntry.employee_id}
                  onChange={(e) =>
                    setNewEntry({
                      ...newEntry,
                      employee_id: e.target.value,
                    })
                  }
                  className="w-full mt-1 border rounded-md p-2 bg-background text-foreground"
                >
                  <option value="">Select employee</option>
                  {employees.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name}
                    </option>
                  ))}
                </select>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setIsEmployeeDialogOpen(true)}
                >
                  <More />
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="entry_date">Date</Label>
              <Input
                id="entry_date"
                type="date"
                value={newEntry.entry_date}
                onChange={(e) =>
                  setNewEntry({
                    ...newEntry,
                    entry_date: e.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Duration</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  placeholder="Hours"
                  value={newEntry.duration_hours}
                  onChange={(e) =>
                    setNewEntry({
                      ...newEntry,
                      duration_hours: e.target.value,
                    })
                  }
                />
                <Input
                  type="number"
                  placeholder="Minutes"
                  value={newEntry.duration_minutes}
                  onChange={(e) =>
                    setNewEntry({
                      ...newEntry,
                      duration_minutes: e.target.value,
                    })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                value={newEntry.description}
                onChange={(e) =>
                  setNewEntry({
                    ...newEntry,
                    description: e.target.value,
                  })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEntryDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleAddManualEntry}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isEmployeeDialogOpen}
        onOpenChange={setIsEmployeeDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add employee</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="employee-name">Name</Label>
              <Input
                id="employee-name"
                value={newEmployee.name}
                onChange={(e) =>
                  setNewEmployee({ ...newEmployee, name: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="employee-position">Position</Label>
              <Input
                id="employee-position"
                value={newEmployee.position}
                onChange={(e) =>
                  setNewEmployee({ ...newEmployee, position: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEmployeeDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleAddEmployee}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
export default TimeTracking;
