import React, { useEffect, useState } from "react";
import axios from "axios";
import { useCookies } from "react-cookie";
import { useStateProvider } from "../context/StateContext";
import { reducerCases } from "../context/constants";
import { GET_PROFILE_EXTRA, SKILLS_ROUTE, CERTIFICATIONS_ROUTE, PORTFOLIO_ROUTE } from "../utils/constants";
import SkillSelector from "./SkillSelector";
import PortfolioUpload from "./PortfolioUpload";
import CertificationUpload from "./CertificationUpload";
import { toast } from "react-toastify";

function EnhancedProfile() {
  const [cookies] = useCookies();
  const [{ profileExtra }, dispatch] = useStateProvider();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExtra = async () => {
      try {
        const { data } = await axios.get(GET_PROFILE_EXTRA, {
          headers: { Authorization: `Bearer ${cookies.jwt}` },
        });
        dispatch({ type: reducerCases.SET_PROFILE_EXTRA, profileExtra: data });
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };
    if (cookies.jwt) fetchExtra();
  }, [cookies, dispatch]);

  const addSkill = async (payload) => {
    try {
      const { data } = await axios.post(SKILLS_ROUTE, payload, { headers: { Authorization: `Bearer ${cookies.jwt}` } });
      dispatch({ type: reducerCases.SET_PROFILE_EXTRA, profileExtra: { ...profileExtra, skills: data } });
      toast.success("Skill added");
    } catch (e) {
      toast.error(e?.response?.data || "Failed to add skill");
    }
  };

  const updateSkill = async (index, payload) => {
    try {
      const { data } = await axios.put(`${SKILLS_ROUTE}/${index}`, payload, { headers: { Authorization: `Bearer ${cookies.jwt}` } });
      dispatch({ type: reducerCases.SET_PROFILE_EXTRA, profileExtra: { ...profileExtra, skills: data } });
      toast.success("Skill updated");
    } catch (e) {
      toast.error(e?.response?.data || "Failed to update skill");
    }
  };

  const removeSkill = async (index) => {
    try {
      const { data } = await axios.delete(`${SKILLS_ROUTE}/${index}`, { headers: { Authorization: `Bearer ${cookies.jwt}` } });
      dispatch({ type: reducerCases.SET_PROFILE_EXTRA, profileExtra: { ...profileExtra, skills: data } });
      toast.success("Skill removed");
    } catch (e) {
      toast.error(e?.response?.data || "Failed to remove skill");
    }
  };

  const addCertification = async (payload) => {
    try {
      const { data } = await axios.post(CERTIFICATIONS_ROUTE, payload, { headers: { Authorization: `Bearer ${cookies.jwt}` } });
      dispatch({ type: reducerCases.SET_PROFILE_EXTRA, profileExtra: { ...profileExtra, certifications: data } });
      toast.success("Certification added");
    } catch (e) {
      toast.error(e?.response?.data || "Failed to add certification");
    }
  };

  const updateCertification = async (index, payload) => {
    try {
      const { data } = await axios.put(`${CERTIFICATIONS_ROUTE}/${index}`, payload, { headers: { Authorization: `Bearer ${cookies.jwt}` } });
      dispatch({ type: reducerCases.SET_PROFILE_EXTRA, profileExtra: { ...profileExtra, certifications: data } });
      toast.success("Certification updated");
    } catch (e) {
      toast.error(e?.response?.data || "Failed to update certification");
    }
  };

  const removeCertification = async (index) => {
    try {
      const { data } = await axios.delete(`${CERTIFICATIONS_ROUTE}/${index}`, { headers: { Authorization: `Bearer ${cookies.jwt}` } });
      dispatch({ type: reducerCases.SET_PROFILE_EXTRA, profileExtra: { ...profileExtra, certifications: data } });
      toast.success("Certification removed");
    } catch (e) {
      toast.error(e?.response?.data || "Failed to remove certification");
    }
  };

  const addPortfolio = async (formData) => {
    try {
      const { data } = await axios.post(PORTFOLIO_ROUTE, formData, { headers: { Authorization: `Bearer ${cookies.jwt}` } });
      dispatch({ type: reducerCases.SET_PROFILE_EXTRA, profileExtra: { ...profileExtra, portfolio: data } });
      toast.success("Portfolio item added");
    } catch (e) {
      toast.error(e?.response?.data || "Failed to add portfolio item");
    }
  };

  const updatePortfolio = async (index, formData) => {
    try {
      const { data } = await axios.put(`${PORTFOLIO_ROUTE}/${index}`, formData, { headers: { Authorization: `Bearer ${cookies.jwt}` } });
      dispatch({ type: reducerCases.SET_PROFILE_EXTRA, profileExtra: { ...profileExtra, portfolio: data } });
      toast.success("Portfolio item updated");
    } catch (e) {
      toast.error(e?.response?.data || "Failed to update portfolio item");
    }
  };

  const removePortfolio = async (index) => {
    try {
      const { data } = await axios.delete(`${PORTFOLIO_ROUTE}/${index}`, { headers: { Authorization: `Bearer ${cookies.jwt}` } });
      dispatch({ type: reducerCases.SET_PROFILE_EXTRA, profileExtra: { ...profileExtra, portfolio: data } });
      toast.success("Portfolio item removed");
    } catch (e) {
      toast.error(e?.response?.data || "Failed to remove portfolio item");
    }
  };

  if (loading) return null;

  return (
    <div className="flex flex-col gap-10 w-full max-w-6xl mx-auto px-8 py-8 bg-white">
      <div className="text-center">
        <h2 className="text-3xl font-semibold text-[#404145] mb-2">Enhanced Profile</h2>
        <p className="text-gray-600">Showcase your skills, certifications, and portfolio</p>
      </div>
      <SkillSelector skills={profileExtra?.skills || []} onAdd={addSkill} onUpdate={updateSkill} onRemove={removeSkill} />
      <CertificationUpload certifications={profileExtra?.certifications || []} onAdd={addCertification} onUpdate={updateCertification} onRemove={removeCertification} />
      <PortfolioUpload portfolio={profileExtra?.portfolio || []} onAdd={addPortfolio} onUpdate={updatePortfolio} onRemove={removePortfolio} />
    </div>
  );
}

export default EnhancedProfile;


