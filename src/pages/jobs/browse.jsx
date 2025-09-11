import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import { useStateProvider } from '../../context/StateContext';
import { BROWSE_JOBS_ROUTE, SEARCH_JOBS_ROUTE } from '../../utils/constants';
import { useCookies } from 'react-cookie';
import { toast } from 'react-toastify';
import { MagnifyingGlass } from "react-loader-spinner";
import { IoSearchOutline } from 'react-icons/io5';
import { FaBriefcase, FaDollarSign, FaClock } from 'react-icons/fa';

const BrowseJobs = () => {
  const router = useRouter();
  const [{ userInfo, isSeller }] = useStateProvider();
  const [cookies] = useCookies();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  
  // New filter states
  const [filters, setFilters] = useState({
    category: 'all',
    complexity: 'all',
    minBudget: '',
    maxBudget: '',
    timeline: 'all'
  });

  useEffect(() => {
    const { search } = router.query;
    if (search) {
      setSearchTerm(search);
      searchJobs(search);
    } else {
      fetchJobs();
    }
  }, [router.query]);

  const fetchJobs = async () => {
    try {
      const params = {};
      
      // Add filter parameters
      if (filters.category !== 'all') params.category = filters.category;
      if (filters.complexity !== 'all') params.complexity = filters.complexity;
      if (filters.minBudget) params.minBudget = filters.minBudget;
      if (filters.maxBudget) params.maxBudget = filters.maxBudget;
      if (filters.timeline !== 'all') params.timeline = filters.timeline;
      
      // Only add auth header if user is logged in
      const config = { params };
      if (cookies.jwt) {
        config.headers = { Authorization: `Bearer ${cookies.jwt}` };
      }
      
      const { data } = await axios.get(BROWSE_JOBS_ROUTE, config);
      setJobs(data);
      setFilteredJobs(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast.error('Failed to load jobs');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (jobs.length > 0) {
      filterJobs();
    }
  }, [filter, jobs]);

  // Refetch jobs when filters change
  useEffect(() => {
    if (!loading) {
      fetchJobs();
    }
  }, [filters]);

  const filterJobs = () => {
    let filtered = jobs;
    
    // Apply category filter
    if (filters.category !== 'all') {
      filtered = filtered.filter(job => {
        const categoryMatch = job.title && job.title.toLowerCase().includes(filters.category.toLowerCase());
        const skillsMatch = job.requiredSkills && job.requiredSkills.some(skill => 
          skill.toLowerCase().includes(filters.category.toLowerCase())
        );
        const descriptionMatch = job.description && job.description.toLowerCase().includes(filters.category.toLowerCase());
        
        return categoryMatch || skillsMatch || descriptionMatch;
      });
    }
    
    // Apply complexity filter
    if (filters.complexity !== 'all') {
      filtered = filtered.filter(job => job.complexity === filters.complexity.toUpperCase());
    }
    
    // Apply budget filters
    if (filters.minBudget) {
      filtered = filtered.filter(job => job.budget >= Number(filters.minBudget));
    }
    if (filters.maxBudget) {
      filtered = filtered.filter(job => job.budget <= Number(filters.maxBudget));
    }
    
    // Apply timeline filter
    if (filters.timeline !== 'all') {
      filtered = filtered.filter(job => {
        const timeline = job.timeline.toLowerCase();
        switch (filters.timeline) {
          case 'less-than-1-week':
            return timeline.includes('day') || timeline.includes('week') && !timeline.includes('month');
          case '1-4-weeks':
            return timeline.includes('week') && !timeline.includes('month');
          case '1-3-months':
            return timeline.includes('month');
          case 'more-than-3-months':
            return timeline.includes('month') && (timeline.includes('3') || timeline.includes('4') || timeline.includes('5') || timeline.includes('6') || timeline.includes('year'));
          default:
            return true;
        }
      });
    }
    
    setFilteredJobs(filtered);
  };

  const handleApply = (jobId) => {
    if (!isSeller) {
      toast.error('Only sellers/freelancers can apply to jobs. Switch to seller mode to apply.');
      return;
    }
    router.push(`/jobs/${jobId}/apply`);
  };

  const handleJobClick = (jobId) => {
    router.push(`/jobs/${jobId}`);
  };

  const searchJobs = async (searchQuery) => {
    if (!searchQuery.trim()) {
      fetchJobs(); // Reset to all jobs if search is empty
      return;
    }

    setIsSearching(true);
    setLoading(true); // Set loading to true when starting search
    try {
      const searchParams = { searchTerm: searchQuery };
      
      // Add filter parameters to search
      if (filters.category !== 'all') searchParams.category = filters.category;
      if (filters.complexity !== 'all') searchParams.complexity = filters.complexity;
      if (filters.minBudget) searchParams.minBudget = filters.minBudget;
      if (filters.maxBudget) searchParams.maxBudget = filters.maxBudget;
      
      // Only add auth header if user is logged in
      const config = { params: searchParams };
      if (cookies.jwt) {
        config.headers = { Authorization: `Bearer ${cookies.jwt}` };
      }
      
      const { data } = await axios.get(SEARCH_JOBS_ROUTE, config);
      setJobs(data.jobs);
      setFilteredJobs(data.jobs);
      setIsSearching(false);
      setLoading(false); // Set loading to false when search completes
    } catch (error) {
      console.error('Error searching jobs:', error);
      toast.error('Failed to search jobs');
      setIsSearching(false);
      setLoading(false); // Set loading to false even on error
    }
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      category: 'all',
      complexity: 'all',
      minBudget: '',
      maxBudget: '',
      timeline: 'all'
    });
    setFilter('all');
  };

  const handleSearch = () => {
    searchJobs(searchTerm);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    fetchJobs();
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

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Browse Jobs</h1>
        <p className="text-lg text-gray-600">Find the perfect opportunities for your skills</p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="flex gap-4 items-center">
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search jobs by title, description, or skills..."
              className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
            <IoSearchOutline className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
          </div>
          <button
            onClick={handleSearch}
            disabled={isSearching}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            {isSearching ? 'Searching...' : 'Search'}
          </button>
          {searchTerm && (
            <button
              onClick={clearSearch}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-3 rounded-lg font-medium transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Advanced Filters */}
      <div className="mb-6 bg-gray-50 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
          <button
            onClick={clearAllFilters}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Clear All
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Categories</option>
              <option value="web-development">Web Development</option>
              <option value="design">Design</option>
              <option value="writing">Writing</option>
              <option value="marketing">Marketing</option>
              <option value="programming">Programming</option>
              <option value="data">Data</option>
              <option value="business">Business</option>
            </select>
          </div>

          {/* Complexity Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Complexity</label>
            <select
              value={filters.complexity}
              onChange={(e) => handleFilterChange('complexity', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Levels</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
          </div>

          {/* Budget Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Min Budget ($)</label>
            <input
              type="number"
              value={filters.minBudget}
              onChange={(e) => handleFilterChange('minBudget', e.target.value)}
              placeholder="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Max Budget ($)</label>
            <input
              type="number"
              value={filters.maxBudget}
              onChange={(e) => handleFilterChange('maxBudget', e.target.value)}
              placeholder="10000"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Timeline Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Timeline</label>
            <select
              value={filters.timeline}
              onChange={(e) => handleFilterChange('timeline', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Any Timeline</option>
              <option value="less-than-1-week">Less than 1 week</option>
              <option value="1-4-weeks">1-4 weeks</option>
              <option value="1-3-months">1-3 months</option>
              <option value="more-than-3-months">More than 3 months</option>
            </select>
          </div>
        </div>
      </div>

      {/* Job Listings */}
      {filteredJobs.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4 text-gray-400">
            <FaBriefcase className="mx-auto" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {jobs.length === 0 ? 'No Jobs Available Yet' : `No Jobs Found for "${filter}"`}
          </h3>
          <p className="text-gray-600 mb-6">
            {jobs.length === 0 
              ? 'Be the first to post a job or check back later for new opportunities!'
              : 'Try adjusting your filters or browse all jobs.'
            }
          </p>
          {jobs.length === 0 && !isSeller && (
            <button
              onClick={() => router.push('/jobs/create')}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Post a Job
            </button>
          )}
          {jobs.length > 0 && (
            <button
              onClick={() => setFilter('all')}
              className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Show All Jobs
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {filteredJobs.map((job) => (
            <div key={job.id} className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <div className="flex justify-between items-start mb-4">
                <div 
                  className="flex-1 cursor-pointer"
                  onClick={() => handleJobClick(job.id)}
                >
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 hover:text-blue-600 transition-colors">{job.title}</h3>
                  <p className="text-gray-600 mb-2">{job.description}</p>
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
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  {isSeller ? (
                    <button
                      onClick={() => handleApply(job.id)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                    >
                      Apply Now
                    </button>
                  ) : (
                    <div className="text-center">
                      <button
                        onClick={() => handleJobClick(job.id)}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-medium transition-colors mb-2"
                      >
                        View Details
                      </button>
                      <p className="text-xs text-gray-500">Switch to seller mode to apply</p>
                    </div>
                  )}
                </div>
              </div>
              
              {job.requiredSkills && job.requiredSkills.length > 0 && (
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
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BrowseJobs;
