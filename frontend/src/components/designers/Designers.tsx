import React from 'react';
import './Designers.css';

const designers = [
  { id: 1, name: 'Aisha Khan', role: 'Lead UI/UX Designer', bio: 'Specializes in product design, prototyping and design systems.', avatar: '/avatars/designer1.png' },
  { id: 2, name: 'Ravi Patel', role: 'Visual Designer', bio: 'Branding and illustration expert with a passion for motion.', avatar: '/avatars/designer2.png' },
  { id: 3, name: 'Lina Gomez', role: 'Interaction Designer', bio: 'Focus on micro-interactions and accessibility-first experiences.', avatar: '/avatars/designer3.png' },
];

const Designers: React.FC = () => {
  return (
    <div className="designers-page">
      <div className="designers-container">
        <h1>Our Designers</h1>
        <p className="lead">Meet the creative team behind our product designs.</p>

        <div className="designers-grid">
          {designers.map(d => (
            <div key={d.id} className="designer-card">
              <div className="designer-avatar">
                <img src={d.avatar} alt={d.name} onError={(e) => { (e.target as HTMLImageElement).src = '/user.png'; }} />
              </div>
              <div className="designer-info">
                <div className="designer-name">{d.name}</div>
                <div className="designer-role">{d.role}</div>
                <div className="designer-bio">{d.bio}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Designers;
