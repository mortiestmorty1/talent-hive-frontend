import React, { useMemo } from "react";
import { useStateProvider } from "../context/StateContext";

function SkillBasedReviews() {
  const [{ gigData }] = useStateProvider();

  const byCategory = useMemo(() => {
    const map = {};
    (gigData?.reviews || []).forEach((r) => {
      const key = r.skillCategory || "General";
      if (!map[key]) map[key] = { count: 0, total: 0 };
      map[key].count += 1;
      map[key].total += r.overallRating || r.rating || 0;
    });
    return Object.entries(map).map(([category, { count, total }]) => ({ category, avg: count ? (total / count).toFixed(1) : "0.0", count }));
  }, [gigData]);

  if (!gigData) return null;

  return (
    <div className="mt-8">
      <h4 className="text-xl font-semibold mb-3">Ratings by Skill Category</h4>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {byCategory.map((row) => (
          <div key={row.category} className="p-3 border rounded-lg">
            <div className="font-medium">{row.category}</div>
            <div className="text-sm text-gray-600">{row.avg} / 5 ({row.count})</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SkillBasedReviews;


