import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiFetch } from '@/lib/apiClient';
import {
  Search,
  RefreshCw,
  Trash2,
  Plus,
  ToggleLeft,
  ToggleRight,
  Database,
  BookOpen,
  Loader2,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';

interface BPSVariable {
  id: number;
  variable_id: string;
  variable_name: string;
  variable_name_en?: string;
  unit?: string;
  category?: string;
  is_active: boolean;
}

interface BPSCatalogResult {
  var_id: string;
  title: string;
  unit: string;
  subject: string;
}

export default function BPSSurveyManagement() {
  const { toast } = useToast();

  // Registered variables state
  const [variables, setVariables] = useState<BPSVariable[]>([]);
  const [loadingVars, setLoadingVars] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [togglingIds, setTogglingIds] = useState<Set<number>>(new Set());
  const [deletingIds, setDeletingIds] = useState<Set<number>>(new Set());

  // Catalog search state
  const [catalogKeyword, setCatalogKeyword] = useState('');
  const [catalogResults, setCatalogResults] = useState<BPSCatalogResult[]>([]);
  const [searchingCatalog, setSearchingCatalog] = useState(false);
  const [addingVarIds, setAddingVarIds] = useState<Set<string>>(new Set());

  // Fetch registered variables
  const fetchVariables = useCallback(async () => {
    setLoadingVars(true);
    try {
      const data = await apiFetch('/v2/panel/api/bps/variables');
      const list = Array.isArray(data) ? data : data.data ?? data.variables ?? [];
      setVariables(list);
    } catch (err: any) {
      toast({
        title: 'Failed to load variables',
        description: err.message || 'Could not fetch registered variables.',
        variant: 'destructive',
      });
    } finally {
      setLoadingVars(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchVariables();
  }, [fetchVariables]);

  // Unique categories for filter dropdown
  const categories = useMemo(() => {
    const cats = new Set<string>();
    variables.forEach((v) => {
      if (v.category) cats.add(v.category);
    });
    return Array.from(cats).sort();
  }, [variables]);

  // Client-side filtered variables
  const filteredVariables = useMemo(() => {
    return variables.filter((v) => {
      const matchesSearch =
        !searchQuery ||
        v.variable_name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === 'all' || v.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [variables, searchQuery, selectedCategory]);

  // Registered variable IDs set for catalog comparison
  const registeredVarIds = useMemo(() => {
    return new Set(variables.map((v) => v.variable_id));
  }, [variables]);

  // Toggle active/inactive
  const handleToggleActive = async (variable: BPSVariable) => {
    setTogglingIds((prev) => new Set(prev).add(variable.id));
    try {
      await apiFetch(`/v2/panel/api/bps/variables/${variable.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ is_active: !variable.is_active }),
      });
      setVariables((prev) =>
        prev.map((v) =>
          v.id === variable.id ? { ...v, is_active: !v.is_active } : v
        )
      );
      toast({
        title: `Variable ${!variable.is_active ? 'activated' : 'deactivated'}`,
        description: `"${variable.variable_name}" is now ${!variable.is_active ? 'active' : 'inactive'}.`,
      });
    } catch (err: any) {
      toast({
        title: 'Failed to update variable',
        description: err.message || 'Could not toggle variable status.',
        variant: 'destructive',
      });
    } finally {
      setTogglingIds((prev) => {
        const next = new Set(prev);
        next.delete(variable.id);
        return next;
      });
    }
  };

  // Delete variable
  const handleDelete = async (variable: BPSVariable) => {
    if (!confirm(`Delete variable "${variable.variable_name}"? This action cannot be undone.`)) {
      return;
    }
    setDeletingIds((prev) => new Set(prev).add(variable.id));
    try {
      await apiFetch(`/v2/panel/api/bps/variables/${variable.id}`, {
        method: 'DELETE',
      });
      setVariables((prev) => prev.filter((v) => v.id !== variable.id));
      toast({
        title: 'Variable deleted',
        description: `"${variable.variable_name}" has been removed.`,
      });
    } catch (err: any) {
      toast({
        title: 'Failed to delete variable',
        description: err.message || 'Could not delete variable.',
        variant: 'destructive',
      });
    } finally {
      setDeletingIds((prev) => {
        const next = new Set(prev);
        next.delete(variable.id);
        return next;
      });
    }
  };

  // Search BPS catalog
  const handleCatalogSearch = async () => {
    if (!catalogKeyword.trim()) {
      toast({
        title: 'Enter a keyword',
        description: 'Please enter a search keyword to browse the BPS catalog.',
        variant: 'destructive',
      });
      return;
    }
    setSearchingCatalog(true);
    setCatalogResults([]);
    try {
      const data = await apiFetch(
        `/v2/panel/api/bps/variables/search?keyword=${encodeURIComponent(catalogKeyword.trim())}&domain=0000`
      );
      const results = Array.isArray(data)
        ? data
        : data.data ?? data.results ?? data.variables ?? [];
      setCatalogResults(results);
      if (results.length === 0) {
        toast({
          title: 'No results',
          description: 'No variables found matching your keyword.',
        });
      }
    } catch (err: any) {
      toast({
        title: 'Catalog search failed',
        description: err.message || 'Could not search the BPS catalog.',
        variant: 'destructive',
      });
    } finally {
      setSearchingCatalog(false);
    }
  };

  // Add variable from catalog
  const handleAddFromCatalog = async (result: BPSCatalogResult) => {
    setAddingVarIds((prev) => new Set(prev).add(result.var_id));
    try {
      await apiFetch('/v2/panel/api/bps/variables', {
        method: 'POST',
        body: JSON.stringify({
          variable_id: result.var_id,
          variable_name: result.title,
          unit: result.unit,
          category: result.subject,
        }),
      });
      toast({
        title: 'Variable added',
        description: `"${result.title}" has been registered.`,
      });
      // Refresh registered variables to update the registeredVarIds set
      await fetchVariables();
    } catch (err: any) {
      toast({
        title: 'Failed to add variable',
        description: err.message || 'Could not add variable from catalog.',
        variant: 'destructive',
      });
    } finally {
      setAddingVarIds((prev) => {
        const next = new Set(prev);
        next.delete(result.var_id);
        return next;
      });
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">BPS Survey Management</h1>
        <p className="text-muted-foreground mt-1">
          Manage registered BPS statistical variables and browse the BPS catalog.
        </p>
      </div>

      <Tabs defaultValue="registered" className="space-y-6">
        <TabsList>
          <TabsTrigger value="registered" className="gap-2">
            <Database className="h-4 w-4" />
            Registered Variables
          </TabsTrigger>
          <TabsTrigger value="catalog" className="gap-2">
            <BookOpen className="h-4 w-4" />
            Browse BPS Catalog
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Registered Variables */}
        <TabsContent value="registered">
          <Card>
            <CardHeader>
              <CardTitle>Registered Variables</CardTitle>
              <CardDescription>
                Variables currently tracked in your system. Toggle their status or remove them.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Filter bar */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by variable name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  onClick={fetchVariables}
                  disabled={loadingVars}
                  className="gap-2"
                >
                  <RefreshCw className={`h-4 w-4 ${loadingVars ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>

              {/* Variables list */}
              {loadingVars ? (
                <div className="flex items-center justify-center py-12 text-muted-foreground gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Loading variables...
                </div>
              ) : filteredVariables.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
                  <AlertCircle className="h-8 w-8" />
                  <p className="text-sm">
                    {variables.length === 0
                      ? 'No registered variables yet. Browse the BPS Catalog to add some.'
                      : 'No variables match your current filters.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredVariables.map((variable) => (
                    <div
                      key={variable.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border rounded-lg"
                    >
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium truncate">
                            {variable.variable_name}
                          </span>
                          <Badge variant="secondary" className="font-mono text-xs">
                            {variable.variable_id}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                          {variable.unit && <span>Unit: {variable.unit}</span>}
                          {variable.category && (
                            <Badge variant="outline" className="text-xs">
                              {variable.category}
                            </Badge>
                          )}
                          {variable.is_active ? (
                            <Badge className="bg-green-100 text-green-800 hover:bg-green-100 text-xs">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs">
                              <XCircle className="h-3 w-3 mr-1" />
                              Inactive
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleActive(variable)}
                          disabled={togglingIds.has(variable.id)}
                          className="gap-1.5"
                        >
                          {togglingIds.has(variable.id) ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : variable.is_active ? (
                            <ToggleRight className="h-4 w-4" />
                          ) : (
                            <ToggleLeft className="h-4 w-4" />
                          )}
                          {variable.is_active ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(variable)}
                          disabled={deletingIds.has(variable.id)}
                          className="gap-1.5"
                        >
                          {deletingIds.has(variable.id) ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Browse BPS Catalog */}
        <TabsContent value="catalog">
          <Card>
            <CardHeader>
              <CardTitle>Browse BPS Catalog</CardTitle>
              <CardDescription>
                Search the BPS statistical catalog and register variables to track.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search bar */}
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search BPS catalog by keyword..."
                    value={catalogKeyword}
                    onChange={(e) => setCatalogKeyword(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleCatalogSearch();
                    }}
                    className="pl-9"
                  />
                </div>
                <Button
                  onClick={handleCatalogSearch}
                  disabled={searchingCatalog}
                  className="gap-2"
                >
                  {searchingCatalog ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                  Search
                </Button>
              </div>

              {/* Catalog results */}
              {searchingCatalog ? (
                <div className="flex items-center justify-center py-12 text-muted-foreground gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Searching BPS catalog...
                </div>
              ) : catalogResults.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
                  <BookOpen className="h-8 w-8" />
                  <p className="text-sm">
                    Enter a keyword above and click Search to browse the BPS catalog.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {catalogResults.map((result) => {
                    const isRegistered = registeredVarIds.has(result.var_id);
                    const isAdding = addingVarIds.has(result.var_id);

                    return (
                      <div
                        key={result.var_id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border rounded-lg"
                      >
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium">{result.title}</span>
                            <Badge variant="secondary" className="font-mono text-xs">
                              {result.var_id}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                            {result.unit && <span>Unit: {result.unit}</span>}
                            {result.subject && (
                              <Badge variant="outline" className="text-xs">
                                {result.subject}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="shrink-0">
                          {isRegistered ? (
                            <Badge className="bg-green-100 text-green-800 hover:bg-green-100 gap-1">
                              <CheckCircle className="h-3 w-3" />
                              Registered
                            </Badge>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => handleAddFromCatalog(result)}
                              disabled={isAdding}
                              className="gap-1.5"
                            >
                              {isAdding ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Plus className="h-4 w-4" />
                              )}
                              Add
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
