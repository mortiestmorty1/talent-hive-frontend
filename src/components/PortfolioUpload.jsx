import React, { useState } from "react";
import { IMAGES_URL } from "../utils/constants";

function PortfolioUpload({ portfolio = [], onAdd, onUpdate, onRemove }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [projectUrl, setProjectUrl] = useState("");
  const [technologies, setTechnologies] = useState("");
  const [images, setImages] = useState([]);

  const input = "block p-3 w-full text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500";
  const label = "mb-2 text-sm font-medium text-[#404145]";

  const submit = async () => {
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("projectUrl", projectUrl);
    formData.append("technologies", technologies);
    images.forEach((f) => formData.append("images", f));
    onAdd(formData);
    setTitle("");
    setDescription("");
    setProjectUrl("");
    setTechnologies("");
    setImages([]);
  };

  return (
    <div className="w-full bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <h3 className="text-2xl font-semibold text-[#404145] mb-6">Portfolio</h3>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        <div>
          <label className={label}>Title</label>
          <input className={input} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Project X" />
        </div>
        <div>
          <label className={label}>Project URL</label>
          <input className={input} value={projectUrl} onChange={(e) => setProjectUrl(e.target.value)} placeholder="https://..." />
        </div>
        <div className="md:col-span-2">
          <label className={label}>Technologies (comma-separated)</label>
          <input className={input} value={technologies} onChange={(e) => setTechnologies(e.target.value)} placeholder="React, Node, MongoDB" />
        </div>
        <div>
          <label className={label}>Images</label>
          <input className={input} type="file" multiple onChange={(e) => setImages(Array.from(e.target.files || []))} />
        </div>
        <div className="md:col-span-5">
          <label className={label}>Description</label>
          <textarea className={input} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Short description..." />
        </div>
        <div className="md:col-span-5">
          <button className="border text-sm font-semibold px-6 py-3 border-[#1DBF73] bg-[#1DBF73] text-white rounded-lg hover:bg-[#18a65c] transition-colors" type="button" onClick={submit}>Add Portfolio Item</button>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6">
        {portfolio.map((p, i) => (
          <div key={`${p.title}-${i}`} className="p-6 border border-gray-200 rounded-lg bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <input className={input} defaultValue={p.title} onBlur={(e) => onUpdate(i, new FormData().append("title", e.target.value))} placeholder="Project title" />
              <input className={input} defaultValue={p.projectUrl || ""} onBlur={(e) => onUpdate(i, new FormData().append("projectUrl", e.target.value))} placeholder="Project URL" />
              <input className={input} defaultValue={(p.technologies || []).join(", ")} onBlur={(e) => onUpdate(i, new FormData().append("technologies", e.target.value))} placeholder="Technologies" />
              <div className="flex gap-2">
                <input className={input + " flex-1"} type="file" multiple onChange={(e) => {
                  const fd = new FormData();
                  Array.from(e.target.files || []).forEach((f) => fd.append("images", f));
                  fd.append("replaceImages", "true");
                  onUpdate(i, fd);
                }} />
                <button className="border px-4 py-2 rounded-lg text-red-600 border-red-300 hover:bg-red-50 transition-colors" type="button" onClick={() => onRemove(i)}>Remove</button>
              </div>
            </div>
            {(p.imageUrls || []).length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {(p.imageUrls || []).map((src, idx) => (
                  <img key={`${src}-${idx}`} src={`${IMAGES_URL}/${src.replace(/^uploads\//, "")}`} alt={p.title} className="w-full h-32 object-cover rounded-lg shadow-sm" />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default PortfolioUpload;


