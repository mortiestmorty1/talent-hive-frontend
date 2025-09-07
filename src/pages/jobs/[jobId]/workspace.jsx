import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useStateProvider } from '../../../context/StateContext';
import { 
  FaCheckCircle, 
  FaClock, 
  FaExclamationTriangle,
  FaDollarSign,
  FaUser,
  FaCalendar,
  FaStar,
  FaFileAlt,
  FaPlus,
  FaEdit,
  FaTrash,
  FaPlay,
  FaPause,
  FaChartLine,
  FaTasks
} from 'react-icons/fa';
import { useCookies } from 'react-cookie';
import { toast } from 'react-toastify';
import { UPDATE_JOB_PROGRESS, GET_JOB_MILESTONES, ADD_JOB_MILESTONE, UPDATE_MILESTONE_STATUS, GET_JOB_ROUTE, UPDATE_JOB_STATUS } from '../../../utils/constants';

const JobWorkspace = () => {
  const router = useRouter();
  const { jobId } = router.query;
  const [{ userInfo, isSeller }] = useStateProvider();
  const [cookies] = useCookies();
  
  const [loading, setLoading] = useState(true);
  const [job, setJob] = useState(null);
  const [milestones, setMilestones] = useState([]);
  const [newMilestone, setNewMilestone] = useState({ title: '', description: '' });
  const [showMilestoneForm, setShowMilestoneForm] = useState(false);
  const [updatingProgress, setUpdatingProgress] = useState(false);

  useEffect(() => {
    if (jobId && userInfo) {
      fetchJobDetails();
      fetchMilestones();
    }
  }, [jobId, userInfo]);

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

        console.log('=== JOB DATA DEBUG ===');
        console.log('Job data:', jobData);
        console.log('User info:', userInfo);
        console.log('Job client ID:', jobData.clientId);
        console.log('Job accepted freelancer ID:', jobData.acceptedFreelancerId);
        console.log('User ID:', userInfo.id);
      }
    } catch (error) {
      console.error('Error fetching job details:', error);
      toast.error('Failed to load job details');
    } finally {
      setLoading(false);
    }
  };


  const fetchMilestones = async () => {
    try {
      const response = await fetch(`${GET_JOB_MILESTONES}/${jobId}/milestones`, {
        headers: {
          'Authorization': `Bearer ${cookies.jwt}`
        }
      });

      if (response.ok) {
        const milestonesData = await response.json();
        setMilestones(milestonesData.milestones || []);
      }
    } catch (error) {
      console.error('Error fetching milestones:', error);
    }
  };


  const addMilestone = async (e) => {
    e.preventDefault();
    if (!newMilestone.title.trim() || !newMilestone.description.trim()) return;

    try {
      const response = await fetch(`${ADD_JOB_MILESTONE}/${jobId}/milestones`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${cookies.jwt}`
        },
        body: JSON.stringify(newMilestone)
      });

      if (response.ok) {
        setNewMilestone({ title: '', description: '' });
        setShowMilestoneForm(false);
        fetchMilestones();
        toast.success('Milestone added successfully');
      } else {
        toast.error('Failed to add milestone');
      }
    } catch (error) {
      console.error('Error adding milestone:', error);
      toast.error('Failed to add milestone');
    }
  };

  const updateMilestoneStatus = async (milestoneId, status) => {
    try {
      console.log('=== UPDATE JOB MILESTONE STATUS DEBUG ===');
      console.log('Milestone ID:', milestoneId);
      console.log('New Status:', status);
      console.log('API URL:', `${UPDATE_MILESTONE_STATUS}/${milestoneId}`);
      console.log('JWT Token:', cookies.jwt ? 'Present' : 'Missing');

      const response = await fetch(`${UPDATE_MILESTONE_STATUS}/${milestoneId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${cookies.jwt}`
        },
        body: JSON.stringify({ status })
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (response.ok) {
        const data = await response.json();
        console.log('Success response:', data);
        fetchMilestones();
        toast.success(data.message || 'Milestone status updated');
      } else {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        toast.error(errorData.error || 'Failed to update milestone');
      }
    } catch (error) {
      console.error('Error updating milestone:', error);
      toast.error(`Failed to update milestone: ${error.message}`);
    }
  };

  const updateJobStatus = async (newStatus) => {
    try {
      console.log('=== UPDATE JOB STATUS DEBUG ===');
      console.log('Job ID:', jobId);
      console.log('New Status:', newStatus);
      console.log('API URL:', `${UPDATE_JOB_STATUS}/${jobId}`);
      console.log('JWT Token:', cookies.jwt ? 'Present' : 'Missing');

      const response = await fetch(`${UPDATE_JOB_STATUS}/${jobId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${cookies.jwt}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (response.ok) {
        const data = await response.json();
        console.log('Success response:', data);
        setJob(data.job);
        toast.success(data.message);
        
        // Refresh job details to get updated status
        fetchJobDetails();
      } else {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        toast.error(errorData.error || 'Failed to update job status');
      }
    } catch (error) {
      console.error('Error updating job status:', error);
      toast.error(`Failed to update job status: ${error.message}`);
    }
  };

  // Calculate overall progress based on status and milestones
  const calculateOverallProgress = () => {
    const status = job?.status;
    if (status === 'COMPLETED') return 100;
    if (status === 'PENDING_COMPLETION') return 95;
    
    // If there are milestones, use their average
    if (milestones.length > 0) {
      return Math.round(milestones.reduce((sum, m) => sum + m.progress, 0) / milestones.length);
    }
    
    // Use job.progress if available, otherwise default based on status
    if (job?.progress) return job.progress;
    if (status === 'IN_PROGRESS') return 25;
    return 0;
  };

  const updateJobProgress = async (progress) => {
    try {
      setUpdatingProgress(true);
      const response = await fetch(`${UPDATE_JOB_PROGRESS}/${jobId}/progress`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${cookies.jwt}`
        },
        body: JSON.stringify({ progress })
      });

      if (response.ok) {
        setJob(prev => ({ ...prev, progress }));
        toast.success('Progress updated successfully');
      } else {
        toast.error('Failed to update progress');
      }
    } catch (error) {
      console.error('Error updating progress:', error);
      toast.error('Failed to update progress');
    } finally {
      setUpdatingProgress(false);
    }
  };

  const completeJob = async () => {
    try {
      const response = await fetch(`/api/jobs/complete/${jobId}`, {
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
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'OPEN': return 'text-gray-600 bg-gray-100';
      case 'IN_PROGRESS': return 'text-blue-600 bg-blue-100';
      case 'PENDING_COMPLETION': return 'text-orange-600 bg-orange-100';
      case 'COMPLETED': return 'text-green-600 bg-green-100';
      case 'CANCELLED': return 'text-red-600 bg-red-100';
      case 'PENDING': return 'text-yellow-600 bg-yellow-100'; // For milestones
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'OPEN': return <FaClock className="w-4 h-4" />;
      case 'IN_PROGRESS': return <FaPlay className="w-4 h-4" />;
      case 'PENDING_COMPLETION': return <FaExclamationTriangle className="w-4 h-4" />;
      case 'COMPLETED': return <FaCheckCircle className="w-4 h-4" />;
      case 'CANCELLED': return <FaExclamationTriangle className="w-4 h-4" />;
      case 'PENDING': return <FaClock className="w-4 h-4" />; // For milestones
      default: return <FaClock className="w-4 h-4" />;
    }
  };

  if (loading || !userInfo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading workspace...</p>
        </div>
      </div>
    );
  }

  if (!job) {
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

  // Determine user role for this specific job
  const isJobClient = userInfo && job.clientId === userInfo.id;
  const isAcceptedFreelancer = userInfo && job.acceptedFreelancerId === userInfo.id;
  
  // Allow access if:
  // 1. User is the job client, OR
  // 2. User is the accepted freelancer
  const canManageJob = isJobClient || isAcceptedFreelancer;
  const isJobCompleted = job.status === 'COMPLETED';

  if (!canManageJob && !isJobCompleted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaExclamationTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You can only access the workspace for jobs in progress.</p>
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
              <p className="mt-2 text-gray-600">Job Workspace - Collaboration Hub</p>
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
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status Management Section */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FaCheckCircle className="w-5 h-5 mr-2" />
                Status Management
              </h2>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-600 mb-2">Current Status:</p>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(job.status)}`}>
                    {getStatusIcon(job.status)}
                    <span className="ml-2">{job.status}</span>
                  </span>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  {/* Status Update Buttons */}
                  {isAcceptedFreelancer && job.status === 'IN_PROGRESS' && (
                    <button
                      onClick={() => updateJobStatus('PENDING_COMPLETION')}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
                    >
                      <FaCheckCircle className="w-4 h-4 mr-2" />
                      Request Completion
                    </button>
                  )}
                  {isJobClient && job.status === 'PENDING_COMPLETION' && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => updateJobStatus('COMPLETED')}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
                      >
                        <FaCheckCircle className="w-4 h-4 mr-2" />
                        Approve Completion
                      </button>
                      <button
                        onClick={() => updateJobStatus('IN_PROGRESS')}
                        className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 flex items-center"
                      >
                        <FaEdit className="w-4 h-4 mr-2" />
                        Request Changes
                      </button>
                    </div>
                  )}
                  {job.status === 'COMPLETED' && (
                    <div className="px-4 py-2 bg-green-100 text-green-800 rounded-lg flex items-center">
                      <FaCheckCircle className="w-4 h-4 mr-2" />
                      Job Completed Successfully!
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Progress Section */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <FaChartLine className="w-5 h-5 mr-2" />
                  Project Progress
                </h2>
              </div>
              
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Overall Progress</span>
                  <span className="text-sm font-medium text-gray-700">{calculateOverallProgress()}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      job?.status === 'COMPLETED' ? 'bg-green-600' : 
                      job?.status === 'PENDING_COMPLETION' ? 'bg-orange-600' : 'bg-blue-600'
                    }`}
                    style={{ width: `${calculateOverallProgress()}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {job?.status === 'COMPLETED' && '✅ Job completed successfully!'}
                  {job?.status === 'PENDING_COMPLETION' && '⏳ Awaiting client approval'}
                  {job?.status === 'IN_PROGRESS' && '🚀 Work in progress'}
                </div>
              </div>

              {isSeller && !isJobCompleted && (
                <div className="flex space-x-2">
                  {[25, 50, 75, 100].map(progress => (
                    <button
                      key={progress}
                      onClick={() => updateJobProgress(progress)}
                      disabled={updatingProgress}
                      className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 disabled:opacity-50"
                    >
                      {progress}%
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Milestones Section */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <FaTasks className="w-5 h-5 mr-2" />
                  Milestones
                </h2>
                {isSeller && !isJobCompleted && (
                  <button
                    onClick={() => setShowMilestoneForm(!showMilestoneForm)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <FaPlus className="w-4 h-4 mr-2" />
                    Add Milestone
                  </button>
                )}
              </div>

              {/* Add Milestone Form */}
              {showMilestoneForm && (
                <form onSubmit={addMilestone} className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                      <input
                        type="text"
                        value={newMilestone.title}
                        onChange={(e) => setNewMilestone(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Milestone title"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <input
                        type="text"
                        value={newMilestone.description}
                        onChange={(e) => setNewMilestone(prev => ({ ...prev, description: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Milestone description"
                      />
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Add Milestone
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowMilestoneForm(false)}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {/* Milestones List */}
              <div className="space-y-4">
                {milestones.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No milestones yet</p>
                ) : (
                  milestones.map((milestone) => (
                    <div key={milestone.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-gray-900">{milestone.title}</h3>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(milestone.status)}`}>
                          {getStatusIcon(milestone.status)}
                          <span className="ml-1">{milestone.status}</span>
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{milestone.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex-1 mr-4">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-gray-500">Progress</span>
                            <span className="text-xs text-gray-500">{milestone.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1">
                            <div 
                              className="bg-blue-600 h-1 rounded-full transition-all duration-300"
                              style={{ width: `${milestone.progress}%` }}
                            ></div>
                          </div>
                        </div>
                        {isSeller && !isJobCompleted && (
                          <div className="flex space-x-1">
                            <button
                              onClick={() => updateMilestoneStatus(milestone.id, 'IN_PROGRESS')}
                              className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                            >
                              Start
                            </button>
                            <button
                              onClick={() => updateMilestoneStatus(milestone.id, 'COMPLETED')}
                              className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
                            >
                              Complete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Job Details */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Details</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <FaDollarSign className="w-4 h-4 text-green-600 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Budget</p>
                    <p className="font-semibold text-gray-900">${job.budget}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <FaCalendar className="w-4 h-4 text-blue-600 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Timeline</p>
                    <p className="font-semibold text-gray-900">{job.timeline}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <FaExclamationTriangle className="w-4 h-4 text-orange-600 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Complexity</p>
                    <p className="font-semibold text-gray-900">{job.complexity}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <FaUser className="w-4 h-4 text-purple-600 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">{isSeller ? 'Client' : 'Freelancer'}</p>
                    <p className="font-semibold text-gray-900">
                      {isSeller ? job.client?.fullName : job.acceptedFreelancer?.fullName || 'N/A'}
                    </p>
                  </div>
                </div>
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
                  <FaFileAlt className="w-4 h-4 inline mr-2" />
                  View Job Details
                </button>
                <button
                  onClick={() => router.push(`/jobs/${jobId}/manage`)}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  <FaEdit className="w-4 h-4 inline mr-2" />
                  Job Management
                </button>
                <button
                  onClick={() => router.push(`/jobs/${jobId}/messages`)}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  <FaEdit className="w-4 h-4 inline mr-2" />
                  Job Messages
                </button>
                <div className="pt-2 border-t border-gray-200">
                  <p className="text-xs text-gray-500 mb-2">Communication</p>
                  <p className="text-xs text-gray-600">Use the "Job Messages" button above for dedicated messaging.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobWorkspace;
