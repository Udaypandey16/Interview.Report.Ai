import axios from 'axios';

const api = axios.create({
    baseURL: 'https://interview-report-ai.onrender.com/api/interview',
    withCredentials: true,
})


/**
 * @description Services to generate interview report based on user self description, resume and job description.
 */

export const generateInterviewReport = async ({ jobDescription, selfDescription, resumeFile }) => {
    const formData = new FormData()
    formData.append('jobDescription', jobDescription)
    formData.append('selfDescription', selfDescription)

    if (resumeFile) {
        formData.append('resume', resumeFile)
    }

    const response = await api.post('/', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    })
    return response.data
}

/**
 * @description Services to get interview report by interviewId
 */

export const getInterviewReportById = async (interviewId) => {
    const response = await api.get(`/report/${interviewId}`)
    return response.data
}

/**
 * @description Services to get all interview reports of logged in user.
 */

export const getAllInterviewReports = async () => {
    const response = await api.get("/")
    return response.data
}