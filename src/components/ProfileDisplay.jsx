import React from 'react'
import { User, Mail, Phone, MapPin, GraduationCap, Briefcase, Award, Code, Star } from 'lucide-react'
import './ProfileDisplay.css'

const ProfileDisplay = ({ profile, onEdit }) => {
  if (!profile) return null

  const {
    full_name,
    email,
    phone,
    location,
    summary,
    skills = [],
    education = [],
    experience = [],
    projects = [],
    certifications = [],
    languages = []
  } = profile

  return (
    <div className="profile-display">
      <div className="profile-header">
        <div className="profile-avatar">
          <User size={32} />
        </div>
        <div className="profile-info">
          <h2>{full_name || 'Your Name'}</h2>
          <p className="profile-summary">{summary}</p>
        </div>
        {onEdit && (
          <button className="edit-profile-btn" onClick={onEdit}>
            Edit Profile
          </button>
        )}
      </div>

      <div className="profile-details">
        <div className="contact-info">
          <h3>Contact Information</h3>
          <div className="contact-item">
            <Mail size={16} />
            <span>{email || 'No email provided'}</span>
          </div>
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

        {skills.length > 0 && (
          <div className="skills-section">
            <h3>
              <Code size={20} />
              Skills
            </h3>
            <div className="skills-grid">
              {skills.map((skill, index) => (
                <span key={index} className="skill-tag">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {experience.length > 0 && (
          <div className="experience-section">
            <h3>
              <Briefcase size={20} />
              Experience
            </h3>
            <div className="experience-list">
              {experience.map((exp, index) => (
                <div key={index} className="experience-item">
                  <h4>{exp.title || exp.role || 'Position'}</h4>
                  <p className="company">{exp.company}</p>
                  {exp.dates && <p className="dates">{exp.dates}</p>}
                  {exp.description && <p className="description">{exp.description}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {education.length > 0 && (
          <div className="education-section">
            <h3>
              <GraduationCap size={20} />
              Education
            </h3>
            <div className="education-list">
              {education.map((edu, index) => (
                <div key={index} className="education-item">
                  <h4>{edu.degree}</h4>
                  <p className="institution">{edu.institution}</p>
                  {edu.dates && <p className="dates">{edu.dates}</p>}
                  {edu.gpa && <p className="gpa">GPA: {edu.gpa}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {projects.length > 0 && (
          <div className="projects-section">
            <h3>
              <Star size={20} />
              Projects
            </h3>
            <div className="projects-list">
              {projects.map((project, index) => (
                <div key={index} className="project-item">
                  <h4>{project.title}</h4>
                  {project.description && <p className="description">{project.description}</p>}
                  {project.technologies && (
                    <div className="project-tech">
                      {project.technologies.map((tech, techIndex) => (
                        <span key={techIndex} className="tech-tag">{tech}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {certifications.length > 0 && (
          <div className="certifications-section">
            <h3>
              <Award size={20} />
              Certifications
            </h3>
            <div className="certifications-list">
              {certifications.map((cert, index) => (
                <div key={index} className="certification-item">
                  {cert}
                </div>
              ))}
            </div>
          </div>
        )}

        {languages.length > 0 && (
          <div className="languages-section">
            <h3>Languages</h3>
            <div className="languages-list">
              {languages.map((language, index) => (
                <span key={index} className="language-tag">{language}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProfileDisplay
