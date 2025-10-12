import React from "react";
import { useStateProvider } from "../../context/StateContext";
import { useRouter } from "next/router";
import { FiClock, FiRefreshCcw } from "react-icons/fi";
import { BsCheckLg } from "react-icons/bs";
import { BiRightArrowAlt } from "react-icons/bi";
import { reducerCases } from "../../context/constants";
import { toast } from "react-toastify";

const Pricing = () => {
  const [{ gigData, userInfo, isSeller }, dispatch] = useStateProvider();
  const router = useRouter();

  const handleOrderGig = () => {
    // Check if user is authenticated first
    if (!userInfo) {
      // Show login modal
      dispatch({
        type: reducerCases.TOGGLE_LOGIN_MODAL,
        showLoginModal: true,
      });
      return;
    }

    // Prevent sellers from purchasing gigs
    if (isSeller) {
      toast.error('Sellers cannot purchase gigs. Please switch to Buyer mode to purchase services.', {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }
    
    // Proceed to checkout
    router.push(`/checkout?gigId=${gigData.id}`);
  };

  const handleContactMe = () => {
    // Check if user is authenticated first
    if (!userInfo) {
      // Show login modal
      dispatch({
        type: reducerCases.TOGGLE_LOGIN_MODAL,
        showLoginModal: true,
      });
      return;
    }
    
    // Proceed to contact/messaging functionality
    // For now, we'll show a toast message
    // You can implement actual messaging functionality here
    alert('Contact functionality will be implemented here');
  };
  return (
    <>
      {gigData && (
        <div className="sticky top-36 mb-10 h-max w-96 ">
          <div className="border p-10 flex flex-col gap-5">
            <div className="flex justify-between">
              <h4 className="text-md font-normal text-[#74767e]">
                {gigData.shortDesc}
              </h4>
              <h6 className="font-medium text-3xl"> ${gigData.price} </h6>
            </div>
            <div>
              <div className="text-[#62646a] font-semibold text-sm flex gap-6">
                <div className="flex items-center gap-2">
                  <FiClock className="text-xl" />
                  <span>{gigData.deliveryTime} Days Delivery</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiRefreshCcw className="text-xl" />
                  <span>{gigData.revisions} Revisions</span>
                </div>
              </div>
              <ul></ul>
            </div>
            <ul className="flex gap-1 flex-col">
              {gigData.features.map((feature) => (
                <li key={feature} className="flex items-center gap-3">
                  <BsCheckLg className="text-[#1DBF73] text-lg" />
                  <span className="text-[#4f5156]">{feature}</span>
                </li>
              ))}
            </ul>
            {gigData.userId === userInfo?.id ? (
              <button
                className="flex items-center bg-[#1DBF73] text-white py-2 justify-center font-bold text-lg relative rounded"
                onClick={() => router.push(`/seller/gigs/${gigData.id}`)}
              >
                <span>Edit</span>
                <BiRightArrowAlt className="text-2xl absolute right-4" />
              </button>
            ) : (
              <>
                <button
                  className={`flex items-center ${isSeller ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#1DBF73] hover:bg-[#19a463]'} text-white py-2 justify-center font-bold text-lg relative rounded transition-colors`}
                  onClick={handleOrderGig}
                  disabled={isSeller}
                >
                  <span>{isSeller ? 'Switch to Buyer Mode' : 'Continue'}</span>
                  <BiRightArrowAlt className="text-2xl absolute right-4" />
                </button>
                {isSeller && (
                  <p className="text-center text-sm text-red-600 mt-2">
                    ⚠️ You must switch to Buyer mode to purchase gigs
                  </p>
                )}
              </>
            )}
          </div>
          {gigData.userId !== userInfo?.id && (
            <div className="flex items-center justify-center mt-5">
              <button 
                className=" w-5/6 hover:bg-[#74767e] py-1 border border-[#74767e] px-5 text-[#6c6d75] hover:text-white transition-all duration-300 text-lg rounded font-bold"
                onClick={handleContactMe}
              >
                Contact Me
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default Pricing;
