import React, { useRef, useState } from 'react';
import './FilesTab.css';
import { Upload, FileText, Download, FileImage, File, FileArchive, Search, Trash2 } from 'lucide-react';
import projects from '../../../api/projects.js';

const FilesTab = ({ projectFiles = [], projectId, refreshFiles }) => {
    const fileInputRef = useRef(null);
    const [isUploading, setIsUploading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            await projects.uploadProjectFile(projectId, formData);
            if (refreshFiles) refreshFiles();
        } catch (error) {
            console.error("Failed to upload file", error);
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleDeleteFile = async (fileId) => {
        if (!window.confirm("Are you sure you want to delete this file?")) return;
        try {
            await projects.deleteProjectFile(projectId, fileId);
            if (refreshFiles) refreshFiles();
        } catch (error) {
            console.error("Failed to delete file", error);
        }
    };

    const formatBytes = (bytes, decimals = 2) => {
        if (!+bytes) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
    };

    const getFileIcon = (fileName) => {
        if (!fileName) return <File size={24} />;
        const ext = fileName.split('.').pop().toLowerCase();
        if (['png', 'jpg', 'jpeg', 'gif', 'svg'].includes(ext)) return <FileImage size={24} />;
        if (['zip', 'rar', 'tar', 'gz'].includes(ext)) return <FileArchive size={24} />;
        if (['txt', 'md', 'doc', 'docx', 'pdf'].includes(ext)) return <FileText size={24} />;
        return <File size={24} />;
    };

    const filteredFiles = projectFiles.filter(f => 
        (f.name || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="files-tab">
            <div className="files-header">
                <div className="files-search">
                    <Search size={16} className="search-icon" />
                    <input 
                        type="text" 
                        placeholder="Search files..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <button 
                    className="btn-primary" 
                    style={{ display: 'flex', alignItems: 'center' }}
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                >
                    <Upload size={16} style={{ marginRight: '8px' }} />
                    {isUploading ? 'Uploading...' : 'Upload File'}
                </button>
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    style={{ display: 'none' }} 
                    onChange={handleFileUpload}
                />
            </div>

            {filteredFiles.length === 0 ? (
                <div className="files-empty">
                    <FileText size={48} color="#D1D5DB" />
                    <h3>No files found</h3>
                    <p>Upload a file to get started or try a different search term.</p>
                </div>
            ) : (
                <div className="files-grid">
                    {filteredFiles.map(file => {
                        const ext = file.name ? file.name.split('.').pop().toUpperCase() : 'FILE';
                        return (
                            <div key={file.id} className="file-card">
                                <div className="file-card-icon">
                                    {getFileIcon(file.name || '')}
                                </div>
                                <div className="file-card-details">
                                    <div className="file-card-name" title={file.name}>
                                        {file.name}
                                    </div>
                                    <div className="file-card-meta">
                                        {ext} • {formatBytes(file.size)}
                                    </div>
                                    <div className="file-card-date">
                                        {file.uploadDate ? new Date(file.uploadDate).toLocaleDateString() : 'Unknown date'}
                                        {file.taskId && <span style={{ marginLeft: '8px', padding: '2px 6px', backgroundColor: '#E0E7FF', color: '#4338CA', borderRadius: '4px', fontSize: '10px', fontWeight: '500' }} title={file.taskTitle}>Task #{file.taskId}</span>}
                                    </div>
                                </div>
                                <div className="file-card-actions" style={{ display: 'flex', gap: '8px' }}>
                                    <a href={`http://localhost:8080/api/files/download?fileName=${file.fileUrl}`} download target="_blank" rel="noreferrer" className="btn-icon">
                                        <Download size={16} />
                                    </a>
                                    <button className="btn-icon" style={{ color: '#EF4444' }} onClick={() => handleDeleteFile(file.id)}>
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default FilesTab;
