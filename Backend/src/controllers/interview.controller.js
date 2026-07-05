const pdfParse = require('pdf-parse')
const generateInterviewReport = require('../services/ai.services')
const interviewReportModel = require('../models/interviewReport.model')

async function extractPdfText(buffer) {
    if (!buffer) return ''

    const uint8Array = new Uint8Array(buffer)
    const pdfParser = new pdfParse.PDFParse(uint8Array)
    const result = await pdfParser.getText()
    return result?.text || ''
}

/**
 * @description Controller to generate interview report based on self description, resume pdf and job description.
 */

async function generateInterviewReportController(req, res) {
    try {
        const { selfDescription = '', jobDescription = '' } = req.body

        if (!jobDescription.trim()) {
            return res.status(400).json({ message: 'Job description is required' })
        }

        if (!selfDescription.trim() && !req.file?.buffer) {
            return res.status(400).json({ message: 'Please upload a resume or enter a self description' })
        }

        const resumeText = req.file?.buffer
            ? await extractPdfText(req.file.buffer)
            : ''

        const aiReport = await generateInterviewReport({
            resume: resumeText,
            selfDescription,
            jobDescription,
        })

        const roadmap = aiReport.roadmap || aiReport.preparationPlan || []
        const interviewReport = await interviewReportModel.create({
            user: req.user.id,
            resume: resumeText,
            selfDescription,
            jobDescription,
            title: aiReport.title || 'Interview Strategy',
            ...aiReport,
            roadmap,
            preparationPlan: roadmap,
        })

        res.status(201).json({
            message: 'Interview report generated successfully',
            interviewReport,
        })
    } catch (error) {
        console.error('generateInterviewReportController error:', error)
        res.status(500).json({ message: error.message || 'Failed to generate interview report' })
    }
}

/**
 * @description Controller to get interview report by ID
 */

async function getInterviewReportByIdController(req, res) {
    try {
        const interviewReport = await interviewReportModel.findOne({
            _id: req.params.interviewId,
            user: req.user.id,
        })

        if (!interviewReport) {
            return res.status(404).json({ message: 'Interview report not found' })
        }

        res.status(200).json({ message: 'Interview report fetched successfully', interviewReport })
    } catch (error) {
        console.error('getInterviewReportByIdController error:', error)
        res.status(500).json({ message: 'Failed to fetch interview report' })
    }
}

/**
 * @description Controller to get all interview reports of the logged in user
 */

async function getAllInterviewReportsController(req, res) {
    try {
        const interviewReports = await interviewReportModel
            .find({ user: req.user.id })
            .sort({ createdAt: -1 })
            .select('-resume -selfDescription -jobDescription -__v')

        res.status(200).json({ message: 'Interview reports fetched successfully', interviewReports })
    } catch (error) {
        console.error('getAllInterviewReportsController error:', error)
        res.status(500).json({ message: 'Failed to fetch interview reports' })
    }
}

module.exports = { generateInterviewReportController, getInterviewReportByIdController, getAllInterviewReportsController }