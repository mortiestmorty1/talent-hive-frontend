import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useStateProvider } from '../../../context/StateContext';
import { 
  FaCheckCircle, 
  FaClock, 
  FaExclamationTriangle,
  FaComments,
  FaDollarSign,
  FaUser,
  FaCalendar,
  FaStar,
  FaFileAlt,
  FaEye
} from 'react-icons/fa';
import { useCookies } from 'react-cookie';
import { toast } from 'react-toastify';
import { UPDATE_JOB_STATUS, GET_JOB_ROUTE, GET_JOB_APPLICATIONS_ROUTE, UPDATE_APPLICATION_STATUS_ROUTE, COMPLETE_JOB_ROUTE } from '../../../utils/constants';

const JobManagement = () => {
  const router = useRouter();
  const { jobId } = router.query;
  const [{ userInfo, isSeller }] = useStateProvider();
  const [cookies] = useCookies();
  
  const [loading, setLoading] = useState(true);
  const [job, setJob] = useState(null);
  const [application, setApplication] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    if (jobId) {
      fetchJobDetails();
    }
  }, [jobId]);

  const fetchJobDetails = async () => {
    try {
      
      const response = await fetch(`${GET_JOB_ROUTE}/${jobId}`, {
        headers: {
          'Authorization': `Bearer ${cookies.jwt}`
        }
      });

      if (response.ok) {
        const jobData = await response.json();
        setJob(jobData);

        // If user is a freelancer, find their application
        if (isSeller) {
          const appResponse = await fetch(`${GET_JOB_APPLICATIONS_ROUTE}/${jobId}/applications`, {
            headers: {
              'Authorization': `Bearer ${cookies.jwt}`
            }
          });

          if (appResponse.ok) {
            const appsData = await appResponse.json();
            const userApp = appsData.applications.find(app => app.freelancerId === userInfo.id);
            setApplication(userApp);
          }
        }
      } else {
        console.log('❌ Response not ok:', response.status, response.statusText);
        const errorText = await response.text();
        console.log('❌ Error response body:', errorText);
        toast.error('Failed to load job details');
      }
    } catch (error) {
      console.error('Error fetching job details:', error);
      toast.error('Failed to load job details');
    } finally {
      setLoading(false);
    }
  };


  const updateJobStatus = async (newStatus) => {
    if (!application) return;

    try {
      setUpdatingStatus(true);
      
      // Update application status
      const response = await fetch(`${UPDATE_APPLICATION_STATUS_ROUTE}/${application.id}`, {
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
        setApplication(prev => ({ ...prev, status: newStatus }));
        
        // If freelancer is starting work, also update job status to IN_PROGRESS
        if (newStatus === 'IN_PROGRESS') {
          const jobResponse = await fetch(`${UPDATE_JOB_STATUS}/${jobId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${cookies.jwt}`
            },
            body: JSON.stringify({
              status: 'IN_PROGRESS'
            })
          });
          
          if (jobResponse.ok) {
            setJob(prev => ({ ...prev, status: 'IN_PROGRESS' }));
          }
        }
        
        toast.success(`Job status updated to ${newStatus}`);
        fetchJobDetails();
      } else {
        toast.error('Failed to update job status');
      }
    } catch (error) {
      console.error('Error updating job status:', error);
      toast.error('Failed to update job status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const completeJob = async () => {
    try {
      setUpdatingStatus(true);
      const response = await fetch(`${COMPLETE_JOB_ROUTE}/${jobId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${cookies.jwt}`
        }
      });

      if (response.ok) {
        toast.success('Job marked as completed');
        fetchJobDetails();
      } else {
        toast.error('Failed to complete job');
      }
    } catch (error) {
      console.error('Error completing job:', error);
      toast.error('Failed to complete job');
    } finally {
      setUpdatingStatus(false);
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

  // Calculate job states safely (with null checks)
  const canManageJob = job ? (isSeller ? (application?.status === 'ACCEPTED' || application?.status === 'IN_PROGRESS') : job.clientId === userInfo.id) : false;
  const isJobCompleted = job?.status === 'COMPLETED';
  const isJobInProgress = job?.status === 'IN_PROGRESS';

  // Redirect to workspace if job is in progress (must be before early returns)
  useEffect(() => {
    if (job && isJobInProgress && canManageJob) {
      router.replace(`/jobs/${jobId}/workspace`);
    }
  }, [job, isJobInProgress, canManageJob, jobId, router]);

  console.log('🔍 Render state - loading:', loading, 'job:', !!job, 'jobId:', jobId);

  if (loading) {
    console.log('🔄 Showing loading state');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    console.log('❌ Showing job not found - job state:', job);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaExclamationTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Job Not Found</h2>
          <p className="text-gray-600">The job you're looking for doesn't exist or you don't have access to it.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{job.title}</h1>
              <p className="mt-2 text-gray-600">Job Management & Communication</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(job.status)}`}>
                {getStatusIcon(job.status)}
                <span className="ml-2">{job.status}</span>
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Job Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Job Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <FaExclamationTriangle className="w-5 h-5 text-orange-600 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Complexity</p>
                    <p className="font-semibold text-gray-900">{job.complexity}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <FaUser className="w-5 h-5 text-purple-600 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Client</p>
                    <p className="font-semibold text-gray-900">{job.client?.fullName || 'N/A'}</p>
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">Description</p>
                <p className="text-gray-900">{job.description}</p>
              </div>
              {job.requiredSkills && job.requiredSkills.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2">Required Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {job.requiredSkills.map((skill, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Application Details (for freelancers) */}
            {isSeller && application && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Application</h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Proposal</p>
                    <p className="text-gray-900">{application.proposal}</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Bid Amount</p>
                      <p className="font-semibold text-gray-900">${application.bidAmount}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Proposed Timeline</p>
                      <p className="font-semibold text-gray-900">{application.timeline}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Status Management */}
            {canManageJob && !isJobCompleted && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Job Management</h2>
                <div className="space-y-4">
                  {isSeller ? (
                    // Freelancer actions
                    <div className="flex flex-wrap gap-3">
                      {application?.status === 'ACCEPTED' && (
                        <button
                          onClick={() => updateJobStatus('IN_PROGRESS')}
                          disabled={updatingStatus}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                          Start Working
                        </button>
                      )}
                      {application?.status === 'IN_PROGRESS' && (
                        <button
                          onClick={completeJob}
                          disabled={updatingStatus}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                        >
                          Mark as Completed
                        </button>
                      )}
                    </div>
                  ) : (
                    // Client actions
                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={() => router.push(`/jobs/${jobId}/applications`)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        View Applications
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Communication */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FaComments className="w-5 h-5 mr-2" />
                Communication
              </h2>
              
              <div className="text-center py-8">
                <FaComments className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Dedicated Messaging</h3>
                <p className="text-gray-600 mb-4">
                  Use our dedicated messaging system for seamless communication about this job.
                </p>
                <button
                  onClick={() => router.push(`/jobs/${jobId}/messages`)}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  Open Messages
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Job Status */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Current Status</span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                    {getStatusIcon(job.status)}
                    <span className="ml-1">{job.status}</span>
                  </span>
                </div>
                {application && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Application Status</span>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                      {getStatusIcon(application.status)}
                      <span className="ml-1">{application.status}</span>
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={() => router.push(`/jobs/${jobId}`)}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  <FaEye className="w-4 h-4 inline mr-2" />
                  View Job Details
                </button>
                {!isSeller && (
                  <button
                    onClick={() => router.push(`/jobs/${jobId}/applications`)}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
                  >
                    <FaUser className="w-4 h-4 inline mr-2" />
                    View Applications
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobManagement;
