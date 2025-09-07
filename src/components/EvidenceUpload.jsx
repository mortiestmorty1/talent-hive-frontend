import React, { useState } from "react";
import axios from "axios";
import { useCookies } from "react-cookie";
import { UPLOAD_EVIDENCE_ROUTE } from "../utils/constants";
import { toast } from "react-toastify";

function EvidenceUpload({ disputeId, onUploaded }) {
  const [cookies] = useCookies();
  const [files, setFiles] = useState([]);

  const input = "block p-3 w-full text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500";
  const label = "mb-2 text-sm font-medium text-[#404145]";
  
  const submit = async () => {
    try {
      const fd = new FormData();
      files.forEach((f) => fd.append("evidence", f));
      const { data } = await axios.post(`${UPLOAD_EVIDENCE_ROUTE}/${disputeId}`, fd, {
        headers: { Authorization: `Bearer ${cookies.jwt}` },
      });
      toast.success("Evidence uploaded");
      setFiles([]);
      onUploaded && onUploaded(data);
    } catch (e) {
      toast.error(e?.response?.data || "Upload failed");
    }
  };

  return (
    <div className="w-full bg-gray-50 border border-gray-200 rounded-lg p-4">
      <h4 className="text-lg font-semibold text-[#404145] mb-4">Evidence Upload</h4>
      <div className="space-y-3">
        <div>
          <label className={label}>Select Files</label>
          <input className={input} type="file" multiple onChange={(e) => setFiles(Array.from(e.target.files || []))} />
        </div>
        <button className="border text-sm font-semibold px-6 py-3 border-[#1DBF73] bg-[#1DBF73] text-white rounded-lg hover:bg-[#18a65c] transition-colors" type="button" onClick={submit}>Upload Evidence</button>
      </div>
    </div>
  );
}

export default EvidenceUpload;


