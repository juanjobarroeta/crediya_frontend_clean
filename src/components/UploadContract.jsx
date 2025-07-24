import React, { useState } from "react";
import axios from "axios";

const UploadContract = ({ loanId, onSuccess }) => {
  const [file, setFile] = useState(null);
  const token = localStorage.getItem("token");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/loans/${loanId}/upload-contract`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      alert("✅ Contrato subido correctamente");
      setFile(null);
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error("Error uploading contract:", err);
      alert("❌ Error al subir contrato");
    }
  };

  return (
    <div className="d-flex flex-column gap-2 mt-2">
      <input type="file" onChange={handleFileChange} className="form-control form-control-sm" />
      <button className="btn btn-outline-primary btn-sm" onClick={handleUpload}>
        📤 Subir contrato
      </button>
    </div>
  );
};

export default UploadContract;
