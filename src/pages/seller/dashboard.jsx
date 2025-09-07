import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useStateProvider } from '../../context/StateContext';
import { 
  FaBriefcase, 
  FaDollarSign, 
  FaClock, 
  FaCheckCircle, 
  FaExclamationTriangle,
  FaEye,
  FaComments,
  FaStar,
  FaChartLine,
  FaUserTie
} from 'react-icons/fa';
import { GET_SELLER_DATA, GET_FREELANCER_JOB_ORDERS } from '../../utils/constants';
import { useCookies } from 'react-cookie';
import Link from 'next/link';

const SellerDashboard = () => {
  const router = useRouter();
  const [{ userInfo, isSeller }] = useStateProvider();
  const [cookies] = useCookies();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [jobOrders, setJobOrders] = useState([]);
  const [stats, setStats] = useState({
    totalEarnings: 0,
    activeJobs: 0,
    completedJobs: 0,
    pendingApplications: 0
  });

  useEffect(() => {
    if (!isSeller) {
      router.push('/dashboard');
      return;
    }
    fetchDashboardData();
  }, [isSeller, router]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch seller analytics
      const sellerResponse = await fetch(GET_SELLER_DATA, {
        headers: {
          'Authorization': `Bearer ${cookies.jwt}`
        }
      });
      
      if (sellerResponse.ok) {
        const sellerData = await sellerResponse.json();
        setDashboardData(sellerData);
      }

      // Fetch job orders
      const jobOrdersResponse = await fetch(GET_FREELANCER_JOB_ORDERS, {
        headers: {
          'Authorization': `Bearer ${cookies.jwt}`
        }
      });

      if (jobOrdersResponse.ok) {
        const jobOrdersData = await jobOrdersResponse.json();
        setJobOrders(jobOrdersData.orders || []);
        
        // Calculate stats
        const totalEarnings = jobOrdersData.orders?.reduce((sum, order) => {
          return order.status === 'COMPLETED' ? sum + (order.job?.budget || 0) : sum;
        }, 0) || 0;

        const activeJobs = jobOrdersData.orders?.filter(order => 
          order.status === 'IN_PROGRESS'
        ).length || 0;

        const completedJobs = jobOrdersData.orders?.filter(order => 
          order.status === 'COMPLETED'
        ).length || 0;

        setStats({
          totalEarnings,
          activeJobs,
          completedJobs,
          pendingApplications: 0 // This would need a separate API call
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'text-yellow-600 bg-yellow-100';
      case 'ACCEPTED': return 'text-green-600 bg-green-100';
      case 'IN_PROGRESS': return 'text-blue-600 bg-blue-100';
      case 'COMPLETED': return 'text-purple-600 bg-purple-100';
      case 'REJECTED': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING': return <FaClock className="w-4 h-4" />;
      case 'ACCEPTED': return <FaCheckCircle className="w-4 h-4" />;
      case 'IN_PROGRESS': return <FaExclamationTriangle className="w-4 h-4" />;
      case 'COMPLETED': return <FaCheckCircle className="w-4 h-4" />;
      case 'REJECTED': return <FaExclamationTriangle className="w-4 h-4" />;
      default: return <FaClock className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Seller Dashboard</h1>
          <p className="mt-2 text-gray-600">Manage your freelancing business and track your progress</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <FaDollarSign className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                <p className="text-2xl font-bold text-gray-900">${stats.totalEarnings}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <FaBriefcase className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Jobs</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeJobs}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                <FaCheckCircle className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed Jobs</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completedJobs}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-orange-100 text-orange-600">
                <FaUserTie className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Applications</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingApplications}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/jobs/browse" className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <FaBriefcase className="w-5 h-5 text-blue-600 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Browse Jobs</p>
                  <p className="text-sm text-gray-600">Find new opportunities</p>
                </div>
              </Link>
              
              <Link href="/seller/gigs" className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <FaChartLine className="w-5 h-5 text-green-600 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Manage Gigs</p>
                  <p className="text-sm text-gray-600">Update your services</p>
                </div>
              </Link>
              
              <Link href="/profile" className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <FaUserTie className="w-5 h-5 text-purple-600 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Update Profile</p>
                  <p className="text-sm text-gray-600">Enhance your profile</p>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Job Orders */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Job Orders</h2>
          </div>
          <div className="overflow-x-auto">
            {jobOrders.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <FaBriefcase className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No job orders yet</p>
                <p className="text-sm">Start by browsing and applying to jobs</p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Job Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Client
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Budget
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {jobOrders.slice(0, 10).map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {order.job?.title || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {order.job?.complexity || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {order.job?.client?.fullName || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {order.job?.client?.email || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${order.job?.budget || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          <span className="ml-1">{order.status}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Link 
                            href={`/jobs/${order.jobId}`}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <FaEye className="w-4 h-4" />
                          </Link>
                          {order.status === 'ACCEPTED' && (
                            <Link 
                              href={`/jobs/${order.jobId}/manage`}
                              className="text-green-600 hover:text-green-900"
                            >
                              <FaComments className="w-4 h-4" />
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;
