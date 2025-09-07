import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { useStateProvider } from "../../../context/StateContext";
import { toast } from "react-toastify";
import ApplicationSystem from "../../../components/ApplicationSystem";

function ApplyJobPage() {
  const router = useRouter();
  const { jobId } = router.query;
  const [{ isSeller, userInfo }] = useStateProvider();

  useEffect(() => {
    if (!isSeller) {
      toast.error('Only sellers/freelancers can apply to jobs. Switch to seller mode to apply.');
      router.push('/jobs/browse');
      return;
    }
  }, [isSeller, router]);

  if (!jobId) return null;
  
  // Don't render anything if user is not a seller
  if (!isSeller) {
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-start min-h-[80vh] gap-6 p-4">
      <h2 className="text-3xl">Apply to Job</h2>
      <ApplicationSystem jobId={jobId} />
    </div>
  );
}

export default ApplyJobPage;


