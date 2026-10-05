import React, { useState, useRef } from 'react';
import { uploadProjectFile } from '../../api/files';
import './FileUpload.css';

const FileUpload = ({ projectId, onUploadSuccess, onUploadError }) => {
    const [isUploading, setIsUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef(null);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const onButtonClick = () => {
        fileInputRef.current.click();
    };

    const handleFile = async (file) => {
        if (!projectId) {
            console.error("Project ID is missing!");
            if (onUploadError) onUploadError("ID проекта не передан");
            return;
        }

        setIsUploading(true);
        try {
            const data = await uploadProjectFile(projectId, file);
            if (onUploadSuccess) onUploadSuccess(data);
        } catch (error) {
            console.error("Upload failed", error);
            if (onUploadError) onUploadError(error.message || "Ошибка при загрузке");
        } finally {
            setIsUploading(false);
            // Reset input
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    return (
        <div className="file-upload-wrapper">
            <form 
                className={`file-upload-form ${dragActive ? "drag-active" : ""}`} 
                onDragEnter={handleDrag} 
                onDragLeave={handleDrag} 
                onDragOver={handleDrag} 
                onDrop={handleDrop}
                onSubmit={(e) => e.preventDefault()}
            >
                <input 
                    ref={fileInputRef} 
                    type="file" 
                    className="file-upload-input" 
                    onChange={handleChange} 
                />
                
                <div className="file-upload-content">
                    {isUploading ? (
                        <p>Загрузка файла...</p>
                    ) : (
                        <>
                            <p>Перетащите файл сюда или</p>
                            <button type="button" className="file-upload-button" onClick={onButtonClick}>
                                Выберите файл
                            </button>
                        </>
                    )}
                </div>
            </form>
        </div>
    );
};

export default FileUpload;
