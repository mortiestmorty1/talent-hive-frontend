import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { useStateProvider } from "../../context/StateContext";
import { toast } from "react-toastify";
import JobPostingForm from "../../components/JobPostingForm";

function CreateJobPage() {
  const router = useRouter();
  const [{ isSeller, userInfo }] = useStateProvider();

  useEffect(() => {
    if (isSeller) {
      toast.error('Sellers cannot post jobs. Switch to buyer mode to post jobs.');
      router.push('/seller');
      return;
    }
  }, [isSeller, router]);

  // Don't render anything if user is seller
  if (isSeller) {
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-start min-h-[80vh] gap-6 p-4">
      <h2 className="text-3xl">Post a Job</h2>
      <JobPostingForm />
    </div>
  );
}

export default CreateJobPage;


