import React, { useState } from "react";
import axios from "axios";
import { useCookies } from "react-cookie";
import { APPLY_JOB_ROUTE } from "../utils/constants";
import { toast } from "react-toastify";

function ApplicationSystem({ jobId, onApplied }) {
  const [cookies] = useCookies();
  const [proposal, setProposal] = useState("");
  const [bidAmount, setBidAmount] = useState("");
  const [timeline, setTimeline] = useState("");

  const input = "block p-3 w-full text-sm border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500";
  const label = "mb-2 text-sm font-medium text-gray-900";

  const submit = async () => {
    try {
      const payload = { jobId, proposal, bidAmount: Number(bidAmount), timeline };
      const { data } = await axios.post(APPLY_JOB_ROUTE, payload, { headers: { Authorization: `Bearer ${cookies.jwt}` } });
      toast.success("Applied successfully");
      onApplied && onApplied(data);
    } catch (e) {
      toast.error(e?.response?.data || "Failed to apply");
    }
  };

  return (
    <div className="w-full max-w-3xl">
      <h3 className="text-xl font-semibold mb-2">Apply to Job</h3>
      <div className="grid grid-cols-1 gap-3">
        <div>
          <label className={label}>Proposal</label>
          <textarea className={input} value={proposal} onChange={(e) => setProposal(e.target.value)} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className={label}>Bid Amount</label>
            <input className={input} type="number" min="0" value={bidAmount} onChange={(e) => setBidAmount(e.target.value)} />
          </div>
          <div>
            <label className={label}>Timeline</label>
            <input className={input} value={timeline} onChange={(e) => setTimeline(e.target.value)} placeholder="2-3 weeks" />
          </div>
        </div>
        <div>
          <button className="border text-sm font-semibold px-4 py-2 border-[#1DBF73] bg-[#1DBF73] text-white rounded-md" type="button" onClick={submit}>Submit Application</button>
        </div>
      </div>
    </div>
  );
}

export default ApplicationSystem;


