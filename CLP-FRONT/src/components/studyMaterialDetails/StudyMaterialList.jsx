import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../ui/table";
import Button from "../../ui/button/Button";

const StudyMaterialList = () => {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Sr. No.
              </TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Course Name
              </TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Upload Type
              </TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Title
              </TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                Action
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody>
            {/* Example row — replace with your mapped data */}
            <TableRow>
              <TableCell className="px-5 py-3 text-sm text-gray-700 dark:text-gray-300">
                1
              </TableCell>
              <TableCell className="px-5 py-3 text-sm text-gray-700 dark:text-gray-300">
                React Basics
              </TableCell>
              <TableCell className="px-5 py-3 text-sm text-gray-700 dark:text-gray-300">
                PDF
              </TableCell>
              <TableCell className="px-5 py-3 text-sm text-gray-700 dark:text-gray-300">
                Introduction to JSX
              </TableCell>
              <TableCell className="px-5 py-3 text-sm text-gray-700 dark:text-gray-300 space-x-2">
                <Button size="sm" variant="outline">
                  View
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
  );
};

export default StudyMaterialList;
