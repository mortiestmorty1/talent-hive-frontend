import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { GET_JOB_ROUTE } from '../../utils/constants';
import { useStateProvider } from '../../context/StateContext';
import { useCookies } from 'react-cookie';
import { toast } from 'react-toastify';
import { MagnifyingGlass } from "react-loader-spinner";
import FreelancerMatching from '../../components/FreelancerMatching';
import { FaDollarSign, FaCalendarAlt, FaTimes, FaClock } from "react-icons/fa";

const JobDetails = () => {
  const router = useRouter();
  const { jobId } = router.query;
  const [{ userInfo, isSeller }] = useStateProvider();
  const [cookies] = useCookies();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showMatches, setShowMatches] = useState(false);

  useEffect(() => {
    if (jobId) {
      fetchJob();
    }
  }, [jobId]);

  const fetchJob = async () => {
    try {
      const { data } = await axios.get(`${GET_JOB_ROUTE}/${jobId}`, {
        headers: { Authorization: `Bearer ${cookies.jwt}` }
      });
      setJob(data);
    } catch (error) {
      console.error('Error fetching job:', error);
      toast.error('Failed to load job details');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (!isSeller) {
      toast.error('Only sellers/freelancers can apply to jobs. Switch to seller mode to apply.');
      return;
    }
    router.push(`/jobs/${jobId}/apply`);
  };

  const handleViewMatches = () => {
    setShowMatches(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <MagnifyingGlass
          visible={true}
          height="80"
          width="80"
          ariaLabel="MagnifyingGlass-loading"
          wrapperStyle={{}}
          wrapperClass="MagnifyingGlass-wrapper"
          glassColor="#c0efff"
          color="#e15b64"
        />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Job Not Found</h2>
          <p className="text-gray-600 mb-6">The job you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => router.push('/jobs/browse')}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium"
          >
            Browse All Jobs
          </button>
        </div>
      </div>
    );
  }

  const isOwner = userInfo && userInfo.id === job.clientId;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="text-blue-500 hover:text-blue-600 mb-4 flex items-center"
        >
          ← Back
        </button>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{job.title}</h1>
        <div className="flex items-center space-x-4 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <FaDollarSign className="text-green-600" />
            ${job.budget}
          </span>
          <span className="flex items-center gap-1">
            <FaClock className="text-blue-600" />
            {job.timeline}
          </span>
          <span className={`px-2 py-1 rounded-full ${
            job.complexity === 'LOW' ? 'bg-green-100 text-green-800' :
            job.complexity === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {job.complexity}
          </span>
          <span className="flex items-center gap-1">
            <FaCalendarAlt className="text-gray-600" />
            Posted {new Date(job.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Job Content */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Job Description</h2>
        <p className="text-gray-700 mb-6 whitespace-pre-wrap">{job.description}</p>

        {job.requiredSkills && job.requiredSkills.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Required Skills</h3>
            <div className="flex flex-wrap gap-2">
              {job.requiredSkills.map((skill, index) => (
                <span
                  key={index}
                  className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4">
          {isOwner ? (
            <>
              <button
                onClick={() => router.push(`/jobs/${jobId}/applications`)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                View Applications ({job.applications ? job.applications.length : 0})
              </button>
              <button
                onClick={handleViewMatches}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                View Freelancer Matches
              </button>
              {(job.status === 'IN_PROGRESS' || job.status === 'PENDING_COMPLETION') && (
                <button
                  onClick={() => router.push(`/jobs/${jobId}/workspace`)}
                  className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Workspace
                </button>
              )}
              <button
                onClick={() => router.push('/jobs/my-jobs')}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                My Jobs
              </button>
            </>
          ) : (
            <div className="flex flex-col gap-3">
              {isSeller ? (
                <>
                  {(job.status === 'IN_PROGRESS' || job.status === 'PENDING_COMPLETION') && job.acceptedFreelancerId === userInfo?.id ? (
                    <button
                      onClick={() => router.push(`/jobs/${jobId}/workspace`)}
                      className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                    >
                      Go to Workspace
                    </button>
                  ) : (
                    <button
                      onClick={handleApply}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                    >
                      Apply for This Job
                    </button>
                  )}
                </>
              ) : (
                <div className="text-center">
                  <button
                    onClick={() => router.push('/jobs/browse')}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-colors mb-2"
                  >
                    Browse More Jobs
                  </button>
                  <p className="text-sm text-gray-600">
                    Switch to seller mode to apply for jobs
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Freelancer Matches Section */}
      {showMatches && isOwner && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Top Freelancer Matches</h2>
            <button
              onClick={() => setShowMatches(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <FaTimes />
            </button>
          </div>
          <FreelancerMatching jobId={jobId} />
        </div>
      )}

      {/* Job Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        {isOwner ? (
          <button
            onClick={() => router.push(`/jobs/${jobId}/applications`)}
            className="bg-white rounded-lg shadow p-4 text-center hover:shadow-md transition-shadow cursor-pointer border-2 border-blue-200 hover:border-blue-300"
          >
            <div className="text-2xl font-bold text-blue-600">
              {job.applications ? job.applications.length : 0}
            </div>
            <div className="text-sm text-gray-600">Applications</div>
            <div className="text-xs text-blue-500 mt-1">Click to view</div>
          </button>
        ) : (
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {job.applications ? job.applications.length : 0}
            </div>
            <div className="text-sm text-gray-600">Applications</div>
          </div>
        )}
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-2xl font-bold text-green-600">
            {job.status === 'OPEN' ? 'Open' :
             job.status === 'IN_PROGRESS' ? 'In Progress' :
             job.status === 'PENDING_COMPLETION' ? 'Pending Completion' :
             job.status === 'COMPLETED' ? 'Completed' :
             job.status === 'CANCELLED' ? 'Cancelled' :
             job.status}
          </div>
          <div className="text-sm text-gray-600">Status</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">${job.budget}</div>
          <div className="text-sm text-gray-600">Budget</div>
        </div>
      </div>
    </div>
  );
};

export default JobDetails;
