import React, { useState, useEffect } from 'react'
import { useParams, useLocation } from 'react-router'
import '../style/interview.scss'


const Interview = ({ data: propData = null }) => {
  const { interviewID } = useParams()
  const location = useLocation()
  const [data, setData] = useState(propData || location.state?.interviewData || {})
  const [loading, setLoading] = useState(!propData && !location.state?.interviewData && !!interviewID)
  const [activeTab, setActiveTab] = useState('technical')
  const [selectedQuestion, setSelectedQuestion] = useState(0)

  // Agar interviewID URL se aaye aur koi data nahi to API se fetch kro
  useEffect(() => {
    if (interviewID && !propData && !location.state?.interviewData) {
      fetchData()
    }
  }, [interviewID])

  const fetchData = async () => {
    try {
      setLoading(true)
const response = await fetch(`https://interview-report-ai.onrender.com/api/interview/report/${interviewID}`, {        credentials: 'include'
      })
      const text = await response.text()
      let result = {}

      try {
        result = text ? JSON.parse(text) : {}
      } catch {
        throw new Error('Unexpected server response')
      }

      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch interview report')
      }

      setData(result.interviewReport || result)
    } catch (error) {
      console.error('Error fetching interview:', error)
    } finally {
      setLoading(false)
    }
  }

  const {
    matchScore = 0,
    technicalQuestions = [],
    behavioralQuestions = [],
    skillGap = [],
  } = data

  const roadmap = data.roadmap || data.preparationPlan || []

  const currentQuestions = activeTab === 'technical' ? technicalQuestions : behavioralQuestions
  const currentQuestion = currentQuestions[selectedQuestion] || {}

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    setSelectedQuestion(0)
  }

  const handlePrevious = () => {
    if (selectedQuestion > 0) {
      setSelectedQuestion(selectedQuestion - 1)
    }
  }

  const handleNext = () => {
    if (selectedQuestion < currentQuestions.length - 1) {
      setSelectedQuestion(selectedQuestion + 1)
    }
  }

  const handleDownloadPdf = () => {
    const printableContent = [
      `Interview Report`,
      `Match Score: ${matchScore}%`,
      '',
      'Technical Questions',
      ...technicalQuestions.map((item, index) => `Q${index + 1}: ${item.question}\nAnswer: ${item.answer}`),
      '',
      'Behavioral Questions',
      ...behavioralQuestions.map((item, index) => `Q${index + 1}: ${item.question}\nAnswer: ${item.answer}`),
      '',
      'Skill Gaps',
      ...skillGap.map((item) => `${item.skill} (${item.severity})`),
      '',
      'Roadmap',
      ...roadmap.map((item, index) => `Day ${index + 1}: ${item.focus || item.title || item.week || ''}`),
    ].join('\n\n')

    const blob = new Blob([printableContent], { type: 'text/plain;charset=utf-8' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'interview-report.txt'
    link.click()
    window.URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="interview">
        <div className="interview__loading">
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="interview">
      <div className="interview__container">
        {/* Left Sidebar */}
        <aside className="interview__sidebar interview__sidebar--left">
          <nav className="sidebar-nav">
            <button
              className={`sidebar-nav__item ${activeTab === 'technical' ? 'active' : ''}`}
              onClick={() => handleTabChange('technical')}
            >
              Technical questions
            </button>
            <button
              className={`sidebar-nav__item ${activeTab === 'behavioral' ? 'active' : ''}`}
              onClick={() => handleTabChange('behavioral')}
            >
              Behavioral questions
            </button>
            <button
              className={`sidebar-nav__item ${activeTab === 'roadmap' ? 'active' : ''}`}
              onClick={() => handleTabChange('roadmap')}
            >
              Road Map
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="interview__main">
          <div className="interview__header">
            <div className="match-score">
              <span className="match-score__label">Match Score</span>
              <span className="match-score__value">{matchScore}%</span>
            </div>
          </div>

          <div className="question-container">
            {activeTab === 'roadmap' ? (
              // Roadmap View
              <div className="roadmap-view">
                <h2 className="question-container__title">Preparation Roadmap</h2>
                
                {roadmap && roadmap.length > 0 ? (
                  <div className="roadmap-list">
                    {roadmap.map((item, idx) => (
                      <div key={idx} className="roadmap-item">
                        <div className="roadmap-item__header">
                          <span className="roadmap-item__number">{idx + 1}</span>
                          <h3 className="roadmap-item__title">{item.title || item.week || `Week ${idx + 1}`}</h3>
                        </div>
                        <p className="roadmap-item__description">{item.description || item.tasks || 'No description'}</p>
                        {item.resources && (
                          <div className="roadmap-item__resources">
                            <strong>Resources:</strong>
                            <p>{item.resources}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="roadmap-view__empty">No roadmap available yet</p>
                )}
              </div>
            ) : currentQuestion && currentQuestion.question ? (
              // Questions View
              <>
                <h2 className="question-container__title">{currentQuestion.question}</h2>

                <div className="question-section">
                  <h3 className="question-section__label">Interview Intention:</h3>
                  <p className="question-section__content">{currentQuestion.intention}</p>
                </div>

                <div className="question-section">
                  <h3 className="question-section__label"> Answer:</h3>
                  <p className="question-section__content">{currentQuestion.answer}</p>
                </div>

                <div className="question-nav">
                  <button
                    className="question-nav__btn question-nav__btn--prev"
                    onClick={handlePrevious}
                    disabled={selectedQuestion === 0}
                  >
                    ← Previous
                  </button>

                  <span className="question-nav__counter">
                    {selectedQuestion + 1} / {currentQuestions.length}
                  </span>

                  <button
                    className="question-nav__btn question-nav__btn--next"
                    onClick={handleNext}
                    disabled={selectedQuestion === currentQuestions.length - 1}
                  >
                    Next →
                  </button>
                </div>

                <div className="question-list">
                  <h3 className="question-list__title">Questions</h3>
                  <div className="question-list__items">
                    {currentQuestions.map((q, idx) => (
                      <button
                        key={idx}
                        className={`question-list__item ${
                          selectedQuestion === idx ? 'active' : ''
                        }`}
                        onClick={() => setSelectedQuestion(idx)}
                      >
                        Q{idx + 1}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="question-container__empty">
                <p>No questions available</p>
              </div>
            )}

            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
              <button className="download-report-btn" type="button" onClick={handleDownloadPdf}>
                Download Report
              </button>
            </div>
          </div>
        </main>

        {/* Right Sidebar */}
        <aside className="interview__sidebar interview__sidebar--right">
          <div className="skill-gaps">
            <h3 className="skill-gaps__title">Skill Gaps</h3>
            <div className="skill-gaps__list">
              {skillGap && skillGap.length > 0 ? (
                skillGap.map((item, idx) => (
                  <span
                    key={idx}
                    className={`skill-tag skill-tag--${item.severity || 'low'}`}
                    title={`Severity: ${item.severity}`}
                  >
                    {item.skill}
                  </span>
                ))
              ) : (
                <p className="skill-gaps__empty">No skill gaps identified</p>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

export default Interview