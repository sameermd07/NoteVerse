// Data structure
let appData = {
    sections: []
};

let currentSectionId = null;
let currentNoteId = null;

// Initialize data
function loadData() {
    const savedData = localStorage.getItem('noteflowData');
    if (savedData) {
        appData = JSON.parse(savedData);
    } else {
        // Create default sections
        appData.sections = [
            {
                id: generateId(),
                name: 'Personal',
                icon: 'fa-user',
                notes: [
                    {
                        id: generateId(),
                        title: 'Welcome to Noteflow',
                        content: '<p>Welcome to your new note-taking app! 🎉</p><p>Here\'s what you can do:</p><ul><li>Create sections to organize your notes</li><li>Add notes with rich text formatting</li><li>Insert code snippets with syntax highlighting</li><li>Export/import your data</li></ul><p>Start creating your first note!</p>',
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    }
                ]
            },
            {
                id: generateId(),
                name: 'Work',
                icon: 'fa-briefcase',
                notes: []
            },
            {
                id: generateId(),
                name: 'Ideas',
                icon: 'fa-lightbulb',
                notes: []
            }
        ];
    }
}

// Save data
function saveData() {
    localStorage.setItem('noteflowData', JSON.stringify(appData));
    updateCounters();
}

// Generate unique ID
function generateId() {
    return Date.now() + Math.random().toString(36).substr(2, 9);
}

