import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table/index";
import Button from "../ui/button/Button";
import PageBreadcrumb from "../common/PageBreadCrumb";
import ComponentCard from "../common/ComponentCard";
import PageMeta from "../common/PageMeta";

// Dummy data for program details
const programData = [
  {
    id: 1,
    detail: "Course Overview Document",
    linkLabel: "View PDF",
    linkUrl: "#",
  },
  {
    id: 2,
    detail: "Curriculum Structure",
    linkLabel: "Download",
    linkUrl: "#",
  },
  {
    id: 3,
    detail: "Orientation Video",
    linkLabel: "Watch",
    linkUrl: "#",
  },
];

const StudentAboutProgram = () => {
  return (
    <>
      <PageMeta
        title="About Program | Student Panel"
        description="This section contains program-related resources and links."
      />

      <PageBreadcrumb pageTitle="About Program" />

      <div className="space-y-6">
        <ComponentCard title="Program Details">
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="max-w-full overflow-x-auto">
              <Table>
                {/* Table Header */}
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    <TableCell
                      isHeader
                      className="px-5 py-3 text-start text-gray-500 text-theme-xs dark:text-gray-400"
                    >
                      Details
                    </TableCell>
                    <TableCell
                      isHeader
                      className="px-5 py-3 text-start text-gray-500 text-theme-xs dark:text-gray-400"
                    >
                      Links
                    </TableCell>
                  </TableRow>
                </TableHeader>

                {/* Table Body */}
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {programData.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="px-5 py-4 text-theme-sm text-gray-800 dark:text-white/90">
                        {item.detail}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-theme-sm text-blue-600 underline">
                        <a href={item.linkUrl} target="_blank" rel="noopener noreferrer">
                          {item.linkLabel}
                        </a>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </ComponentCard>
      </div>
    </>
  );
};

export default StudentAboutProgram;
