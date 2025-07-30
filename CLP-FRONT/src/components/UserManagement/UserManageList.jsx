import React from "react";
import {
  Table,
  TableHeader,
  TableRow,
  TableCell,
  TableBody,
} from "../ui/table/index";
import Button from "../ui/button/Button";
import ComponentCard from "../common/ComponentCard";
import PageBreadcrumb from "../common/PageBreadCrumb";
import PageMeta from "../common/PageMeta";

const UserManageList = () => {
  return (
    <>
      <PageMeta title="User Management" description="Manage system users" />
      <PageBreadcrumb pageTitle="User Management" />

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Full Name
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Email
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Mobile
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Role
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Description
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Action
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody>
              {/* Example row – replace with dynamic user data */}
              <TableRow>
                <TableCell className="px-5 py-3 text-sm text-gray-700 dark:text-gray-300">
                  John Doe
                </TableCell>
                <TableCell className="px-5 py-3 text-sm text-gray-700 dark:text-gray-300">
                  john@example.com
                </TableCell>
                <TableCell className="px-5 py-3 text-sm text-gray-700 dark:text-gray-300">
                  +91 9876543210
                </TableCell>
                <TableCell className="px-5 py-3 text-sm text-gray-700 dark:text-gray-300">
                  Admin
                </TableCell>
                <TableCell className="px-5 py-3 text-sm text-gray-700 dark:text-gray-300">
                  Can manage all system settings.
                </TableCell>
                <TableCell className="px-5 py-3 text-sm text-gray-700 dark:text-gray-300 space-x-2">
                  <Button size="sm" variant="default">
                    Edit
                  </Button>
                  <Button size="sm" variant="destructive">
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
};

export default UserManageList;
