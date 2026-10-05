import React, { useState, useEffect } from 'react';
import { Search, FileText, Image as ImageIcon, FileArchive, Download, MoreVertical, Filter, Grid, List, Trash2, X } from 'lucide-react';
import Sidebar from '../../components/layout/Sidebar/Sidebar.jsx';
import Header from '../../components/layout/Header/Header.jsx';
import { getMyFiles, uploadProjectFile, deleteProjectFile } from '../../api/files';
import projectsApi from '../../api/projects';
import './Files.css';

const FilesPage = () => {
    const [search, setSearch] = useState('');
    const [viewMode, setViewMode] = useState('grid');
    const [files, setFiles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [projects, setProjects] = useState([]);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [uploadFile, setUploadFile] = useState(null);
    const [uploadProjectId, setUploadProjectId] = useState('');
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        fetchFiles();
        fetchProjects();
    }, []);

    const fetchFiles = async () => {
        try {
            setIsLoading(true);
            const data = await getMyFiles();
            setFiles(data);
        } catch (error) {
            console.error("Failed to load files", error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchProjects = async () => {
        try {
            const data = await projectsApi.getProjects();
            setProjects(data);
        } catch (error) {
            console.error("Failed to load projects", error);
        }
    };

    const handleDownload = (fileUrl, originalName) => {
        window.open(`http://localhost:8080/api/files/download?fileName=${fileUrl}`, '_blank');
    };

    const handleDelete = async (projectId, fileId) => {
        if (!window.confirm("Are you sure you want to delete this file?")) return;
        try {
            await deleteProjectFile(projectId, fileId);
            setFiles(files.filter(f => f.id !== fileId));
        } catch (error) {
            console.error("Failed to delete file", error);
            alert("Error deleting file.");
        }
    };

    const handleUploadSubmit = async (e) => {
        e.preventDefault();
        if (!uploadFile || !uploadProjectId) return;
        
        try {
            setIsUploading(true);
            await uploadProjectFile(uploadProjectId, uploadFile);
            await fetchFiles(); // Refresh files list
            setShowUploadModal(false);
            setUploadFile(null);
            setUploadProjectId('');
        } catch (error) {
            console.error("Failed to upload file", error);
            alert("Error uploading file.");
        } finally {
            setIsUploading(false);
        }
    };

    const formatSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString();
    };

    const getFileIcon = (type) => {
        if (!type) return <FileText color="#6B7280" size={32} />;
        if (type.includes('pdf')) return <FileText color="#EF4444" size={32} />;
        if (type.includes('image')) return <ImageIcon color="#3B82F6" size={32} />;
        if (type.includes('zip') || type.includes('tar') || type.includes('rar') || type.includes('archive')) return <FileArchive color="#EAB308" size={32} />;
        if (type.includes('word') || type.includes('document')) return <FileText color="#3B82F6" size={32} />;
        if (type.includes('presentation') || type.includes('powerpoint')) return <FileText color="#F97316" size={32} />;
        return <FileText color="#6B7280" size={32} />;
    };

    const filteredFiles = files.filter(f => 
        (f.name && f.name.toLowerCase().includes(search.toLowerCase())) || 
        (f.projectName && f.projectName.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div className="dashboard-layout">
            <Sidebar />
            <main className="dashboard-main">
                <Header title="Files" subtitle="Access and manage all project resources" />
                <div className="dashboard-content files-content">
                    
                    <div className="files-toolbar">
                        <div className="files-search">
                            <Search size={18} color="#9CA3AF" />
                            <input 
                                type="text" 
                                placeholder="Search files or projects..." 
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <div className="files-actions">
                            <button className="btn-secondary"><Filter size={16} style={{marginRight: '8px'}} /> Filter</button>
                            <div className="view-toggle">
                                <button className={`toggle-btn ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')}>
                                    <Grid size={16} />
                                </button>
                                <button className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')}>
                                    <List size={16} />
                                </button>
                            </div>
                            <button className="btn-primary" onClick={() => setShowUploadModal(true)}>Upload File</button>
                        </div>
                    </div>

                    {isLoading ? (
                        <div style={{display: 'flex', justifyContent: 'center', padding: '40px', color: '#9ca3af'}}>
                            Loading files...
                        </div>
                    ) : filteredFiles.length === 0 ? (
                        <div style={{display: 'flex', justifyContent: 'center', padding: '40px', color: '#9ca3af'}}>
                            {search ? 'No files match your search.' : 'No files found. Upload one to get started!'}
                        </div>
                    ) : viewMode === 'grid' ? (
                        <div className="files-grid">
                            {filteredFiles.map(file => (
                                <div key={file.id} className="file-card">
                                    <div className="file-card-preview">
                                        {getFileIcon(file.type)}
                                    </div>
                                    <div className="file-card-info">
                                        <h4 title={file.name}>{file.name}</h4>
                                        <span className="file-meta">{formatSize(file.size)} • {file.projectName}</span>
                                    </div>
                                    <div className="file-card-footer">
                                        <div className="uploader-info">
                                            <div className="mini-avatar">{file.uploaderName ? file.uploaderName.charAt(0) : '?'}</div>
                                            <span>{formatDate(file.uploadDate)}</span>
                                        </div>
                                        <div className="file-actions-row">
                                            <button className="icon-btn" onClick={() => handleDownload(file.fileUrl, file.name)} title="Download"><Download size={16} /></button>
                                            <button className="icon-btn danger" onClick={() => handleDelete(file.projectId, file.id)} title="Delete"><Trash2 size={16} /></button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="files-list">
                            <table className="files-table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Project</th>
                                        <th>Size</th>
                                        <th>Uploaded By</th>
                                        <th>Date</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredFiles.map(file => (
                                        <tr key={file.id}>
                                            <td className="file-name-cell">
                                                {React.cloneElement(getFileIcon(file.type), { size: 20 })}
                                                <span>{file.name}</span>
                                            </td>
                                            <td><span className="project-badge">{file.projectName}</span></td>
                                            <td className="text-gray">{formatSize(file.size)}</td>
                                            <td>{file.uploaderName}</td>
                                            <td className="text-gray">{formatDate(file.uploadDate)}</td>
                                            <td className="actions-cell">
                                                <button className="icon-btn" onClick={() => handleDownload(file.fileUrl, file.name)} title="Download"><Download size={16} /></button>
                                                <button className="icon-btn danger" onClick={() => handleDelete(file.projectId, file.id)} title="Delete"><Trash2 size={16} /></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>

            {/* Upload File Modal */}
            {showUploadModal && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{maxWidth: '400px'}}>
                        <div className="modal-header">
                            <h2>Upload File</h2>
                            <button className="close-btn" onClick={() => setShowUploadModal(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <form className="modal-form" onSubmit={handleUploadSubmit}>
                            <div className="form-group">
                                <label>Target Project</label>
                                <select 
                                    value={uploadProjectId} 
                                    onChange={(e) => setUploadProjectId(e.target.value)}
                                    required
                                    className="form-input"
                                >
                                    <option value="" disabled>Select a project</option>
                                    {projects.map(p => (
                                        <option key={p.id} value={p.id}>{p.title}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>File</label>
                                <input 
                                    type="file" 
                                    onChange={(e) => setUploadFile(e.target.files[0])}
                                    required
                                    className="form-input"
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn-secondary" onClick={() => setShowUploadModal(false)}>Cancel</button>
                                <button type="submit" className="btn-primary" disabled={isUploading || !uploadFile || !uploadProjectId}>
                                    {isUploading ? 'Uploading...' : 'Upload'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FilesPage;
