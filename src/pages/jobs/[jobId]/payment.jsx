import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useStateProvider } from '../../../context/StateContext';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import {
  FaDollarSign,
  FaUser,
  FaCalendar,
  FaExclamationTriangle,
  FaCheckCircle,
  FaArrowLeft,
  FaClock
} from 'react-icons/fa';
import { useCookies } from 'react-cookie';
import { toast } from 'react-toastify';
import { GET_JOB_ROUTE, GET_JOB_APPLICATIONS_ROUTE, CREATE_JOB_PAYMENT, CONFIRM_JOB_PAYMENT } from '../../../utils/constants';
import CheckoutForm from '../../../components/CheckoutForm';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);

const JobPayment = () => {
  const router = useRouter();
  const { jobId, applicationId } = router.query;
  const [{ userInfo, isSeller }] = useStateProvider();
  const [cookies] = useCookies();
  
  const [loading, setLoading] = useState(true);
  const [job, setJob] = useState(null);
  const [application, setApplication] = useState(null);
  const [clientSecret, setClientSecret] = useState('');
  const [paymentLoading, setPaymentLoading] = useState(false);

  useEffect(() => {
    if (jobId && applicationId) {
      fetchJobDetails();
    }
  }, [jobId, applicationId]);

  const fetchJobDetails = async () => {
    try {
      setLoading(true);
      
      // Fetch job details
      const jobResponse = await fetch(`${GET_JOB_ROUTE}/${jobId}`, {
        headers: {
          'Authorization': `Bearer ${cookies.jwt}`
        }
      });

      if (jobResponse.ok) {
        const jobData = await jobResponse.json();
        setJob(jobData);

        // Fetch application details
        const appResponse = await fetch(`${GET_JOB_APPLICATIONS_ROUTE}/${jobId}/applications`, {
          headers: {
            'Authorization': `Bearer ${cookies.jwt}`
          }
        });

        if (appResponse.ok) {
          const appsData = await appResponse.json();
          const userApp = appsData.applications.find(app => app.id === applicationId);
          setApplication(userApp);
        }
      }
    } catch (error) {
      console.error('Error fetching job details:', error);
      toast.error('Failed to load job details');
    } finally {
      setLoading(false);
    }
  };

  const createPayment = async () => {
    try {
      setPaymentLoading(true);
      
      const response = await fetch(CREATE_JOB_PAYMENT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${cookies.jwt}`
        },
        body: JSON.stringify({
          jobId: jobId,
          applicationId: applicationId
        })
      });

      if (response.ok) {
        const data = await response.json();
        setClientSecret(data.clientSecret);
        toast.success('Payment form loaded successfully');
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to create payment');
      }
    } catch (error) {
      console.error('Error creating payment:', error);
      toast.error('Failed to create payment');
    } finally {
      setPaymentLoading(false);
    }
  };

  const confirmPayment = async (paymentIntentId) => {
    try {
      const response = await fetch(CONFIRM_JOB_PAYMENT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${cookies.jwt}`
        },
        body: JSON.stringify({
          paymentIntent: paymentIntentId
        })
      });

      if (response.ok) {
        toast.success('Payment confirmed successfully!');
        router.push(`/jobs/${jobId}/manage`);
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to confirm payment');
      }
    } catch (error) {
      console.error('Error confirming payment:', error);
      toast.error('Failed to confirm payment');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading payment details...</p>
        </div>
      </div>
    );
  }

  if (!job || !application) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => router.back()}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-8 transition-colors"
          >
            <FaArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </button>
          <div className="flex items-center justify-center">
            <div className="text-center">
              <FaExclamationTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Not Available</h2>
              <p className="text-gray-600">The job or application you're looking for doesn't exist.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isSeller) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => router.back()}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-8 transition-colors"
          >
            <FaArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </button>
          <div className="flex items-center justify-center">
            <div className="text-center">
              <FaExclamationTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
              <p className="text-gray-600">Only clients can make payments for jobs.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (job.status !== 'COMPLETED') {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => router.back()}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-8 transition-colors"
          >
            <FaArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </button>
          <div className="flex items-center justify-center">
            <div className="text-center">
              <FaClock className="w-16 h-16 text-orange-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Job In Progress</h2>
              <p className="text-gray-600 mb-4">
                You cannot make payment until the job is completed.
                <br />
                Current status: <span className="font-semibold capitalize">
                  {job.status === 'IN_PROGRESS' ? 'In Progress' :
                   job.status === 'PENDING_COMPLETION' ? 'Pending Completion' :
                   job.status === 'OPEN' ? 'Open' : job.status}
                </span>
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => router.push(`/jobs/${jobId}/manage`)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  View Job Progress
                </button>
                <button
                  onClick={() => router.push(`/jobs/${jobId}/workspace`)}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Go to Workspace
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (application.status !== 'ACCEPTED') {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => router.back()}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-8 transition-colors"
          >
            <FaArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </button>
          <div className="flex items-center justify-center">
            <div className="text-center">
              <FaExclamationTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Not Available</h2>
              <p className="text-gray-600">You can only pay for accepted applications.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <FaArrowLeft className="w-4 h-4 mr-2" />
            Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Job Payment</h1>
          <p className="mt-2 text-gray-600">Complete payment for the accepted job application</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Job Details */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Job Details</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900">{job.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{job.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center">
                  <FaDollarSign className="w-4 h-4 text-green-600 mr-2" />
                  <div>
                    <p className="text-xs text-gray-600">Budget</p>
                    <p className="font-semibold">${job.budget}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <FaCalendar className="w-4 h-4 text-blue-600 mr-2" />
                  <div>
                    <p className="text-xs text-gray-600">Timeline</p>
                    <p className="font-semibold">{job.timeline}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <FaExclamationTriangle className="w-4 h-4 text-orange-600 mr-2" />
                  <div>
                    <p className="text-xs text-gray-600">Complexity</p>
                    <p className="font-semibold">{job.complexity}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <FaUser className="w-4 h-4 text-purple-600 mr-2" />
                  <div>
                    <p className="text-xs text-gray-600">Freelancer</p>
                    <p className="font-semibold">{application.freelancer?.fullName || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Application Details */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Application Details</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">Proposal</p>
                <p className="text-gray-900">{application.proposal}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Bid Amount</p>
                  <p className="text-2xl font-bold text-green-600">${application.bidAmount}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Proposed Timeline</p>
                  <p className="font-semibold">{application.timeline}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <FaCheckCircle className="w-4 h-4 text-green-600 mr-2" />
                <span className="text-sm text-green-600 font-medium">Application Accepted</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Section */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment</h2>
          
          {!clientSecret ? (
            <div className="text-center py-8">
              <FaDollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">Ready to make payment for this job?</p>
              <button
                onClick={createPayment}
                disabled={paymentLoading}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {paymentLoading ? 'Creating Payment...' : `Pay $${application.bidAmount}`}
              </button>
            </div>
          ) : (
            <div>
              <p className="text-gray-600 mb-4">Complete your payment using the form below:</p>
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <CheckoutForm 
                  onPaymentSuccess={confirmPayment}
                  amount={application.bidAmount}
                />
              </Elements>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobPayment;
