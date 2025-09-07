import React, { useState } from "react";

function CertificationUpload({ certifications = [], onAdd, onUpdate, onRemove }) {
  const [form, setForm] = useState({ name: "", issuer: "", issueDate: "", expiryDate: "", credentialId: "", credentialUrl: "" });

  const input = "block p-3 w-full text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500";
  const label = "mb-2 text-sm font-medium text-[#404145]";

  return (
    <div className="w-full bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <h3 className="text-2xl font-semibold text-[#404145] mb-6">Certifications</h3>
      <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
        <div className="md:col-span-2">
          <label className={label}>Name</label>
          <input className={input} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="AWS Certified Developer" />
        </div>
        <div>
          <label className={label}>Issuer</label>
          <input className={input} value={form.issuer} onChange={(e) => setForm({ ...form, issuer: e.target.value })} placeholder="Amazon" />
        </div>
        <div>
          <label className={label}>Issue Date</label>
          <input className={input} type="date" value={form.issueDate} onChange={(e) => setForm({ ...form, issueDate: e.target.value })} />
        </div>
        <div>
          <label className={label}>Expiry Date</label>
          <input className={input} type="date" value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} />
        </div>
        <div>
          <label className={label}>Credential ID</label>
          <input className={input} value={form.credentialId} onChange={(e) => setForm({ ...form, credentialId: e.target.value })} />
        </div>
        <div>
          <label className={label}>Credential URL</label>
          <input className={input} value={form.credentialUrl} onChange={(e) => setForm({ ...form, credentialUrl: e.target.value })} />
        </div>
        <div className="md:col-span-6 flex items-end">
          <button
            className="border text-sm font-semibold px-6 py-3 border-[#1DBF73] bg-[#1DBF73] text-white rounded-lg w-full hover:bg-[#18a65c] transition-colors"
            type="button"
            onClick={() => onAdd(form)}
          >
            Add Certification
          </button>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4">
        {certifications.map((c, i) => (
          <div key={`${c.name}-${i}`} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-3">
              <input className={input} defaultValue={c.name} onBlur={(e) => onUpdate(i, { name: e.target.value })} placeholder="Certification name" />
              <input className={input} defaultValue={c.issuer || ""} onBlur={(e) => onUpdate(i, { issuer: e.target.value })} placeholder="Issuing organization" />
              <input className={input} type="date" defaultValue={c.issueDate ? String(c.issueDate).slice(0, 10) : ""} onBlur={(e) => onUpdate(i, { issueDate: e.target.value })} />
              <input className={input} type="date" defaultValue={c.expiryDate ? String(c.expiryDate).slice(0, 10) : ""} onBlur={(e) => onUpdate(i, { expiryDate: e.target.value })} />
              <input className={input} defaultValue={c.credentialId || ""} onBlur={(e) => onUpdate(i, { credentialId: e.target.value })} placeholder="Credential ID" />
            </div>
            <div className="flex gap-2 items-center">
              <input className={input + " flex-1"} defaultValue={c.credentialUrl || ""} onBlur={(e) => onUpdate(i, { credentialUrl: e.target.value })} placeholder="Credential URL" />
              <button className="border px-4 py-2 rounded-lg text-red-600 border-red-300 hover:bg-red-50 transition-colors" type="button" onClick={() => onRemove(i)}>Remove</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CertificationUpload;


