import React from 'react';
import { Pencil, PenTool, Droplet, Eraser, Save, Download, FolderOpen, Hand } from 'lucide-react';

const Toolbar = ({ appState, setAppState, onSave, onDownload, onShowProjects, currentProjectName }) => {
  const { tool, color, thickness } = appState;

  const handleToolChange = (newTool) => {
    setAppState(prev => ({ ...prev, tool: newTool }));
  };

  const handleColorChange = (e) => {
    setAppState(prev => ({ ...prev, color: e.target.value }));
  };

  const handleThicknessChange = (e) => {
    setAppState(prev => ({ ...prev, thickness: parseInt(e.target.value) }));
  };

  return (
    <div className="toolbar">
      <button onClick={onShowProjects} title="Projects">
        <FolderOpen size={20} />
      </button>
      {currentProjectName && (
        <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#555', padding: '0 8px', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={currentProjectName}>
          {currentProjectName}
        </span>
      )}
      <div className="divider" />
      
      <button className={tool === 'hand' ? 'active' : ''} onClick={() => handleToolChange('hand')} title="Pan Canvas">
        <Hand size={20} />
      </button>
      <button className={tool === 'pencil' ? 'active' : ''} onClick={() => handleToolChange('pencil')} title="Pencil">
        <Pencil size={20} />
      </button>
      <button className={tool === 'pen' ? 'active' : ''} onClick={() => handleToolChange('pen')} title="Pen">
        <PenTool size={20} />
      </button>
      <button className={tool === 'ink' ? 'active' : ''} onClick={() => handleToolChange('ink')} title="Ink">
        <Droplet size={20} />
      </button>
      <button className={tool === 'eraser' ? 'active' : ''} onClick={() => handleToolChange('eraser')} title="Eraser">
        <Eraser size={20} />
      </button>

      <div className="divider" />
      
      <input 
        type="color" 
        value={color} 
        onChange={handleColorChange} 
        disabled={tool === 'eraser' || tool === 'hand'}
      />
      <input 
        type="range" 
        min="1" 
        max="50" 
        value={thickness} 
        onChange={handleThicknessChange}
        disabled={tool === 'hand'}
      />

      <div className="divider" />
      
      <button onClick={onSave} title="Save to Server">
        <Save size={20} />
      </button>
      <button onClick={onDownload} title="Download JSON">
        <Download size={20} />
      </button>
    </div>
  );
};

export default Toolbar;