// Render sections
function renderSections() {
    const sectionsList = document.getElementById('sectionsList');
    if (!sectionsList) return;

    sectionsList.innerHTML = '';

    appData.sections.forEach(section => {
        const sectionElement = document.createElement('div');
        sectionElement.className = `section-item ${section.id === currentSectionId ? 'active' : ''}`;
        sectionElement.innerHTML = `
            <span class="section-name" onclick="selectSection('${section.id}')">
                <i class="fas ${section.icon || 'fa-folder'}"></i>
                ${section.name}
            </span>
            <div class="section-actions">
                <button class="section-action-btn" onclick="editSection('${section.id}')">
                    <i class="fas fa-pencil-alt"></i>
                </button>
                <button class="section-action-btn" onclick="deleteSection('${section.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        sectionsList.appendChild(sectionElement);
    });

    document.getElementById('sectionCount').textContent = appData.sections.length;
}

// Render notes grid
function renderNotes() {
    const notesGrid = document.getElementById('notesGrid');
    const currentSectionTitle = document.getElementById('currentSectionTitle');
    const noteCountElement = document.getElementById('noteCount');
    const addNoteBtn = document.getElementById('addNoteBtn');

    if (!notesGrid) return;

    if (!currentSectionId && appData.sections.length > 0) {
        selectSection(appData.sections[0].id);
        return;
    }

    const currentSection = appData.sections.find(s => s.id === currentSectionId);
    
    if (!currentSection) {
        notesGrid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-folder-open"></i>
                <h3>No section selected</h3>
                <p>Choose a section or create a new one</p>
            </div>
        `;
        currentSectionTitle.innerHTML = '<i class="fas fa-folder-open"></i><span>All Notes</span>';
        noteCountElement.textContent = '0 notes';
        if (addNoteBtn) addNoteBtn.disabled = true;
        return;
    }

    currentSectionTitle.innerHTML = `<i class="fas ${currentSection.icon || 'fa-folder'}"></i><span>${currentSection.name}</span>`;
    noteCountElement.textContent = `${currentSection.notes.length} ${currentSection.notes.length === 1 ? 'note' : 'notes'}`;
    if (addNoteBtn) addNoteBtn.disabled = false;

    if (currentSection.notes.length === 0) {
        notesGrid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-pencil-alt"></i>
                <h3>No notes yet</h3>
                <p>Create your first note in ${currentSection.name}</p>
            </div>
        `;
        return;
    }

    // Sort notes by updatedAt descending
    const sortedNotes = [...currentSection.notes].sort((a, b) => 
        new Date(b.updatedAt) - new Date(a.updatedAt)
    );

    notesGrid.innerHTML = sortedNotes.map(note => createNoteCard(note, currentSection)).join('');
}

// Create note card HTML
function createNoteCard(note, section) {
    const previewContent = stripHtml(note.content).substring(0, 120) + '...';
    const hasCode = note.content.includes('<pre><code');
    const date = new Date(note.updatedAt).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    return `
        <div class="note-card" onclick="selectNote('${note.id}')">
            <div class="note-card-header">
                <div class="note-card-title">
                    <i class="fas fa-file-alt"></i>
                    ${escapeHtml(note.title || 'Untitled')}
                </div>
                <span class="note-card-date">${date}</span>
            </div>
            <div class="note-card-content">
                ${previewContent}
                ${hasCode ? '<div class="code-preview"><i class="fas fa-code"></i> Contains code snippet</div>' : ''}
            </div>
            <div class="note-card-footer">
                <span class="note-card-section">
                    <i class="fas ${section.icon || 'fa-folder'}"></i>
                    ${section.name}
                </span>
                <div class="note-card-actions" onclick="event.stopPropagation()">
                    <button class="note-card-action" onclick="deleteNote('${note.id}')">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Helper: Strip HTML tags
function stripHtml(html) {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
}

// Helper: Escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Select section
function selectSection(sectionId) {
    currentSectionId = sectionId;
    currentNoteId = null;
    renderSections();
    renderNotes();
}

// Add new section
function addSection() {
    const sectionName = prompt('Enter section name:');
    if (!sectionName || !sectionName.trim()) return;

    const icons = ['fa-folder', 'fa-user', 'fa-briefcase', 'fa-lightbulb', 'fa-heart', 'fa-star', 'fa-book', 'fa-graduation-cap'];
    const randomIcon = icons[Math.floor(Math.random() * icons.length)];

    const newSection = {
        id: generateId(),
        name: sectionName.trim(),
        icon: randomIcon,
        notes: []
    };

    appData.sections.push(newSection);
    saveData();
    renderSections();
    selectSection(newSection.id);
}

// Edit section
function editSection(sectionId) {
    const section = appData.sections.find(s => s.id === sectionId);
    const newName = prompt('Edit section name:', section.name);
    if (newName && newName.trim()) {
        section.name = newName.trim();
        saveData();
        renderSections();
        if (currentSectionId === sectionId) {
            renderNotes();
        }
    }
}

// Delete section
function deleteSection(sectionId) {
    if (confirm('Are you sure you want to delete this section and all its notes?')) {
        appData.sections = appData.sections.filter(s => s.id !== sectionId);
        
        if (currentSectionId === sectionId) {
            currentSectionId = appData.sections[0]?.id || null;
            currentNoteId = null;
        }
        
        saveData();
        renderSections();
        renderNotes();
        closeEditor();
    }
}

// Add new note
function addNote() {
    if (!currentSectionId) {
        alert('Please select a section first');
        return;
    }

    const section = appData.sections.find(s => s.id === currentSectionId);
    
    const newNote = {
        id: generateId(),
        title: 'Untitled Note',
        content: '<p>Start writing your note here...</p>',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    section.notes.push(newNote);
    saveData();
    renderNotes();
    selectNote(newNote.id);
}

// Select note
function selectNote(noteId) {
    currentNoteId = noteId;
    const note = getCurrentNote();
    
    if (note) {
        openEditor();
        document.getElementById('noteTitle').value = note.title || '';
        
        const editor = document.getElementById('noteContent');
        editor.innerHTML = note.content || '';
        
        document.getElementById('lastEdited').textContent = formatDate(note.updatedAt);
        
        // Highlight code blocks
        setTimeout(() => {
            document.querySelectorAll('#noteContent pre code').forEach((block) => {
                hljs.highlightBlock(block);
            });
        }, 100);
    }
    
    renderNotes();
}

// Get current note
function getCurrentNote() {
    if (!currentSectionId || !currentNoteId) return null;
    const section = appData.sections.find(s => s.id === currentSectionId);
    return section?.notes.find(n => n.id === currentNoteId);
}

// Open editor modal
function openEditor() {
    const modal = document.getElementById('editorModal');
    modal.classList.add('show');
}

// Close editor modal
function closeEditor() {
    const modal = document.getElementById('editorModal');
    modal.classList.remove('show');
    currentNoteId = null;
}

// Save current note
function saveCurrentNote() {
    const note = getCurrentNote();
    if (!note) {
        alert('Please select a note to save');
        return;
    }

    const titleInput = document.getElementById('noteTitle');
    const editor = document.getElementById('noteContent');

    note.title = titleInput.value.trim() || 'Untitled';
    note.content = editor.innerHTML;
    note.updatedAt = new Date().toISOString();

    saveData();
    renderNotes();
    
    document.getElementById('lastEdited').textContent = formatDate(note.updatedAt);
    
    // Show save feedback
    const saveBtn = document.querySelector('.modal-btn.primary');
    const originalText = saveBtn.innerHTML;
    saveBtn.innerHTML = '<i class="fas fa-check"></i> Saved!';
    setTimeout(() => {
        saveBtn.innerHTML = originalText;
    }, 1500);
}

// Delete note
function deleteNote(noteId) {
    if (!currentSectionId) return;
    
    if (confirm('Are you sure you want to delete this note?')) {
        const section = appData.sections.find(s => s.id === currentSectionId);
        section.notes = section.notes.filter(n => n.id !== noteId);

        if (currentNoteId === noteId) {
            currentNoteId = null;
            closeEditor();
        }

        saveData();
        renderNotes();
    }
}

// Delete current note
function deleteCurrentNote() {
    if (currentNoteId) {
        deleteNote(currentNoteId);
    }
}

// Insert code block
function insertCodeBlock() {
    const editor = document.getElementById('noteContent');
    const selection = window.getSelection();
    
    if (!editor.contains(selection.anchorNode)) {
        editor.focus();
    }

    const code = prompt('Enter your code:');
    if (code) {
        const language = prompt('Enter language (javascript, python, html, css, etc.) or leave empty:', 'javascript');
        const codeBlock = `
            <pre><code class="language-${language || 'plaintext'}">${escapeHtml(code)}</code></pre>
        `;
        
        document.execCommand('insertHTML', false, codeBlock);
        
        // Highlight the new code block
        setTimeout(() => {
            document.querySelectorAll('#noteContent pre code').forEach((block) => {
                hljs.highlightBlock(block);
            });
        }, 100);
    }
}

// Insert image
function insertImage() {
    const url = prompt('Enter image URL:');
    if (url) {
        document.execCommand('insertHTML', false, `<img src="${url}" alt="Image" style="max-width: 100%; border-radius: 8px;">`);
    }
}

// Insert link
function insertLink() {
    const url = prompt('Enter URL:');
    if (url) {
        const text = prompt('Enter link text:', url);
        document.execCommand('insertHTML', false, `<a href="${url}" target="_blank">${escapeHtml(text || url)}</a>`);
    }
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} minutes ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} hours ago`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)} days ago`;
    
    return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
    });
}

