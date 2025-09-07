import React, { useMemo } from "react";
import { useStateProvider } from "../context/StateContext";

function Bar({ label, value }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-24 text-sm text-gray-600">{label}</div>
      <div className="flex-1 bg-gray-100 h-3 rounded">
        <div className="bg-[#1DBF73] h-3 rounded" style={{ width: `${Math.min(100, (value / 5) * 100)}%` }} />
      </div>
      <div className="w-10 text-sm text-gray-700 text-right">{value?.toFixed ? value.toFixed(1) : value}</div>
    </div>
  );
}

function ReviewAnalytics() {
  const [{ gigData }] = useStateProvider();

  const stats = useMemo(() => {
    const reviews = gigData?.reviews || [];
    if (!reviews.length) return null;
    const avg = (key) => {
      const arr = reviews.map((r) => r[key]).filter((v) => typeof v === "number");
      if (!arr.length) return 0;
      return arr.reduce((a, b) => a + b, 0) / arr.length;
    };
    return {
      overall: avg("overallRating") || avg("rating"),
      communication: avg("communicationRating"),
      timeliness: avg("timelinessRating"),
      quality: avg("qualityRating"),
      skill: avg("skillSpecificRating"),
    };
  }, [gigData]);

  if (!stats) return null;

  return (
    <div className="mt-8">
      <h4 className="text-xl font-semibold mb-3">Review Analytics</h4>
      <div className="grid grid-cols-1 gap-2">
        <Bar label="Overall" value={stats.overall} />
        <Bar label="Communication" value={stats.communication} />
        <Bar label="Timeliness" value={stats.timeliness} />
        <Bar label="Quality" value={stats.quality} />
        <Bar label="Skill Fit" value={stats.skill} />
      </div>
    </div>
  );
}

export default ReviewAnalytics;


