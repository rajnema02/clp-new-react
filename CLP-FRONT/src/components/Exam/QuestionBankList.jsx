import React, { useEffect, useState } from "react";
import {
  Table,
  TableHeader,
  TableRow,
  TableCell,
  TableBody,
} from "../../components/ui/table";
import Button from "../../components/ui/button/Button";
import ComponentCard from "../../components/common/ComponentCard";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import api from "../../Services/api.service";
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
      const resp = await api.get("question", {
        params: { page, limit, is_inactive: isInactive },
        headers: { "Cache-Control": "no-cache" },
      });

      const { data, meta } = resp.data || {};
      setQuestionList(Array.isArray(data) ? data : []);
      setListCount(meta?.total ?? 0);
    } catch (err) {
      console.error("Error fetching questions", err);
      setQuestionList([]);
      setListCount(0);
    } finally {
      setLoading(false);
    }
  };

  const deleteQuestion = async (quesId) => {
    if (window.confirm("Are you sure you want to delete this question?")) {
      try {
        await api.delete(`question/${quesId}`);
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

  const totalPages = Math.max(1, Math.ceil(listCount / limit));

  return (
    <>
      <PageMeta title="Question Bank" description="Manage your question bank here" />
      <PageBreadcrumb pageTitle="Question Bank List" />

      <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white p-3 rounded-md mb-6 flex justify-between items-center">
        <h2 className="text-lg font-semibold">Question Bank</h2>
        <div className="flex gap-2">
          <Button size="sm" variant="primary" onClick={() => navigate("/bulk-upload-list")}>
            Bulk Upload
          </Button>
          <Button size="sm" variant="primary" onClick={() => navigate("/question-bank-create")}>
            Create Question
          </Button>
        </div>
      </div>

      <ComponentCard title="Question Bank Table">
        <div className="overflow-x-auto">
          {loading ? (
            <p className="text-center p-4 text-gray-500">Loading questions...</p>
          ) : (
            <>
              <div className="flex justify-between items-center mb-3 text-sm text-gray-600">
                <div>Total Questions: {listCount}</div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="secondary" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                    Prev
                  </Button>
                  <span>
                    Page {page} / {totalPages}
                  </span>
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={page >= totalPages}
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
                    <TableCell isHeader>Correct Answer</TableCell>
                    <TableCell isHeader>No. of Options</TableCell>
                    <TableCell isHeader>Marks</TableCell>
                    <TableCell isHeader>Actions</TableCell>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {questionList.length > 0 ? (
                    questionList.map((item) => (
                      <TableRow key={item._id}>
                        <TableCell>
                          <div
                            style={{ wordWrap: "normal", whiteSpace: "normal" }}
                            dangerouslySetInnerHTML={{ __html: item.question || "" }}
                          />
                        </TableCell>
                        <TableCell>{item.course_type}</TableCell>
                        <TableCell>{item.course_name || "General"}</TableCell>
                        <TableCell>
                          <span dangerouslySetInnerHTML={{ __html: item.correct_answer || "" }} />
                        </TableCell>
                        <TableCell>{item.number_of_options}</TableCell>
                        <TableCell>{item.marks}</TableCell>
                        <TableCell className="space-x-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => navigate(`/question-bank-edit/${item._id}`)}
                          >
                            Edit
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => deleteQuestion(item._id)}>
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-gray-500">
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
    </>
  );
};

export default QuestionBankList;
