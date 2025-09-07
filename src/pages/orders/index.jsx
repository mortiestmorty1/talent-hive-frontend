import React, { useState, useEffect } from "react";
import { useCookies } from "react-cookie";
import { useStateProvider } from "../../context/StateContext";
import { toast } from "react-toastify";
import { GET_BUYER_ORDERS, GET_SELLER_ORDERS, GET_CLIENT_JOB_ORDERS_ROUTE, GET_FREELANCER_JOB_ORDERS_ROUTE } from "../../utils/constants";
import axios from "axios";
import Link from "next/link";
import Image from "next/image";
import { HOST } from "../../utils/constants";
import { SiGooglemessages } from "react-icons/si";
import { FaBriefcase, FaBox, FaHandshake, FaDollarSign, FaClock, FaUser, FaCog, FaExternalLinkAlt } from "react-icons/fa";

const AllOrders = () => {
  const [cookies] = useCookies();
  const [gigOrders, setGigOrders] = useState([]);
  const [jobOrders, setJobOrders] = useState([]);
  const [{ userInfo, isSeller }] = useStateProvider();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("gigs");

  useEffect(() => {
    const getOrders = async () => {
      setLoading(true);
      
      // Fetch gig orders based on user role
      try {
        const gigOrdersUrl = isSeller ? GET_SELLER_ORDERS : GET_BUYER_ORDERS;
        const { data: gigData } = await axios.get(gigOrdersUrl, {
          headers: { Authorization: `Bearer ${cookies.jwt}` },
        });
        setGigOrders(gigData.orders || []);
      } catch (error) {
        console.error("Error fetching gig orders:", error);
        setGigOrders([]);
      }

      // Fetch job orders based on user role
      try {
        const jobOrdersUrl = isSeller ? GET_FREELANCER_JOB_ORDERS_ROUTE : GET_CLIENT_JOB_ORDERS_ROUTE;
        const { data: jobData } = await axios.get(jobOrdersUrl, {
          headers: { Authorization: `Bearer ${cookies.jwt}` },
        });
        setJobOrders(jobData.orders || []);
      } catch (error) {
        console.error("❌ Error fetching job orders:", error);
        console.error("❌ Error details:", error.response?.data);
        setJobOrders([]);
      }
      
      setLoading(false);
    };

    if (userInfo) {
      getOrders();
    }
  }, [userInfo, isSeller, cookies.jwt]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const renderGigOrders = () => (
    <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
      <table className="w-full text-sm text-left text-gray-800">
        <thead className="text-xs text-gray-800 uppercase bg-gray-50">
          <tr>
            {!isSeller && <th scope="col" className="px-6 py-3">ID</th>}
            <th scope="col" className="px-6 py-3">Gig Name</th>
            <th scope="col" className="px-6 py-3">Category</th>
            <th scope="col" className="px-6 py-3">Price</th>
            <th scope="col" className="px-6 py-3">Delivery Time</th>
            <th scope="col" className="px-6 py-3">{isSeller ? "Ordered By" : "Seller"}</th>
            <th scope="col" className="px-6 py-3">Order Date</th>
            <th scope="col" className="px-6 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {gigOrders.map((order) => (
            <tr
              className="bg-white border-b hover:bg-gray-50"
              key={order.id}
            >
              {!isSeller && (
                <td className="px-6 py-4 font-medium text-gray-900">
                  {order.id}
                </td>
              )}
              <td className="px-6 py-4 font-medium text-gray-900">
                {order.gig.title}
              </td>
              <td className="px-6 py-4">{order.gig.category}</td>
              <td className="px-6 py-4">
                <span className="font-medium text-green-600">💲 {order.gig.price}</span>
              </td>
              <td className="px-6 py-4">{order.gig.deliveryTime} days</td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  {(isSeller ? order.buyer : order.gig.createdBy)?.profileImage && (
                    <Image
                      src={HOST + "/" + (isSeller ? order.buyer : order.gig.createdBy).profileImage}
                      alt={(isSeller ? order.buyer : order.gig.createdBy).username}
                      width={30}
                      height={30}
                      className="rounded-full"
                    />
                  )}
                  <span>{(isSeller ? order.buyer : order.gig.createdBy)?.fullName || (isSeller ? order.buyer : order.gig.createdBy)?.username}</span>
                </div>
              </td>
              <td className="px-6 py-4">{order.createdAt.split("T")[0]}</td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <Link
                    className="font-medium text-blue-600 hover:underline"
                    href={`/${isSeller ? 'seller' : 'buyer'}/orders/messages/${order.id}`}
                    title="Messages"
                  >
                    <SiGooglemessages fill="green" size={20} />
                  </Link>
                  <Link
                    className="font-medium text-purple-600 hover:underline"
                    href={`/orders/${order.id}/workspace`}
                    title="Workspace"
                  >
                    <FaCog size={20} />
                  </Link>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {gigOrders.length === 0 && (
        <div className="text-center py-12">
          <FaBox className="mx-auto text-4xl text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No Gig Orders Yet</h3>
          <p className="text-gray-500">
            {isSeller 
              ? "Start selling services to see orders here" 
              : "Browse services and place your first order"
            }
          </p>
        </div>
      )}
    </div>
  );

  const renderJobOrders = () => (
    <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
      {jobOrders.length > 0 ? (
        <table className="w-full text-sm text-left text-gray-800">
          <thead className="text-xs text-gray-800 uppercase bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3">Job Title</th>
              <th scope="col" className="px-6 py-3">Budget</th>
              <th scope="col" className="px-6 py-3">Timeline</th>
              <th scope="col" className="px-6 py-3">Status</th>
              <th scope="col" className="px-6 py-3">{isSeller ? "Client" : "Freelancer"}</th>
              <th scope="col" className="px-6 py-3">Start Date</th>
              <th scope="col" className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {jobOrders.map((order, index) => {
              // Handle different data structures based on user role
              const job = isSeller ? order.job : order;
              const otherParty = isSeller ? job.client : (order.applications && order.applications[0] ? order.applications[0].freelancer : null);
              
              
              return (
                <tr
                  className="bg-white border-b hover:bg-gray-50"
                  key={isSeller ? order.id : order.id}
                >
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {job.title}
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-medium text-green-600">💲 {job.budget}</span>
                  </td>
                  <td className="px-6 py-4">{job.timeline}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      job.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-800' :
                      job.status === 'PENDING_COMPLETION' ? 'bg-orange-100 text-orange-800' :
                      job.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {job.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {otherParty?.profileImage && (
                        <Image
                          src={HOST + "/" + otherParty.profileImage}
                          alt={otherParty.username}
                          width={30}
                          height={30}
                          className="rounded-full"
                        />
                      )}
                      <span>{otherParty?.fullName || otherParty?.username || 'N/A'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {new Date(isSeller ? order.createdAt : order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Link
                        className="font-medium text-blue-600 hover:underline"
                        href={`/jobs/${job.id}/manage`}
                        title="Manage Job"
                      >
                        <FaCog size={20} />
                      </Link>
                      {job.status === 'IN_PROGRESS' || job.status === 'PENDING_COMPLETION' && (
                        <Link
                          className="font-medium text-purple-600 hover:underline"
                          href={`/jobs/${job.id}/workspace`}
                          title="Workspace"
                        >
                          <FaExternalLinkAlt size={20} />
                        </Link>
                      )}
                      {['IN_PROGRESS', 'COMPLETED'].includes(job.status) && (
                        <Link
                          className="font-medium text-green-600 hover:underline"
                          href={`/jobs/${job.id}/messages`}
                          title="Messages"
                        >
                          <SiGooglemessages size={20} />
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        <div className="text-center py-12">
          <FaBriefcase className="mx-auto text-4xl text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No Job Orders Yet</h3>
          <p className="text-gray-500">
            {isSeller 
              ? "Apply to jobs and get accepted to see orders here" 
              : "Post jobs and accept applications to see orders here"
            }
          </p>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-[80vh] my-10 mt-0 px-4 md:px-32">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
          <FaHandshake />
          All Your Orders
        </h1>
        <p className="text-lg text-gray-600">
          View and manage both service orders and job-based work
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setActiveTab("gigs")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === "gigs"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          <FaBox className="inline mr-2" />
          Service Orders ({gigOrders.length})
        </button>
        <button
          onClick={() => setActiveTab("jobs")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === "jobs"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          <FaBriefcase className="inline mr-2" />
          Job Orders ({jobOrders.length})
        </button>
      </div>

      {/* Content */}
      {activeTab === "gigs" ? renderGigOrders() : renderJobOrders()}
    </div>
  );
};

export default AllOrders;
