import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { IoSearchOutline } from "react-icons/io5";
import AnimatedText from "../../utils/AnimatedText";

const images = [
  "/bg-herof.png",
  "/bg-hero2.png",
  "/bg-hero3.png",
  // "/bg-hero4.png",
  "/bg-hero5.png",
  "/bg-hero6.png",
];

const popularSearchTerms = [
  { label: "Website Design", query: "website design", type: "gigs" },
  { label: "Wordpress", query: "wordpress", type: "gigs" },
  { label: "Logo Design", query: "logo design", type: "gigs" },
  { label: "AI Services", query: "ai services", type: "gigs" },
];

const popularJobSearches = [
  { label: "Web Development", query: "web development", type: "jobs" },
  { label: "Content Writing", query: "content writing", type: "jobs" },
  { label: "Data Analysis", query: "data analysis", type: "jobs" },
  { label: "Mobile App", query: "mobile app", type: "jobs" },
];

const HeroBanner = () => {
  const router = useRouter();
  const [image, setImage] = useState(0);
  const [searchData, setSearchData] = useState("");
  const [searchType, setSearchType] = useState("gigs");

  useEffect(() => {
    const interval = setInterval(
      () => setImage(image >= 4 ? 0 : image + 1),
      4000
    );
    return () => clearInterval(interval);
  }, [image]);

  const handleSearch = () => {
    const query = searchData.trim();
    if (query) {
      if (searchType === "jobs") {
        router.push(`/jobs/browse?search=${query}`);
      } else {
        router.push(`/search?q=${query}&type=gigs`);
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="h-[460px] bg-black md:h-[680px] relative bg-cover">
      <div className="hidden  md:block absolute top-0 right-0 w-full h-full transition-opacity z-0">
        {images.map((img, index) => (
          <Image
            key={index}
            alt="hero"
            src={img}
            fill
            className={` ${
              index == image ? "opacity-100" : "opacity-0"
            } transition-all duration-1000 ease-in-out`}
          />
        ))}
      </div>

      <div className="z-10 relative md:w-1/2 flex justify-center flex-col h-full gap-8 md:gap-5 md:ml-20 mx-6">
        <h1 className="font-macan text-white font-semibold text-4xl md:text-5xl leading-snug ">
          <AnimatedText
            text="Find the perfect freelancer services for your business."
            className="flex flex-wrap pr-0 md:pr-20"
          />
        </h1>

        <div className="flex flex-col gap-4 md:gap-0">
          <div className="flex flex-col md:flex-row gap-2 md:gap-0">
            <select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
              className="h-14 px-4 bg-white border border-gray-300 rounded-md md:rounded-r-none md:w-32 focus:outline-none text-gray-700"
            >
              <option value="gigs">Gigs</option>
              <option value="jobs">Jobs</option>
            </select>
            <div className="relative flex-1">
              <IoSearchOutline className="absolute text-gray-500 text-2xl flex align-middle h-full left-2" />
              <input
                type="text"
                placeholder={searchType === "gigs" ? "Search for any service..." : "Search for job opportunities..."}
                className="h-14 w-full pl-10 pr-5 rounded-md md:rounded-none border border-gray-300 md:border-l-0 focus:outline-none"
                onChange={(e) => setSearchData(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>
            <button
              className="bg-[#1DBF73] text-white py-3 md:py-0 px-8 text-lg font-semibold rounded-md md:rounded-l-none h-14"
              onClick={handleSearch}
            >
              Search
            </button>
          </div>
        </div>

        <div className="hidden text-white md:flex gap-4">
          Popular:
          <ul className="flex gap-5">
            {(searchType === "jobs" ? popularJobSearches : popularSearchTerms).map(({ label, query, type }) => (
              <li
                key={query}
                className="text-sm py-1 px-3 border rounded-full hover:bg-white hover:text-black transition-all duration-300 cursor-pointer"
                onClick={() => {
                  if (type === "jobs") {
                    router.push(`/jobs/browse?search=${query}`);
                  } else {
                    router.push(`/search?q=${query}&type=gigs`);
                  }
                }}
              >
                {label}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;
