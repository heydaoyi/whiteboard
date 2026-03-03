import React from 'react';
import { X } from 'lucide-react';

const ProjectList = ({ projects, onCreate, onLoad, onClose }) => {
  return (
    <div className="project-list-overlay">
      <div className="project-list">
        <h2>
          Projects
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={24} />
          </button>
        </h2>
        
        <button className="create-btn" onClick={onCreate}>
          + New Project
        </button>
        
        <div className="projects-container">
          {projects.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#666' }}>No projects found.</p>
          ) : (
            projects.map(proj => (
              <div 
                key={proj.id} 
                className="project-item"
                onClick={() => onLoad(proj.id)}
              >
                <strong>{proj.name}</strong>
                <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>
                  Updated: {new Date(proj.updatedAt).toLocaleString()}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectList;
