import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import { exportJournalToPDF } from '../utils/pdfExport';
import { useSupabase } from '../hooks/useSupabase';
import { JournalEntry, RichTextBlock } from '../types/journal';
import { MediaPicker } from '../components/MediaPicker';

interface JournalEntryScreenProps {
  route: {
    params: {
      entry?: JournalEntry;
    };
  };
  navigation: any;
}

export function JournalEntryScreen({ route, navigation }: JournalEntryScreenProps) {
  const { entry } = route.params || {};
  const [title, setTitle] = useState(entry?.title || '');
  const [blocks, setBlocks] = useState<RichTextBlock[]>(
    entry?.content ? parseContent(entry.content) : []
  );
  const [tags, setTags] = useState<string[]>(entry?.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const webViewRef = useRef<WebView>(null);
  const { supabase } = useSupabase();

  // Parse content string into RichTextBlocks
  function parseContent(content: string): RichTextBlock[] {
    try {
      return JSON.parse(content);
    } catch {
      return [{ type: 'paragraph', content }];
    }
  }

  // Convert blocks back to string for storage
  function stringifyBlocks(): string {
    return JSON.stringify(blocks);
  }

  const handleSave = async () => {
    if (!title.trim()) return;

    try {
      setSaving(true);
      const content = stringifyBlocks();
      const timestamp = new Date().toISOString();

      const entryData = {
        title: title.trim(),
        content,
        tags,
        images: blocks
          .filter(block => block.type === 'image')
          .map(block => block.imageUrl!)
          .filter(Boolean),
        updated_at: timestamp,
        ...(entry ? {} : { created_at: timestamp }),
      };

      if (entry) {
        await supabase
          .from('journal_entries')
          .update(entryData)
          .eq('id', entry.id);
      } else {
        await supabase.from('journal_entries').insert(entryData);
      }

      navigation.goBack();
    } catch (error) {
      console.error('Error saving journal entry:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags(prev => [...prev, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove));
  };

  const handleAddImage = async (imageUrl: string) => {
    setBlocks(prev => [
      ...prev,
      {
        type: 'image',
        content: '',
        imageUrl,
      },
    ]);
    setShowMediaPicker(false);
  };

  const handleFormatText = (format: string) => {
    webViewRef.current?.injectJavaScript(`
      document.execCommand('${format}', false, null);
      true;
    `);
  };

  const handleAddBlock = (type: RichTextBlock['type']) => {
    setBlocks(prev => [
      ...prev,
      {
        type,
        content: '',
        ...(type === 'checklist' ? { checked: false } : {}),
      },
    ]);
  };

  const editorHtml = `<!DOCTYPE html><html dir="rtl"><head><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1"><style>body{font-family:-apple-system,BlinkMacSystemFont,sans-serif;margin:0;padding:16px;direction:rtl}.editor{min-height:200px;outline:none}img{max-width:100%;height:auto}h1{font-size:24px}h2{font-size:20px}ul{padding-right:20px}.checklist{list-style:none;padding:0}.checklist-item{display:flex;align-items:center;margin-bottom:8px}.checklist-checkbox{margin-left:8px}</style></head><body><div class="editor" contenteditable="true"></div><script>const editor=document.querySelector('.editor');editor.addEventListener('input',()=>{window.ReactNativeWebView.postMessage(JSON.stringify({type:'content',value:editor.innerHTML}))});editor.addEventListener('paste',(e)=>{e.preventDefault();const text=e.clipboardData.getData('text/plain');const hasMarkdown=/[#*_\`]/.test(text);if(hasMarkdown){const html=text.replace(/^# (.+)$/gm,'<h1>$1</h1>').replace(/^## (.+)$/gm,'<h2>$1</h2>').replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>').replace(/\*(.+?)\*/g,'<em>$1</em>').replace(/\`(.+?)\`/g,'<code>$1</code>').replace(/^\* (.+)$/gm,'<li>$1</li>').replace(/\n\n/g,'<br><br>');document.execCommand('insertHTML',false,html)}else{document.execCommand('insertText',false,text)}});</script></body></html>`;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
            disabled={!title.trim() || saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.saveButtonText}>שמור</Text>
            )}
          </TouchableOpacity>
          {entry && (
            <TouchableOpacity
              style={[styles.saveButton, styles.exportButton]}
              onPress={() => exportJournalToPDF(entry)}
            >
              <MaterialIcons name="picture-as-pdf" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView style={styles.content}>
        <TextInput
          style={styles.titleInput}
          value={title}
          onChangeText={setTitle}
          placeholder="כותרת"
          textAlign="right"
        />

        <View style={styles.toolbar}>
          <TouchableOpacity
            style={styles.toolbarButton}
            onPress={() => handleFormatText('bold')}
          >
            <MaterialIcons name="format-bold" size={24} color="#263238" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.toolbarButton}
            onPress={() => handleFormatText('italic')}
          >
            <MaterialIcons name="format-italic" size={24} color="#263238" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.toolbarButton}
            onPress={() => handleAddBlock('heading1')}
          >
            <MaterialIcons name="title" size={24} color="#263238" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.toolbarButton}
            onPress={() => handleAddBlock('bulletList')}
          >
            <MaterialIcons name="format-list-bulleted" size={24} color="#263238" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.toolbarButton}
            onPress={() => handleAddBlock('checklist')}
          >
            <MaterialIcons name="check-box" size={24} color="#263238" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.toolbarButton}
            onPress={() => setShowMediaPicker(true)}
          >
            <MaterialIcons name="image" size={24} color="#263238" />
          </TouchableOpacity>
        </View>

        <WebView
          ref={webViewRef}
          style={styles.editor}
          source={{ html: editorHtml }}
          onMessage={event => {
            const data = JSON.parse(event.nativeEvent.data);
            if (data.type === 'content') {
              // Update blocks based on HTML content
            }
          }}
          scrollEnabled={false}
        />

        <View style={styles.tagsSection}>
          <View style={styles.tagInput}>
            <TextInput
              style={styles.tagInputField}
              value={tagInput}
              onChangeText={setTagInput}
              placeholder="הוסף תגית"
              onSubmitEditing={handleAddTag}
              textAlign="right"
            />
            <TouchableOpacity
              style={styles.addTagButton}
              onPress={handleAddTag}
              disabled={!tagInput.trim()}
            >
              <MaterialIcons name="add" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.tagsContainer}>
            {tags.map(tag => (
              <TouchableOpacity
                key={tag}
                style={styles.tag}
                onPress={() => handleRemoveTag(tag)}
              >
                <Text style={styles.tagText}>{tag}</Text>
                <MaterialIcons name="close" size={16} color="#1976D2" />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      <MediaPicker
        visible={showMediaPicker}
        onMediaSelect={handleAddImage}
        onError={(error) => console.error('Media picker error:', error)}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  saveButton: {
    backgroundColor: '#3F51B5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  exportButton: {
    backgroundColor: '#4CAF50',
  },
  content: {
    flex: 1,
  },
  titleInput: {
    fontSize: 24,
    fontWeight: '600',
    padding: 16,
    color: '#263238',
  },
  toolbar: {
    flexDirection: 'row',
    padding: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E0E0E0',
  },
  toolbarButton: {
    padding: 8,
    marginHorizontal: 4,
  },
  editor: {
    flex: 1,
    minHeight: 200,
  },
  tagsSection: {
    padding: 16,
  },
  tagInput: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  tagInputField: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    marginRight: 8,
    fontSize: 16,
  },
  addTagButton: {
    backgroundColor: '#3F51B5',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
  },
  tag: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 8,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagText: {
    color: '#1976D2',
    fontSize: 14,
    marginRight: 4,
  },
});
