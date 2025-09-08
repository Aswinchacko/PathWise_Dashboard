import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Star, Clock, Users, CheckCircle, Award, MapPin, Globe, MessageCircle } from 'lucide-react';
import './Mentors.css';

const Mentors = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedExpertise, setSelectedExpertise] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedPrice, setSelectedPrice] = useState('');

  const mentors = [
    {
      id: 1,
      name: 'Sarah Chen',
      title: 'Senior Software Engineer',
      company: 'Google',
      expertise: ['React', 'Node.js', 'AWS'],
      rating: 4.9,
      hourlyRate: 120,
      languages: ['English', 'Mandarin'],
      sessions: 150,
      responseTime: '2 hours',
      verified: true,
      featured: true,
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      description: 'Full-stack developer with 8+ years building scalable web applications. Specialized in React ecosystem and cloud architecture.'
    },
    {
      id: 2,
      name: 'Marcus Rodriguez',
      title: 'Product Manager',
      company: 'Microsoft',
      expertise: ['Product Strategy', 'User Research', 'Agile'],
      rating: 4.8,
      hourlyRate: 95,
      languages: ['English', 'Spanish'],
      sessions: 89,
      responseTime: '4 hours',
      verified: true,
      featured: false,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      description: 'Product leader helping startups and enterprises build user-centric products. Expert in go-to-market strategies.'
    },
    {
      id: 3,
      name: 'Priya Patel',
      title: 'UX/UI Designer',
      company: 'Figma',
      expertise: ['User Research', 'Prototyping', 'Design Systems'],
      rating: 4.9,
      hourlyRate: 110,
      languages: ['English', 'Hindi'],
      sessions: 120,
      responseTime: '1 hour',
      verified: true,
      featured: true,
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      description: 'Designer focused on creating intuitive user experiences. Specialized in design systems and user research methodologies.'
    },
    {
      id: 4,
      name: 'David Kim',
      title: 'Data Scientist',
      company: 'Netflix',
      expertise: ['Machine Learning', 'Python', 'SQL'],
      rating: 4.7,
      hourlyRate: 130,
      languages: ['English', 'Korean'],
      sessions: 75,
      responseTime: '6 hours',
      verified: true,
      featured: false,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      description: 'Data scientist helping companies leverage AI and machine learning. Expert in recommendation systems and predictive analytics.'
    },
    {
      id: 5,
      name: 'Emma Thompson',
      title: 'Marketing Director',
      company: 'Shopify',
      expertise: ['Growth Marketing', 'Brand Strategy', 'Analytics'],
      rating: 4.8,
      hourlyRate: 100,
      languages: ['English'],
      sessions: 95,
      responseTime: '3 hours',
      verified: true,
      featured: true,
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
      description: 'Marketing strategist helping brands grow through data-driven campaigns and authentic brand building.'
    },
    {
      id: 6,
      name: 'Alex Johnson',
      title: 'DevOps Engineer',
      company: 'Amazon',
      expertise: ['Docker', 'Kubernetes', 'Terraform'],
      rating: 4.6,
      hourlyRate: 115,
      languages: ['English', 'German'],
      sessions: 68,
      responseTime: '5 hours',
      verified: true,
      featured: false,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
      description: 'DevOps specialist helping teams implement CI/CD pipelines and cloud infrastructure automation.'
    }
  ];

  const expertiseOptions = ['React', 'Node.js', 'AWS', 'Product Strategy', 'User Research', 'Agile', 'UX/UI Design', 'Machine Learning', 'Python', 'SQL', 'Growth Marketing', 'Brand Strategy', 'Analytics', 'Docker', 'Kubernetes', 'Terraform'];
  const locationOptions = ['Remote', 'New York', 'San Francisco', 'London', 'Berlin', 'Toronto', 'Singapore', 'Sydney'];
  const priceOptions = ['$50-75', '$75-100', '$100-125', '$125-150', '$150+'];

  const filteredMentors = mentors.filter(mentor => {
    const matchesSearch = mentor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         mentor.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         mentor.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         mentor.expertise.some(exp => exp.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesExpertise = !selectedExpertise || mentor.expertise.includes(selectedExpertise);
    const matchesLocation = !selectedLocation || mentor.languages.includes(selectedLocation) || mentor.languages.includes('English');
    const matchesPrice = !selectedPrice || mentor.hourlyRate >= parseInt(selectedPrice.split('-')[0].replace('$', '')) && 
                        (!selectedPrice.includes('+') || mentor.hourlyRate >= parseInt(selectedPrice.split('-')[0].replace('$', '')));
    
    return matchesSearch && matchesExpertise && matchesLocation && matchesPrice;
  });

  return (
    <div className="mentors-page">
      {/* Enhanced Search & Filter Section */}
      <div className="search-filter-section">
        <div className="section-header">
          <h2>Find Your Perfect Mentor</h2>
          <p>Connect with industry experts who can guide your career journey</p>
        </div>
        
        <div className="search-container">
          <div className="search-bar">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder="Search mentors by name, skills, or company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="filter-container">
            <div className="filter-group">
              <Filter className="filter-icon" />
              <select
                value={selectedExpertise}
                onChange={(e) => setSelectedExpertise(e.target.value)}
              >
                <option value="">All Expertise</option>
                {expertiseOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
            
            <div className="filter-group">
              <MapPin className="filter-icon" />
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
              >
                <option value="">All Locations</option>
                {locationOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
            
            <div className="filter-group">
              <Award className="filter-icon" />
              <select
                value={selectedPrice}
                onChange={(e) => setSelectedPrice(e.target.value)}
              >
                <option value="">All Prices</option>
                {priceOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Mentors Grid */}
      <div className="mentors-grid">
        {filteredMentors.map(mentor => (
          <motion.div
            key={mentor.id}
            className={`mentor-card ${mentor.featured ? 'featured' : ''}`}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
          >
            {mentor.featured && (
              <div className="featured-badge">
                <Award size={14} />
                Featured
              </div>
            )}
            
            <div className="mentor-header">
              <div className="mentor-avatar">
                <img src={mentor.avatar} alt={mentor.name} />
                {mentor.verified && (
                  <div className="verification-badge">
                    <CheckCircle size={12} />
                  </div>
                )}
              </div>
              
              <div className="mentor-info">
                <h3 className="mentor-name">{mentor.name}</h3>
                <p className="mentor-title">{mentor.title}</p>
                <p className="mentor-company">{mentor.company}</p>
              </div>
            </div>
            
            <div className="mentor-meta">
              <div className="meta-item">
                <Star size={14} />
                <span>{mentor.rating}</span>
              </div>
              <div className="meta-item">
                <Clock size={14} />
                <span>{mentor.responseTime}</span>
              </div>
              <div className="meta-item">
                <Users size={14} />
                <span>{mentor.sessions} sessions</span>
              </div>
            </div>
            
            <div className="mentor-expertise">
              {mentor.expertise.map(skill => (
                <span key={skill} className="expertise-tag">{skill}</span>
              ))}
            </div>
            
            <p className="mentor-description">{mentor.description}</p>
            
            <div className="mentor-languages">
              <Globe size={14} />
              <span>{mentor.languages.join(', ')}</span>
            </div>
            
            <div className="mentor-actions">
              <div className="price-info">
                <span className="hourly-rate">${mentor.hourlyRate}/hr</span>
              </div>
              <button className="btn btn-primary">
                <MessageCircle size={16} />
                Message
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* CTA Section */}
      <div className="cta-section">
        <div className="cta-content">
          <h2>Can't find the right mentor?</h2>
          <p>Join our community and get personalized recommendations based on your goals and experience level.</p>
          <button className="btn btn-large btn-primary">Join Community</button>
        </div>
      </div>
    </div>
  );
};

export default Mentors; 