import React, { useEffect, useState } from "react";
import axios from "axios";
import { useCookies } from "react-cookie";
import { GET_JOB_MATCHES_ROUTE } from "../utils/constants";

function FreelancerMatching({ jobId }) {
  const [cookies] = useCookies();
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    const run = async () => {
      const { data } = await axios.get(`${GET_JOB_MATCHES_ROUTE}/${jobId}?limit=10`, { headers: { Authorization: `Bearer ${cookies.jwt}` } });
      setMatches(data);
    };
    if (jobId && cookies.jwt) run();
  }, [jobId, cookies]);

  return (
    <div className="w-full">
      <h3 className="text-xl font-semibold mb-2">Top Matches</h3>
      <div className="grid grid-cols-1 gap-3">
        {matches.map(({ freelancer, score }) => (
          <div key={freelancer.id} className="p-3 border rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gray-200 overflow-hidden" />
                <div>
                  <div className="font-semibold">{freelancer.fullName || freelancer.username}</div>
                  <div className="text-xs text-gray-500">Skills: {(freelancer.skills || []).map((s) => s.skillName).join(", ")}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">{score.total}%</div>
                <div className="text-xs text-gray-500">skills {score.breakdown.skills}% · exp {score.breakdown.experience}% · port {score.breakdown.portfolio}% · rev {score.breakdown.reviews}%</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default FreelancerMatching;


