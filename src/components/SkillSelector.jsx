import React, { useState } from "react";

const levels = ["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"];

function SkillSelector({ skills = [], onAdd, onUpdate, onRemove }) {
  const [form, setForm] = useState({ skillName: "", level: levels[0], yearsOfExperience: "" });

  const input = "block p-3 w-full text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500";
  const label = "mb-2 text-sm font-medium text-[#404145]";

  return (
    <div className="w-full bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <h3 className="text-2xl font-semibold text-[#404145] mb-6">Skills & Expertise</h3>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div>
          <label className={label}>Skill</label>
          <input className={input} value={form.skillName} onChange={(e) => setForm({ ...form, skillName: e.target.value })} placeholder="e.g. React" />
        </div>
        <div>
          <label className={label}>Level</label>
          <select className={input} value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })}>
            {levels.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={label}>Years</label>
          <input className={input} type="number" min="0" value={form.yearsOfExperience} onChange={(e) => setForm({ ...form, yearsOfExperience: e.target.value })} placeholder="2" />
        </div>
        <div className="flex items-end">
          <button
            className="border text-sm font-semibold px-6 py-3 border-[#1DBF73] bg-[#1DBF73] text-white rounded-lg w-full hover:bg-[#18a65c] transition-colors"
            type="button"
            onClick={() => onAdd({ ...form, yearsOfExperience: form.yearsOfExperience ? Number(form.yearsOfExperience) : undefined })}
          >
            Add Skill
          </button>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4">
        {skills.map((s, i) => (
          <div key={`${s.skillName}-${i}`} className="p-4 border border-gray-200 rounded-lg bg-gray-50 flex flex-col md:flex-row gap-4 items-center md:items-end">
            <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-3 gap-3">
              <input className={input} defaultValue={s.skillName} onBlur={(e) => onUpdate(i, { skillName: e.target.value })} />
              <select className={input} defaultValue={s.level} onChange={(e) => onUpdate(i, { level: e.target.value })}>
                {levels.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
              <input className={input} type="number" min="0" defaultValue={s.yearsOfExperience || ""} onBlur={(e) => onUpdate(i, { yearsOfExperience: e.target.value ? Number(e.target.value) : undefined })} placeholder="Years" />
            </div>
            <button className="border px-4 py-2 rounded-lg text-red-600 border-red-300 hover:bg-red-50 transition-colors" type="button" onClick={() => onRemove(i)}>Remove</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SkillSelector;


