import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  MoreVertical,
  Trash2,
  Edit,
  ChevronUp,
  ChevronsUp,
  ChevronDown,
  List,
  Kanban,
  Bell,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/customSupabaseClient";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DatePicker } from "@/components/DatePicker";
import { format, isPast, isToday } from "date-fns";
import { Helmet } from "react-helmet";
import { cn } from "@/lib/utils";

const priorityIcons = {
  low: <ChevronDown className="h-4 w-4 text-green-500" />,
  medium: <ChevronUp className="h-4 w-4 text-yellow-500" />,
  high: <ChevronsUp className="h-4 w-4 text-red-500" />,
};

const priorityText = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

const statusText = {
  todo: "To do",
  inprogress: "In progress",
  done: "Done",
};

const TaskDialog = ({
  isOpen,
  onOpenChange,
  task,
  projects,
  employees,
  onSave,
}) => {
  const [editedTask, setEditedTask] = useState(task);

  useEffect(() => {
    setEditedTask(task);
  }, [task]);

  if (!editedTask) return null;

  const handleSave = () => {
    onSave(editedTask);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{editedTask.id ? "Edit task" : "New task"}</DialogTitle>
          <DialogDescription>Fill in the task details below.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={editedTask.title || ""}
              onChange={(e) =>
                setEditedTask({ ...editedTask, title: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={editedTask.description || ""}
              onChange={(e) =>
                setEditedTask({ ...editedTask, description: e.target.value })
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="due_date">Due date</Label>
              <DatePicker
                date={
                  editedTask.due_date ? new Date(editedTask.due_date) : null
                }
                setDate={(date) =>
                  setEditedTask({ ...editedTask, due_date: date })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <select
                id="priority"
                value={editedTask.priority}
                onChange={(e) =>
                  setEditedTask({ ...editedTask, priority: e.target.value })
                }
                className="w-full border rounded-md p-2 bg-background text-foreground"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="project_id">Project</Label>
              <select
                id="project_id"
                value={editedTask.project_id || ""}
                onChange={(e) =>
                  setEditedTask({
                    ...editedTask,
                    project_id: e.target.value || null,
                  })
                }
                className="w-full border rounded-md p-2 bg-background text-foreground"
              >
                <option value="">No projects</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="assignee_id">Assigned to</Label>
              <select
                id="assignee_id"
                value={editedTask.assignee_id || ""}
                onChange={(e) =>
                  setEditedTask({
                    ...editedTask,
                    assignee_id: e.target.value || null,
                  })
                }
                className="w-full border rounded-md p-2 bg-background text-foreground"
              >
                <option value="">Person</option>
                {employees.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const TaskCard = ({ task, onEdit, onDelete, onStatusChange }) => {
  const dueDate = task.due_date ? new Date(task.due_date) : null;
  const isOverdue =
    dueDate && isPast(dueDate) && !isToday(dueDate) && task.status !== "done";
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-card border rounded-lg p-4 space-y-3"
    >
      <div className="flex justify-between items-start">
        <p className="font-bold flex-1 pr-2">{task.title}</p>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 flex-shrink-0"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(task)}>
              <Edit className="mr-2 h-4 w-4" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onStatusChange(task.id, "todo")}>
              To do
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onStatusChange(task.id, "inprogress")}
            >
              In Progress
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onStatusChange(task.id, "done")}>
              Done
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(task.id)}
              className="text-red-500"
            >
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {task.description && (
        <p className="text-sm text-muted-foreground">{task.description}</p>
      )}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          {priorityIcons[task.priority]}
          <span>{priorityText[task.priority]}</span>
        </div>
        {dueDate && (
          <div
            className={cn(
              "flex items-center gap-1",
              isOverdue && "text-red-500 font-semibold"
            )}
          >
            <Bell className="h-4 w-4" />
            <span>{format(dueDate, "dd/MM/yyyy")}</span>
          </div>
        )}
      </div>
      <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border">
        <span>{task.projects?.name || "No project"}</span>
        <span>{task.employees?.name || "Unassigned"}</span>
      </div>
    </motion.div>
  );
};

const TaskManager = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("kanban"); // 'kanban' or 'list'
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const [
      { data: tasksData, error: tasksError },
      { data: projectsData, error: projectsError },
      { data: employeesData, error: employeesError },
    ] = await Promise.all([
      supabase
        .from("tasks")
        .select("*, projects(name), employees(name)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
      supabase.from("projects").select("id, name").eq("user_id", user.id),
      supabase.from("employees").select("id, name").eq("user_id", user.id),
    ]);

    if (tasksError)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Unable to load tasks.",
      });
    else setTasks(tasksData);

    if (projectsError)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Unable to load projects.",
      });
    else setProjects(projectsData);

    if (employeesError)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Unable to load employees.",
      });
    else setEmployees(employeesData);

    setLoading(false);
  }, [user, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenDialog = (task = null) => {
    setSelectedTask(
      task || { title: "", description: "", priority: "medium", status: "todo" }
    );
    setIsDialogOpen(true);
  };

  const handleSaveTask = async (taskToSave) => {
    const taskPayload = {
      ...taskToSave,
      user_id: user.id,
      due_date: taskToSave.due_date
        ? format(new Date(taskToSave.due_date), "yyyy-MM-dd")
        : null,
    };
    delete taskPayload.projects;
    delete taskPayload.employees;

    if (taskToSave.id) {
      // Update
      const { error } = await supabase
        .from("tasks")
        .update(taskPayload)
        .eq("id", taskToSave.id);
      if (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "The task could not be updated.",
        });
      } else {
        toast({ title: "Success", description: "Task updated." });
      }
    } else {
      //Create
      const { error } = await supabase.from("tasks").insert(taskPayload);
      if (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "The task could not be created.",
        });
      } else {
        toast({ title: "Success", description: "Task created." });
      }
    }
    fetchData();
  };

  const handleDeleteTask = async (taskId) => {
    const { error } = await supabase.from("tasks").delete().eq("id", taskId);
    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "The task could not be deleted.",
      });
    } else {
      toast({ title: "Success", description: "Task deleted." });
      fetchData();
    }
  };

  const handleStatusChange = async (taskId, status) => {
    const { error } = await supabase
      .from("tasks")
      .update({ status })
      .eq("id", taskId);
    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "The status could not be updated.",
      });
    } else {
      toast({ title: "Success", description: "Status updated." });
      fetchData();
    }
  };

  const stats = useMemo(() => {
    const total = tasks.length;
    const done = tasks.filter((t) => t.status === "done").length;
    const overdue = tasks.filter(
      (t) =>
        t.due_date &&
        isPast(new Date(t.due_date)) &&
        !isToday(new Date(t.due_date)) &&
        t.status !== "done"
    ).length;
    return { total, done, overdue };
  }, [tasks]);

  const columns = {
    todo: tasks.filter((t) => t.status === "todo"),
    inprogress: tasks.filter((t) => t.status === "inprogress"),
    done: tasks.filter((t) => t.status === "done"),
  };

  return (
    <div className="space-y-8">
      <Helmet>
        <title>Task Manager - YourBizFlow</title>
        <meta
          name="description"
          content="Manage your missions, priorities and deadlines with the YourBizFlow task manager."
        />
      </Helmet>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Task Manager
          </h1>
          <p className="text-muted-foreground">
            Centralize your missions, priorities and deadlines.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-md bg-card border">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setViewMode("kanban")}
              className={cn(viewMode === "kanban" && "bg-primary/20")}
            >
              <Kanban className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setViewMode("list")}
              className={cn(viewMode === "list" && "bg-primary/20")}
            >
              <List className="h-5 w-5" />
            </Button>
          </div>
          <Button onClick={() => handleOpenDialog()}>
            <More className="w-4 h-4 mr-2" />
            New task
          </Button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <div className="bg-card border rounded-lg p-4 flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 rounded-lg">
            <CheckCircle className="h-6 w-6 text-blue-500" />
          </div>
          <div>
            <p className="text-muted-foreground">Completed Tasks</p>
            <p className="text-2xl font-bold">{stats.done}</p>
          </div>
        </div>
        <div className="bg-card border rounded-lg p-4 flex items-center gap-4">
          <div className="p-3 bg-red-500/10 rounded-lg">
            <AlertCircle className="h-6 w-6 text-red-500" />
          </div>
          <div>
            <p className="text-muted-foreground">Overdue tasks</p>
            <p className="text-2xl font-bold">{stats.overdue}</p>
          </div>
        </div>
        <div className="bg-card border rounded-lg p-4 flex items-center gap-4">
          <div className="p-3 bg-gray-500/10 rounded-lg">
            <List className="h-6 w-6 text-gray-500" />
          </div>
          <div>
            <p className="text-muted-foreground">Total Tasks</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </div>
        </div>
      </motion.div>

      {viewMode === "kanban" ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {Object.keys(columns).map((status) => (
            <div key={status} className="bg-card/50 rounded-xl">
              <h2 className="text-lg font-semibold p-4 border-b">
                {statusText[status]}{" "}
                <span className="text-sm font-normal text-muted-foreground">
                  ({columns[status].length})
                </span>
              </h2>
              <div className="p-4 space-y-4 h-[60vh] overflow-y-auto">
                {columns[status].map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onEdit={handleOpenDialog}
                    onDelete={handleDeleteTask}
                    onStatusChange={handleStatusChange}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-card/50 rounded-xl p-4 space-y-4">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="bg-card border rounded-lg p-4 flex justify-between items-center"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-2 h-10 rounded-full ${
                    task.status === "done"
                      ? "bg-green-500"
                      : task.status === "inprogress"
                      ? "bg-yellow-500"
                      : "bg-gray-500"
                  }`}
                ></div>
                <div>
                  <p className="font-bold">{task.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {statusText[task.status]}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
                  {priorityIcons[task.priority]}
                  <span>{priorityText[task.priority]}</span>
                </div>
                {task.due_date && (
                  <div className="hidden lg:block text-sm text-muted-foreground">
                    {format(new Date(task.due_date), "dd/MM/yyyy")}
                  </div>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleOpenDialog(task)}>
                      <Edit className="mr-2 h-4 w-4" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDeleteTask(task.id)}
                      className="text-red-500"
                    >
                      <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      )}
      <TaskDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        task={selectedTask}
        projects={projects}
        employees={employees}
        onSave={handleSaveTask}
      />
    </div>
  );
};

export default TaskManager;
