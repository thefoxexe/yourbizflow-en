import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Phone,
  Mail,
  Trash2,
  MoreVertical,
  Search,
  Filter,
  MapPin,
  Upload,
  Edit,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Helmet } from "react-helmet";

const clientTags = [
  {
    key: "lead",
    label: "Lead",
    color: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  },
  {
    key: "prospect",
    label: "Prospect",
    color: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  },
  {
    key: "client_ponctuel",
    label: "Client Ponctuel",
    color: "bg-green-500/10 text-green-400 border-green-500/20",
  },
  {
    key: "client_fidele",
    label: "Client Fidèle",
    color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  },
];

const CRM = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState([]);

  const [newClient, setNewClient] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    address: "",
    tags: ["lead"],
  });

  const fetchClients = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Unable to load clients.",
      });
    } else {
      setClients(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchClients();
  }, [user]);

  const handleAddClient = async () => {
    if (!newClient.name || !newClient.email) {
      toast({
        variant: "destructive",
        title: "Required fields",
        description: "Name and email are required.",
      });
      return;
    }

    const { data, error } = await supabase
      .from("clients")
      .insert({ ...newClient, user_id: user.id })
      .select();

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "The client could not be added.",
      });
    } else {
      toast({ title: "Success", description: "Customer added successfully." });
      setClients([data[0], ...clients]);
      setIsDialogOpen(false);
      setNewClient({
        name: "",
        company: "",
        email: "",
        phone: "",
        address: "",
        tags: ["lead"],
      });
    }
  };

  const handleDeleteClient = async (clientId) => {
    const { error } = await supabase
      .from("clients")
      .delete()
      .eq("id", clientId);
    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "The client could not be deleted.",
      });
    } else {
      toast({ title: "Success", description: "Customer deleted." });
      setClients(clients.filter((c) => c.id !== clientId));
    }
  };

  const handleUpdateClientStatus = async (clientId, newStatus) => {
    const { data, error } = await supabase
      .from("clients")
      .update({ tags: [newStatus] })
      .eq("id", clientId)
      .select()
      .single();

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Client status could not be updated.",
      });
    } else {
      toast({ title: "Success", description: "Client status updated." });
      setClients(clients.map((c) => (c.id === clientId ? data : c)));
    }
  };

  const filteredClients = useMemo(() => {
    return clients.filter((client) => {
      const searchMatch =
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (client.company &&
          client.company.toLowerCase().includes(searchTerm.toLowerCase()));
      const statusMatch =
        statusFilter.length === 0 ||
        client.tags.some((tag) => statusFilter.includes(tag));
      return searchMatch && statusMatch;
    });
  }, [clients, searchTerm, statusFilter]);

  return (
    <div className="space-y-8">
      <Helmet>
        <title>CRM - YourBizFlow</title>
        <meta
          name="description"
          content="Manage all your customer and prospect relationships from a simple and powerful interface. Track your contacts, segment your audience and never miss an opportunity again."
        />
      </Helmet>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">CRM</h1>
          <p className="text-muted-foreground">
            Manage your customer and prospect relationships
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() =>
              toast({ title: "🚧 This feature is under development! 🚀" })
            }
          >
            <Upload className="w-4 h-4 mr-2" />
            Import
          </Button>
          <Button
            onClick={() => setIsDialogOpen(true)}
            className="flex-shrink-0"
          >
            <More className="w-4 h-4 mr-2" />
            New customer
          </Button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <Input
            placeholder="Find a customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex-shrink-0">
              <Filter className="w-4 h-4 mr-2" />
              Filter by status
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Status</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {clientTags.map((tag) => (
              <DropdownMenuCheckboxItem
                key={tag.key}
                checked={statusFilter.includes(tag.key)}
                onCheckedChange={(checked) => {
                  setStatusFilter((prev) =>
                    checked
                      ? [...prev, tag.key]
                      : prev.filter((s) => s !== tag.key)
                  );
                }}
              >
                {tag.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {loading
          ? [...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-56 bg-muted/50 rounded-xl animate-pulse"
              ></div>
            ))
          : filteredClients.map((client, index) => (
              <motion.div
                key={client.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.05 * index }}
                className="bg-card/50 backdrop-blur-sm border rounded-xl p-6 shadow-sm hover:shadow-primary/10 hover:border-primary/30 transition-all duration-300 group flex flex-col"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-bold text-foreground">
                      {client.name}
                    </h2>
                    <p className="text-muted-foreground text-sm">
                      {client.company}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1 justify-end">
                    {client.tags.map((tagKey) => {
                      const tagInfo = clientTags.find((t) => t.key === tagKey);
                      return tagInfo ? (
                        <span
                          key={tagKey}
                          className={cn(
                            "px-2 py-1 rounded-full text-xs font-medium capitalize border",
                            tagInfo.color
                          )}
                        >
                          {tagInfo.label}
                        </span>
                      ) : null;
                    })}
                  </div>
                </div>
                <div className="space-y-3 mb-6 flex-grow">
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Mail className="w-4 h-4" />
                    <span className="text-sm">{client.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Phone className="w-4 h-4" />
                    <span className="text-sm">{client.phone || "N/A"}</span>
                  </div>
                  <div className="flex items-start gap-3 text-muted-foreground">
                    <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
                    <span className="text-sm">{client.address || "N/A"}</span>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="icon" variant="ghost">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                          <Edit className="w-4 h-4 mr-2" />
                          Change status
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent>
                          {clientTags.map((tag) => (
                            <DropdownMenuItem
                              key={tag.key}
                              onClick={() =>
                                handleUpdateClientStatus(client.id, tag.key)
                              }
                            >
                              {tag.label}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuSubContent>
                      </DropdownMenuSub>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleDeleteClient(client.id)}
                        className="text-red-500 focus:text-red-500"
                      >
                        <Trash2 className="w-4 h-4 mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </motion.div>
            ))}
      </motion.div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add a new customer</DialogTitle>
            <DialogDescription>
              Fill in the information below.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={newClient.name}
                onChange={(e) =>
                  setNewClient({ ...newClient, name: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="company" className="text-right">
                Company
              </Label>
              <Input
                id="company"
                value={newClient.company}
                onChange={(e) =>
                  setNewClient({ ...newClient, company: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={newClient.email}
                onChange={(e) =>
                  setNewClient({ ...newClient, email: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">
                Phone
              </Label>
              <Input
                id="phone"
                value={newClient.phone}
                onChange={(e) =>
                  setNewClient({ ...newClient, phone: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="address" className="text-right">
                Address
              </Label>
              <Input
                id="address"
                value={newClient.address}
                onChange={(e) =>
                  setNewClient({ ...newClient, address: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Status
              </Label>
              <Select
                value={newClient.tags[0]}
                onValueChange={(value) =>
                  setNewClient({ ...newClient, tags: [value] })
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {clientTags.map((tag) => (
                    <SelectItem key={tag.key} value={tag.key}>
                      {tag.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddClient}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CRM;
