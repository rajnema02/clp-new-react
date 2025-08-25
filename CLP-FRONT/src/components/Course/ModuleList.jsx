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

// Dummy module data
const moduleData = [
  {
    id: 1,
    courseType: "Online",
    courseName: "React Mastery",
    moduleName: "React Basics",
    moduleCode: "RM101",
    moduleFees: "₹2,000",
    moduleDuration: "3 weeks",
  },
  {
    id: 2,
    courseType: "Offline",
    courseName: "Node.js Advanced",
    moduleName: "API Development",
    moduleCode: "NA202",
    moduleFees: "₹3,500",
    moduleDuration: "4 weeks",
  },
];

const ModuleList = () => {
  return (
    <>
      <PageMeta
        title="Module List | CLP"
        description="This is the module list page for CLP"
      />
      <PageBreadcrumb pageTitle="Modules" />

      <div className="space-y-6">
        <ComponentCard title="Modules Table">
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
            <div className="max-w-full overflow-x-auto">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    <TableCell isHeader className="px-5 py-3 text-start text-gray-500 text-theme-xs dark:text-gray-400">
                      Course Type
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 text-start text-gray-500 text-theme-xs dark:text-gray-400">
                      Course Name
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 text-start text-gray-500 text-theme-xs dark:text-gray-400">
                      Module Name
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 text-start text-gray-500 text-theme-xs dark:text-gray-400">
                      Module Code
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 text-start text-gray-500 text-theme-xs dark:text-gray-400">
                      Module Fees
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 text-start text-gray-500 text-theme-xs dark:text-gray-400">
                      Module Duration
                    </TableCell>
                    <TableCell isHeader className="px-5 py-3 text-start text-gray-500 text-theme-xs dark:text-gray-400">
                      Action
                    </TableCell>
                  </TableRow>
                </TableHeader>

                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {moduleData.map((mod) => (
                    <TableRow key={mod.id}>
                      <TableCell className="px-5 py-4 text-theme-sm text-gray-800 dark:text-white/90">
                        {mod.courseType}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-theme-sm text-gray-500 dark:text-gray-400">
                        {mod.courseName}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-theme-sm text-gray-500 dark:text-gray-400">
                        {mod.moduleName}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-theme-sm text-gray-500 dark:text-gray-400">
                        {mod.moduleCode}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-theme-sm text-gray-500 dark:text-gray-400">
                        {mod.moduleFees}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-theme-sm text-gray-500 dark:text-gray-400">
                        {mod.moduleDuration}
                      </TableCell>
                      <TableCell className="px-5 py-4 space-x-2 flex flex-wrap gap-2">
                        <Button size="sm" variant="secondary">
                          Edit
                        </Button>
                        <Button size="sm" variant="destructive">
                          Delete
                        </Button>
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

export default ModuleList;
