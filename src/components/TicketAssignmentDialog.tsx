import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Users, Clock, CheckCircle, AlertTriangle } from "lucide-react";

interface Profile {
  user_id: string;
  full_name: string;
}

interface AssignmentHistory {
  id: string;
  assigned_to: string;
  assigned_by: string;
  assigned_at: string;
  unassigned_at: string | null;
  notes: string | null;
  assignee_profile?: { full_name: string };
  assigner_profile?: { full_name: string };
}

interface TicketAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ticketId: string;
  currentAssignee?: string;
  assignmentStatus?: string;
  onAssignmentUpdate: () => void;
}

export function TicketAssignmentDialog({ 
  open, 
  onOpenChange, 
  ticketId, 
  currentAssignee, 
  assignmentStatus = "unassigned",
  onAssignmentUpdate 
}: TicketAssignmentDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [adminUsers, setAdminUsers] = useState<Profile[]>([]);
  const [selectedAssignee, setSelectedAssignee] = useState(currentAssignee || "");
  const [notes, setNotes] = useState("");
  const [assignmentHistory, setAssignmentHistory] = useState<AssignmentHistory[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchAdminUsers();
      fetchAssignmentHistory();
      setSelectedAssignee(currentAssignee || "");
    }
  }, [open, ticketId, currentAssignee]);

  const fetchAdminUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select(`
          user_id
        `)
        .in('role', ['super_admin', 'internal_admin', 'pengolah_data']);

      if (error) throw error;

      // Fetch profiles separately to avoid relation issues
      const userIds = data?.map(item => item.user_id) || [];
      
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, full_name')
        .in('user_id', userIds);

      if (profilesError) throw profilesError;

      const admins = profilesData || [];

      setAdminUsers(admins);
    } catch (error) {
      console.error('Error fetching admin users:', error);
    }
  };

  const fetchAssignmentHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('ticket_assignments')
        .select('*')
        .eq('ticket_id', ticketId)
        .order('assigned_at', { ascending: false });

      if (error) throw error;

      // Fetch profiles separately
      const assigneeIds = [...new Set(data?.map(item => item.assigned_to) || [])];
      const assignerIds = [...new Set(data?.map(item => item.assigned_by) || [])];
      const allUserIds = [...new Set([...assigneeIds, ...assignerIds])];

      const { data: profilesData } = await supabase
        .from('profiles')
        .select('user_id, full_name')
        .in('user_id', allUserIds);

      const profilesMap = profilesData?.reduce((acc, profile) => {
        acc[profile.user_id] = profile;
        return acc;
      }, {} as Record<string, any>) || {};

      const enrichedAssignments = data?.map(assignment => ({
        ...assignment,
        assignee_profile: profilesMap[assignment.assigned_to],
        assigner_profile: profilesMap[assignment.assigned_by]
      })) || [];

      setAssignmentHistory(enrichedAssignments);
    } catch (error) {
      console.error('Error fetching assignment history:', error);
    }
  };

  const handleAssignment = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      // If unassigning (selectedAssignee is empty)
      if (!selectedAssignee && currentAssignee) {
        // Update current assignment as unassigned
        const { error: unassignError } = await supabase
          .from('ticket_assignments')
          .update({ unassigned_at: new Date().toISOString() })
          .eq('ticket_id', ticketId)
          .eq('assigned_to', currentAssignee)
          .is('unassigned_at', null);

        if (unassignError) throw unassignError;

        // Update ticket assignment status
        const { error: ticketError } = await supabase
          .from('tickets')
          .update({ 
            assigned_to: null,
            assignment_status: 'unassigned',
            updated_at: new Date().toISOString()
          })
          .eq('id', ticketId);

        if (ticketError) throw ticketError;

        toast({
          title: "Success",
          description: "Ticket unassigned successfully",
        });
      } 
      // If assigning to someone new
      else if (selectedAssignee) {
        // If there's a current assignee, mark their assignment as ended
        if (currentAssignee && currentAssignee !== selectedAssignee) {
          await supabase
            .from('ticket_assignments')
            .update({ unassigned_at: new Date().toISOString() })
            .eq('ticket_id', ticketId)
            .eq('assigned_to', currentAssignee)
            .is('unassigned_at', null);
        }

        // Create new assignment record only if it's a different assignee
        if (currentAssignee !== selectedAssignee) {
          const { error: assignmentError } = await supabase
            .from('ticket_assignments')
            .insert({
              ticket_id: ticketId,
              assigned_to: selectedAssignee,
              assigned_by: user.id,
              notes: notes.trim() || null
            });

          if (assignmentError) throw assignmentError;
        }

        // Update ticket
        const { error: ticketError } = await supabase
          .from('tickets')
          .update({ 
            assigned_to: selectedAssignee,
            assignment_status: 'assigned',
            updated_at: new Date().toISOString()
          })
          .eq('id', ticketId);

        if (ticketError) throw ticketError;

        toast({
          title: "Success",
          description: "Ticket assigned successfully",
        });
      }

      onAssignmentUpdate();
      onOpenChange(false);
      setNotes("");
    } catch (error) {
      console.error('Error updating assignment:', error);
      toast({
        title: "Error",
        description: "Failed to update ticket assignment",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getAssignmentStatusIcon = (status: string) => {
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

  const getAssignmentStatusColor = (status: string): "default" | "secondary" | "destructive" | "outline" => {
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Ticket Assignment
          </DialogTitle>
          <DialogDescription>
            Assign this ticket to an admin user or view assignment history.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Status */}
          <div className="flex items-center gap-4 p-4 border rounded-lg">
            <div className="flex items-center gap-2">
              {getAssignmentStatusIcon(assignmentStatus)}
              <span className="font-medium">Current Status:</span>
            </div>
            <Badge variant={getAssignmentStatusColor(assignmentStatus)}>
              {assignmentStatus.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>

          {/* Assignment Form */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="assignee">Assign To</Label>
              <Select value={selectedAssignee} onValueChange={setSelectedAssignee}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an admin user" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Unassigned</SelectItem>
                  {adminUsers.map((admin) => (
                    <SelectItem key={admin.user_id} value={admin.user_id}>
                      {admin.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="notes">Assignment Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes about this assignment..."
                className="min-h-[80px]"
              />
            </div>
          </div>

          {/* Assignment History */}
          {assignmentHistory.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium">Assignment History</h4>
              <div className="max-h-[200px] overflow-y-auto space-y-2">
                {assignmentHistory.map((assignment) => (
                  <div key={assignment.id} className="p-3 border rounded-lg text-sm">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="font-medium">
                          {assignment.assignee_profile?.full_name}
                        </span>
                        <span className="text-muted-foreground">
                          {assignment.unassigned_at ? ' (Unassigned)' : ' (Current)'}
                        </span>
                      </div>
                      <div className="text-muted-foreground text-xs">
                        {new Date(assignment.assigned_at).toLocaleDateString()}
                      </div>
                    </div>
                    {assignment.notes && (
                      <p className="text-muted-foreground">{assignment.notes}</p>
                    )}
                    <div className="text-xs text-muted-foreground mt-1">
                      Assigned by: {assignment.assigner_profile?.full_name}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleAssignment} disabled={loading}>
            {loading ? "Updating..." : "Update Assignment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}