import React, { useState } from "react";
import axios from "axios";
import { useCookies } from "react-cookie";
import { ADD_REVIEW_ROUTE } from "../utils/constants";
import { toast } from "react-toastify";

function StarInput({ value, onChange }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          className={`text-xl ${s <= value ? "text-yellow-400" : "text-gray-300"}`}
          onClick={() => onChange(s)}
        >
          ★
        </button>
      ))}
    </div>
  );
}

function EnhancedReviewForm({ gigId, onSubmitted }) {
  const [cookies] = useCookies();
  const [reviewText, setReviewText] = useState("");
  const [skillCategory, setSkillCategory] = useState("");
  const [skillSpecificRating, setSkillSpecificRating] = useState(0);
  const [communicationRating, setCommunicationRating] = useState(0);
  const [timelinessRating, setTimelinessRating] = useState(0);
  const [qualityRating, setQualityRating] = useState(0);

  const input = "block p-3 w-full text-sm border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500";
  const label = "mb-2 text-sm font-medium text-gray-900";

  const submit = async () => {
    try {
      // Basic client-side validation
      const hasReviewText = reviewText.trim().length > 0;
      const hasAnyRating = skillSpecificRating > 0 || communicationRating > 0 || timelinessRating > 0 || qualityRating > 0;

      if (!hasReviewText && !hasAnyRating) {
        toast.error("Please provide a review comment or at least one rating.");
        return;
      }

      if (skillSpecificRating > 0 && !skillCategory.trim()) {
        toast.error("Please specify the skill category when providing a skill rating.");
        return;
      }

      const payload = {
        reviewText: reviewText.trim(),
        skillCategory: skillCategory.trim() || undefined,
        skillSpecificRating: skillSpecificRating > 0 ? skillSpecificRating : undefined,
        communicationRating: communicationRating > 0 ? communicationRating : undefined,
        timelinessRating: timelinessRating > 0 ? timelinessRating : undefined,
        qualityRating: qualityRating > 0 ? qualityRating : undefined,
      };

      const { data, status } = await axios.post(`${ADD_REVIEW_ROUTE}/${gigId}`, payload, {
        headers: { Authorization: `Bearer ${cookies.jwt}` },
      });

      if (status === 201) {
        toast.success("Thanks for your review!");
        onSubmitted && onSubmitted(data.newReview);
        // Reset form
        setReviewText("");
        setSkillCategory("");
        setSkillSpecificRating(0);
        setCommunicationRating(0);
        setTimelinessRating(0);
        setQualityRating(0);
      }
    } catch (e) {
      const errorMessage = e?.response?.data || "Failed to submit review";
      toast.error(errorMessage);
      console.error("Review submission error:", e);
    }
  };

  return (
    <div className="mb-10">
      <h3 className="text-2xl my-5 font-normal text-[#404145]">Leave a Review</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={label}>Skill Category</label>
          <input className={input} value={skillCategory} onChange={(e) => setSkillCategory(e.target.value)} placeholder="e.g. Frontend" />
        </div>
        <div>
          <label className={label}>Communication</label>
          <StarInput value={communicationRating} onChange={setCommunicationRating} />
        </div>
        <div>
          <label className={label}>Timeliness</label>
          <StarInput value={timelinessRating} onChange={setTimelinessRating} />
        </div>
        <div>
          <label className={label}>Quality</label>
          <StarInput value={qualityRating} onChange={setQualityRating} />
        </div>
        <div>
          <label className={label}>Skill Fit</label>
          <StarInput value={skillSpecificRating} onChange={setSkillSpecificRating} />
        </div>
        <div className="md:col-span-2">
          <label className={label}>Comments</label>
          <textarea className={input} value={reviewText} onChange={(e) => setReviewText(e.target.value)} placeholder="Share your experience" />
        </div>
        <div className="md:col-span-2">
          <button className="border text-sm font-semibold px-4 py-2 border-[#1DBF73] bg-[#1DBF73] text-white rounded-md" type="button" onClick={submit}>Submit Review</button>
        </div>
      </div>
    </div>
  );
}

export default EnhancedReviewForm;


