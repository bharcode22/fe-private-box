import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useFileUpload } from '../hooks/useFileUpload';
import { BackgroundUploadWidget } from '../components/dashboard/BackgroundUploadWidget';
import { BackgroundDeleteWidget } from '../components/dashboard/BackgroundDeleteWidget';

interface GlobalProgressContextType {
  uploadState: ReturnType<typeof useFileUpload>;

  deleting: boolean;
  setDeleting: React.Dispatch<React.SetStateAction<boolean>>;
  deleteProgress: number;
  setDeleteProgress: React.Dispatch<React.SetStateAction<number>>;
  deleteItemCount: number;
  setDeleteItemCount: React.Dispatch<React.SetStateAction<number>>;
  deleteCurrentIndex: number;
  setDeleteCurrentIndex: React.Dispatch<React.SetStateAction<number>>;
  deleteCurrentName: string;
  setDeleteCurrentName: React.Dispatch<React.SetStateAction<string>>;
  deleteStatusMessage: string;
  setDeleteStatusMessage: React.Dispatch<React.SetStateAction<string>>;
}

const GlobalProgressContext = createContext<GlobalProgressContextType | null>(null);

export const GlobalProgressProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const uploadState = useFileUpload();
  
  const [deleting, setDeleting] = useState(false);
  const [deleteProgress, setDeleteProgress] = useState(0);
  const [deleteItemCount, setDeleteItemCount] = useState(0);
  const [deleteCurrentIndex, setDeleteCurrentIndex] = useState(0);
  const [deleteCurrentName, setDeleteCurrentName] = useState('');
  const [deleteStatusMessage, setDeleteStatusMessage] = useState('');

  return (
    <GlobalProgressContext.Provider value={{
      uploadState,
      deleting, setDeleting,
      deleteProgress, setDeleteProgress,
      deleteItemCount, setDeleteItemCount,
      deleteCurrentIndex, setDeleteCurrentIndex,
      deleteCurrentName, setDeleteCurrentName,
      deleteStatusMessage, setDeleteStatusMessage
    }}>
      {children}
      
      {/* Global Background Widgets */}
      <BackgroundUploadWidget
        uploading={uploadState.uploading}
        uploadProgress={uploadState.uploadProgress}
        fileCount={uploadState.uploadFileCount}
        currentFileIndex={uploadState.currentFileIndex}
        currentFileName={uploadState.currentFileName}
        fileProgressPercent={uploadState.fileProgressPercent}
        statusMessage={uploadState.statusMessage}
        targetFolderName={uploadState.uploadTargetFolderName}
        onCancelUpload={() => uploadState.handleCancelUpload((msg) => console.log(msg))}
      />

      <BackgroundDeleteWidget
        deleting={deleting}
        deleteProgress={deleteProgress}
        itemCount={deleteItemCount}
        currentItemIndex={deleteCurrentIndex}
        currentItemName={deleteCurrentName}
        statusMessage={deleteStatusMessage}
      />
    </GlobalProgressContext.Provider>
  );
};

export const useGlobalProgress = () => {
  const context = useContext(GlobalProgressContext);
  if (!context) {
    throw new Error('useGlobalProgress must be used within a GlobalProgressProvider');
  }
  return context;
};
