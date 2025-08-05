import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, FileText, ArrowLeft, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import type { Database } from "@/integrations/supabase/types";

type FAQ = Database["public"]["Tables"]["faqs"]["Row"];
type FAQCategory = Database["public"]["Tables"]["faq_categories"]["Row"];

const FAQ = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [categories, setCategories] = useState<FAQCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    fetchFAQs();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('faq_categories')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setCategories(data || []);
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
      const { data, error } = await supabase
        .from('faqs')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFaqs(data || []);
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

  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || faq.category_id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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
          <p className="mt-2 text-muted-foreground">Loading FAQs...</p>
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
            <h1 className="text-3xl font-bold tracking-tight">Frequently Asked Questions</h1>
            <p className="text-muted-foreground">
              Find answers to common questions about our telecommunications services
            </p>
          </div>
        </div>
        {user && (
          <Link to="/support">
            <Button>
              <FileText className="mr-2 h-4 w-4" />
              Create Support Ticket
            </Button>
          </Link>
        )}
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search FAQs</CardTitle>
          <CardDescription>
            Search through our knowledge base or filter by category
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search questions and answers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(null)}
            >
              All Categories
            </Button>
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.name}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* FAQ Results */}
      <Card>
        <CardHeader>
          <CardTitle>
            {filteredFAQs.length} {filteredFAQs.length === 1 ? 'Question' : 'Questions'} Found
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredFAQs.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No FAQs found matching your search criteria.</p>
              {user && (
                <Link to="/support" className="mt-4 inline-block">
                  <Button>
                    <FileText className="mr-2 h-4 w-4" />
                    Ask a Question via Support Ticket
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredFAQs.map((faq) => (
                <Card key={faq.id} className="p-4">
                  <div className="flex items-start justify-between space-x-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium">{faq.question}</h3>
                        <Badge variant="secondary">
                          {getCategoryName(faq.category_id)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{faq.answer}</p>
                    </div>
                    {faq.file_url && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(faq.file_url, '_blank')}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FAQ;