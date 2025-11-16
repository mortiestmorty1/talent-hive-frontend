import React, { useState, useEffect } from "react";
import axios from "axios";
import { useCookies } from "react-cookie";
import { APPLY_JOB_ROUTE, GET_JOB_ROUTE } from "../utils/constants";
import { toast } from "react-toastify";
import { FaUser } from "react-icons/fa";

function ApplicationSystem({ jobId, onApplied }) {
  const [cookies] = useCookies();
  const [proposal, setProposal] = useState("");
  const [bidAmount, setBidAmount] = useState("");
  const [timeline, setTimeline] = useState("");
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  const input = "block p-3 w-full text-sm border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500";
  const label = "mb-2 text-sm font-medium text-gray-900";

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        const { data } = await axios.get(`${GET_JOB_ROUTE}/${jobId}`, {
          headers: { Authorization: `Bearer ${cookies.jwt}` }
        });
        setJob(data);
      } catch (error) {
        console.error('Error fetching job details:', error);
        toast.error('Failed to load job details');
      } finally {
        setLoading(false);
      }
    };

    if (jobId) {
      fetchJobDetails();
    }
  }, [jobId, cookies.jwt]);

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

  if (loading) {
    return (
      <div className="w-full max-w-3xl flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="w-full max-w-3xl flex items-center justify-center py-8">
        <div className="text-center">
          <p className="text-red-600">Failed to load job details. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl">
      <h3 className="text-xl font-semibold mb-4">Apply to Job</h3>

      {/* Buyer Information Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-center mb-2">
          <FaUser className="text-blue-600 mr-2" />
          <h4 className="text-lg font-medium text-blue-900">Job Posted By</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Buyer Name</label>
            <p className="text-gray-900 font-semibold">{job.client?.fullName || 'N/A'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Buyer ID</label>
            <p className="text-gray-900 font-mono text-sm">{job.client?.id || 'N/A'}</p>
          </div>
        </div>
      </div>

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


