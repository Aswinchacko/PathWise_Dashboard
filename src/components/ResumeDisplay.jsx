import React from 'react'
import { Mail, Phone, MapPin, GraduationCap, Briefcase, Award, FileText } from 'lucide-react'
import './ResumeDisplay.css'

const ResumeDisplay = ({ resumeData }) => {
  if (!resumeData) return null

  const {
    name,
    email,
    phone,
    location,
    summary,
    skills = [],
    education = [],
    experience = [],
    languages = [],
    certifications = [],
    projects = []
  } = resumeData

  const formatDate = (year) => {
    return year ? year.toString() : 'Present'
  }

  const formatDateRange = (start, end) => {
    if (!start && !end) return 'Date not specified'
    if (!start) return `Until ${formatDate(end)}`
    if (!end) return `${formatDate(start)} - Present`
    return `${formatDate(start)} - ${formatDate(end)}`
  }

  return (
    <div className="resume-display">
      <div className="resume-header">
        <div className="candidate-info">
          <h1 className="candidate-name">{name || 'Name not found'}</h1>
          <div className="contact-info">
            {email && (
              <div className="contact-item">
                <Mail size={16} />
                <span>{email}</span>
              </div>
            )}
            {phone && (
              <div className="contact-item">
                <Phone size={16} />
                <span>{phone}</span>
              </div>
            )}
            {location && (
              <div className="contact-item">
                <MapPin size={16} />
                <span>{location}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="resume-sections">
        {summary && (
          <section className="resume-section">
            <h2 className="section-title">
              <FileText size={20} />
              Summary
            </h2>
            <p className="section-content">{summary}</p>
          </section>
        )}

        {skills.length > 0 && (
          <section className="resume-section">
            <h2 className="section-title">
              <Award size={20} />
              Skills
            </h2>
            <div className="skills-container">
              {skills.map((skill, index) => (
                <span key={index} className="skill-tag">
                  {skill}
                </span>
              ))}
            </div>
          </section>
        )}

        {experience.length > 0 && (
          <section className="resume-section">
            <h2 className="section-title">
              <Briefcase size={20} />
              Experience
            </h2>
            <div className="experience-list">
              {experience.map((exp, index) => (
                <div key={index} className="experience-item">
                  <div className="experience-header">
                    <h3 className="experience-role">{exp.title || 'Role not specified'}</h3>
                    <span className="experience-dates">
                      {exp.dates || 'Date not specified'}
                    </span>
                  </div>
                  {exp.company && (
                    <p className="experience-company">{exp.company}</p>
                  )}
                  {exp.description && (
                    <p className="experience-description">{exp.description}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {education.length > 0 && (
          <section className="resume-section">
            <h2 className="section-title">
              <GraduationCap size={20} />
              Education
            </h2>
            <div className="education-list">
              {education.map((edu, index) => (
                <div key={index} className="education-item">
                  <div className="education-header">
                    <h3 className="education-degree">{edu.degree || 'Degree not specified'}</h3>
                    <span className="education-dates">
                      {edu.dates || 'Date not specified'}
                    </span>
                  </div>
                  {edu.institution && (
                    <p className="education-institution">{edu.institution}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {projects.length > 0 && (
          <section className="resume-section">
            <h2 className="section-title">
              <FileText size={20} />
              Projects
            </h2>
            <div className="projects-list">
              {projects.map((project, index) => (
                <div key={index} className="project-item">
                  <h3 className="project-title">{project.title || 'Project'}</h3>
                  {project.description && (
                    <p className="project-description">{project.description}</p>
                  )}
                  {project.technologies && (
                    <div className="project-technologies">
                      {project.technologies.map((tech, techIndex) => (
                        <span key={techIndex} className="tech-tag">
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {certifications.length > 0 && (
          <section className="resume-section">
            <h2 className="section-title">
              <Award size={20} />
              Certifications
            </h2>
            <div className="certifications-list">
              {certifications.map((cert, index) => (
                <div key={index} className="certification-item">
                  <span className="certification-name">{cert}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {languages.length > 0 && (
          <section className="resume-section">
            <h2 className="section-title">
              <FileText size={20} />
              Languages
            </h2>
            <div className="languages-list">
              {languages.map((language, index) => (
                <span key={index} className="language-tag">
                  {language}
                </span>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

export default ResumeDisplay
