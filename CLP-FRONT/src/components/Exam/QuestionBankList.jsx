import React from "react";
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

// Dummy data for illustration
const questionBankData = [
  {
    id: 1,
    question: "What is React?",
    courseType: "Online",
    courseName: "Frontend Development",
    regional: "English",
    answer: "A JavaScript library",
    optionsCount: 4,
    marks: 5,
  },
  {
    id: 2,
    question: "What is Node.js?",
    courseType: "Offline",
    courseName: "Backend Development",
    regional: "Hindi",
    answer: "JavaScript runtime",
    optionsCount: 4,
    marks: 3,
  },
];

const QuestionBankList = () => {
  return (
    <>
      <PageMeta title="Question Bank" description="Manage your question bank here" />
      <PageBreadcrumb pageTitle="Question Bank List" />

      <div className="space-y-6">
        <ComponentCard title="Question Bank Table">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell isHeader>Question</TableCell>
                  <TableCell isHeader>Course Type</TableCell>
                  <TableCell isHeader>Course Name</TableCell>
                  <TableCell isHeader>Regional</TableCell>
                  <TableCell isHeader>Answer</TableCell>
                  <TableCell isHeader>No. of Options</TableCell>
                  <TableCell isHeader>Marks</TableCell>
                  <TableCell isHeader>Actions</TableCell>
                </TableRow>
              </TableHeader>

              <TableBody>
                {questionBankData.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.question}</TableCell>
                    <TableCell>{item.courseType}</TableCell>
                    <TableCell>{item.courseName}</TableCell>
                    <TableCell>{item.regional}</TableCell>
                    <TableCell>{item.answer}</TableCell>
                    <TableCell>{item.optionsCount}</TableCell>
                    <TableCell>{item.marks}</TableCell>
                    <TableCell className="space-x-2">
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
        </ComponentCard>
      </div>
    </>
  );
};

export default QuestionBankList;
