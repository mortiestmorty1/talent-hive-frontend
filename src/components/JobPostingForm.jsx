import React, { useState } from "react";
import axios from "axios";
import { useCookies } from "react-cookie";
import { CREATE_JOB_ROUTE } from "../utils/constants";
import { toast } from "react-toastify";
import { useRouter } from "next/router";

const complexities = ["LOW", "MEDIUM", "HIGH"];

function JobPostingForm({ onCreated }) {
  const [cookies] = useCookies();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [requiredSkills, setRequiredSkills] = useState("");
  const [budget, setBudget] = useState("");
  const [timeline, setTimeline] = useState("");
  const [complexity, setComplexity] = useState(complexities[0]);

  const input = "block p-3 w-full text-sm border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500";
  const label = "mb-2 text-sm font-medium text-gray-900";

  const submit = async () => {
    try {
      const payload = {
        title,
        description,
        requiredSkills: requiredSkills.split(",").map((s) => s.trim()).filter(Boolean),
        budget: Number(budget),
        timeline,
        complexity,
      };
      const { data } = await axios.post(CREATE_JOB_ROUTE, payload, { headers: { Authorization: `Bearer ${cookies.jwt}` } });
      toast.success("Job created successfully!");
      
      // Redirect to the job details page
      if (data && data.id) {
        router.push(`/jobs/${data.id}`);
      } else {
        router.push('/jobs/my-jobs'); // Fallback to my jobs page
      }
      
      onCreated && onCreated(data);
    } catch (e) {
      toast.error(e?.response?.data || "Failed to create job");
    }
  };

  return (
    <div className="w-full max-w-3xl">
      <h3 className="text-xl font-semibold mb-2">Create Job Posting</h3>
      <div className="grid grid-cols-1 gap-3">
        <div>
          <label className={label}>Title</label>
          <input className={input} value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div>
          <label className={label}>Description</label>
          <textarea className={input} value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div>
          <label className={label}>Required Skills (comma-separated)</label>
          <input className={input} value={requiredSkills} onChange={(e) => setRequiredSkills(e.target.value)} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className={label}>Budget</label>
            <input className={input} type="number" min="0" value={budget} onChange={(e) => setBudget(e.target.value)} />
          </div>
          <div>
            <label className={label}>Timeline</label>
            <input className={input} value={timeline} onChange={(e) => setTimeline(e.target.value)} placeholder="2-4 weeks" />
          </div>
          <div>
            <label className={label}>Complexity</label>
            <select className={input} value={complexity} onChange={(e) => setComplexity(e.target.value)}>
              {complexities.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <button className="border text-sm font-semibold px-4 py-2 border-[#1DBF73] bg-[#1DBF73] text-white rounded-md" type="button" onClick={submit}>Create Job</button>
        </div>
      </div>
    </div>
  );
}

export default JobPostingForm;


