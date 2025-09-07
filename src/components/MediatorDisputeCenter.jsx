import React, { useEffect, useState } from "react";
import axios from "axios";
import { useCookies } from "react-cookie";
import {
  LIST_ALL_DISPUTES_FOR_MEDIATORS_ROUTE,
  ASSIGN_MEDIATOR_ROUTE,
  UPDATE_DISPUTE_STATUS_ROUTE,
  RESOLVE_DISPUTE_ROUTE,
  LIST_MY_DISPUTES_ROUTE,
  OPEN_DISPUTE_ROUTE,
} from "../utils/constants";
import { toast } from "react-toastify";
import EvidenceUpload from "./EvidenceUpload";
import MediationChat from "./MediationChat";
import { useStateProvider } from "../context/StateContext";
import { 
  FaBuilding, 
  FaExclamationTriangle, 
  FaInbox, 
  FaUser, 
  FaUserPlus, 
  FaExclamationCircle, 
  FaShoppingCart, 
  FaBox, 
  FaCheckCircle, 
  FaGavel 
} from "react-icons/fa";

function MediatorDisputeCenter() {
  const [cookies] = useCookies();
  const [{ userInfo }] = useStateProvider();
  const [disputes, setDisputes] = useState([]);
  const [selected, setSelected] = useState(null);
  const [status, setStatus] = useState("UNDER_REVIEW");
  const [resolution, setResolution] = useState("");
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, unassigned, assigned, resolved
  
  // Dispute creation form state (for non-mediators)
  const [orderId, setOrderId] = useState("");
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  
  // Determine if the current user is a mediator
  const isMediator = userInfo?.isMediator || false;

  const input = "block p-3 w-full text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500";
  const label = "mb-2 text-sm font-medium text-[#404145]";

  const refresh = async () => {
    try {
      setLoading(true);
      
      if (isMediator) {
        // User is a mediator - fetch all disputes they can mediate
        const { data } = await axios.get(LIST_ALL_DISPUTES_FOR_MEDIATORS_ROUTE, { 
          headers: { Authorization: `Bearer ${cookies.jwt}` } 
        });
        setDisputes(data);
      } else {
        // User is a buyer/seller - fetch only their own disputes
        const { data } = await axios.get(LIST_MY_DISPUTES_ROUTE, {
          headers: { Authorization: `Bearer ${cookies.jwt}` }
        });
        setDisputes(data);
      }
    } catch (error) {
      console.error("Error fetching disputes:", error);
      toast.error("Failed to load disputes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    if (cookies.jwt && userInfo) refresh(); 
  }, [cookies.jwt, userInfo, isMediator]);

  const assignSelfAsMediator = async (disputeId) => {
    if (!isMediator) {
      toast.error("Only mediators can assign themselves to disputes");
      return;
    }
    
    try {
      await axios.post(`${ASSIGN_MEDIATOR_ROUTE}/${disputeId}`, { 
        mediatorId: userInfo.id 
      }, { 
        headers: { Authorization: `Bearer ${cookies.jwt}` } 
      });
      toast.success("Assigned as mediator");
      
      // Optimistically update the selected dispute
      if (selected && selected.id === disputeId) {
        setSelected({
          ...selected,
          mediator: {
            id: userInfo.id,
            username: userInfo.username,
            fullName: userInfo.fullName,
            email: userInfo.email
          }
        });
      }
      
      refresh();
    } catch (e) {
      toast.error(e?.response?.data || "Failed to assign mediator");
    }
  };

  const updateStatus = async () => {
    if (!selected) return;
    try {
      await axios.put(`${UPDATE_DISPUTE_STATUS_ROUTE}/${selected.id}`, { status }, { 
        headers: { Authorization: `Bearer ${cookies.jwt}` } 
      });
      toast.success("Status updated");
      setSelected({...selected, status});
      refresh();
    } catch (e) {
      toast.error(e?.response?.data || "Failed to update status");
    }
  };

  const resolve = async () => {
    if (!selected || !resolution.trim()) {
      toast.error("Please provide a resolution");
      return;
    }
    try {
      await axios.put(`${RESOLVE_DISPUTE_ROUTE}/${selected.id}`, { resolution }, { 
        headers: { Authorization: `Bearer ${cookies.jwt}` } 
      });
      toast.success("Dispute resolved");
      setResolution("");
      setSelected({...selected, status: "RESOLVED", resolution});
      refresh();
    } catch (e) {
      toast.error(e?.response?.data || "Failed to resolve");
    }
  };

  // Check if a dispute already exists for the given order ID
  const checkExistingDispute = (orderId) => {
    return disputes.find(dispute => dispute.orderId === orderId);
  };

  // Dispute creation function for buyers/sellers
  const openDispute = async () => {
    if (!orderId.trim() || !reason.trim()) {
      toast.error("Order ID and reason are required");
      return;
    }
    
    // Check if dispute already exists for this order
    const existingDispute = checkExistingDispute(orderId);
    if (existingDispute) {
      toast.error(`A dispute already exists for this order (Status: ${existingDispute.status}). Please select it from the list above.`);
      return;
    }
    
    try {
      await axios.post(OPEN_DISPUTE_ROUTE, {
        orderId,
        reason,
        description
      }, {
        headers: { Authorization: `Bearer ${cookies.jwt}` }
      });
      
      toast.success("Dispute opened successfully");
      setOrderId("");
      setReason("");
      setDescription("");
      refresh();
    } catch (e) {
      toast.error(e?.response?.data || "Failed to open dispute");
    }
  };

  const filteredDisputes = disputes.filter(d => {
    switch(filter) {
      case 'unassigned': return !d.mediator;
      case 'assigned': return d.mediator && d.status !== 'RESOLVED' && d.status !== 'CLOSED';
      case 'resolved': return d.status === 'RESOLVED' || d.status === 'CLOSED';
      default: return true;
    }
  });

  const getStatusColor = (status) => {
    switch(status) {
      case 'RESOLVED': return 'bg-green-100 text-green-800 border-green-200';
      case 'MEDIATION': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'UNDER_REVIEW': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'CLOSED': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-red-100 text-red-800 border-red-200';
    }
  };

  const getPriorityLevel = (dispute) => {
    const daysSinceCreated = Math.floor((new Date() - new Date(dispute.createdAt)) / (1000 * 60 * 60 * 24));
    if (daysSinceCreated > 7) return 'high';
    if (daysSinceCreated > 3) return 'medium';
    return 'low';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-xl mb-6">
        <h2 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <FaBuilding />
          {isMediator ? 'Mediator Dispute Center' : 'My Disputes'}
        </h2>
        <p className="text-purple-100">
          {isMediator 
            ? 'Resolve disputes and help users find fair solutions'
            : 'View and manage your dispute cases'
          }
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {(isMediator ? [
          { key: 'all', label: `All Disputes (${disputes.length})`, color: 'bg-gray-100 hover:bg-gray-200' },
          { key: 'unassigned', label: `Unassigned (${disputes.filter(d => !d.mediator).length})`, color: 'bg-red-100 hover:bg-red-200' },
          { key: 'assigned', label: `In Progress (${disputes.filter(d => d.mediator && d.status !== 'RESOLVED' && d.status !== 'CLOSED').length})`, color: 'bg-yellow-100 hover:bg-yellow-200' },
          { key: 'resolved', label: `Resolved (${disputes.filter(d => d.status === 'RESOLVED' || d.status === 'CLOSED').length})`, color: 'bg-green-100 hover:bg-green-200' }
        ] : [
          { key: 'all', label: `All My Disputes (${disputes.length})`, color: 'bg-gray-100 hover:bg-gray-200' },
          { key: 'assigned', label: `In Progress (${disputes.filter(d => d.mediator && d.status !== 'RESOLVED' && d.status !== 'CLOSED').length})`, color: 'bg-yellow-100 hover:bg-yellow-200' },
          { key: 'resolved', label: `Resolved (${disputes.filter(d => d.status === 'RESOLVED' || d.status === 'CLOSED').length})`, color: 'bg-green-100 hover:bg-green-200' }
        ]).map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === tab.key 
                ? 'bg-blue-500 text-white' 
                : tab.color + ' text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className={`grid gap-6 ${isMediator ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1 md:grid-cols-3'}`}>
        {/* Dispute Creation Form - Only for Non-Mediators */}
        {!isMediator && (
          <div className="bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 rounded-xl p-6 shadow-lg">
            <h3 className="text-2xl font-semibold text-[#404145] mb-6 flex items-center gap-2">
              <FaExclamationTriangle />
              Open a Dispute
            </h3>
            <div className="space-y-4">
              <div>
                <label className={label}>Order ID</label>
                <input 
                  className={input} 
                  value={orderId} 
                  onChange={(e) => setOrderId(e.target.value)} 
                  placeholder="Enter order ID" 
                />
              </div>
              <div>
                <label className={label}>Reason</label>
                <input 
                  className={input} 
                  value={reason} 
                  onChange={(e) => setReason(e.target.value)} 
                  placeholder="Brief reason for dispute" 
                />
              </div>
              <div>
                <label className={label}>Description</label>
                <textarea 
                  className={input + " h-24"} 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  placeholder="Describe the issue in detail..." 
                />
              </div>
              <button 
                className="w-full bg-[#1DBF73] hover:bg-[#18a65c] text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2" 
                onClick={openDispute}
              >
                <FaExclamationTriangle />
                Open Dispute
              </button>
            </div>
          </div>
        )}

        {/* Disputes List */}
        <div className={`bg-white border border-gray-200 rounded-xl p-6 shadow-sm max-h-[800px] overflow-y-auto ${isMediator ? 'lg:col-span-1' : ''}`}>
          <h3 className="text-xl font-semibold text-[#404145] mb-4">
            {filter === 'all' && 'All Disputes'}
            {filter === 'unassigned' && 'Unassigned Disputes'}
            {filter === 'assigned' && 'In Progress'}
            {filter === 'resolved' && 'Resolved Disputes'}
          </h3>
          
          <div className="flex flex-col gap-3">
            {filteredDisputes.map((d) => {
              const priority = getPriorityLevel(d);
              const parties = [];
              
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

              return (
                <button 
                  key={d.id} 
                  className={`text-left p-4 border-2 rounded-xl transition-all duration-200 ${
                    selected?.id === d.id 
                      ? "bg-blue-50 border-blue-300 shadow-md" 
                      : "bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                  } ${priority === 'high' ? 'ring-2 ring-red-200' : ''}`} 
                  onClick={() => setSelected(d)}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="font-semibold text-[#404145] text-sm mb-1">{d.reason}</div>
                      {priority === 'high' && (
                        <div className="text-xs text-red-600 font-medium flex items-center gap-1">
                          <FaExclamationTriangle />
                          High Priority
                        </div>
                      )}
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(d.status)}`}>
                      {d.status}
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-3">
                    {parties.map((party, index) => (
                      <div key={index} className={`p-2 rounded-lg border text-xs ${
                        party.isInitiator ? 'bg-red-50 border-red-200 text-red-700' :
                        party.role.includes('Buyer') ? 'bg-blue-50 border-blue-200 text-blue-700' :
                        'bg-green-50 border-green-200 text-green-700'
                      }`}>
                        <div className="font-medium">{party.role}</div>
                        <div className="text-gray-600">{party.user.fullName || party.user.username}</div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>{Math.floor((new Date() - new Date(d.createdAt)) / (1000 * 60 * 60 * 24))} days ago</span>
                    {!d.mediator && (
                      <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full">No Mediator</span>
                    )}
                  </div>
                </button>
              );
            })}
            
            {filteredDisputes.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">
                  <FaInbox className="mx-auto" />
                </div>
                <p>No {filter !== 'all' ? filter : ''} disputes found</p>
              </div>
            )}
          </div>
        </div>

        {/* Dispute Details and Actions */}
        <div className={`bg-white border border-gray-200 rounded-xl p-6 shadow-sm ${isMediator ? 'lg:col-span-2' : 'md:col-span-2'}`}>
          {selected ? (
            // Show special message for closed disputes
            selected.status === 'CLOSED' ? (
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
            <div className="space-y-6">
              {/* Dispute Header */}
              <div className="border-b pb-4">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-2xl font-semibold text-[#404145]">{selected.reason}</h3>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selected.status)}`}>
                    {selected.status}
                  </div>
                </div>
                {selected.description && (
                  <p className="text-gray-700 mb-4">{selected.description}</p>
                )}
                
                {/* Quick Actions - Only for Mediators */}
                {isMediator && !selected.mediator && (
                  <button
                    onClick={() => assignSelfAsMediator(selected.id)}
                    className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg font-medium transition-colors mr-3 flex items-center gap-2"
                  >
                    <FaUserPlus />
                    Assign Myself as Mediator
                  </button>
                )}
                {selected.mediator && (
                  <div className="text-sm text-gray-600 mb-3">
                    <span className="font-medium">Mediator:</span> {selected.mediator.fullName || selected.mediator.username}
                  </div>
                )}
                {isMediator && selected.mediator && selected.status !== 'CLOSED' && (
                  <div className="flex gap-3">
                    <select 
                      className={input + " w-auto"} 
                      value={status} 
                      onChange={(e) => setStatus(e.target.value)}
                    >
                      {['OPENED','UNDER_REVIEW','MEDIATION','RESOLVED','CLOSED'].map((s) => 
                        <option key={s} value={s}>{s}</option>
                      )}
                    </select>
                    <button 
                      onClick={updateStatus}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      Update Status
                    </button>
                  </div>
                )}
              </div>

              {/* Parties Information */}
              <div className="border-b pb-4">
                <h4 className="text-lg font-semibold text-[#404145] mb-3">Parties Involved</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Buyer */}
                  {selected.order?.buyer && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="text-sm font-medium text-blue-800 mb-2 flex items-center gap-2">
                        {selected.initiator?.id === selected.order.buyer.id ? (
                          <>
                            <FaExclamationCircle />
                            Buyer (Dispute Initiator)
                          </>
                        ) : (
                          <>
                            <FaUser />
                            Buyer
                          </>
                        )}
                      </div>
                      <div className="space-y-1">
                        <div className="font-medium">{selected.order.buyer.fullName || selected.order.buyer.username}</div>
                        <div className="text-gray-600 text-sm">{selected.order.buyer.email}</div>
                        <div className="text-xs text-gray-500">@{selected.order.buyer.username}</div>
                      </div>
                    </div>
                  )}

                  {/* Seller */}
                  {selected.order?.gig?.user && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="text-sm font-medium text-green-800 mb-2 flex items-center gap-2">
                        {selected.initiator?.id === selected.order.gig.user.id ? (
                          <>
                            <FaExclamationCircle />
                            Seller (Dispute Initiator)
                          </>
                        ) : (
                          <>
                            <FaShoppingCart />
                            Seller
                          </>
                        )}
                      </div>
                      <div className="space-y-1">
                        <div className="font-medium">{selected.order.gig.user.fullName || selected.order.gig.user.username}</div>
                        <div className="text-gray-600 text-sm">{selected.order.gig.user.email}</div>
                        <div className="text-xs text-gray-500">@{selected.order.gig.user.username}</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Order Information */}
                {selected.order?.gig && (
                  <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="text-sm font-medium text-gray-800 mb-2 flex items-center gap-2">
                      <FaBox />
                      Order Details
                    </div>
                    <div className="space-y-1 text-sm">
                      <div><span className="font-medium">Gig:</span> {selected.order.gig.title}</div>
                      <div><span className="font-medium">Order ID:</span> {selected.orderId}</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Resolution Section - Only for Mediators */}
              {isMediator && selected.status !== 'CLOSED' && selected.mediator && selected.mediator.id === userInfo?.id && (
                <div className="border-b pb-4">
                  <h4 className="text-lg font-semibold text-[#404145] mb-3">Resolve Dispute</h4>
                  <div className="space-y-3">
                    <textarea 
                      className={input + " h-24"} 
                      value={resolution} 
                      onChange={(e) => setResolution(e.target.value)} 
                      placeholder="Provide a detailed resolution explaining the decision and any actions to be taken..."
                    />
                    <button 
                      onClick={resolve}
                      className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
                    >
                      <FaCheckCircle />
                      Resolve Dispute
                    </button>
                  </div>
                </div>
              )}

              {/* Show resolution if exists */}
              {selected.resolution && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="text-sm font-medium text-green-800 mb-2 flex items-center gap-2">
                    <FaCheckCircle />
                    Resolution
                  </div>
                  <div className="text-sm text-gray-700">{selected.resolution}</div>
                </div>
              )}

              {/* Evidence and Chat */}
              <div className="grid grid-cols-1 gap-6">
                <EvidenceUpload disputeId={selected.id} onUploaded={setSelected} />
                <MediationChat disputeId={selected.id} />
              </div>
            </div>
            )
          ) : (
            <div className="text-center text-gray-500 py-12">
              <div className="text-6xl mb-4">
                <FaGavel className="mx-auto" />
              </div>
              <h4 className="text-xl font-medium text-[#404145] mb-2">No Dispute Selected</h4>
              <p>Select a dispute from the list to start mediation</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MediatorDisputeCenter;
