import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Edit, Trash2, Eye, EyeOff } from "lucide-react";
import { FileUpload } from "@/components/FileUpload";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FAQApi, Faq, FaqCategory } from "@/lib/faqApi";
import { UploadAPI } from "@/lib/apiClient";

type EditingFAQ = Omit<Faq, 'category_id'> & { category_id: string | 'none' | null };

const AdminFAQ = () => {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [categories, setCategories] = useState<FaqCategory[]>([]);
  const [loading, setLoading] = useState(true);

  const [isCreateFAQOpen, setIsCreateFAQOpen] = useState(false);
  const [isCreateCategoryOpen, setIsCreateCategoryOpen] = useState(false);

  const [editingFAQ, setEditingFAQ] = useState<EditingFAQ | null>(null);
  const [editingCategory, setEditingCategory] = useState<FaqCategory | null>(null);
  const [isEditFAQOpen, setIsEditFAQOpen] = useState(false);
  const [isEditCategoryOpen, setIsEditCategoryOpen] = useState(false);
  const [newFAQFile, setNewFAQFile] = useState<File | null>(null);
  const [editingFAQFile, setEditingFAQFile] = useState<File | null>(null);

  const [newFAQ, setNewFAQ] = useState({
    question: "",
    answer: "",
    category_id: "none" as string | 'none',
    is_active: true,
    file_url: null as string | null
  });

  const [newCategory, setNewCategory] = useState({
    name: "",
    description: ""
  });

  const isAdmin = !!user?.roles?.some(r => r === 'super_admin' || r === 'internal_admin');

  useEffect(() => {
    if (user && isAdmin) {
      fetchFAQs();
      fetchCategories();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isAdmin]);

  const fetchCategories = async () => {
    try {
      const list = await FAQApi.listCategoriesPublic();
      setCategories(list || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast({
        title: "Error",
        description: "Failed to load FAQ categories",
        variant: "destructive",
      });
    }
  };

  const fetchFAQs = async () => {
    try {
      setLoading(true);
      const list = await FAQApi.adminList();
      setFaqs(list || []);
    } catch (error) {
      console.error('Error fetching FAQs:', error);
      toast({
        title: "Error",
        description: "Failed to load FAQs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You don't have permission to access the FAQ management system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/">
              <Button className="w-full">
                Return to Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const createFAQ = async () => {
    if (!newFAQ.question.trim() || !newFAQ.answer.trim()) {
      toast({
        title: "Error",
        description: "Question and answer are required",
        variant: "destructive",
      });
      return;
    }

    try {
      let finalFileUrl = newFAQ.file_url || null;
      if (newFAQFile) {
        const uploaded = await UploadAPI.uploadPdf(newFAQFile);
        finalFileUrl = uploaded.file_url;
      }
      await FAQApi.create({
        question: newFAQ.question.trim(),
        answer: newFAQ.answer.trim(),
        category_id: newFAQ.category_id === "none" ? null : newFAQ.category_id,
        is_active: newFAQ.is_active,
        file_url: finalFileUrl,
      });

      toast({
        title: "Success",
        description: "FAQ created successfully",
      });

      setNewFAQFile(null);
      setNewFAQ({ question: "", answer: "", category_id: "none", is_active: true, file_url: null });
      setIsCreateFAQOpen(false);
      fetchFAQs();
    } catch (error) {
      console.error('Error creating FAQ:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create FAQ",
        variant: "destructive",
      });
    }
  };

  const createCategory = async () => {
    if (!newCategory.name.trim()) {
      toast({
        title: "Error",
        description: "Category name is required",
        variant: "destructive",
      });
      return;
    }

    try {
      await FAQApi.categories.create({
        name: newCategory.name.trim(),
        description: newCategory.description.trim() || null,
      });

      toast({
        title: "Success",
        description: "Category created successfully",
      });

      setNewCategory({ name: "", description: "" });
      setIsCreateCategoryOpen(false);
      fetchCategories();
    } catch (error) {
      console.error('Error creating category:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create category",
        variant: "destructive",
      });
    }
  };

  const toggleFAQStatus = async (faq: Faq) => {
    try {
      await FAQApi.update(faq.id, { is_active: !faq.is_active });

      toast({
        title: "Success",
        description: `FAQ ${!faq.is_active ? 'activated' : 'deactivated'} successfully`,
      });

      fetchFAQs();
    } catch (error) {
      console.error('Error updating FAQ status:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update FAQ status",
        variant: "destructive",
      });
    }
  };

  const deleteFAQ = async (faqId: string) => {
    try {
      await FAQApi.remove(faqId);

      toast({
        title: "Success",
        description: "FAQ deleted successfully",
      });

      fetchFAQs();
    } catch (error) {
      console.error('Error deleting FAQ:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete FAQ",
        variant: "destructive",
      });
    }
  };

  const updateFAQ = async () => {
    if (!editingFAQ || !editingFAQ.question.trim() || !editingFAQ.answer.trim()) {
      toast({
        title: "Error",
        description: "Question and answer are required",
        variant: "destructive",
      });
      return;
    }

    try {
      let finalFileUrl = editingFAQ.file_url || null;
      if (editingFAQFile) {
        const uploaded = await UploadAPI.uploadPdf(editingFAQFile);
        finalFileUrl = uploaded.file_url;
      }
      await FAQApi.update(editingFAQ.id, {
        question: editingFAQ.question.trim(),
        answer: editingFAQ.answer.trim(),
        category_id: editingFAQ.category_id === "none" ? null : editingFAQ.category_id,
        is_active: editingFAQ.is_active,
        file_url: finalFileUrl,
      });

      toast({
        title: "Success",
        description: "FAQ updated successfully",
      });

      setEditingFAQFile(null);
      setEditingFAQ(null);
      setIsEditFAQOpen(false);
      fetchFAQs();
    } catch (error) {
      console.error('Error updating FAQ:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update FAQ",
        variant: "destructive",
      });
    }
  };

  const updateCategory = async () => {
    if (!editingCategory || !editingCategory.name.trim()) {
      toast({
        title: "Error",
        description: "Category name is required",
        variant: "destructive",
      });
      return;
    }

    try {
      await FAQApi.categories.update(editingCategory.id, {
        name: editingCategory.name.trim(),
        description: editingCategory.description?.trim() || null,
      });

      toast({
        title: "Success",
        description: "Category updated successfully",
      });

      setEditingCategory(null);
      setIsEditCategoryOpen(false);
      fetchCategories();
    } catch (error) {
      console.error('Error updating category:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update category",
        variant: "destructive",
      });
    }
  };

  const deleteCategory = async (categoryId: string) => {
    // Client-side check to prevent accidental deletion when FAQs exist
    const associatedFAQs = faqs.filter(faq => faq.category_id === categoryId);
    if (associatedFAQs.length > 0) {
      toast({
        title: "Error",
        description: `Cannot delete category. It has ${associatedFAQs.length} associated FAQ(s).`,
        variant: "destructive",
      });
      return;
    }

    try {
      await FAQApi.categories.remove(categoryId);
      toast({
        title: "Success",
        description: "Category deleted successfully",
      });
      fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete category",
        variant: "destructive",
      });
    }
  };

  const getCategoryName = (categoryId: string | null) => {
    if (!categoryId) return "General";
    const category = categories.find(cat => cat.id === categoryId);
    return category?.name || "General";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading FAQ management...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">FAQ Management</h1>
            <p className="text-muted-foreground">
              Manage frequently asked questions and categories
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="faqs" className="w-full">
        <TabsList>
          <TabsTrigger value="faqs">FAQs</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>

        <TabsContent value="faqs" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>FAQ Management</CardTitle>
                  <CardDescription>Create and manage frequently asked questions</CardDescription>
                </div>
                <Dialog open={isCreateFAQOpen} onOpenChange={setIsCreateFAQOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Add FAQ
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                      <DialogTitle>Create New FAQ</DialogTitle>
                      <DialogDescription>
                        Add a new frequently asked question
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="question">Question</Label>
                        <Input
                          id="question"
                          placeholder="Enter the question"
                          value={newFAQ.question}
                          onChange={(e) => setNewFAQ({ ...newFAQ, question: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="answer">Answer</Label>
                        <Textarea
                          id="answer"
                          placeholder="Enter the answer"
                          value={newFAQ.answer}
                          onChange={(e) => setNewFAQ({ ...newFAQ, answer: e.target.value })}
                          rows={4}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="category">Category</Label>
                        <Select value={newFAQ.category_id} onValueChange={(value) => setNewFAQ({ ...newFAQ, category_id: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category (optional)" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">No Category</SelectItem>
                            {categories.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="file">Document (optional)</Label>
                        <FileUpload
                          value={newFAQ.file_url}
                          deferred
                          onFileSelect={setNewFAQFile}
                          onChange={(fileUrl) => setNewFAQ({ ...newFAQ, file_url: fileUrl })}
                        />
                        <p className="text-xs text-muted-foreground">
                          Optional: Upload a PDF document for users to download
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="is_active"
                          checked={newFAQ.is_active}
                          onCheckedChange={(checked) => setNewFAQ({ ...newFAQ, is_active: checked })}
                        />
                        <Label htmlFor="is_active">Active</Label>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsCreateFAQOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={createFAQ}>Create FAQ</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Question</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {faqs.map((faq) => (
                    <TableRow key={faq.id}>
                      <TableCell className="max-w-xs">
                        <div className="truncate" title={faq.question}>
                          {faq.question}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {getCategoryName(faq.category_id)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={faq.is_active ? "default" : "secondary"}>
                          {faq.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {faq.created_at ? new Date(faq.created_at).toLocaleDateString() : '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingFAQ({
                                ...faq,
                                category_id: faq.category_id || "none"
                              });
                              setIsEditFAQOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleFAQStatus(faq)}
                          >
                            {faq.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete FAQ</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this FAQ? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deleteFAQ(faq.id)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Category Management</CardTitle>
                  <CardDescription>Organize FAQs into categories</CardDescription>
                </div>
                <Dialog open={isCreateCategoryOpen} onOpenChange={setIsCreateCategoryOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Category
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Category</DialogTitle>
                      <DialogDescription>
                        Add a new FAQ category
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                          id="name"
                          placeholder="Category name"
                          value={newCategory.name}
                          onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          placeholder="Category description (optional)"
                          value={newCategory.description}
                          onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                          rows={3}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsCreateCategoryOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={createCategory}>Create Category</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell className="font-medium">{category.name}</TableCell>
                      <TableCell>{category.description || "No description"}</TableCell>
                      <TableCell>{category.created_at ? new Date(category.created_at).toLocaleDateString() : '-'}</TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingCategory(category);
                              setIsEditCategoryOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Category</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this category? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deleteCategory(category.id)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit FAQ Dialog */}
      <Dialog open={isEditFAQOpen} onOpenChange={setIsEditFAQOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit FAQ</DialogTitle>
            <DialogDescription>
              Update the frequently asked question
            </DialogDescription>
          </DialogHeader>
          {editingFAQ && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-question">Question</Label>
                <Input
                  id="edit-question"
                  placeholder="Enter the question"
                  value={editingFAQ.question}
                  onChange={(e) => setEditingFAQ({ ...editingFAQ, question: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-answer">Answer</Label>
                <Textarea
                  id="edit-answer"
                  placeholder="Enter the answer"
                  value={editingFAQ.answer}
                  onChange={(e) => setEditingFAQ({ ...editingFAQ, answer: e.target.value })}
                  rows={4}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-category">Category</Label>
                <Select
                  value={editingFAQ.category_id || "none"}
                  onValueChange={(value) => setEditingFAQ({ ...editingFAQ, category_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Category</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-file">Document (optional)</Label>
                <FileUpload
                  value={editingFAQ.file_url}
                  deferred
                  onFileSelect={setEditingFAQFile}
                  onChange={(fileUrl) => setEditingFAQ({ ...editingFAQ, file_url: fileUrl })}
                />
                <p className="text-xs text-muted-foreground">
                  Optional: Upload a PDF document for users to download
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-is_active"
                  checked={editingFAQ.is_active}
                  onCheckedChange={(checked) => setEditingFAQ({ ...editingFAQ, is_active: checked })}
                />
                <Label htmlFor="edit-is_active">Active</Label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditFAQOpen(false)}>
              Cancel
            </Button>
            <Button onClick={updateFAQ}>Update FAQ</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Category Dialog */}
      <Dialog open={isEditCategoryOpen} onOpenChange={setIsEditCategoryOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>
              Update the FAQ category
            </DialogDescription>
          </DialogHeader>
          {editingCategory && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-category-name">Name</Label>
                <Input
                  id="edit-category-name"
                  placeholder="Category name"
                  value={editingCategory.name}
                  onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-category-description">Description</Label>
                <Textarea
                  id="edit-category-description"
                  placeholder="Category description (optional)"
                  value={editingCategory.description || ""}
                  onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditCategoryOpen(false)}>
              Cancel
            </Button>
            <Button onClick={updateCategory}>Update Category</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminFAQ;
