import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { LIST_CLIENT_JOBS_ROUTE } from '../../utils/constants';
import { useStateProvider } from '../../context/StateContext';
import { useCookies } from 'react-cookie';
import { toast } from 'react-toastify';
import { MagnifyingGlass } from "react-loader-spinner";

const MyJobs = () => {
  const router = useRouter();
  const [{ userInfo }] = useStateProvider();
  const [cookies] = useCookies();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userInfo) {
      fetchMyJobs();
    }
  }, [userInfo]);

  const fetchMyJobs = async () => {
    try {
      const { data } = await axios.get(LIST_CLIENT_JOBS_ROUTE, {
        headers: { Authorization: `Bearer ${cookies.jwt}` }
      });
      setJobs(data);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast.error('Failed to load your jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleJobClick = (jobId) => {
    router.push(`/jobs/${jobId}`);
  };

  const handleViewMatches = (jobId) => {
    router.push(`/jobs/${jobId}/matches`);
  };

  if (!userInfo) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please Sign In</h2>
          <p className="text-gray-600">You need to be signed in to view your jobs.</p>
        </div>
      </div>
    );
  }

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

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Jobs</h1>
          <p className="text-lg text-gray-600">Manage your job postings and view applications</p>
        </div>
        <button
          onClick={() => router.push('/jobs/create')}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          Post New Job
        </button>
      </div>

      {/* Jobs List */}
      {jobs.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">💼</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Jobs Posted Yet</h3>
          <p className="text-gray-600 mb-6">
            Create your first job posting to start finding talented freelancers!
          </p>
          <button
            onClick={() => router.push('/jobs/create')}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Post Your First Job
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {jobs.map((job) => (
            <div key={job.id} className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 
                    className="text-xl font-semibold text-gray-900 mb-2 cursor-pointer hover:text-blue-600"
                    onClick={() => handleJobClick(job.id)}
                  >
                    {job.title}
                  </h3>
                  <p className="text-gray-600 mb-3 line-clamp-2">{job.description}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>💰 ${job.budget}</span>
                    <span>⏰ {job.timeline}</span>
                    <span className={`px-2 py-1 rounded-full ${
                      job.complexity === 'LOW' ? 'bg-green-100 text-green-800' :
                      job.complexity === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {job.complexity}
                    </span>
                    <span>📅 {new Date(job.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <div className="flex space-x-3 ml-4">
                  <button
                    onClick={() => handleViewMatches(job.id)}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm"
                  >
                    View Matches
                  </button>
                  {(job.status === 'IN_PROGRESS' || job.status === 'PENDING_COMPLETION') && (
                    <button
                      onClick={() => router.push(`/jobs/${job.id}/workspace`)}
                      className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm"
                    >
                      Workspace
                    </button>
                  )}
                  <button
                    onClick={() => handleJobClick(job.id)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm"
                  >
                    View Details
                  </button>
                </div>
              </div>
              
              {job.requiredSkills && job.requiredSkills.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {job.requiredSkills.slice(0, 5).map((skill, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                  {job.requiredSkills.length > 5 && (
                    <span className="text-gray-500 text-sm">+{job.requiredSkills.length - 5} more</span>
                  )}
                </div>
              )}

              {/* Job Stats */}
              <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200">
                <div className="text-center">
                  <div className="text-lg font-semibold text-blue-600">{job._count?.applications || 0}</div>
                  <div className="text-xs text-gray-500">Applications</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-green-600">Active</div>
                  <div className="text-xs text-gray-500">Status</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-purple-600">0</div>
                  <div className="text-xs text-gray-500">Views</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Navigation Links */}
      <div className="mt-8 text-center space-x-4">
        <button
          onClick={() => router.push('/jobs/browse')}
          className="text-blue-500 hover:text-blue-600 font-medium"
        >
          Browse All Jobs
        </button>
        <span className="text-gray-300">|</span>
        <button
          onClick={() => router.push('/dashboard')}
          className="text-blue-500 hover:text-blue-600 font-medium"
        >
          Dashboard
        </button>
      </div>
    </div>
  );
};

export default MyJobs;
