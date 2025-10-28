import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
// Using REST API instead of Supabase
import { UserAPI, AssignmentAPI, type AdminUser, type AssignmentRecord } from "@/lib/apiClient";
import { useAuth } from "@/hooks/useAuth";
import { Users, Clock, CheckCircle, AlertTriangle } from "lucide-react";

type Profile = AdminUser;

type AssignmentHistory = AssignmentRecord;

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
  const [selectedAssignee, setSelectedAssignee] = useState(currentAssignee || "unassigned");
  const [notes, setNotes] = useState("");
  const [assignmentHistory, setAssignmentHistory] = useState<AssignmentHistory[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchAdminUsers();
      fetchAssignmentHistory();
      setSelectedAssignee(currentAssignee || "unassigned");
    }
  }, [open, ticketId, currentAssignee]);

  const fetchAdminUsers = async () => {
    try {
      const admins = await UserAPI.getAdminUsers();
      setAdminUsers(admins);
    } catch (error) {
      console.error('Error fetching admin users:', error);
    }
  };

  const fetchAssignmentHistory = async () => {
    try {
      const assignments = await AssignmentAPI.getHistory(ticketId);
      setAssignmentHistory(assignments);
    } catch (error) {
      console.error('Error fetching assignment history:', error);
    }
  };

  const handleAssignment = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      // If unassigning (selectedAssignee is "unassigned")
      if (selectedAssignee === "unassigned" && currentAssignee) {
        await AssignmentAPI.unassign(ticketId);

        toast({
          title: "Success",
          description: "Ticket unassigned successfully",
        });
      }
      // If assigning to someone new
      else if (selectedAssignee && selectedAssignee !== "unassigned") {
        await AssignmentAPI.assign(ticketId, {
          assigned_to: selectedAssignee,
          notes: notes.trim() || undefined
        });

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
                  <SelectItem value="unassigned">Unassigned</SelectItem>
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