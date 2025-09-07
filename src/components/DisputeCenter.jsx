import React, { useEffect, useState } from "react";
import axios from "axios";
import { useCookies } from "react-cookie";
import { FaCheckCircle } from "react-icons/fa";
import {
  OPEN_DISPUTE_ROUTE,
  LIST_MY_DISPUTES_ROUTE,
  ASSIGN_MEDIATOR_ROUTE,
  UPDATE_DISPUTE_STATUS_ROUTE,
  RESOLVE_DISPUTE_ROUTE,
} from "../utils/constants";
import { toast } from "react-toastify";
import EvidenceUpload from "./EvidenceUpload";
import MediationChat from "./MediationChat";

function DisputeCenter() {
  const [cookies] = useCookies();
  const [orderId, setOrderId] = useState("");
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [disputes, setDisputes] = useState([]);
  const [selected, setSelected] = useState(null);
  const [mediatorId, setMediatorId] = useState("");
  const [status, setStatus] = useState("UNDER_REVIEW");
  const [resolution, setResolution] = useState("");

  const input = "block p-3 w-full text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500";
  const label = "mb-2 text-sm font-medium text-[#404145]";

  const refresh = async () => {
    try {
      console.log("Fetching disputes...");
      const { data } = await axios.get(LIST_MY_DISPUTES_ROUTE, { headers: { Authorization: `Bearer ${cookies.jwt}` } });
      console.log("Disputes fetched:", data);
      setDisputes(data || []);
    } catch (error) {
      console.error("Error fetching disputes:", error);
      console.error("Error response:", error.response?.data);
      toast.error("Failed to load disputes. Please try again.");
      setDisputes([]);
    }
  };

  useEffect(() => { if (cookies.jwt) refresh(); }, [cookies]);

  const open = async () => {
    try {
      const { data } = await axios.post(OPEN_DISPUTE_ROUTE, { orderId, reason, description }, { headers: { Authorization: `Bearer ${cookies.jwt}` } });
      toast.success("Dispute opened");
      setOrderId(""); setReason(""); setDescription("");
      setSelected(data);
      refresh();
    } catch (e) {
      toast.error(e?.response?.data || "Failed to open dispute");
    }
  };

  const assign = async () => {
    try {
      const { data } = await axios.post(`${ASSIGN_MEDIATOR_ROUTE}/${selected.id}`, { mediatorId }, { headers: { Authorization: `Bearer ${cookies.jwt}` } });
      toast.success("Mediator assigned");
      setSelected(data);
      refresh();
    } catch (e) {
      toast.error(e?.response?.data || "Failed to assign mediator");
    }
  };

  const update = async () => {
    try {
      const { data } = await axios.put(`${UPDATE_DISPUTE_STATUS_ROUTE}/${selected.id}`, { status }, { headers: { Authorization: `Bearer ${cookies.jwt}` } });
      toast.success("Status updated");
      setSelected(data);
      refresh();
    } catch (e) {
      toast.error(e?.response?.data || "Failed to update status");
    }
  };

  const resolve = async () => {
    try {
      const { data } = await axios.put(`${RESOLVE_DISPUTE_ROUTE}/${selected.id}`, { resolution }, { headers: { Authorization: `Bearer ${cookies.jwt}` } });
      toast.success("Dispute resolved");
      setSelected(data);
      refresh();
    } catch (e) {
      toast.error(e?.response?.data || "Failed to resolve");
    }
  };

  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-8 p-6">
      <div className="md:col-span-1 bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 rounded-xl p-6 shadow-lg">
        <h3 className="text-2xl font-semibold text-[#404145] mb-6">Open a Dispute</h3>
        <div className="grid grid-cols-1 gap-2">
          <div>
            <label className={label}>Order ID</label>
            <input className={input} value={orderId} onChange={(e) => setOrderId(e.target.value)} placeholder="Order ID" />
          </div>
          <div>
            <label className={label}>Reason</label>
            <input className={input} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason" />
          </div>
          <div>
            <label className={label}>Description</label>
            <textarea className={input} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the issue" />
          </div>
          <button className="border text-sm font-semibold px-6 py-3 border-[#1DBF73] bg-[#1DBF73] text-white rounded-lg hover:bg-[#18a65c] transition-colors" type="button" onClick={open}>Open Dispute</button>
        </div>
        <h3 className="text-xl font-semibold text-[#404145] mt-8 mb-4">My Disputes</h3>
        <div className="flex flex-col gap-3">
          {disputes.map((d) => {
            // Determine all parties involved with better logic
            const parties = [];
            
            // Always show the buyer and seller from the order
            if (d.order?.buyer) {
              const isBuyerInitiator = d.initiator?.id === d.order.buyer.id;
              parties.push({ 
                role: isBuyerInitiator ? 'Buyer (Initiator)' : 'Buyer', 
                user: d.order.buyer,
                isInitiator: isBuyerInitiator
              });
            }
            
            if (d.order?.gig?.user) {
              const isSellerInitiator = d.initiator?.id === d.order.gig.user.id;
              parties.push({ 
                role: isSellerInitiator ? 'Seller (Initiator)' : 'Seller', 
                user: d.order.gig.user,
                isInitiator: isSellerInitiator
              });
            }
            
            // Add mediator if assigned
            if (d.mediator) {
              parties.push({ role: 'Mediator', user: d.mediator, isMediator: true });
            }

            // Status color logic
            const getStatusColor = (status) => {
              switch(status) {
                case 'RESOLVED': return 'bg-green-100 text-green-800 border-green-200';
                case 'MEDIATION': return 'bg-blue-100 text-blue-800 border-blue-200';
                case 'UNDER_REVIEW': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
                case 'CLOSED': return 'bg-gray-100 text-gray-800 border-gray-200';
                default: return 'bg-red-100 text-red-800 border-red-200';
              }
            };

            return (
              <button key={d.id} className={`text-left p-4 border-2 rounded-xl transition-all duration-200 ${selected?.id === d.id ? "bg-blue-50 border-blue-300 shadow-md" : "bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300"}`} onClick={() => setSelected(d)}>
                <div className="flex justify-between items-start mb-3">
                  <div className="font-semibold text-[#404145] text-lg">{d.reason}</div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(d.status)}`}>
                    {d.status}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  {parties.map((party, index) => (
                    <div key={index} className={`p-2 rounded-lg border ${
                      party.isInitiator ? 'bg-red-50 border-red-200' :
                      party.isMediator ? 'bg-purple-50 border-purple-200' :
                      party.role.includes('Buyer') ? 'bg-blue-50 border-blue-200' :
                      'bg-green-50 border-green-200'
                    }`}>
                      <div className={`text-xs font-medium mb-1 ${
                        party.isInitiator ? 'text-red-700' :
                        party.isMediator ? 'text-purple-700' :
                        party.role.includes('Buyer') ? 'text-blue-700' :
                        'text-green-700'
                      }`}>
                        {party.role}
                      </div>
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">{party.user.fullName || party.user.username}</div>
                        <div className="text-gray-600 text-xs">{party.user.email}</div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {d.order?.gig && (
                  <div className="text-xs text-gray-600 mb-2">
                    <span className="font-medium">Gig:</span> {d.order.gig.title}
                  </div>
                )}
                
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>Created: {new Date(d.createdAt).toLocaleDateString()}</span>
                  <span>Order ID: {d.orderId.slice(-8)}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
      <div className="md:col-span-2 bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-xl p-6 shadow-lg">
        {selected ? (
          <div className="grid grid-cols-1 gap-6">
            {/* Dispute Details Header */}
            <div className="border-b pb-4">
              <h3 className="text-2xl font-semibold text-[#404145] mb-3">Dispute Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600">Reason</div>
                  <div className="font-medium text-[#404145]">{selected.reason}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Status</div>
                  <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                    selected.status === 'RESOLVED' ? 'bg-green-100 text-green-800' :
                    selected.status === 'MEDIATION' ? 'bg-blue-100 text-blue-800' :
                    selected.status === 'UNDER_REVIEW' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {selected.status}
                  </div>
                </div>
              </div>
              {selected.description && (
                <div className="mt-3">
                  <div className="text-sm text-gray-600">Description</div>
                  <div className="text-gray-700">{selected.description}</div>
                </div>
              )}
            </div>

            {/* Parties Involved Section */}
            <div className="border-b pb-4">
              <h4 className="text-lg font-semibold text-[#404145] mb-3">Parties Involved</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Initiator */}
                {selected.initiator && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="text-sm font-medium text-red-800 mb-2">Dispute Initiator</div>
                    <div className="text-sm">
                      <div className="font-medium">{selected.initiator.fullName || selected.initiator.username}</div>
                      <div className="text-gray-600">{selected.initiator.email}</div>
                      <div className="text-xs text-gray-500">@{selected.initiator.username}</div>
                    </div>
                  </div>
                )}

                {/* Buyer */}
                {selected.order?.buyer && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="text-sm font-medium text-blue-800 mb-2">Buyer</div>
                    <div className="text-sm">
                      <div className="font-medium">{selected.order.buyer.fullName || selected.order.buyer.username}</div>
                      <div className="text-gray-600">{selected.order.buyer.email}</div>
                      <div className="text-xs text-gray-500">@{selected.order.buyer.username}</div>
                    </div>
                  </div>
                )}

                {/* Seller */}
                {selected.order?.gig?.user && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="text-sm font-medium text-green-800 mb-2">Seller</div>
                    <div className="text-sm">
                      <div className="font-medium">{selected.order.gig.user.fullName || selected.order.gig.user.username}</div>
                      <div className="text-gray-600">{selected.order.gig.user.email}</div>
                      <div className="text-xs text-gray-500">@{selected.order.gig.user.username}</div>
                    </div>
                  </div>
                )}

                {/* Mediator */}
                {selected.mediator && (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                    <div className="text-sm font-medium text-purple-800 mb-2">Mediator</div>
                    <div className="text-sm">
                      <div className="font-medium">{selected.mediator.fullName || selected.mediator.username}</div>
                      <div className="text-gray-600">{selected.mediator.email}</div>
                      <div className="text-xs text-gray-500">@{selected.mediator.username}</div>
                    </div>
                  </div>
                )}
              </div>
              {selected.resolution && (
                <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="text-sm font-medium text-green-800 mb-2">Resolution</div>
                  <div className="text-sm text-gray-700">{selected.resolution}</div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className={label}>Mediator ID</label>
                <input className={input} value={mediatorId} onChange={(e) => setMediatorId(e.target.value)} placeholder="User ID of mediator" />
                <button className="mt-2 border text-sm font-semibold px-4 py-2 border-blue-500 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors" type="button" onClick={assign}>Assign</button>
              </div>
              <div>
                <label className={label}>Status</label>
                <select className={input} value={status} onChange={(e) => setStatus(e.target.value)}>
                  {['OPENED','UNDER_REVIEW','MEDIATION','RESOLVED','CLOSED'].map((s)=> <option key={s} value={s}>{s}</option>)}
                </select>
                <button className="mt-2 border text-sm font-semibold px-4 py-2 border-yellow-500 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors" type="button" onClick={update}>Update</button>
              </div>
              <div>
                <label className={label}>Resolution</label>
                <input className={input} value={resolution} onChange={(e) => setResolution(e.target.value)} placeholder="Resolution text" />
                <button className="mt-2 border text-sm font-semibold px-4 py-2 border-green-600 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors" type="button" onClick={resolve}>Resolve</button>
              </div>
            </div>
            <EvidenceUpload disputeId={selected.id} onUploaded={setSelected} />
            <MediationChat disputeId={selected.id} />
          </div>
        ) : selected && selected.status === 'CLOSED' ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4 text-green-500">
              <FaCheckCircle />
            </div>
            <h4 className="text-2xl font-semibold text-[#404145] mb-4">Dispute Closed Successfully</h4>
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 max-w-md mx-auto">
              <p className="text-green-800 font-medium mb-2">This dispute has been resolved and closed.</p>
              <p className="text-green-700 text-sm">
                All parties have been notified and the case is now complete.
              </p>
              {selected.resolution && (
                <div className="mt-4 p-3 bg-white border border-green-200 rounded-lg">
                  <p className="text-sm font-medium text-gray-800 mb-1">Final Resolution:</p>
                  <p className="text-sm text-gray-700">{selected.resolution}</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8">
            <h4 className="text-lg font-medium text-[#404145] mb-2">No Dispute Selected</h4>
            <p>Select a dispute from the list to manage it</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default DisputeCenter;


