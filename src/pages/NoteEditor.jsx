import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import '@/quill-custom.css';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { Save, Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

const NoteEditor = () => {
  const { noteId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [note, setNote] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const titleRef = useRef(null);
  const quillRef = useRef(null);

  const fetchNote = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('storage_items').select('name, content').eq('id', noteId).single();
    if (error || !data) {
      toast({ variant: 'destructive', title: t('toast_error_title'), description: t('note_editor.not_found') });
      navigate('/notes');
    } else {
      setNote(data);
      setTitle(data.name || '');
      setContent(data.content || '');
    }
    setLoading(false);
  }, [noteId, navigate, toast, t]);

  useEffect(() => {
    fetchNote();
  }, [fetchNote]);

  const handleSave = async () => {
    if (!note) return;
    
    setSaving(true);
    const { error } = await supabase
      .from('storage_items')
      .update({ name: title, content: content, updated_at: new Date() })
      .eq('id', noteId);
    setSaving(false);
    
    if (error) {
      toast({ variant: 'destructive', title: t('toast_error_title'), description: t('note_editor.save_error') });
    } else {
      toast({ title: t('toast_success_title'), description: t('note_editor.save_success') });
    }
  };

  useEffect(() => {
    if (title === t('notes.new_note') && titleRef.current) {
        titleRef.current.select();
    }
  }, [title, t]);

  if (loading) {
    return <div className="flex justify-center items-center h-full"><Loader2 className="w-12 h-12 animate-spin text-primary" /></div>;
  }

  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
      ['link', 'image'],
      ['clean']
    ],
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <Button variant="ghost" onClick={() => navigate('/notes')} className="flex items-center gap-2">
          <ArrowLeft className="w-5 h-5" />
          {t('notes.title')}
        </Button>
        <div className="flex gap-2">
          <Button onClick={handleSave} disabled={saving} className="flex items-center gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{saving ? t('billing.saving') : t('note_editor.save_button')}</span>
          </Button>
        </div>
      </div>
      <input
        ref={titleRef}
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder={t('note_editor.title_placeholder')}
        className="text-3xl font-bold bg-transparent border-none focus:ring-0 outline-none p-2 mb-4"
      />
      <div className="flex-grow">
        <ReactQuill theme="snow" value={content} onChange={setContent} modules={quillModules} className="h-full" />
      </div>
    </motion.div>
  );
};

export default NoteEditor;