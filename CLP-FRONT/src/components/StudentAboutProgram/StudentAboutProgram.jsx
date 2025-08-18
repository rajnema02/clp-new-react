import React, { useEffect, useState } from "react";
import apiService from "../../Services/api.service";

const StudentAboutProgram = () => {
  const [programs, setPrograms] = useState([]);

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const res = await apiService.get("/about-program");

        // Check if res.data is an array or object containing array
        if (Array.isArray(res.data)) {
          setPrograms(res.data);
        } else if (Array.isArray(res.data?.data)) {
          setPrograms(res.data.data);
        } else {
          console.error("Unexpected API response format:", res.data);
          setPrograms([]);
        }
      } catch (err) {
        console.error("Error fetching programs:", err);
        setPrograms([]);
      }
    };

    fetchPrograms();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6 mt-10 bg-white shadow-lg rounded-2xl">
      <h2 className="text-2xl font-bold mb-6 text-center">About Programs</h2>
      {programs.length === 0 ? (
        <p className="text-center text-gray-500">No programs available.</p>
      ) : (
        <ul className="space-y-4">
          {programs.map((program) => (
            <li
              key={program._id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-lg text-gray-800">
                  {program.title}
                </span>
                <a
                  href={`http://localhost:3000/uploads/about-programs/${program.file}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  View File
                </a>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default StudentAboutProgram;
