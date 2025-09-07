import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useStateProvider } from '../context/StateContext';
import { 
  FaUser, 
  FaSearch, 
  FaBriefcase, 
  FaBox, 
  FaGavel, 
  FaDollarSign,
  FaShoppingCart,
  FaClipboardList,
  FaUserTie,
  FaPlus
} from 'react-icons/fa';

const Dashboard = () => {
  const router = useRouter();
  const [{ userInfo, isSeller }] = useStateProvider();

  const dashboardItems = isSeller ? [
    // Seller/Freelancer Dashboard
    {
      title: "Enhanced Profile",
      description: "Manage your skills, certifications, and portfolio",
      icon: <FaUser />,
      link: "/profile",
      color: "bg-blue-500",
      hoverColor: "hover:bg-blue-600"
    },
    {
      title: "Browse Jobs",
      description: "Find and apply to available job opportunities",
      icon: <FaSearch />,
      link: "/jobs/browse",
      color: "bg-purple-500",
      hoverColor: "hover:bg-purple-600"
    },
    {
      title: "My Gigs",
      description: "Manage your services and offerings",
      icon: <FaBriefcase />,
      link: "/seller/gigs",
      color: "bg-green-500",
      hoverColor: "hover:bg-green-600"
    },
    {
      title: "My Orders",
      description: "View orders from clients",
      icon: <FaBox />,
      link: "/orders",
      color: "bg-indigo-500",
      hoverColor: "hover:bg-indigo-600"
    },
    {
      title: "Dispute Center",
      description: "Manage disputes and resolve conflicts",
      icon: <FaGavel />,
      link: "/disputes",
      color: "bg-orange-500",
      hoverColor: "hover:bg-orange-600"
    },
    {
      title: "Seller Dashboard",
      description: "Track your earnings and analytics",
      icon: <FaDollarSign />,
      link: "/seller/dashboard",
      color: "bg-red-500",
      hoverColor: "hover:bg-red-600"
    }
  ] : [
    // Buyer/Client Dashboard
    {
      title: "Enhanced Profile",
      description: "Manage your profile information",
      icon: <FaUser />,
      link: "/profile",
      color: "bg-blue-500",
      hoverColor: "hover:bg-blue-600"
    },
    {
      title: "Post a Job",
      description: "Create job postings and find talented freelancers",
      icon: <FaBriefcase />,
      link: "/jobs/create",
      color: "bg-green-500",
      hoverColor: "hover:bg-green-600"
    },
    {
      title: "Job Applications",
      description: "Review and manage applications for your jobs",
      icon: <FaUserTie />,
      link: "/jobs/applications",
      color: "bg-purple-500",
      hoverColor: "hover:bg-purple-600"
    },
    {
      title: "My Jobs",
      description: "View and manage your job postings",
      icon: <FaClipboardList />,
      link: "/jobs/my-jobs",
      color: "bg-teal-500",
      hoverColor: "hover:bg-teal-600"
    },
    {
      title: "Browse Services",
      description: "Find and purchase freelancer services",
      icon: <FaShoppingCart />,
      link: "/",
      color: "bg-purple-500",
      hoverColor: "hover:bg-purple-600"
    },
    {
      title: "My Orders",
      description: "View and manage your order history",
      icon: <FaBox />,
      link: "/orders",
      color: "bg-indigo-500",
      hoverColor: "hover:bg-indigo-600"
    },
    {
      title: "Dispute Center",
      description: "Manage disputes and resolve conflicts",
      icon: <FaGavel />,
      link: "/disputes",
      color: "bg-orange-500",
      hoverColor: "hover:bg-orange-600"
    }
  ];

  if (!userInfo) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Welcome to TalentHive</h2>
          <p className="text-lg text-gray-600 mb-8">Please sign in to access your dashboard</p>
          <div className="space-x-4">
            <button 
              onClick={() => router.push('/auth')}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium"
            >
              Sign In
            </button>
            <button 
              onClick={() => router.push('/auth')}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium"
            >
              Join Now
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {userInfo.fullName || userInfo.username}!
        </h1>
        <p className="text-lg text-gray-600">
          Access all your TalentHive features from one place
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {dashboardItems.map((item, index) => (
          <Link key={index} href={item.link}>
            <div className={`${item.color} ${item.hoverColor} text-white rounded-xl p-6 transition-all duration-300 transform hover:scale-105 cursor-pointer shadow-lg`}>
              <div className="flex items-center mb-4">
                <span className="text-3xl mr-3">{item.icon}</span>
                <h3 className="text-xl font-semibold">{item.title}</h3>
              </div>
              <p className="text-white/90 text-sm">{item.description}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Stats</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">0</div>
            <div className="text-sm text-gray-600">Active Orders</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">0</div>
            <div className="text-sm text-gray-600">Completed Projects</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">0</div>
            <div className="text-sm text-gray-600">Job Applications</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">⭐ 5.0</div>
            <div className="text-sm text-gray-600">Average Rating</div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
              <span className="text-gray-700">Profile updated successfully</span>
            </div>
            <span className="text-sm text-gray-500">Just now</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
              <span className="text-gray-700">Welcome to TalentHive!</span>
            </div>
            <span className="text-sm text-gray-500">Today</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
