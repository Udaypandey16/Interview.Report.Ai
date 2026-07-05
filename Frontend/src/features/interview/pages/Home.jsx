import React, { useState, useRef } from 'react'
import '../style/home.scss'
import { useInterview } from '../hooks/useInterview'
import { useNavigate } from 'react-router'

const Home = () => {
  const { loading, generateReport } = useInterview()
  const [formData, setFormData] = useState({
    jobDescription: '',
    selfDescription: '',
    resume: null,
  })
  const [error, setError] = useState('')
  const resumeInputRef = useRef(null)
  const navigate = useNavigate()

  const handleInputChange = (event) => {
    const { id, value } = event.target
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0] || null
    setFormData((prev) => ({ ...prev, resume: selectedFile }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    const hasResume = Boolean(formData.resume)
    const hasSelfDescription = formData.selfDescription.trim().length > 0

    if (!hasResume && !hasSelfDescription) {
      setError('Please upload a resume or enter a self description before generating the interview strategy.')
      return
    }

    if (!formData.jobDescription.trim()) {
      setError('Please enter the job description.')
      return
    }

    try {
      const report = await generateReport({
        jobDescription: formData.jobDescription,
        selfDescription: formData.selfDescription,
        resumeFile: formData.resume,
      })

      if (report?._id) {
        navigate(`/interview/${report._id}`, { state: { interviewData: report } })
      } else {
        setError('The report was generated, but the response did not include an interview ID.')
      }
    } catch (err) {
      setError(err.message || 'Unable to generate your interview strategy right now.')
    }
  }

  return (
    <main className='home-page'>
      <section className='hero-card'>
        <header className='hero-card__header'>
          <div>
            <p className='eyebrow'>Create Your Custom</p>
            <h1>Interview Plan</h1>
          </div>
          <p className='hero-card__subtitle'>Let our AI analyze the job requirements and your unique profile to build a winning strategy.</p>
        </header>

        <form className='hero-card__body' onSubmit={handleSubmit}>
          <div className='panel panel--job'>
            <div className='panel__top'>
              <span className='panel__title'>Target Job Description</span>
              <button type='button' className='panel__action'>Paste JD</button>
            </div>

            <textarea
              id='jobDescription'
              className='panel__textarea'
              placeholder='Paste the full job description here... e.g. Senior Frontend Engineer at Google requires proficiency in React, TypeScript, and large-scale system design...'
              value={formData.jobDescription}
              onChange={handleInputChange}
            />

            <div className='panel__footer'>{formData.jobDescription.length} / 5000 chars</div>
          </div>

          <div className='panel panel--profile'>
            <div className='panel__section'>
              <div className='panel__section-head'>
                <span>Upload Resume</span>
                <small className='panel__hint'>(Required)</small>
              </div>

              <label htmlFor='resume' className='upload-card'>
                <span className='upload-card__icon'>⬆</span>
                <div>
                  <p>Click to upload or drag &amp; drop</p>
                  <small>PDF • DOCX • Max 5MB</small>
                </div>
              </label>
              <input
                ref={resumeInputRef}
                hidden
                type='file'
                id='resume'
                name='resume'
                accept='.pdf,.docx'
                onChange={handleFileChange}
              />
              {formData.resume && (
                <p className='panel__file-name'>✓ {formData.resume.name}</p>
              )}
            </div>

            <div className='or-separator'>OR</div>

            <div className='panel__section'>
              <label htmlFor='selfDescription' className='panel__section-label'>Quick Self Description</label>
              <textarea
                id='selfDescription'
                className='panel__textarea panel__textarea--small'
                placeholder='Briefly describe your experience, key skills, and areas of expertise. Focus on what makes you stand out...'
                value={formData.selfDescription}
                onChange={handleInputChange}
              />
            </div>

            <div className='panel__note'>Better resume = 10x better plan tailored to your goals and experience.</div>
          </div>

          {error && (
            <div className='error-message'>
              {error}
            </div>
          )}

          <button
            type='submit'
            className='action-button'
            disabled={loading}
          >
            {loading ? 'Generating...' : 'Generate My Interview Strategy'}
          </button>
        </form>

        <div className='hero-card__footer'>
          <nav className='footer-nav'>
            <a href='#'>Privacy Policy</a>
            <a href='#'>Terms of Service</a>
            <a href='#'>Help Center</a>
          </nav>
        </div>
      </section>
    </main>
  )
}

export default Home