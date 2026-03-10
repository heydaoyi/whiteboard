import React from 'react';
import { X } from 'lucide-react';

const ProjectList = ({ projects, onCreate, onLoad, onClose }) => {
  return (
    <div className="project-list-overlay">
      <div className="project-list">
        <h2>
          Projects
          <button onClick={onClose} className="icon-button">
            <X size={24} />
          </button>
        </h2>
        
        <button className="create-btn" onClick={onCreate}>
          + New Project
        </button>
        
        <div className="projects-container">
          {projects.length === 0 ? (
            <p className="empty-projects">No projects found.</p>
          ) : (
            projects.map(proj => (
              <div 
                key={proj.id} 
                className="project-item"
                onClick={() => onLoad(proj.id)}
              >
                <strong>{proj.name}</strong>
                <div className="project-updated-at">
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
