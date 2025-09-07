import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useStateProvider } from '../../../context/StateContext';
import { 
  FaUser, 
  FaDollarSign, 
  FaCalendar, 
  FaCheckCircle, 
  FaTimes, 
  FaEye,
  FaCreditCard
} from 'react-icons/fa';
import { useCookies } from 'react-cookie';
import { toast } from 'react-toastify';
import Link from 'next/link';

const JobApplications = () => {
  const router = useRouter();
  const { jobId } = router.query;
  const [{ userInfo, isSeller }] = useStateProvider();
  const [cookies] = useCookies();
  
  const [loading, setLoading] = useState(true);
  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    if (jobId) {
      fetchJobAndApplications();
    }
  }, [jobId]);

  const fetchJobAndApplications = async () => {
    try {
      setLoading(true);
      
      // Fetch job details
      const jobResponse = await fetch(`/api/jobs/get/${jobId}`, {
        headers: {
          'Authorization': `Bearer ${cookies.jwt}`
        }
      });

      if (jobResponse.ok) {
        const jobData = await jobResponse.json();
        setJob(jobData);
      }

      // Fetch applications
      const appsResponse = await fetch(`/api/jobs/${jobId}/applications`, {
        headers: {
          'Authorization': `Bearer ${cookies.jwt}`
        }
      });

      if (appsResponse.ok) {
        const appsData = await appsResponse.json();
        setApplications(appsData.applications || []);
      }
    } catch (error) {
      console.error('Error fetching job and applications:', error);
      toast.error('Failed to load job applications');
    } finally {
      setLoading(false);
    }
  };

  const updateApplicationStatus = async (applicationId, newStatus) => {
    try {
      setUpdatingStatus(true);
      
      const response = await fetch(`/api/jobs/applications/${applicationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${cookies.jwt}`
        },
        body: JSON.stringify({
          status: newStatus
        })
      });

      if (response.ok) {
        toast.success(`Application ${newStatus.toLowerCase()} successfully`);
        fetchJobAndApplications();
      } else {
        toast.error('Failed to update application status');
      }
    } catch (error) {
      console.error('Error updating application status:', error);
      toast.error('Failed to update application status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'text-yellow-600 bg-yellow-100';
      case 'ACCEPTED': return 'text-green-600 bg-green-100';
      case 'REJECTED': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING': return <FaCalendar className="w-4 h-4" />;
      case 'ACCEPTED': return <FaCheckCircle className="w-4 h-4" />;
      case 'REJECTED': return <FaTimes className="w-4 h-4" />;
      default: return <FaCalendar className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading applications...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaTimes className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Job Not Found</h2>
          <p className="text-gray-600">The job you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  if (isSeller) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaTimes className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">Only job clients can view applications.</p>
        </div>
      </div>
    );
  }

  if (job.clientId !== userInfo.id) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaTimes className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You can only view applications for your own jobs.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{job.title}</h1>
          <p className="mt-2 text-gray-600">Job Applications ({applications.length})</p>
        </div>

        {/* Job Summary */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center">
              <FaDollarSign className="w-5 h-5 text-green-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Budget</p>
                <p className="font-semibold text-gray-900">${job.budget}</p>
              </div>
            </div>
            <div className="flex items-center">
              <FaCalendar className="w-5 h-5 text-blue-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Timeline</p>
                <p className="font-semibold text-gray-900">{job.timeline}</p>
              </div>
            </div>
            <div className="flex items-center">
              <FaUser className="w-5 h-5 text-purple-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Applications</p>
                <p className="font-semibold text-gray-900">{applications.length}</p>
              </div>
            </div>
            <div className="flex items-center">
              <FaCheckCircle className="w-5 h-5 text-orange-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <p className="font-semibold text-gray-900">{job.status}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Applications */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Applications</h2>
          </div>
          
          {applications.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <FaUser className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No applications yet</p>
              <p className="text-sm">Applications will appear here when freelancers apply</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {applications.map((application) => (
                <div key={application.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <h3 className="text-lg font-medium text-gray-900">
                          {application.freelancer?.fullName || 'Unknown Freelancer'}
                        </h3>
                        <span className={`ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                          {getStatusIcon(application.status)}
                          <span className="ml-1">{application.status}</span>
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center">
                          <FaDollarSign className="w-4 h-4 text-green-600 mr-2" />
                          <div>
                            <p className="text-sm text-gray-600">Bid Amount</p>
                            <p className="font-semibold text-gray-900">${application.bidAmount}</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <FaCalendar className="w-4 h-4 text-blue-600 mr-2" />
                          <div>
                            <p className="text-sm text-gray-600">Timeline</p>
                            <p className="font-semibold text-gray-900">{application.timeline}</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <FaUser className="w-4 h-4 text-purple-600 mr-2" />
                          <div>
                            <p className="text-sm text-gray-600">Email</p>
                            <p className="font-semibold text-gray-900">{application.freelancer?.email || 'N/A'}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <p className="text-sm text-gray-600 mb-2">Proposal</p>
                        <p className="text-gray-900">{application.proposal}</p>
                      </div>
                    </div>
                    
                    <div className="ml-6 flex flex-col space-y-2">
                      <Link 
                        href={`/jobs/${jobId}/manage`}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <FaEye className="w-4 h-4 mr-2" />
                        Manage
                      </Link>
                      
                      {application.status === 'PENDING' && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => updateApplicationStatus(application.id, 'ACCEPTED')}
                            disabled={updatingStatus}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                          >
                            <FaCheckCircle className="w-4 h-4 mr-2" />
                            Accept
                          </button>
                          <button
                            onClick={() => updateApplicationStatus(application.id, 'REJECTED')}
                            disabled={updatingStatus}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
                          >
                            <FaTimes className="w-4 h-4 mr-2" />
                            Reject
                          </button>
                        </div>
                      )}
                      
                      {application.status === 'ACCEPTED' && (
                        <Link 
                          href={`/jobs/${jobId}/payment?applicationId=${application.id}`}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                        >
                          <FaCreditCard className="w-4 h-4 mr-2" />
                          Make Payment
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobApplications;
