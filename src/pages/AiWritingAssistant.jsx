import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Helmet } from "react-helmet";
import { supabase } from "@/lib/customSupabaseClient";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Bot,
  Clipboard,
  ClipboardCheck,
  History,
  Loader2,
  RefreshCw,
  Trash2,
  Mail,
  MessageSquare,
  Briefcase,
  ShoppingCart,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const contentTypes = [
  { value: "email-prospection", label: "Email de prospection", icon: Mail },
  { value: "email-relance", label: "Email de relance", icon: Mail },
  { value: "post-linkedin", label: "Post LinkedIn", icon: Briefcase },
  {
    value: "description-produit",
    label: "Description de produit",
    icon: ShoppingCart,
  },
  {
    value: "message-court",
    label: "Message court (SMS, WhatsApp)",
    icon: MessageSquare,
  },
];

const tones = [
  { value: "formel", label: "Formal" },
  { value: "informel", label: "Informal" },
  { value: "persuasif", label: "Persuasif" },
  { value: "amical", label: "Amical" },
  { value: "créatif", label: "Creative" },
];

const lengths = [
  { value: "court", label: "Short (~50 words)" },
  { value: "moyen", label: "Moyen (~150 mots)" },
  { value: "long", label: "Long (300+ words)" },
];

const AiWritingAssistant = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [prompt, setPrompt] = useState("");
  const [contentType, setContentType] = useState("email-prospection");
  const [tone, setTone] = useState("formal");
  const [length, setLength] = useState("average");
  const [language, setLanguage] = useState("French");

  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [history, setHistory] = useState([]);
  const [copiedIndex, setCopiedIndex] = useState(-1);
  const [view, setView] = useState("generator");

  const fetchHistory = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("ai_writing_history")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Unable to load history.",
      });
    } else {
      setHistory(data);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleGenerate = async (rewriteText = null) => {
    const currentPrompt = rewriteText || prompt;
    if (!currentPrompt) {
      toast({
        variant: "destructive",
        title: "Required field",
        description: "Please enter a prompt.",
      });
      return;
    }

    setIsLoading(true);
    setSuggestions([]);

    try {
      const { data, error } = await supabase.functions.invoke(
        "ai-writing-assistant",
        {
          body: {
            prompt: currentPrompt,
            contentType: contentTypes.find((c) => c.value === contentType)
              ?.label,
            tone: tones.find((t) => t.value === tone)?.label,
            length: lengths.find((l) => l.value === length)?.label,
            language: language,
          },
        }
      );

      if (error) throw error;

      setSuggestions(data.suggestions);

      if (!rewriteText) {
        const { error: saveError } = await supabase
          .from("ai_writing_history")
          .insert({
            user_id: user.id,
            prompt: currentPrompt,
            generated_text: data.suggestions.join("\n---\n"),
            content_type: contentType,
            tone,
            length,
          });
        if (saveError) throw saveError;
        fetchHistory();
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: "AI Error",
        description: "Generation failed. Please try again.",
      });
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    toast({
      title: "Copied!",
      description: "The text has been copied to the clipboard.",
    });
    setTimeout(() => setCopiedIndex(-1), 2000);
  };

  const deleteHistoryItem = async (id) => {
    const { error } = await supabase
      .from("ai_writing_history")
      .delete()
      .eq("id", id);
    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Unable to delete this item.",
      });
    } else {
      toast({
        title: "Deleted",
        description: "The item has been deleted from your history.",
      });
      fetchHistory();
    }
  };

  return (
    <div className="container mx-auto p-0 sm:p-4">
      <Helmet>
        <title>AI Writing Assistant - YourBizFlow</title>
        <meta
          name="description"
          content="Generate professional content with the AI ​​writing assistant."
        />
      </Helmet>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-primary/10 text-primary p-3 rounded-lg">
            <Bot className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">AI Writing Assistant</h1>
            <p className="text-muted-foreground">
              Your creative partner for impactful content.
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant={view === "generator" ? "default" : "outline"}
            onClick={() => setView("generator")}
          >
            <Bot className="w-4 h-4 mr-2" />
            Generator
          </Button>
          <Button
            variant={view === "history" ? "default" : "outline"}
            onClick={() => setView("history")}
          >
            <History className="w-4 h-4 mr-2" />
            History ({history.length})
          </Button>
        </div>
      </div>

      {view === "generator" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label>Content Type</label>
                <Select value={contentType} onValueChange={setContentType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {contentTypes.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label>What do you want to write?</label>
                <Textarea
                  placeholder="Ex: A post to announce our new reporting functionality..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={6}
                />
              </div>
              <div className="space-y-2">
                <label>Tone</label>
                <Select value={tone} onValueChange={setTone}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {tones.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label>Length</label>
                <Select value={length} onValueChange={setLength}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {lengths.map((l) => (
                      <SelectItem key={l.value} value={l.value}>
                        {l.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label>Language</label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Français">Français</SelectItem>
                    <SelectItem value="English">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={() => handleGenerate()}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin mr-2" />
                ) : (
                  <Bot className="mr-2" />
                )}
                Generate content
              </Button>
            </CardContent>
          </Card>

          <div className="lg:col-span-2 space-y-6">
            <AnimatePresence>
              {isLoading && suggestions.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center h-full min-h-[300px] text-center p-8 bg-card rounded-lg"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="w-12 h-12 mb-4"
                  >
                    <Bot className="w-full h-full text-primary" />
                  </motion.div>
                  <p className="text-lg font-semibold">
                    The AI ​​is writing...
                  </p>
                  <p className="text-muted-foreground">
                    Content creation in progress.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
            <AnimatePresence>
              {suggestions.length > 0 &&
                suggestions.map((suggestion, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Suggestion {index + 1}</CardTitle>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleGenerate(suggestion)}
                            className="sm:size-sm"
                          >
                            <RefreshCw className="w-4 h-4 sm:mr-0" />
                            <span className="hidden sm:inline-block ml-2">
                              Rewrite
                            </span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleCopy(suggestion, index)}
                            className="sm:size-sm"
                          >
                            {copiedIndex === index ? (
                              <ClipboardCheck className="w-4 h-4 sm:mr-0 text-green-500" />
                            ) : (
                              <Clipboard className="w-4 h-4 sm:mr-0" />
                            )}
                            <span className="hidden sm:inline-block ml-2">
                              Copy
                            </span>
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="whitespace-pre-wrap">{suggestion}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
            </AnimatePresence>
            {suggestions.length === 0 && !isLoading && (
              <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center p-8 bg-card rounded-lg">
                <Bot className="w-4 p.m.-16 text-muted-foreground/50 mb-4" />
                <h3 className="text-xl font-semibold">Ready to create?</h3>
                <p className="text-muted-foreground">
                  Your suggestions will appear here.
                </p>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {view === "history" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {history.length > 0 ? (
            <div className="space-y-4">
              {history.map((item) => (
                <Card key={item.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">
                          {contentTypes.find(
                            (c) => c.value === item.content_type
                          )?.label || "Contenu"}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {format(
                            new Date(item.created_at),
                            "d MMMM yyyy à HH:mm",
                            { locale: fr }
                          )}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteHistoryItem(item.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="font-semibold mb-2">Prompt:</p>
                    <p className="text-muted-foreground italic bg-secondary p-2 rounded-md mb-4">
                      "{item.prompt}"
                    </p>
                    <p className="font-semibold mb-2">Résultat:</p>
                    <p className="whitespace-pre-wrap bg-card p-3 rounded-md">
                      {item.generated_text.split("\n---\n")[0]}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-12 bg-card rounded-lg">
              <History className="w-16 h-16 text-muted-foreground/50 mb-4" />
              <h3 className="text-xl font-semibold">Aucun historique</h3>
              <p className="text-muted-foreground">
                Vos contenus générés apparaîtront ici.
              </p>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default AiWritingAssistant;
