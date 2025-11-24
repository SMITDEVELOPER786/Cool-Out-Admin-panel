import React, { useState, useEffect, useImperativeHandle, forwardRef } from "react";
import { contentSamples, fileNames, optionLabels } from "../data/management";
import { 
  CheckCircle, X, FileText, Edit3, Eye, Download, Save, 
  Search, Clock, Zap, Bold, Italic, List, Link, Undo, AlertCircle
} from "lucide-react";
import "./ContentManagement.css";
import jsPDF from 'jspdf';

// Import your existing Firebase configuration
import { db } from "../firebase";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

const ContentManagement = forwardRef((props, ref) => {
  const [selectedOption, setSelectedOption] = useState("terms");
  const [content, setContent] = useState("");
  const [originalContent, setOriginalContent] = useState("");
  const [lastModified, setLastModified] = useState("");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: "", type: "" }); // success, error, warning

  // Show custom alert
  const showAlert = (message, type = "success") => {
    setAlert({ show: true, message, type });
    setTimeout(() => {
      setAlert({ show: false, message: "", type: "" });
    }, 3000);
  };

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Load content from Firebase
  const loadContentFromFirebase = async (docId) => {
    setLoading(true);
    try {
      const docRef = doc(db, "management", docId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        console.log("Loaded from Firebase:", data);
        
        setContent(data.content || "");
        setOriginalContent(data.content || "");
        
        // Handle lastModified timestamp conversion
        if (data.lastModified) {
          if (data.lastModified.toDate) {
            setLastModified(data.lastModified.toDate().toLocaleString());
          } else if (typeof data.lastModified === 'string') {
            setLastModified(data.lastModified);
          } else {
            setLastModified(new Date().toLocaleString());
          }
        } else {
          setLastModified(new Date().toLocaleString());
        }
      } else {
        // If document doesn't exist, use sample content
        console.log("Document doesn't exist, using sample content");
        const sampleContent = contentSamples[docId] || "";
        setContent(sampleContent);
        setOriginalContent(sampleContent);
        setLastModified(new Date().toLocaleString());
        
        // Create the document in Firebase
        await setDoc(docRef, {
          content: sampleContent,
          lastModified: new Date().toLocaleString(),
          title: optionLabels[docId],
          fileName: fileNames[docId],
          createdAt: new Date().toISOString()
        });
        
        showAlert(`${optionLabels[docId]} document created successfully!`, "success");
      }
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error("Error loading content from Firebase:", error);
      // Fallback to sample content
      const sampleContent = contentSamples[docId] || "";
      setContent(sampleContent);
      setOriginalContent(sampleContent);
      setLastModified(new Date().toLocaleString());
      showAlert("Error loading content. Using sample content.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Save content to Firebase
  const saveContentToFirebase = async () => {
    if (!content.trim()) {
      showAlert("Content cannot be empty!", "warning");
      return;
    }

    setSaving(true);
    try {
      const docRef = doc(db, "management", selectedOption);
      const currentTime = new Date().toLocaleString();
      
      await setDoc(docRef, {
        content: content,
        lastModified: currentTime,
        title: optionLabels[selectedOption],
        fileName: fileNames[selectedOption],
        updatedAt: new Date().toISOString()
      }, { merge: true });

      setOriginalContent(content);
      setLastModified(currentTime);
      setHasUnsavedChanges(false);
      
      showAlert("Content saved successfully!", "success");
    } catch (error) {
      console.error("Error saving content to Firebase:", error);
      showAlert("Error saving content. Please try again.", "error");
    } finally {
      setSaving(false);
    }
  };

  // Initialize content from Firebase when selectedOption changes
  useEffect(() => {
    if (selectedOption) {
      loadContentFromFirebase(selectedOption);
    }
  }, [selectedOption]);

  // Detect changes
  useEffect(() => {
    setHasUnsavedChanges(content !== originalContent);
  }, [content, originalContent]);

  // Handle option change
  const handleOptionChange = (newOption) => {
    if (hasUnsavedChanges) {
      // Custom confirmation dialog
      setAlert({
        show: true,
        message: "You have unsaved changes. Are you sure you want to switch?",
        type: "warning",
        withActions: true,
        onConfirm: () => {
          setSelectedOption(newOption);
          setSearchTerm("");
          setSearchResults([]);
          setShowSearchResults(false);
          setAlert({ show: false, message: "", type: "" });
        },
        onCancel: () => {
          setAlert({ show: false, message: "", type: "" });
        }
      });
    } else {
      setSelectedOption(newOption);
      setSearchTerm("");
      setSearchResults([]);
      setShowSearchResults(false);
    }
  };

  // PDF Export function
  const exportToPDF = () => {
    try {
      const pdf = new jsPDF();
      
      // Set properties
      pdf.setProperties({
        title: optionLabels[selectedOption],
        subject: 'Static Page Content',
        author: 'Content Management System',
        creator: 'Content Management System'
      });

      // Add title
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`Static Page: ${optionLabels[selectedOption]}`, 20, 20);

      // Add metadata
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`File: ${fileNames[selectedOption]}`, 20, 35);
      pdf.text(`Last Modified: ${lastModified}`, 20, 42);
      pdf.text(`Generated: ${new Date().toLocaleString()}`, 20, 49);

      // Add content
      pdf.setFontSize(11);
      const contentText = content.replace(/<[^>]*>/g, '');
      
      // Split text into lines that fit the page width
      const pageWidth = pdf.internal.pageSize.getWidth() - 40;
      const lines = pdf.splitTextToSize(contentText, pageWidth);
      
      let yPosition = 65;
      
      lines.forEach(line => {
        if (yPosition > pdf.internal.pageSize.getHeight() - 20) {
          pdf.addPage();
          yPosition = 20;
        }
        
        pdf.text(line, 20, yPosition);
        yPosition += 7;
      });

      pdf.save(`${fileNames[selectedOption]}_${new Date().toISOString().split('T')[0]}.pdf`);
      showAlert("PDF exported successfully!", "success");
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      showAlert('Error generating PDF. Please try again.', "error");
    }
  };

  useImperativeHandle(ref, () => ({
    exportToPDF
  }));

  // Handle search
  useEffect(() => {
    if (searchTerm.trim()) {
      const lines = content.split('\n');
      const results = lines
        .map((line, index) => ({
          line,
          index,
          matches: (line.match(new RegExp(searchTerm, 'gi')) || []).length
        }))
        .filter(item => item.matches > 0);
      
      setSearchResults(results);
      setShowSearchResults(true);
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  }, [searchTerm, content]);

  const handleSave = () => {
    saveContentToFirebase();
  };

  // Formatting helpers
  const formatText = (type) => {
    const textarea = document.querySelector('.content-textarea');
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    
    const formats = {
      bold: `**${selectedText}**`,
      italic: `_${selectedText}_`,
      list: `\n- ${selectedText}\n`,
      link: `[${selectedText}](url)`
    };

    if (formats[type]) {
      const newContent = content.substring(0, start) + formats[type] + content.substring(end);
      setContent(newContent);
      
      setTimeout(() => {
        textarea.focus();
        const newPosition = start + formats[type].length;
        textarea.setSelectionRange(newPosition, newPosition);
      }, 0);
    }
  };

  // Quick actions
  const quickActions = [
    { icon: Bold, action: () => formatText('bold'), label: 'Bold' },
    { icon: Italic, action: () => formatText('italic'), label: 'Italic' },
    { icon: List, action: () => formatText('list'), label: 'List' },
    { icon: Link, action: () => formatText('link'), label: 'Link' },
  ];

  // Function to render formatted content
  const renderFormattedContent = (content) => {
    let formattedContent = content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/_(.*?)_/g, '<em>$1</em>')
      .replace(/^- (.*$)/gm, '<li>$1</li>')
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="preview-link">$1</a>')
      .replace(/\n/g, '<br>');

    if (formattedContent.includes('<li>')) {
      formattedContent = formattedContent.replace(/(<li>.*<\/li>)/s, '<ul class="preview-list">$1</ul>');
    }

    if (searchTerm.trim()) {
      const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
      formattedContent = formattedContent.replace(regex, '<mark class="search-highlight">$1</mark>');
    }

    return formattedContent;
  };

  // Scroll to line in editor
  const scrollToLine = (lineIndex) => {
    const textarea = document.querySelector('.content-textarea');
    if (textarea) {
      const lines = content.split('\n');
      let position = 0;
      for (let i = 0; i < lineIndex; i++) {
        position += lines[i].length + 1;
      }
      textarea.focus();
      textarea.setSelectionRange(position, position);
      textarea.scrollTop = textarea.scrollHeight * (lineIndex / lines.length);
      setShowSearchResults(false);
    }
  };

  return (
    <div className="content-management-page">
      <div className="content-management-container">
        
        {/* Custom Alert */}
        {alert.show && (
          <div className={`custom-alert ${alert.type} ${alert.withActions ? 'with-actions' : ''}`}>
            <div className="alert-content">
              <div className="alert-icon">
                {alert.type === "success" && <CheckCircle size={20} />}
                {alert.type === "error" && <AlertCircle size={20} />}
                {alert.type === "warning" && <AlertCircle size={20} />}
              </div>
              <div className="alert-message">
                {alert.message}
              </div>
              {!alert.withActions && (
                <button 
                  className="alert-close"
                  onClick={() => setAlert({ show: false, message: "", type: "" })}
                >
                  <X size={16} />
                </button>
              )}
            </div>
            {alert.withActions && (
              <div className="alert-actions">
                <button 
                  className="alert-confirm"
                  onClick={alert.onConfirm}
                >
                  Yes, Switch
                </button>
                <button 
                  className="alert-cancel"
                  onClick={alert.onCancel}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}

        {/* Main Container */}
        <div className="main-container">
          
          {/* Header Section */}
          <div className="header-section">
            <h1 className="page-title">Content Management</h1>
            <p className="page-subtitle">Manage and edit static page content</p>
            {loading && <div className="loading-indicator">Loading from Firebase...</div>}
          </div>

          {/* Stats Grid */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-header">
                <FileText className="stat-icon" />
                <span className="stat-label">Editing</span>
              </div>
              <p className="stat-value">{optionLabels[selectedOption]}</p>
            </div>
            
            <div className="stat-card">
              <div className="stat-header">
                <Clock className="stat-icon" />
                <span className="stat-label">Last Modified</span>
              </div>
              <p className="stat-text">{lastModified.split(',')[0]}</p>
            </div>
            
            <div className="stat-card">
              <div className="stat-header">
                <Zap className="stat-icon" />
                <span className="stat-label">File</span>
              </div>
              <p className="stat-text file-name">{fileNames[selectedOption]}</p>
            </div>
            
            <div className="stat-card">
              <div className="stat-header">
                <Edit3 className="stat-icon" />
                <span className="stat-label">Status</span>
              </div>
              <p className="status-text">
                {loading ? (
                  <span className="status-loading">Loading...</span>
                ) : saving ? (
                  <span className="status-saving">Saving...</span>
                ) : hasUnsavedChanges ? (
                  <span className="status-unsaved">
                    <div className="status-dot"></div>
                    Unsaved Changes
                  </span>
                ) : (
                  <span className="status-saved">
                    <CheckCircle className="status-icon" />
                    Saved
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Control Bar */}
          <div className="control-bar">
            <div className="control-content">
              {/* Content Selector */}
              <select
                value={selectedOption}
                onChange={(e) => handleOptionChange(e.target.value)}
                className="content-selector"
                disabled={loading || saving}
              >
                <option value="terms">Terms & Conditions</option>
                <option value="privacy">Privacy Policy</option>
                <option value="about">About</option>
              </select>

              {/* Search and Actions */}
              <div className="search-actions">
                <div className="search-container">
                  <div className="search-input-wrapper">
                    <Search className="search-icon" />
                    <input
                      type="text"
                      placeholder="Search in content..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="search-input"
                      disabled={loading}
                    />
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm('')}
                        className="clear-search-button"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                  
                  {/* Search Results Dropdown */}
                  {showSearchResults && searchResults.length > 0 && (
                    <div className="search-results">
                      <div className="search-results-header">
                        <h3>Found {searchResults.length} {searchResults.length === 1 ? 'match' : 'matches'} for "{searchTerm}"</h3>
                        <button
                          onClick={() => setShowSearchResults(false)}
                          className="close-results-button"
                        >
                          <X size={14} />
                        </button>
                      </div>
                      <div className="search-results-list">
                        {searchResults.map((result, index) => (
                          <div 
                            key={index}
                            className="search-result-item"
                            onClick={() => scrollToLine(result.index)}
                          >
                            <div 
                              className="result-line"
                              dangerouslySetInnerHTML={{ 
                                __html: result.line.replace(
                                  new RegExp(`(${searchTerm})`, 'gi'), 
                                  '<mark class="search-highlight">$1</mark>'
                                )
                              }}
                            />
                            <div className="result-line-number">Line {result.index + 1}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <button
                  onClick={exportToPDF}
                  className="export-button"
                  disabled={loading || !content.trim()}
                >
                  <Download className="button-icon" />
                  <span className="button-text">Export PDF</span>
                </button>
              </div>
            </div>
          </div>

          {/* Editor Section */}
          <div className="editor-section">
            <div className="editor-content">
              {/* Editor Panel */}
              <div className="editor-panel">
                <div className="editor-container">
                  {/* Editor Header */}
                  <div className="editor-header">
                    <label className="editor-label">Content Editor</label>
                    {!isMobile && (
                      <div className="format-buttons">
                        {quickActions.map((action, index) => (
                          <button
                            key={index}
                            onClick={action.action}
                            className="format-button"
                            title={action.label}
                            disabled={loading}
                          >
                            <action.icon className="format-icon" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Textarea */}
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={isMobile ? 16 : 20}
                    className="content-textarea"
                    placeholder="Enter your content here..."
                    disabled={loading}
                  />

                  {/* Action Buttons */}
                  <div className="action-buttons">
                    <div className="last-saved">
                      <Clock className="saved-icon" />
                      Last saved: {lastModified}
                    </div>
                    
                    <div className="button-group">
                      <button
                        onClick={() => setShowPreview(true)}
                        className="preview-button"
                        disabled={loading || !content.trim()}
                      >
                        <Eye className="button-icon" />
                        <span>Preview</span>
                      </button>
                      
                      {hasUnsavedChanges && (
                        <button
                          onClick={() => {
                            setContent(originalContent);
                            setHasUnsavedChanges(false);
                          }}
                          className="reset-button"
                          disabled={loading}
                        >
                          <Undo className="button-icon" />
                          <span>Reset</span>
                        </button>
                      )}
                      
                      <button
                        onClick={handleSave}
                        disabled={!hasUnsavedChanges || loading || saving || !content.trim()}
                        className={`save-button ${hasUnsavedChanges && !loading && !saving && content.trim() ? 'save-active' : 'save-disabled'}`}
                      >
                        {saving ? (
                          <>Saving...</>
                        ) : (
                          <>
                            <Save className="button-icon" />
                            <span>Save</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Preview Modal */}
        {showPreview && (
          <div className="preview-modal-overlay" onClick={() => setShowPreview(false)}>
            <div 
              className="preview-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="preview-header">
                <h2 className="preview-title">Preview: {optionLabels[selectedOption]}</h2>
                <button 
                  onClick={() => setShowPreview(false)}
                  className="close-button"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="preview-content">
                <div className="preview-container">
                  <h1 className="preview-page-title">{optionLabels[selectedOption]}</h1>
                  <div 
                    className="preview-text"
                    dangerouslySetInnerHTML={{ __html: renderFormattedContent(content) }}
                  />
                </div>
              </div>
              <div className="preview-footer">
                <button
                  onClick={() => setShowPreview(false)}
                  className="back-button"
                >
                  Back to Editor
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

export default ContentManagement;