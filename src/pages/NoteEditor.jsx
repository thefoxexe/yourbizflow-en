import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/customSupabaseClient";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { Save, ArrowLeft, Loader2 } from "lucide-react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "@/quill-custom.css";

const NoteEditor = () => {
  const { noteId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [note, setNote] = useState(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchNote = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("storage_items")
      .select("*")
      .eq("id", noteId)
      .single();

    if (error || !data) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Note not found.",
      });
      navigate("/notes");
    } else {
      setNote(data);
      setTitle(data.name);
      setContent(data.content || "");
    }
    setLoading(false);
  }, [noteId, navigate, toast]);

  useEffect(() => {
    fetchNote();
  }, [fetchNote]);

  const handleSave = async () => {
    setIsSaving(true);
    const { error } = await supabase
      .from("storage_items")
      .update({
        name: title,
        content: content,
        updated_at: new Date().toISOString(),
      })
      .eq("id", noteId);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "The note could not be saved.",
      });
    } else {
      toast({ title: "Success", description: "Note saved." });
    }
    setIsSaving(false);
  };

  const modules = useMemo(
    () => ({
      toolbar: [
        [{ header: [1, 2, 3, false] }],
        ["bold", "italic", "underline", "strike"],
        [{ list: "ordered" }, { list: "bullet" }],
        ["link"],
        ["clean"],
      ],
    }),
    []
  );

  if (loading) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-background text-foreground flex flex-col"
    >
      <header className="p-4 border-b border-border flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-sm z-20">
        <Button variant="ghost" size="icon" onClick={() => navigate("/notes")}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1 mx-4">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-lg font-bold border-none focus-visible:ring-0 focus-visible:ring-offset-0 p-0 h-auto bg-transparent"
            placeholder="Note title"
          />
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Save
        </Button>
      </header>
      <main className="flex-1 flex flex-col">
        <ReactQuill
          theme="snow"
          value={content}
          onChange={setContent}
          modules={modules}
          className="flex-grow"
        />
      </main>
    </motion.div>
  );
};

export default NoteEditor;
