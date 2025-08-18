import apiService from './api.service';
import { toast } from 'react-toastify';

class FileService {
  async uploadFile(file, fieldName) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await apiService.post('/file/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data && response.data.path) {
        return response.data.path;
      } else {
        throw new Error('File uploaded but path not returned');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Failed to upload file. Please try again.', {
        position: 'top-center',
        autoClose: 5000
      });
      throw error;
    }
  }

  async uploadDocument(file, studentId) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await apiService.post(`/file/uploadDocument/${studentId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error;
    }
  }

  async uploadS3File(file) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await apiService.post('/file/uploadS3File', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error uploading to S3:', error);
      throw error;
    }
  }

  async getFilesList(userId) {
    try {
      const response = await apiService.get(`/file/list/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching files list:', error);
      throw error;
    }
  }
}

const fileService = new FileService();

export default fileService;