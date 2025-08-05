import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TicketConversation } from "@/components/TicketConversation";
import { TicketAssignmentDialog } from "@/components/TicketAssignmentDialog";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Download, Search, Filter, Users, Clock, CheckCircle, AlertTriangle, Tag } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";

type Ticket = {
  id: string;
  title: string;
  user_id: string;
  priority: string;
  status: string;
  description: string;
  category?: string;
  assigned_to?: string;
  assignment_status?: string;
  file_url?: string;
  created_at: string;
  updated_at: string;
  profiles?: {
    full_name: string;
    company_name?: string;
  };
  assignee_profile?: {
    full_name: string;
  };
};

const AdminTickets = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [assigneeFilter, setAssigneeFilter] = useState("all");
  const [expandedTickets, setExpandedTickets] = useState<Set<string>>(new Set());
  const [assignmentDialogOpen, setAssignmentDialogOpen] = useState(false);
  const [selectedTicketForAssignment, setSelectedTicketForAssignment] = useState<Ticket | null>(null);

  useEffect(() => {
    if (user) {
      fetchUserRole();
      fetchTickets();
    }
    
    // Listen for refresh events
    const handleRefresh = () => {
      fetchTickets();
    };
    
    window.addEventListener('refreshTickets', handleRefresh);
    return () => window.removeEventListener('refreshTickets', handleRefresh);
  }, [user]);

  const fetchUserRole = async () => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;
      setUserRole(data?.role || null);
    } catch (error) {
      console.error('Error fetching user role:', error);
    }
  };

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tickets')
        .select(`
          *
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Fetch assignee profiles separately
      const ticketsWithAssignees = data || [];
      const assigneeIds = ticketsWithAssignees
        .filter(ticket => ticket.assigned_to)
        .map(ticket => ticket.assigned_to)
        .filter((id): id is string => Boolean(id));
      
      let assigneeProfiles: Record<string, any> = {};
      if (assigneeIds.length > 0) {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('user_id, full_name')
          .in('user_id', assigneeIds);
        
        assigneeProfiles = profilesData?.reduce((acc, profile) => {
          acc[profile.user_id] = profile;
          return acc;
        }, {} as Record<string, any>) || {};
      }

      const enrichedTickets = ticketsWithAssignees.map(ticket => ({
        ...ticket,
        assignee_profile: ticket.assigned_to ? assigneeProfiles[ticket.assigned_to] : undefined
      }));

      setTickets(enrichedTickets);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast({
        title: "Error",
        description: "Failed to fetch tickets",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateTicketStatus = async (ticketId: string, status: string) => {
    try {
      const updateData: any = { 
        status, 
        updated_at: new Date().toISOString() 
      };
      
      // Add resolved_at timestamp if status is resolved or closed
      if (status === 'resolved' || status === 'closed') {
        updateData.resolved_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('tickets')
        .update(updateData)
        .eq('id', ticketId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Ticket status updated successfully",
      });

      fetchTickets();
    } catch (error) {
      console.error('Error updating ticket status:', error);
      toast({
        title: "Error",
        description: "Failed to update ticket status",
        variant: "destructive",
      });
    }
  };

  const updateTicketPriority = async (ticketId: string, priority: string) => {
    try {
      const { error } = await supabase
        .from('tickets')
        .update({ priority, updated_at: new Date().toISOString() })
        .eq('id', ticketId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Ticket priority updated successfully",
      });

      fetchTickets();
    } catch (error) {
      console.error('Error updating ticket priority:', error);
      toast({
        title: "Error",
        description: "Failed to update ticket priority",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'open':
        return 'destructive';
      case 'in_progress':
        return 'secondary';
      case 'resolved':
        return 'outline';
      case 'closed':
        return 'default';
      default:
        return 'default';
    }
  };

  const getPriorityColor = (priority: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (priority) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'secondary';
      case 'low':
        return 'outline';
      default:
        return 'default';
    }
  };

  const toggleTicketExpansion = (ticketId: string) => {
    const newExpanded = new Set(expandedTickets);
    if (newExpanded.has(ticketId)) {
      newExpanded.delete(ticketId);
    } else {
      newExpanded.add(ticketId);
    }
    setExpandedTickets(newExpanded);
  };

  const downloadFile = (fileUrl: string) => {
    window.open(fileUrl, '_blank');
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = 
      ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || ticket.priority === priorityFilter;
    const matchesCategory = categoryFilter === "all" || ticket.category === categoryFilter;
    const matchesAssignee = assigneeFilter === "all" || 
      (assigneeFilter === "unassigned" && !ticket.assigned_to) ||
      (assigneeFilter === "assigned" && ticket.assigned_to) ||
      ticket.assigned_to === assigneeFilter;
    
    return matchesSearch && matchesStatus && matchesPriority && matchesCategory && matchesAssignee;
  });

  const getAssignmentStatusIcon = (status?: string) => {
    switch (status) {
      case 'assigned':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'in_review':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'escalated':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Users className="h-4 w-4 text-gray-600" />;
    }
  };

  const getAssignmentStatusColor = (status?: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'assigned':
        return 'secondary';
      case 'in_review':
        return 'outline';
      case 'escalated':
        return 'destructive';
      default:
        return 'default';
    }
  };

  const getCategoryColor = (category?: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (category) {
      case 'technical':
        return 'destructive';
      case 'billing':
        return 'secondary';
      case 'data_request':
        return 'outline';
      default:
        return 'default';
    }
  };

  const openAssignmentDialog = (ticket: Ticket) => {
    setSelectedTicketForAssignment(ticket);
    setAssignmentDialogOpen(true);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-[400px]">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please log in to access the admin panel.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-[400px]">
          <CardHeader>
            <CardTitle>Loading...</CardTitle>
            <CardDescription>Please wait while we load the tickets.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (!userRole || !['super_admin', 'internal_admin', 'pengolah_data'].includes(userRole)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-[400px]">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>You don't have permission to access this page.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/')} className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8 animate-fade-in">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Ticket Management
              </h1>
              <p className="text-gray-600 mt-2">Manage support tickets from users</p>
            </div>
            <Button onClick={() => navigate('/')} variant="outline" className="hover-scale transition-all duration-300 hover:shadow-md">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                  <Label htmlFor="search">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Search tickets..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All priorities" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priorities</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="technical">Technical</SelectItem>
                      <SelectItem value="billing">Billing</SelectItem>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="data_request">Data Request</SelectItem>
                      <SelectItem value="account">Account</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="assignee">Assignment</Label>
                  <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All assignments" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Assignments</SelectItem>
                      <SelectItem value="unassigned">Unassigned</SelectItem>
                      <SelectItem value="assigned">Assigned</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tickets Table */}
          <Card>
            <CardHeader>
              <CardTitle>Support Tickets ({filteredTickets.length})</CardTitle>
              <CardDescription>
                Manage and respond to support tickets from users
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredTickets.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No tickets found matching your criteria.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredTickets.map((ticket) => (
                    <Card key={ticket.id} className="relative">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <CardTitle className="text-lg flex items-center gap-2">
                              {ticket.title}
                              {ticket.category && (
                                <Badge variant={getCategoryColor(ticket.category)} className="text-xs">
                                  <Tag className="h-3 w-3 mr-1" />
                                  {ticket.category.replace('_', ' ')}
                                </Badge>
                              )}
                            </CardTitle>
                            <CardDescription>
                              <div className="space-y-1">
                                 <div>
                                   Ticket ID: {ticket.id.substring(0, 8)}...
                                 </div>
                                <div>
                                  Created: {new Date(ticket.created_at).toLocaleDateString()}
                                  {ticket.updated_at !== ticket.created_at && (
                                    <span className="ml-2">
                                      Updated: {new Date(ticket.updated_at).toLocaleDateString()}
                                    </span>
                                  )}
                                </div>
                                {ticket.assigned_to && (
                                  <div className="flex items-center gap-2">
                                    <span>Assigned to:</span>
                                    <span className="font-medium">{ticket.assignee_profile?.full_name || 'Unknown'}</span>
                                  </div>
                                )}
                              </div>
                            </CardDescription>
                          </div>
                          <div className="flex gap-2 items-center flex-wrap">
                            <Badge variant={getPriorityColor(ticket.priority)}>
                              {ticket.priority}
                            </Badge>
                            <Badge variant={getStatusColor(ticket.status)}>
                              {ticket.status}
                            </Badge>
                            <Badge variant={getAssignmentStatusColor(ticket.assignment_status)} className="flex items-center gap-1">
                              {getAssignmentStatusIcon(ticket.assignment_status)}
                              {ticket.assignment_status?.replace('_', ' ') || 'unassigned'}
                            </Badge>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openAssignmentDialog(ticket)}
                            >
                              <Users className="h-4 w-4 mr-2" />
                              Assign
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleTicketExpansion(ticket.id)}
                            >
                              Details
                              <ChevronDown className={`h-4 w-4 ml-2 transition-transform ${expandedTickets.has(ticket.id) ? 'rotate-180' : ''}`} />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      
                      <Collapsible open={expandedTickets.has(ticket.id)}>
                        <CollapsibleContent>
                          <CardContent>
                            <div className="space-y-6">
                              <div>
                                <h4 className="font-medium mb-2">Description</h4>
                                <p className="text-muted-foreground whitespace-pre-wrap">{ticket.description}</p>
                              </div>

                              {ticket.file_url && (
                                <div>
                                  <h4 className="font-medium mb-2">Attachment</h4>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => downloadFile(ticket.file_url!)}
                                  >
                                    <Download className="h-4 w-4 mr-2" />
                                    Download Document
                                  </Button>
                                </div>
                              )}

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                                <div>
                                  <Label>Update Status</Label>
                                  <Select 
                                    value={ticket.status} 
                                    onValueChange={(value) => updateTicketStatus(ticket.id, value)}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="open">Open</SelectItem>
                                      <SelectItem value="in_progress">In Progress</SelectItem>
                                      <SelectItem value="resolved">Resolved</SelectItem>
                                      <SelectItem value="closed">Closed</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <Label>Update Priority</Label>
                                  <Select 
                                    value={ticket.priority} 
                                    onValueChange={(value) => updateTicketPriority(ticket.id, value)}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="low">Low</SelectItem>
                                      <SelectItem value="medium">Medium</SelectItem>
                                      <SelectItem value="high">High</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                              
                              {/* Admin Conversation Component */}
                              <div className="border-t pt-6">
                                <h4 className="font-medium mb-4">Admin Response & Conversation</h4>
                                <TicketConversation ticketId={ticket.id} isAdmin={true} />
                              </div>
                            </div>
                          </CardContent>
                        </CollapsibleContent>
                      </Collapsible>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Assignment Dialog */}
          {selectedTicketForAssignment && (
            <TicketAssignmentDialog
              open={assignmentDialogOpen}
              onOpenChange={setAssignmentDialogOpen}
              ticketId={selectedTicketForAssignment.id}
              currentAssignee={selectedTicketForAssignment.assigned_to}
              assignmentStatus={selectedTicketForAssignment.assignment_status}
              onAssignmentUpdate={() => {
                fetchTickets();
                setSelectedTicketForAssignment(null);
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminTickets;