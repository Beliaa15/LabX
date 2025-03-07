import React, { useState, useEffect } from "react";
import axios from "axios";
import { useToast } from "../../components/ui/use-toast";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Edit,
  Eye,
  School,
  Loader2,
  Plus,
  X,
  Filter,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Navigation } from "../Common/Navigation";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Select } from "../../components/ui/select";
import { useRoleStore } from "../../context/roleStore";
import { EmailModal } from "./email";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
  Legend,
} from "recharts";

const ApplicationDetail = ({
  application,
  onClose,
  university,
  onUpdate,
  editMode,
}) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (application?.responses) {
      const initialData = {};
      application.responses.forEach((response) => {
        initialData[response.field_id] = response.value;
      });
      setFormData(initialData);
    }
  }, [application]);

  const handleInputChange = (fieldId, value) => {
    setFormData((prev) => ({
      ...prev,
      [fieldId]: value,
    }));
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem("authToken");
    setIsSubmitting(true);
    try {
      const response = await axios.put(
        `http://127.0.0.1:5000/university/api/v1/applications/${application.application_id}/responses`,
        {
          responses: Object.entries(formData).map(([field_id, value]) => ({
            field_id: parseInt(field_id),
            value,
          })),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.status === "success") {
        toast({
          title: "Success",
          description: "Application updated successfully",
        });
        onUpdate();
        onClose();
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to update application",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinalSubmit = async () => {
    const token = localStorage.getItem("authToken");
    setIsSubmitting(true);
    try {
      const response = await axios.put(
        `http://127.0.0.1:5000/university/api/v1/applications/${application.application_id}/submit`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.status === "success") {
        toast({
          title: "Success",
          description: "Application submitted successfully",
        });
        onUpdate();
        onClose();
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to submit application",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">
            {editMode ? "Edit Application" : "Application Details"}
          </h2>
          <Button variant="ghost" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-4">
          <div className="border-b pb-4">
            <h3 className="font-semibold text-lg mb-2">
              University Information
            </h3>
            <p>Name: {university?.name}</p>
            <p>Location: {university?.location}</p>
          </div>
          <div className="border-b pb-4">
            <h3 className="font-semibold text-lg mb-2">
              Student Profile Information
            </h3>
            <p>Name: {application?.name}</p>
            <p>National ID: {application?.national_id}</p>
            <p>Date Of Birth: {application?.dob}</p>
            <p>Gender: {application?.gender}</p>
            <p>Email: {application?.email}</p>
            <p>GPA: {application?.gpa}</p>
            <p>School: {application?.school}</p>
            <p>High School Major: {application?.high_school_major}</p>
            <p>Transcript File: {application?.transcript_file}</p>
          </div>
          <div className="border-b pb-4">
            <h3 className="font-semibold text-lg mb-2">Application Status</h3>
            <p>Status: {application?.status}</p>
            {application?.submission_date && (
              <p>Submitted: {application.submission_date}</p>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Application Fields</h3>
            {university?.custom_fields?.map((field) => {
              const response = application?.responses?.find(
                (r) => r.field_id === field.id
              );
              return (
                <div key={field.id} className="space-y-2">
                  <Label htmlFor={field.id.toString()}>
                    {field.name}
                    {field.is_required && (
                      <span className="text-red-500">*</span>
                    )}
                  </Label>
                  {editMode ? (
                    field.type === "text" ? (
                      <Input
                        id={field.id.toString()}
                        value={formData[field.id] || ""}
                        onChange={(e) =>
                          handleInputChange(field.id, e.target.value)
                        }
                        placeholder={field.options || ""}
                      />
                    ) : (
                      <Textarea
                        id={field.id.toString()}
                        value={formData[field.id] || ""}
                        onChange={(e) =>
                          handleInputChange(field.id, e.target.value)
                        }
                        placeholder={field.options || ""}
                        style={{
                          whiteSpace: "normal", // Prevent line wrapping
                          maxHeight: "200px",
                          overflowY: "auto", // Optional: Disable vertical scrolling if only horizontal is needed
                        }}
                      />
                    )
                  ) : (
                    <textarea
                      readOnly
                      className="p-2 bg-gray-50 rounded-md w-full"
                      style={{
                        whiteSpace: "normal",
                        overflowY: "auto",
                        maxHeight: "200px",
                      }}
                      value={formData[field.id] || "No response provided"}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {editMode && application?.status === "pending" && (
            <div className="flex gap-4 mt-6">
              <Button
                className="flex-1"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Save Changes
              </Button>
              <Button
                className="flex-1"
                variant="default"
                onClick={handleFinalSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Submit Application
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const StudentDashboard = () => {
  const role = useRoleStore((state) => state.role);
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("applications");
  const [universities, setUniversities] = useState([]);
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showApplicationDetail, setShowApplicationDetail] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: null,
    minGpa: null,
    submissionAfter: null,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [analyticsData, setAnalyticsData] = useState(null);

  useEffect(() => {
    fetchUniversities();
    fetchApplications();
  }, []);

  useEffect(() => {
    if (activeTab === "analytics") {
      fetchAnalyticsData();
    }
  }, [activeTab, filters]);

  const fetchAnalyticsData = async () => {
    const token = localStorage.getItem("authToken");
    try {
      const response = await axios.get(
        "http://127.0.0.1:5000/admin/universities/analytics",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            withCredentials: true,
          },
          params: filters,
        }
      );
      if (response.data) {
        setAnalyticsData(response.data);
        console.log(response.data);
      }
    } catch (error) {
      console.error("Error fetching analytics data:", error);
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to fetch analytics data",
        variant: "destructive",
      });
    }
  };

  const statusIcons = {
    pending: <Clock className="text-yellow-500" size={20} />,
    submitted: <AlertCircle className="text-blue-500" size={20} />,
    accepted: <CheckCircle className="text-green-500" size={20} />,
    rejected: <AlertCircle className="text-red-500" size={20} />,
  };

  const handleStatusUpdate = async (applicationId, newStatus) => {
    const token = localStorage.getItem("authToken");
    try {
      setIsLoading(true);
      const response = await axios.put(
        `http://127.0.0.1:5000/university/api/v1/applications/${applicationId}/status`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            withCredentials: true,
          },
        }
      );

      if (response.data.status === "success") {
        toast({
          title: "Success",
          description: `Application ${newStatus} successfully`,
        });
        fetchApplications(); // Refresh the applications list
      }
    } catch (error) {
      console.error("Error updating application status:", error);
      toast({
        title: "Error",
        description:
          error.response?.data?.message || `Failed to ${newStatus} application`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUniversities = async () => {
    const token = localStorage.getItem("authToken");
    try {
      const response = await axios.get(
        "http://127.0.0.1:5000/university/api/v1/universities",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            withCredentials: true,
          },
        }
      );
      if (response.data.data) {
        setUniversities(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching universities:", error);
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to fetch universities",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchApplications = async () => {
    const token = localStorage.getItem("authToken");
    try {
      const response = await axios.get(
        "http://127.0.0.1:5000/university/api/v1/applications",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            withCredentials: true,
          },
        }
      );
      if (response.data.data) {
        setApplications(response.data.data);
        setFilteredApplications(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to fetch applications",
        variant: "destructive",
      });
    }
  };

  const fetchStudentsGpa = async (universityId, minGpa) => {
    const token = localStorage.getItem("authToken");
    try {
      const response = await axios.get(
        `http://127.0.0.1:5000/admin/universities/students_gpa`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            withCredentials: true,
          },
          params: {
            min_gpa: minGpa,
          },
        }
      );
      if (response.data) {
        return response.data;
      }
    } catch (error) {
      console.error("Error fetching students GPA:", error);
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to fetch students GPA",
        variant: "destructive",
      });
    }
    return [];
  };

  const applyFilters = async () => {
    let filtered = [...applications];
    if (filters.status) {
      filtered = filtered.filter((app) => app.status === filters.status);
    }
    if (filters.minGpa) {
      const studentsGpa = await fetchStudentsGpa(filters.minGpa);
      filtered = filtered.filter((app) => {
        const student = studentsGpa.find(
          (student) => student.student_id === app.user_id
        );
        return student && student.gpa >= filters.minGpa;
      });
    }
    if (filters.submissionAfter) {
      filtered = filtered.filter((app) => {
        const submissionDate = new Date(app.submission_date)
          .toISOString()
          .split("T")[0];
        return submissionDate >= filters.submissionAfter;
      });
    }
    setFilteredApplications(filtered);
  };

  const handleApplyFilters = () => {
    applyFilters();
  };

  const handleGpaChange = (e) => {
    const value = e.target.value;
    setFilters((prevFilters) => ({ ...prevFilters, minGpa: value }));
  };

  const handleSubmissionAfterChange = (e) => {
    const value = e.target.value;
    setFilters((prevFilters) => ({ ...prevFilters, submissionAfter: value }));
  };

  const handleStatusChange = (value) => {
    setFilters((prevFilters) => ({ ...prevFilters, status: value }));
  };

  const resetFilters = () => {
    setFilters({ status: null, minGpa: null, submissionAfter: null });
    setFilteredApplications(applications);
  };

  const initializeApplication = async (universityId) => {
    if (!universityId) {
      toast({
        title: "Error",
        description: "Invalid university selected",
        variant: "destructive",
      });
      return;
    }

    const token = localStorage.getItem("authToken");
    try {
      setIsLoading(true);
      const response = await axios.post(
        `http://127.0.0.1:5000/university/api/v1/universities/${universityId}/applications/initialize`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            withCredentials: true,
          },
        }
      );
      if (response.data.status === "success") {
        await fetchApplications();
        setActiveTab("applications");
        toast({
          title: "Success",
          description:
            response.data.data?.message ||
            "Application initialized successfully",
        });
      }
    } catch (error) {
      console.error("Error initializing application:", error);
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to initialize application",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchApplicationDetails = async (applicationId) => {
    const token = localStorage.getItem("authToken");
    try {
      setIsLoading(true);
      const response = await axios.get(
        `http://127.0.0.1:5000/university/api/v1/applications/${applicationId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            withCredentials: true,
          },
        }
      );
      if (response.data.data) {
        setSelectedApplication(response.data.data);
        setShowApplicationDetail(true);
      }
    } catch (error) {
      console.error("Error fetching application details:", error);
      toast({
        title: "Error",
        description:
          error.response?.data?.message ||
          "Failed to fetch application details",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedApplication(null);
    setShowApplicationDetail(false);
    setEditMode(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto py-12 px-4">
          <Card>
            <CardContent className="flex items-center justify-center py-6">
              <Loader2 className="h-8 w-8 animate-spin" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto py-12 px-4">
        {role === "student" ? (
          <div className="flex justify-between mb-6">
            <div className="flex space-x-4">
              <Button
                variant={activeTab === "universities" ? "default" : "outline"}
                onClick={() => {
                  setActiveTab("universities");
                  setShowFilters(false);
                }}
              >
                Universities
              </Button>
              <Button
                variant={activeTab === "applications" ? "default" : "outline"}
                onClick={() => setActiveTab("applications")}
              >
                My Applications
              </Button>
            </div>
            {(activeTab === "applications") && (
              <Button onClick={() => setShowFilters(!showFilters)}>
                <Filter className="h-4 w-4" />
              </Button>
            )}
          </div>
        ) : (
          <div className="flex justify-between mb-6">
            <div className="flex space-x-4">
              <Button
                variant={activeTab === "applications" ? "default" : "outline"}
                onClick={() => setActiveTab("applications")}
              >
                Applications
              </Button>
              <Button
                variant={activeTab === "analytics" ? "default" : "outline"}
                onClick={() => setActiveTab("analytics")}
              >
                Analytics
              </Button>
            </div>
            {(activeTab === "applications") && (
              <Button onClick={() => setShowFilters(!showFilters)}>
                <Filter className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}

        {showFilters && (
          <div className="mb-6 p-4 border rounded bg-white shadow-md">
            <div className="mb-4">
              <Label htmlFor="status">Status</Label>
              <Select
                onChange={handleStatusChange}
                value={filters.status}
                placeholder="Select status"
                options={[
                  { value: "pending", label: "Pending" },
                  { value: "submitted", label: "Submitted" },
                  { value: "accepted", label: "Accepted" },
                  { value: "rejected", label: "Rejected" },
                ]}
              />
              <div className="mb-2" />
              {role === "uni_admin" ? (
                <>
                  <Label htmlFor="minGpa">Minimum GPA</Label>
                  <Input
                    placeholder="Minimum GPA"
                    name="minGpa"
                    type="number"
                    step="0.001"
                    value={filters.minGpa || ""}
                    onChange={handleGpaChange}
                    className="mb-2"
                  />
                  <Label htmlFor="submissionAfter">Submission After</Label>
                  <Input
                    placeholder="Submission After"
                    name="submissionAfter"
                    type="date"
                    value={filters.submissionAfter || ""}
                    onChange={handleSubmissionAfterChange}
                    className="mb-2"
                  />
                </>
              ) : null}
            </div>
            <div className="flex gap-4">
              <Button onClick={handleApplyFilters} disabled={isLoading}>
                Apply Filters
              </Button>
              <Button
                onClick={resetFilters}
                disabled={isLoading}
                variant="outline"
              >
                Reset Filters
              </Button>
            </div>
          </div>
        )}

        {role === "student" && activeTab === "universities" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {universities.map((university) => (
              <Card
                key={university.id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <School size={24} />
                    {university.name}
                  </CardTitle>
                  <CardDescription>{university.location}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="mb-2">
                    Established:{" "}
                    {university.established_year &&
                      new Date(university.established_year).getFullYear()}
                  </p>
                  <p className="mb-4">
                    Required Fields:{" "}
                    {university.custom_fields?.filter((f) => f.is_required)
                      .length || 0}
                  </p>
                  <Button
                    className="w-full flex items-center justify-center"
                    onClick={() => initializeApplication(university.id)}
                    disabled={isLoading}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Start Application
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {activeTab === "applications" && role === "student" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredApplications.map((application) => (
              <Card
                key={application.application_id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      Application #{application.application_id}
                      {statusIcons[application.status]}
                    </div>
                  </CardTitle>
                  <CardDescription>
                    {
                      universities.find(
                        (u) => u.id === application.university_id
                      )?.name
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">Status: {application.status}</p>
                  {application.submission_date && (
                    <p className="mb-4">
                      Submitted: {application.submission_date}
                    </p>
                  )}
                  <div className="flex gap-2">
                    <Button
                      className="flex items-center justify-center"
                      onClick={() => {
                        setEditMode(false);
                        fetchApplicationDetails(application.application_id);
                      }}
                    >
                      <Eye className="mr-2 h-4 w-4" /> View
                    </Button>
                    {role === "student" && application.status === "pending" && (
                      <Button
                        variant="secondary"
                        className="w-full flex items-center justify-center"
                        onClick={() => {
                          setEditMode(true);
                          fetchApplicationDetails(application.application_id);
                        }}
                      >
                        <Edit className="mr-2 h-4 w-4" /> Edit
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {activeTab === "applications" && role === "uni_admin" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredApplications.map((application) => (
              <Card
                key={application.application_id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      Application #{application.application_id}
                      {statusIcons[application.status]}
                    </div>
                  </CardTitle>
                  <CardDescription>
                    {
                      universities.find(
                        (u) => u.id === application.university_id
                      )?.name
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">Status: {application.status}</p>
                  {application.submission_date && (
                    <p className="mb-4">
                      Submitted: {application.submission_date}
                    </p>
                  )}
                  <div className="flex gap-2">
                    <Button
                      className="flex items-center justify-center"
                      onClick={() => {
                        setEditMode(false);
                        fetchApplicationDetails(application.application_id);
                      }}
                    >
                      <Eye className="mr-2 h-4 w-4" /> View
                    </Button>
                    {role === "student" && application.status === "pending" && (
                      <Button
                        variant="secondary"
                        className="w-full flex items-center justify-center"
                        onClick={() => {
                          setEditMode(true);
                          fetchApplicationDetails(application.application_id);
                        }}
                      >
                        <Edit className="mr-2 h-4 w-4" /> Edit
                      </Button>
                    )}
                    {role === "uni_admin" &&
                      application.status === "submitted" && (
                        <div className="flex gap-2 w-full">
                          <Button
                            variant="default"
                            className="flex-1"
                            onClick={() =>
                              handleStatusUpdate(
                                application.application_id,
                                "accepted"
                              )
                            }
                          >
                            Accept
                          </Button>
                          <Button
                            variant="destructive"
                            className="flex-1"
                            onClick={() =>
                              handleStatusUpdate(
                                application.application_id,
                                "rejected"
                              )
                            }
                          >
                            Reject
                          </Button>
                        </div>
                      )}
                    {role === "uni_admin" && (
                      <div className="flex gap-2 w-full">
                        <EmailModal
                          application={application}
                          onClose={() => {}}
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {activeTab === "analytics" && role === "uni_admin" && (
          <div>
            {analyticsData && (
              <div>
                <h3 className="text-xl font-semibold mb-2">
                  Analytics Summary:
                </h3>
                <div className="flex flex-row space-x-6 mb-4">
                  <p>
                    Total Applications ({analyticsData.total_applications}) :
                  </p>
                  <p>Accepted: {analyticsData.accepted_applications}</p>
                  <p>Rejected: {analyticsData.rejected_applications}</p>
                  <p>Pending: {analyticsData.pending_applications}</p>
                </div>

                <h3 className="text-xl font-semibold mb-2">Graphs:</h3>
                <div className="flex flex-row space-x-4">
                  <div>
                    <h2 className="text-l font-semibold my-4">
                      Application Status Counts
                    </h2>
                    <BarChart
                      width={600}
                      height={300}
                      data={[
                        {
                          name: "Accepted",
                          count: analyticsData.accepted_applications,
                        },
                        {
                          name: "Rejected",
                          count: analyticsData.rejected_applications,
                        },
                        {
                          name: "Pending",
                          count: analyticsData.pending_applications,
                        },
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#8884d9" />
                    </BarChart>
                  </div>
                  <div className="flex flex-col space-y-4">
                    <h2 className="text-l font-semibold my-4">
                      Yearly Applicants & Average GPA
                    </h2>
                    <LineChart
                      width={600}
                      height={300}
                      data={analyticsData.yearlyStats}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="totalApplicants"
                        stroke="#8884d8"
                      />
                      <Line
                        type="monotone"
                        dataKey="averageGpa"
                        stroke="#82ca9d"
                      />
                    </LineChart>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {showApplicationDetail && selectedApplication && (
          <ApplicationDetail
            application={selectedApplication}
            onClose={handleClose}
            university={universities.find(
              (u) => u.id === selectedApplication.university_id
            )}
            onUpdate={fetchApplications}
            editMode={editMode}
          />
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;