import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import { useStateProvider } from '../../context/StateContext';
import { 
  LIST_CLIENT_JOBS_ROUTE,
  GET_JOB_APPLICATIONS_ROUTE,
  UPDATE_APPLICATION_STATUS_ROUTE 
} from '../../utils/constants';
import { useCookies } from 'react-cookie';
import { toast } from 'react-toastify';
import { 
  FaUser, 
  FaDollarSign, 
  FaClock, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaEye,
  FaBriefcase,
  FaHandshake,
  FaEnvelope,
  FaPhone,
  FaStar
} from 'react-icons/fa';

const JobApplications = () => {
  const router = useRouter();
  const [{ userInfo, isSeller }] = useStateProvider();
  const [cookies] = useCookies();
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Redirect if not a buyer
  useEffect(() => {
    if (isSeller) {
      router.push('/seller');
      toast.error('Only buyers can access job applications');
      return;
    }
  }, [isSeller, router]);

  // Fetch jobs posted by the current user
  useEffect(() => {
    const fetchMyJobs = async () => {
      try {
        const { data } = await axios.get(LIST_CLIENT_JOBS_ROUTE, {
          headers: { Authorization: `Bearer ${cookies.jwt}` }
        });
        setJobs(data);
        if (data.length > 0) {
          setSelectedJob(data[0]);
        }
      } catch (error) {
        console.error('Error fetching jobs:', error);
        toast.error('Failed to load your jobs');
      } finally {
        setLoading(false);
      }
    };

    if (cookies.jwt && !isSeller) {
      fetchMyJobs();
    }
  }, [cookies.jwt, isSeller]);

  // Fetch applications for selected job
  useEffect(() => {
    const fetchApplications = async () => {
      if (!selectedJob) return;
      
      try {
        const { data } = await axios.get(`${GET_JOB_APPLICATIONS_ROUTE}/${selectedJob.id}/applications`, {
          headers: { Authorization: `Bearer ${cookies.jwt}` }
        });
        setApplications(data);
      } catch (error) {
        console.error('Error fetching applications:', error);
        toast.error('Failed to load applications');
      }
    };

    fetchApplications();
  }, [selectedJob, cookies.jwt]);

  const handleApplicationAction = async (applicationId, action) => {
    setActionLoading(true);
    try {
      await axios.put(`${UPDATE_APPLICATION_STATUS_ROUTE}/${applicationId}`, 
        { status: action }, 
        { headers: { Authorization: `Bearer ${cookies.jwt}` } }
      );
      
      toast.success(`Application ${action.toLowerCase()}!`);
      
      // If accepted, refresh applications to show other rejections and refresh jobs list
      if (action === 'ACCEPTED') {
        const freelancer = applications.find(app => app.id === applicationId)?.freelancer;
        toast.success(
          `${freelancer?.fullName || freelancer?.username} has been selected! You can now contact them to start work.`,
          { autoClose: 5000 }
        );
        
        // Refresh applications list to show all status changes (auto-rejected applications)
        const { data: appData } = await axios.get(`${GET_JOB_APPLICATIONS_ROUTE}/${selectedJob.id}/applications`, {
          headers: { Authorization: `Bearer ${cookies.jwt}` }
        });
        setApplications(appData);
        
        // Refresh the jobs list to update status
        const { data: jobData } = await axios.get(LIST_CLIENT_JOBS_ROUTE, {
          headers: { Authorization: `Bearer ${cookies.jwt}` }
        });
        setJobs(jobData.jobs || []);
      } else {
        // For rejections, just update the single application
        setApplications(applications.map(app => 
          app.id === applicationId 
            ? { ...app, status: action }
            : app
        ));
      }
    } catch (error) {
      console.error('Error updating application:', error);
      toast.error('Failed to update application');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'ACCEPTED': return 'bg-green-100 text-green-800 border-green-200';
      case 'REJECTED': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'ACCEPTED': return <FaCheckCircle className="text-green-600" />;
      case 'REJECTED': return <FaTimesCircle className="text-red-600" />;
      default: return <FaClock className="text-yellow-600" />;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 rounded-xl mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <FaBriefcase />
            Job Application Management
          </h1>
          <p className="text-blue-100">Review and manage applications for your posted jobs</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Jobs List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Your Jobs</h3>
              
              {jobs.length === 0 ? (
                <div className="text-center py-8">
                  <FaBriefcase className="mx-auto text-4xl text-gray-400 mb-4" />
                  <p className="text-gray-500">No jobs posted yet</p>
                  <button
                    onClick={() => router.push('/jobs/create')}
                    className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Post Your First Job
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {jobs.map((job) => (
                    <button
                      key={job.id}
                      onClick={() => setSelectedJob(job)}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                        selectedJob?.id === job.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <h4 className="font-semibold text-gray-900 mb-2">{job.title}</h4>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div className="flex items-center gap-2">
                          <FaDollarSign className="text-green-600" />
                          ${job.budget}
                        </div>
                        <div className="flex items-center gap-2">
                          <FaUser className="text-blue-600" />
                          {job._count?.applications || 0} applications
                        </div>
                      </div>
                      <div className={`mt-2 px-2 py-1 rounded-full text-xs inline-flex items-center gap-1 ${
                        job.complexity === 'LOW' ? 'bg-green-100 text-green-800' :
                        job.complexity === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {job.complexity} Complexity
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Applications List */}
          <div className="lg:col-span-2">
            {selectedJob ? (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Applications for: {selectedJob.title}
                  </h3>
                  <p className="text-gray-600">{applications.length} total applications</p>
                </div>

                {applications.length === 0 ? (
                  <div className="text-center py-12">
                    <FaUser className="mx-auto text-4xl text-gray-400 mb-4" />
                    <h4 className="text-lg font-semibold text-gray-700 mb-2">No Applications Yet</h4>
                    <p className="text-gray-500">Your job is live and waiting for freelancers to apply.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {applications.map((application) => (
                      <div key={application.id} className="border border-gray-200 rounded-xl p-6">
                        {/* Freelancer Header */}
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                              {(application.freelancer.fullName || application.freelancer.username).charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <h4 className="text-lg font-semibold text-gray-900">
                                {application.freelancer.fullName || application.freelancer.username}
                              </h4>
                              <p className="text-gray-600">@{application.freelancer.username}</p>
                            </div>
                          </div>
                          
                          <div className={`px-3 py-1 rounded-full border flex items-center gap-2 ${getStatusColor(application.status)}`}>
                            {getStatusIcon(application.status)}
                            {application.status}
                          </div>
                        </div>

                        {/* Application Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <FaDollarSign className="text-green-600" />
                              <span className="font-medium">Bid Amount</span>
                            </div>
                            <p className="text-xl font-bold text-green-600">${application.bidAmount}</p>
                          </div>
                          
                          <div className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <FaClock className="text-blue-600" />
                              <span className="font-medium">Timeline</span>
                            </div>
                            <p className="text-lg font-semibold text-gray-900">{application.timeline}</p>
                          </div>
                        </div>

                        {/* Proposal */}
                        <div className="mb-4">
                          <h5 className="font-semibold text-gray-900 mb-2">Proposal</h5>
                          <p className="text-gray-700 bg-gray-50 rounded-lg p-4">{application.proposal}</p>
                        </div>

                        {/* Contact Information */}
                        {application.status === 'ACCEPTED' && (
                          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                            <h5 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                              <FaHandshake />
                              Contact Information
                            </h5>
                            <div className="space-y-1 text-sm">
                              <div className="flex items-center gap-2">
                                <FaEnvelope className="text-green-600" />
                                <span>{application.freelancer.email}</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Action Buttons */}
                        {application.status === 'PENDING' && (
                          <div className="flex gap-3">
                            <button
                              onClick={() => handleApplicationAction(application.id, 'ACCEPTED')}
                              disabled={actionLoading}
                              className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                              <FaCheckCircle />
                              Accept & Start Work
                            </button>
                            <button
                              onClick={() => handleApplicationAction(application.id, 'REJECTED')}
                              disabled={actionLoading}
                              className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                              <FaTimesCircle />
                              Reject
                            </button>
                          </div>
                        )}

                        {application.status === 'ACCEPTED' && (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h5 className="font-semibold text-blue-800">Work Started!</h5>
                                <p className="text-blue-600 text-sm">You can now communicate with this freelancer</p>
                              </div>
                              <button
                                onClick={() => router.push(`/orders`)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                              >
                                View Orders
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <FaBriefcase className="mx-auto text-4xl text-gray-400 mb-4" />
                <h4 className="text-lg font-semibold text-gray-700 mb-2">Select a Job</h4>
                <p className="text-gray-500">Choose a job from the left to view its applications</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobApplications;