// Update counters
function updateCounters() {
    const totalNotes = appData.sections.reduce((acc, section) => acc + section.notes.length, 0);
    document.getElementById('sectionCount').textContent = appData.sections.length;
    document.getElementById('noteCount').textContent = `${totalNotes} notes`;
}

// Export data
function exportData() {
    const exportObj = {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        data: appData
    };
    
    const dataStr = JSON.stringify(exportObj, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `noteflow-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

// Import data
function importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    
    input.onchange = function(event) {
        const file = event.target.files[0];
        const reader = new FileReader();
        
        reader.onload = function(e) {
            try {
                const imported = JSON.parse(e.target.result);
                
                // Handle both old format and new format
                if (imported.data && imported.data.sections) {
                    appData = imported.data;
                } else if (imported.sections) {
                    appData = imported;
                } else {
                    throw new Error('Invalid format');
                }
                
                saveData();
                currentSectionId = appData.sections[0]?.id || null;
                currentNoteId = null;
                renderSections();
                renderNotes();
                closeEditor();
                alert('Data imported successfully!');
            } catch (error) {
                alert('Error importing file: Invalid format');
            }
        };
        
        reader.readAsText(file);
    };
    
    input.click();
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + S: Save note
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (currentNoteId) {
            saveCurrentNote();
        }
    }
    
    // Esc: Close editor
    if (e.key === 'Escape') {
        closeEditor();
    }
    
    // Ctrl/Cmd + N: New note
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        addNote();
    }
});

// Initialize app
function init() {
    loadData();
    renderSections();
    
    // Auto-select first section
    if (appData.sections.length > 0 && !currentSectionId) {
        selectSection(appData.sections[0].id);
    }
    
    // Close modal when clicking outside
    const modal = document.getElementById('editorModal');
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeEditor();
        }
    });
    
    // Initialize editor placeholder
    const editor = document.getElementById('noteContent');
    if (editor) {
        editor.setAttribute('placeholder', 'Write your note here... (Supports code snippets, images, and links)');
    }
}

// Start the app
document.addEventListener('DOMContentLoaded', init);