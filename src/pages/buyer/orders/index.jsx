import React, { useEffect } from "react";
import { useRouter } from "next/router";

const BuyerOrdersRedirect = () => {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the unified orders page
    router.replace("/orders");
  }, [router]);

  return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-lg text-gray-600">Redirecting to orders...</p>
      </div>
    </div>
  );
};

export default BuyerOrdersRedirect;
