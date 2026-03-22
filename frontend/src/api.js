import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8000/api',
});

export const startTest = (skill) =>
  API.post(`/test/start/${skill}`);

export const submitAnswer = (sessionId, questionId, answer) =>
  API.post('/test/answer', {
    session_id: sessionId,
    question_id: questionId,
    answer: answer,
  });

export const getFullReport = (employeeName, role, skills) =>
  API.post('/full-report', {
    employee_name: employeeName,
    role: role,
    assessed_skills: skills,
  });

export const getRoles = () =>
  API.get('/roles');

export const saveReport = (report) =>
  API.post('/save-report', report);

export const getAllReports = () =>
  API.get('/all-reports');

export const clearReports = () =>
  API.delete('/clear-reports');

export default API;
export const deleteReport = (reportId) =>
  API.delete(`/delete-report/${reportId}`);
