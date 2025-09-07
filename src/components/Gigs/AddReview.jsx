import { useStateProvider } from "../../context/StateContext";
import { reducerCases } from "../../context/constants";
import { ADD_REVIEW_ROUTE } from "../../utils/constants";
import axios from "axios";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { FaStar } from "react-icons/fa";
import { useCookies } from "react-cookie";
import { toast } from "react-toastify";
import EnhancedReviewForm from "../EnhancedReviewForm.jsx";

function AddReview() {
  const [{}, dispatch] = useStateProvider();
  const [data, setData] = useState({ reviewText: "", rating: 0 });
  const [cookies] = useCookies();
  const router = useRouter();
  const { gigId } = router.query;

  const addReview = async () => {
    try {
      const response = await axios.post(
        `${ADD_REVIEW_ROUTE}/${gigId}`,
        { ...data },
        {
          headers: {
            Authorization: `Bearer ${cookies.jwt}`,
          },
        }
      );
      if (response.status === 201) {
        setData({ reviewText: "", rating: 0 });
        dispatch({
          type: reducerCases.ADD_REVIEW,
          newReview: response.data.newReview,
        });
      }
      toast.success("Thanks for your review!");
    } catch (err) {
      console.error(err);
      toast.error("Unexpected error ");
    }
  };

  return (
    <div className="mb-10">
      <EnhancedReviewForm
        gigId={gigId}
        onSubmitted={(newReview) => {
          dispatch({ type: reducerCases.ADD_REVIEW, newReview });
        }}
      />
    </div>
  );
}

export default AddReview;
