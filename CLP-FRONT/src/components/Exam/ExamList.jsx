import {
  Table,
  TableHeader,
  TableRow,
  TableCell,
  TableBody,
} from "../../components/ui/table/index";
import Button from "../../components/ui/button/Button";
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";

const ExamList = () => {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Exam Name
              </TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Exam Code
              </TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Course Type
              </TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Batch Name
              </TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Exam Date
              </TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Exam Time
              </TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Exam Status
              </TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Action
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody>
            {/* Example row — replace with dynamic data as needed */}
            <TableRow>
              <TableCell className="px-5 py-3 text-sm text-gray-700 dark:text-gray-300">
                Midterm Exam
              </TableCell>
              <TableCell className="px-5 py-3 text-sm text-gray-700 dark:text-gray-300">
                EXM-101
              </TableCell>
              <TableCell className="px-5 py-3 text-sm text-gray-700 dark:text-gray-300">
                Online
              </TableCell>
              <TableCell className="px-5 py-3 text-sm text-gray-700 dark:text-gray-300">
                Batch A
              </TableCell>
              <TableCell className="px-5 py-3 text-sm text-gray-700 dark:text-gray-300">
                2025-08-15
              </TableCell>
              <TableCell className="px-5 py-3 text-sm text-gray-700 dark:text-gray-300">
                10:00 AM
              </TableCell>
              <TableCell className="px-5 py-3 text-sm text-gray-700 dark:text-gray-300">
                Completed
              </TableCell>
              <TableCell className="px-5 py-3 text-sm text-gray-700 dark:text-gray-300">
                <Button size="sm" variant="default">
                  Show Result
                </Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ExamList;
