import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
// Using REST API (Express + PostgreSQL) instead of Supabase
import { TicketsAPI, type TicketRecord, UploadAPI } from "@/lib/apiClient";
import { wsClient, type WSEvent } from "@/lib/wsClient";
import { TicketConversation } from "@/components/TicketConversation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Ticket, Eye, Download, ChevronDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { FileUpload } from "@/components/FileUpload";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

type Ticket = TicketRecord;

const Support = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [expandedTickets, setExpandedTickets] = useState<Set<string>>(new Set());
  const [newTicket, setNewTicket] = useState({
    title: "",
    description: "",
    priority: "medium",
    category: "general",
    file_url: null as string | null
  });
  const [newTicketFile, setNewTicketFile] = useState<File | null>(null);

  useEffect(() => {
    if (user) {
      fetchTickets();
    }
    
    // Listen for refresh events
    const handleRefresh = () => {
      fetchTickets();
    };
    
    window.addEventListener('refreshTickets', handleRefresh);
    return () => window.removeEventListener('refreshTickets', handleRefresh);
  }, [user]);

  // Realtime via global WS client (singleton)
  useEffect(() => {
    if (!user?.id) return;
    const unsubscribe = wsClient.subscribe((evt: WSEvent) => {
      if (evt.type === 'ticketCreated' || evt.type === 'ticketUpdated' || evt.type === 'ticketClosed') {
        // if payload has ticket, ensure it belongs to current user
        const t = evt.ticket;
        if (!t || t.user_id === user.id) {
          fetchTickets();
        }
      }
      if (evt.type === 'messageCreated') {
        const t = evt.ticket;
        if (!t || t.user_id === user.id) {
          fetchTickets();
        }
      }
    });
    return () => unsubscribe();
  }, [user?.id]);

  const fetchTickets = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const data = await TicketsAPI.list();
      // Filter tickets belonging to current user on client-side
      const userTickets = (data || []).filter((t) => t.user_id === user.id);
      setTickets(userTickets);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast({
        title: "Error",
        description: "Failed to load support tickets",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createTicket = async () => {
    if (!user?.id || !newTicket.title.trim() || !newTicket.description.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      // Deferred upload: jika ada file yang dipilih namun belum diunggah, unggah sekarang
      let finalFileUrl: string | null = newTicket.file_url || null;
      if (newTicketFile) {
        const res = await UploadAPI.uploadPdf(newTicketFile);
        finalFileUrl = res.file_url;
      }

      await TicketsAPI.create({
        title: newTicket.title.trim(),
        description: newTicket.description.trim(),
        priority: newTicket.priority,
        category: newTicket.category,
        file_url: finalFileUrl,
      });

      toast({
        title: "Success",
        description: "Support ticket created successfully",
      });

      setNewTicketFile(null);
      setNewTicket({ title: "", description: "", priority: "medium", category: "general", file_url: null });
      setIsCreateDialogOpen(false);
      fetchTickets();
    } catch (error) {
      console.error('Error creating ticket:', error);
      toast({
        title: "Error",
        description: "Failed to create support ticket",
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

  const closeTicket = async (ticketId: string) => {
    try {
      await TicketsAPI.update(ticketId, { status: 'closed' });

      toast({
        title: "Success",
        description: "Ticket has been closed successfully",
      });

      fetchTickets();
    } catch (error) {
      console.error('Error closing ticket:', error);
      toast({
        title: "Error",
        description: "Failed to close ticket",
        variant: "destructive",
      });
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-[500px]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ticket className="h-6 w-6" />
              Support Center
            </CardTitle>
            <CardDescription>
              Please log in to access the support center and manage your tickets.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">
                You need to be logged in to create and view support tickets.
              </p>
              <Button className="w-full" onClick={() => window.history.back()}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-[400px]">
          <CardHeader>
            <CardTitle>Loading Support Center</CardTitle>
            <CardDescription>Please wait while we load your tickets...</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8 animate-fade-in">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Support Center
              </h1>
              <p className="text-gray-600 mt-2">Manage your support tickets and get help</p>
            </div>
            <Button 
              variant="outline" 
              className="hover-scale transition-all duration-300 hover:shadow-md"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card className="hover-scale transition-all duration-300 hover:shadow-lg animate-fade-in">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <Plus className="h-5 w-5" />
                  Create New Ticket
                </CardTitle>
                <CardDescription>
                  Need help? Create a support ticket and our team will assist you.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full hover-scale transition-all duration-300 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70">
                      <Plus className="mr-2 h-4 w-4" />
                      Create Ticket
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[525px]">
                    <DialogHeader>
                      <DialogTitle>Create Support Ticket</DialogTitle>
                      <DialogDescription>
                        Describe your issue and we'll help you resolve it as soon as possible.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="title" className="text-right">Title</Label>
                        <Input
                          id="title"
                          value={newTicket.title}
                          onChange={(e) => setNewTicket({ ...newTicket, title: e.target.value })}
                          placeholder="Brief description of your issue"
                          className="col-span-3"
                          required
                        />
                      </div>
                      
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="description" className="text-right">Description</Label>
                        <Textarea
                          placeholder="Describe your issue in detail..."
                          value={newTicket.description}
                          onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                          className="col-span-3 min-h-[100px]"
                          required
                        />
                      </div>
                      
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="category" className="text-right">Category</Label>
                        <Select value={newTicket.category} onValueChange={(value) => setNewTicket({ ...newTicket, category: value })}>
                          <SelectTrigger className="col-span-3">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="technical">Technical</SelectItem>
                            <SelectItem value="billing">Billing</SelectItem>
                            <SelectItem value="general">General</SelectItem>
                            <SelectItem value="data_request">Data Request</SelectItem>
                            <SelectItem value="account">Account</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="priority" className="text-right">Priority</Label>
                        <Select value={newTicket.priority} onValueChange={(value) => setNewTicket({ ...newTicket, priority: value })}>
                          <SelectTrigger className="col-span-3">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="file" className="text-right">Attachment</Label>
                        <div className="col-span-3">
                          <FileUpload
                            value={newTicket.file_url}
                            deferred
                            onFileSelect={(file) => setNewTicketFile(file)}
                            onChange={(fileUrl) => setNewTicket({ ...newTicket, file_url: fileUrl })}
                          />
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit" onClick={createTicket}>Create Ticket</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>

            <Card className="hover-scale transition-all duration-300 hover:shadow-lg animate-fade-in" style={{ animationDelay: '100ms' }}>
              <CardHeader>
                <CardTitle className="text-primary">Your Tickets</CardTitle>
                <CardDescription>
                  You have {tickets.length} support ticket{tickets.length !== 1 ? 's' : ''}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm p-2 rounded-lg bg-red-50">
                    <span className="font-medium">Open:</span>
                    <span className="font-bold text-red-600">
                      {tickets.filter(t => t.status === 'open').length}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm p-2 rounded-lg bg-yellow-50">
                    <span className="font-medium">In Progress:</span>
                    <span className="font-bold text-yellow-600">
                      {tickets.filter(t => t.status === 'in_progress').length}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm p-2 rounded-lg bg-green-50">
                    <span className="font-medium">Resolved:</span>
                    <span className="font-bold text-green-600">
                      {tickets.filter(t => t.status === 'resolved').length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tickets List */}
          <Card className="hover-scale transition-all duration-300 hover:shadow-lg animate-fade-in" style={{ animationDelay: '200ms' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <Ticket className="h-5 w-5" />
                Your Support Tickets
              </CardTitle>
              <CardDescription>View and track all your support requests</CardDescription>
            </CardHeader>
            <CardContent>
              {tickets.length === 0 ? (
                <div className="text-center py-12 animate-fade-in">
                  <div className="mx-auto max-w-sm">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 flex items-center justify-center">
                      <Ticket className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="mt-4 text-lg font-medium">No tickets yet</h3>
                    <p className="mt-2 text-muted-foreground">
                      You haven't created any support tickets yet. Click the button above to create your first ticket.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {tickets.map((ticket, index) => (
                    <Card 
                      key={ticket.id} 
                      className="hover-scale transition-all duration-300 hover:shadow-md border-l-4 border-primary/20 hover:border-primary/50 animate-fade-in"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <CardTitle className="text-lg text-primary">{ticket.title}</CardTitle>
                            <CardDescription className="mt-1">
                              Created: {new Date(ticket.created_at).toLocaleDateString()}
                              {ticket.updated_at !== ticket.created_at && (
                                <span className="ml-2">
                                  Updated: {new Date(ticket.updated_at).toLocaleDateString()}
                                </span>
                              )}
                            </CardDescription>
                          </div>
                          <div className="flex gap-2 items-center">
                            <Badge variant={getPriorityColor(ticket.priority)} className="transition-all duration-200">
                              {ticket.priority}
                            </Badge>
                            <Badge variant={getStatusColor(ticket.status)} className="transition-all duration-200">
                              {ticket.status}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleTicketExpansion(ticket.id)}
                              className="hover-scale transition-all duration-200"
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              {expandedTickets.has(ticket.id) ? 'Hide' : 'View'} Details
                              <ChevronDown className={`h-4 w-4 ml-2 transition-transform duration-300 ${expandedTickets.has(ticket.id) ? 'rotate-180' : ''}`} />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <Collapsible open={expandedTickets.has(ticket.id)}>
                        <CollapsibleContent className="animate-accordion-down">
                          <CardContent className="pt-0">
                            <div className="space-y-6">
                              <div className="space-y-4">
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
                              </div>
                              
                              {/* Ticket Actions */}
                              {ticket.status !== 'closed' && (
                                <div className="border-t pt-4">
                                  <div className="flex gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => closeTicket(ticket.id)}
                                      className="text-destructive hover:text-destructive"
                                    >
                                      Close Ticket
                                    </Button>
                                  </div>
                                </div>
                              )}

                              {/* Conversation Component */}
                              <div className="border-t pt-6">
                                <h4 className="font-medium mb-4">Conversation</h4>
                                <TicketConversation ticketId={ticket.id} isAdmin={false} />
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
        </div>
      </div>
    </div>
  );
};

export default Support;