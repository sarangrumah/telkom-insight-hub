import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  FileText,
  ArrowLeft,
  Download,
  HelpCircle,
  Filter,
  X,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'react-router-dom';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { FAQApi, Faq as FAQItem, FaqCategory } from '@/lib/faqApi';

const FAQ = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [categories, setCategories] = useState<FaqCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    fetchFAQs();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await FAQApi.listCategoriesPublic();
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast({
        title: 'Error',
        description: 'Failed to load FAQ categories',
        variant: 'destructive',
      });
    }
  };

  const fetchFAQs = async () => {
    try {
      setLoading(true);
      const data = await FAQApi.listPublic();
      setFaqs(data || []);
    } catch (error) {
      console.error('Error fetching FAQs:', error);
      toast({
        title: 'Error',
        description: 'Failed to load FAQs',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch =
      (faq.question || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (faq.answer || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      !selectedCategory || faq.category_id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryName = (categoryId: string | null) => {
    if (!categoryId) return 'General';
    const category = categories.find(cat => cat.id === categoryId);
    return category?.name || 'General';
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory(null);
    setIsFilterOpen(false);
  };

  const activeFiltersCount = (searchTerm ? 1 : 0) + (selectedCategory ? 1 : 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto"></div>
            <HelpCircle className="absolute inset-0 m-auto h-6 w-6 text-primary/60" />
          </div>
          <div className="space-y-2">
            <p className="text-lg font-medium">Loading FAQs</p>
            <p className="text-sm text-muted-foreground">
              Please wait while we fetch the latest information...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10">
      {/* Header Section */}
      <div className="bg-white/50 backdrop-blur-sm border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex flex-col space-y-3 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
            <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4">
              <Link to="/">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Dashboard
                </Button>
              </Link>
              <div className="space-y-0.5">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                  Frequently Asked Questions
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Find answers to common questions about our telecommunications
                  services
                </p>
              </div>
            </div>
            {user && (
              <Link to="/support" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto shadow-md hover:shadow-lg transition-all duration-200">
                  <FileText className="mr-2 h-4 w-4" />
                  Create Support Ticket
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Search Section */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
              <div>
                <CardTitle className="flex items-center text-lg sm:text-xl">
                  <Search className="mr-2 h-5 w-5 text-primary" />
                  Search Knowledge Base
                </CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Search through our comprehensive FAQ database
                </CardDescription>
              </div>
              {activeFiltersCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  className="w-full sm:w-auto"
                >
                  <X className="mr-2 h-4 w-4" />
                  Clear Filters ({activeFiltersCount})
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search questions and answers..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10 h-12 text-base border-2 focus:border-primary/50 transition-colors"
              />
            </div>

            {/* Desktop Category Filters */}
            <div className="hidden lg:flex flex-wrap gap-2">
              <Button
                variant={selectedCategory === null ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(null)}
                className="transition-all duration-200"
              >
                All Categories
              </Button>
              {categories.map(category => (
                <Button
                  key={category.id}
                  variant={
                    selectedCategory === category.id ? 'default' : 'outline'
                  }
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className="transition-all duration-200"
                >
                  {category.name}
                </Button>
              ))}
            </div>

            {/* Mobile Category Filters */}
            <div className="lg:hidden">
              <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    <div className="flex items-center">
                      <Filter className="mr-2 h-4 w-4" />
                      Categories
                    </div>
                    {selectedCategory && (
                      <Badge variant="secondary" className="ml-2">
                        {getCategoryName(selectedCategory)}
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-[400px]">
                  <SheetHeader>
                    <SheetTitle>Filter by Category</SheetTitle>
                    <SheetDescription>
                      Choose a category to filter the FAQs
                    </SheetDescription>
                  </SheetHeader>
                  <div className="grid grid-cols-1 gap-2 mt-6">
                    <Button
                      variant={
                        selectedCategory === null ? 'default' : 'outline'
                      }
                      onClick={() => {
                        setSelectedCategory(null);
                        setIsFilterOpen(false);
                      }}
                      className="justify-start"
                    >
                      All Categories
                    </Button>
                    {categories.map(category => (
                      <Button
                        key={category.id}
                        variant={
                          selectedCategory === category.id
                            ? 'default'
                            : 'outline'
                        }
                        onClick={() => {
                          setSelectedCategory(category.id);
                          setIsFilterOpen(false);
                        }}
                        className="justify-start"
                      >
                        {category.name}
                      </Button>
                    ))}
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Active Filter Display */}
            {(searchTerm || selectedCategory) && (
              <div className="flex flex-wrap gap-2 p-3 bg-muted/50 rounded-lg">
                <span className="text-sm font-medium text-muted-foreground">
                  Active filters:
                </span>
                {searchTerm && (
                  <Badge variant="secondary" className="text-xs">
                    Search: "{searchTerm}"
                  </Badge>
                )}
                {selectedCategory && (
                  <Badge variant="secondary" className="text-xs">
                    Category: {getCategoryName(selectedCategory)}
                  </Badge>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* FAQ Results */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center text-lg sm:text-xl">
              <HelpCircle className="mr-2 h-5 w-5 text-primary" />
              {filteredFAQs.length}{' '}
              {filteredFAQs.length === 1 ? 'Question' : 'Questions'} Found
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {filteredFAQs.length === 0 ? (
              <div className="text-center py-12 px-6">
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                    <Search className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-lg font-medium">No FAQs found</p>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      We couldn't find any questions matching your search
                      criteria. Try adjusting your search terms or browse all
                      categories.
                    </p>
                  </div>
                  {user && (
                    <Link to="/support" className="inline-block mt-6">
                      <Button className="shadow-md hover:shadow-lg transition-all duration-200">
                        <FileText className="mr-2 h-4 w-4" />
                        Ask a Question via Support Ticket
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            ) : (
              <div className="px-6 pb-6">
                <Accordion type="single" collapsible className="space-y-4">
                  {filteredFAQs.map((faq, index) => (
                    <AccordionItem
                      key={faq.id}
                      value={faq.id}
                      className="bg-white rounded-xl border-2 border-muted/50 shadow-sm hover:shadow-md hover:border-primary/30 focus-within:border-primary focus-within:shadow-lg focus-within:ring-2 focus-within:ring-primary/20 transition-all duration-200 overflow-hidden"
                    >
                      <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-muted/20 focus:bg-primary/5 focus:outline-none focus:ring-0 transition-colors group">
                        <div className="flex items-start space-x-4 text-left w-full">
                          <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold text-sm mt-0.5 group-hover:bg-primary/20 group-focus:bg-primary/30 transition-colors">
                            {index + 1}
                          </div>
                          <div className="flex-1 space-y-2">
                            <h3 className="font-semibold text-sm sm:text-base leading-tight group-hover:text-primary group-focus:text-primary transition-colors">
                              {faq.question}
                            </h3>
                            <div className="flex flex-wrap gap-2">
                              <Badge
                                variant="outline"
                                className="text-xs group-focus:border-primary/50"
                              >
                                {getCategoryName(faq.category_id)}
                              </Badge>
                              {faq.file_url && (
                                <Badge variant="secondary" className="text-xs">
                                  Has attachment
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-6 pb-6 pt-4">
                        <div className="pl-12 space-y-4">
                          <div className="prose prose-sm max-w-none text-muted-foreground">
                            <p className="whitespace-pre-wrap leading-relaxed">
                              {faq.answer}
                            </p>
                          </div>
                          {faq.file_url && (
                            <div className="pt-2 border-t">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  window.open(faq.file_url!, '_blank')
                                }
                                className="w-full sm:w-auto hover:shadow-md focus:shadow-lg focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all duration-200"
                              >
                                <Download className="h-4 w-4 mr-2" />
                                Download Attachment
                              </Button>
                            </div>
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bottom CTA */}
        {user && filteredFAQs.length > 0 && (
          <Card className="relative overflow-hidden shadow-xl border-0 bg-gradient-to-br from-white via-primary/5 to-primary/10 backdrop-blur-sm">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent"></div>
              <div className="absolute top-0 right-0 w-32 h-32 sm:w-48 sm:h-48 rounded-full bg-primary/10 transform translate-x-16 -translate-y-16"></div>
              <div className="absolute bottom-0 left-0 w-20 h-20 sm:w-32 sm:h-32 rounded-full bg-primary/10 transform -translate-x-8 translate-y-8"></div>
            </div>

            <CardContent className="relative z-10 p-6 sm:p-8 lg:p-10">
              <div className="max-w-2xl mx-auto">
                <div className="flex flex-col items-center space-y-6 text-center">
                  {/* Icon */}
                  <div className="relative">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-primary/20 to-primary/30 rounded-full flex items-center justify-center shadow-lg">
                      <HelpCircle className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                      <FileText className="h-3 w-3 text-white" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="space-y-3 sm:space-y-4">
                    <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                      Still have questions?
                    </h3>
                    <p className="text-sm sm:text-base lg:text-lg text-muted-foreground leading-relaxed max-w-lg mx-auto">
                      Can't find what you're looking for? Our dedicated support
                      team is ready to help you with personalized assistance.
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
                    <Link to="/support" className="w-full sm:w-auto">
                      <Button
                        size="lg"
                        className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-semibold shadow-lg hover:shadow-xl focus:shadow-xl focus:ring-4 focus:ring-primary/20 transform hover:scale-105 focus:scale-105 transition-all duration-200 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
                      >
                        <FileText className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                        Contact Support
                      </Button>
                    </Link>

                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() =>
                        window.scrollTo({ top: 0, behavior: 'smooth' })
                      }
                      className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-semibold border-2 border-primary/20 hover:border-primary/40 hover:bg-primary/5 focus:border-primary/40 focus:bg-primary/5 focus:ring-4 focus:ring-primary/20 transition-all duration-200"
                    >
                      <Search className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                      Search Again
                    </Button>
                  </div>

                  {/* Additional Info */}
                  <div className="pt-4 border-t border-muted/30 w-full">
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-xs sm:text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <span>24/7 Support Available</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        <span>Average response time: 2 hours</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default FAQ;
