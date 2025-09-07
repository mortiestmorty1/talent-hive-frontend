import React from "react";
import { useRouter } from "next/router";
import FreelancerMatching from "../../../components/FreelancerMatching";

function JobMatchesPage() {
  const router = useRouter();
  const { jobId } = router.query;
  if (!jobId) return null;
  return (
    <div className="flex flex-col items-center justify-start min-h-[80vh] gap-6 p-4">
      <h2 className="text-3xl">Top Matches</h2>
      <FreelancerMatching jobId={jobId} />
    </div>
  );
}

export default JobMatchesPage;


