import React from "react";
import { useStateProvider } from "../../../context/StateContext";
import JobMessageContainer from "../../../components/Messages/JobMessageContainer";

const JobMessages = () => {
  const [{ userInfo }] = useStateProvider();

  return (
    <div className="min-h-[80vh] my-10 mt-0 px-4 md:px-32">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Job Messages</h1>
        <p className="text-lg text-gray-600">
          Communicate with your client/freelancer about this job
        </p>
      </div>
      {userInfo && <JobMessageContainer />}
    </div>
  );
};

export default JobMessages;
