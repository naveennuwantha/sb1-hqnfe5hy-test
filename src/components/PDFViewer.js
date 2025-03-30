import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Share, TextInput } from 'react-native';
import { Document, Page, pdfjs } from 'react-pdf';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { useUser } from '../context/UserContext';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export default function PDFViewer({ pdfId }) {
  const { user } = useUser();
  const [pdf, setPdf] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    loadPDF();
    checkLikeStatus();
    loadComments();
    loadProgress();
  }, [pdfId]);

  const loadPDF = async () => {
    const { data, error } = await supabase
      .from('pdfs')
      .select('*')
      .eq('id', pdfId)
      .single();

    if (error) {
      console.error('Error loading PDF:', error);
      return;
    }

    setPdf(data);
    setLikesCount(data.likes_count);
  };

  const loadProgress = async () => {
    const { data, error } = await supabase
      .from('pdf_progress')
      .select('*')
      .eq('pdf_id', pdfId)
      .eq('user_id', user.id)
      .single();

    if (data) {
      setCurrentPage(data.current_page);
      setProgress(data.completion_percentage);
    }
  };

  const updateProgress = async () => {
    if (!numPages) return;

    const completion = (currentPage / numPages) * 100;
    
    const { error } = await supabase
      .from('pdf_progress')
      .upsert({
        pdf_id: pdfId,
        user_id: user.id,
        current_page: currentPage,
        completion_percentage: completion,
      });

    if (error) {
      console.error('Error updating progress:', error);
      return;
    }

    setProgress(completion);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    updateProgress();
  };

  const checkLikeStatus = async () => {
    const { data } = await supabase
      .from('pdf_likes')
      .select('*')
      .eq('pdf_id', pdfId)
      .eq('user_id', user.id)
      .single();

    setLiked(!!data);
  };

  const toggleLike = async () => {
    if (liked) {
      await supabase
        .from('pdf_likes')
        .delete()
        .eq('pdf_id', pdfId)
        .eq('user_id', user.id);
      setLikesCount(prev => prev - 1);
    } else {
      await supabase
        .from('pdf_likes')
        .insert({
          pdf_id: pdfId,
          user_id: user.id,
        });
      setLikesCount(prev => prev + 1);
    }
    setLiked(!liked);
  };

  const loadComments = async () => {
    const { data, error } = await supabase
      .from('pdf_comments')
      .select('*, profiles:auth.users(full_name)')
      .eq('pdf_id', pdfId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading comments:', error);
      return;
    }

    setComments(data);
  };

  const addComment = async () => {
    if (!newComment.trim()) return;

    const { error } = await supabase
      .from('pdf_comments')
      .insert({
        pdf_id: pdfId,
        user_id: user.id,
        comment: newComment.trim(),
      });

    if (error) {
      console.error('Error adding comment:', error);
      return;
    }

    setNewComment('');
    loadComments();
  };

  const handleShare = async () => {
    try {
      const result = await Share.share({
        message: `Check out this PDF: ${pdf.title}\n${window.location.origin}/pdf/${pdfId}`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{pdf?.title}</Text>
        <View style={styles.actions}>
          <TouchableOpacity onPress={toggleLike} style={styles.actionButton}>
            <Ionicons 
              name={liked ? "heart" : "heart-outline"} 
              size={24} 
              color={liked ? "#ff4444" : "#666"}
            />
            <Text style={styles.actionText}>{likesCount}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleShare} style={styles.actionButton}>
            <Ionicons name="share-social" size={24} color="#666" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { width: `${progress}%` }]} />
        <Text style={styles.progressText}>
          {progress.toFixed(1)}% Complete | Page {currentPage} of {numPages}
        </Text>
      </View>

      <View style={styles.pdfContainer}>
        <Document
          file={pdf?.file_url}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={<Text>Loading PDF...</Text>}
        >
          <Page
            pageNumber={currentPage}
            scale={scale}
            loading={<Text>Loading page...</Text>}
          />
        </Document>

        <View style={styles.pageControls}>
          <TouchableOpacity 
            onPress={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            style={[styles.pageButton, currentPage <= 1 && styles.pageButtonDisabled]}
          >
            <Ionicons name="chevron-back" size={24} color={currentPage <= 1 ? "#ccc" : "#666"} />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= numPages}
            style={[styles.pageButton, currentPage >= numPages && styles.pageButtonDisabled]}
          >
            <Ionicons name="chevron-forward" size={24} color={currentPage >= numPages ? "#ccc" : "#666"} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.commentsSection}>
        <Text style={styles.commentsTitle}>Comments</Text>
        <View style={styles.commentInput}>
          <TextInput
            style={styles.input}
            value={newComment}
            onChangeText={setNewComment}
            placeholder="Add a comment..."
            multiline
          />
          <TouchableOpacity onPress={addComment} style={styles.commentButton}>
            <Ionicons name="send" size={24} color="#007AFF" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.commentsList}>
          {comments.map((comment) => (
            <View key={comment.id} style={styles.commentItem}>
              <Text style={styles.commentAuthor}>{comment.profiles?.full_name}</Text>
              <Text style={styles.commentText}>{comment.comment}</Text>
              <Text style={styles.commentDate}>
                {new Date(comment.created_at).toLocaleDateString()}
              </Text>
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: 15,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  actionText: {
    color: '#666',
  },
  progressContainer: {
    height: 30,
    backgroundColor: '#f5f5f5',
    borderRadius: 15,
    margin: 15,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  progressText: {
    position: 'absolute',
    width: '100%',
    textAlign: 'center',
    lineHeight: 30,
    color: '#000',
  },
  pdfContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 15,
  },
  pageControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginTop: 15,
  },
  pageButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  pageButtonDisabled: {
    backgroundColor: '#f5f5f5',
    shadowOpacity: 0,
    elevation: 0,
  },
  commentsSection: {
    padding: 15,
    maxHeight: 300,
  },
  commentsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  commentInput: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 15,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    padding: 10,
    paddingHorizontal: 15,
    backgroundColor: '#f9f9f9',
  },
  commentButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f0f0f0',
  },
  commentsList: {
    maxHeight: 200,
  },
  commentItem: {
    backgroundColor: '#f9f9f9',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  commentAuthor: {
    fontWeight: '600',
    marginBottom: 5,
  },
  commentText: {
    marginBottom: 5,
  },
  commentDate: {
    fontSize: 12,
    color: '#666',
  },
}); 