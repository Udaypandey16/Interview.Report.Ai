const express = require("express")
const authMiddleware = require("../middlewares/auth.middleware")
const interController = require("../controllers/interview.controller")
const upload = require('../middlewares/file.middleware')


const interviewRouter = express.Router()

/**
 * @route POST /api/interview/
 * @description generate new interview report o the basis of self description, resume pdf and job description.
 * @access private
 */
interviewRouter.post("/", authMiddleware.authUser, upload.single("resume"), interController.generateInterviewReportController)

/**
 * @route GET /api/interview/report/:interviewId
 * @description Get interview report by ID
 * @access private
 */
interviewRouter.get("/report/:interviewId", authMiddleware.authUser, interController.getInterviewReportByIdController)

/**
 * @route GET /api/interview/
 * @description Get all interview reports of the logged in user
 * @access private
 */

interviewRouter.get("/", authMiddleware.authUser, interController.getAllInterviewReportsController)

module.exports = interviewRouter