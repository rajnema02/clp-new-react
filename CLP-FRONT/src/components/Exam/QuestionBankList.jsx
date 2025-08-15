import React, { useEffect, useState } from "react";
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

// API helper
import api from "../../Services/api.service"; // Assuming same API helper as Angular
import { Navigate } from "react-router";
import { useNavigate } from "react-router-dom";

const QuestionBankList = () => {
  const [questionList, setQuestionList] = useState([]);
  const [listCount, setListCount] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(30);
  const [isInactive] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const getQuestionBank = async () => {
    try {
      setLoading(true);
      const queryData = {
        page,
        limit,
        is_inactive: isInactive,
      };
      const resp = await api.get("question", queryData);
      setQuestionList(resp.data || []);
      setListCount(resp.meta?.total || 0);
    } catch (err) {
      console.error("Error fetching questions", err);
    } finally {
      setLoading(false);
    }
  };

  const deleteQuestion = async (quesId) => {
    if (window.confirm("Are you sure you want to delete this question?")) {
      try {
        await api.delete("question", quesId);
        alert("Question deleted successfully!");
        getQuestionBank();
      } catch (err) {
        console.error("Error deleting question", err);
      }
    }
  };

  useEffect(() => {
    getQuestionBank();
  }, [page]);

  return (
    <>
      <PageMeta
        title="Question Bank"
        description="Manage your question bank here"
      />
      <PageBreadcrumb pageTitle="Question Bank List" />

      {/* Header Section */}
      <div className="bg-gradient-danger text-white p-1 rounded-md mb-6">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold">Question Bank</h2>
          <Button size="sm" variant="primary" onClick={() => navigate("/question-bank-create")}>
                    Create Question Bank
                  </Button>
        </div>
      </div>
      

      <div className="space-y-6">
        <ComponentCard title="Question Bank Table">
          <div className="overflow-x-auto">
            {loading ? (
              <p className="text-center p-4">Loading...</p>
            ) : (
              <>
                <div className="flex justify-between items-center mb-3">
                  <div>Total: {listCount}</div>
                  {/* Pagination Controls */}
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={page === 1}
                      onClick={() => setPage((p) => p - 1)}
                    >
                      Prev
                    </Button>
                    <span>
                      Page {page} / {Math.ceil(listCount / limit) || 1}
                    </span>
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={page >= Math.ceil(listCount / limit)}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>

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
                    {questionList.length > 0 ? (
                      questionList.map((item) => (
                        <TableRow key={item._id || item.id}>
                          <TableCell>{item.question}</TableCell>
                          <TableCell>{item.course_type}</TableCell>
                          <TableCell>
                            {item.course_name || "General"}
                          </TableCell>
                          <TableCell>{item.regional_language}</TableCell>
                          <TableCell>{item.correct_answer}</TableCell>
                          <TableCell>{item.number_of_options}</TableCell>
                          <TableCell>{item.marks}</TableCell>
                          <TableCell className="space-x-2">
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() =>
                                (window.location.href = `/exam/question-update/${item._id}`)
                              }
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => deleteQuestion(item._id)}
                            >
                              Delete
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center">
                          No questions found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </>
            )}
          </div>
        </ComponentCard>
      </div>
    </>
  );
};

export default QuestionBankList;
