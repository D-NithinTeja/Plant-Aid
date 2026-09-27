import api from './api';

export const inferenceService = {
  /**
   * Sends base64 video frame to the ephemeral stream inference endpoint.
   * Does not persist records to database.
   */
  async streamFrame(base64Image) {
    const payload = {
      mime_type: 'image/jpeg',
      encoding: 'base64',
      image_b64: base64Image,
      capture_timestamp: new Date().toISOString(),
    };
    const response = await api.post('/inference/frame', payload);
    return response.data;
  },

  /**
   * Uploads an image file or form payload to /inference/predict.
   */
  async predictUpload(file) {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/inference/predict', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Explicitly logs a confirmed diagnosis to the user's history log.
   */
  async logDiagnosis(diseaseId, diseaseName, confidenceScore, s3Uri, boundingBox) {
    const payload = {
      disease_id: String(diseaseId),
      disease_name: diseaseName,
      confidence_score: confidenceScore,
      s3_storage_uri: s3Uri || 'uploads/local_frame.jpg',
      bounding_box: boundingBox || null,
    };
    const response = await api.post('/history', payload);
    return response.data;
  },
};
