import React, { useState, useEffect } from 'react';
import Whiteboard from './components/Whiteboard';
import Toolbar from './components/Toolbar';
import ProjectList from './components/ProjectList';
import axios from 'axios';
import './App.css';

const API_PORT = import.meta.env.VITE_API_PORT || '3001';
const API_BASE =
  import.meta.env.VITE_API_URL ||
  `${window.location.protocol}//${window.location.hostname}:${API_PORT}/api`;
const DEFAULT_COLOR_BY_THEME = {
  light: '#000000',
  dark: '#ffffff'
};

function App() {
  const [projects, setProjects] = useState([]);
  const [currentProject, setCurrentProject] = useState(null);
  const [showProjectList, setShowProjectList] = useState(true);
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light' || savedTheme === 'dark') {
      return savedTheme;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });
  
  // Canvas State
  const [elements, setElements] = useState([]);
  const [appState, setAppState] = useState({
    tool: 'pen', // pencil, pen, ink, eraser
    color: DEFAULT_COLOR_BY_THEME[theme],
    thickness: 5,
    camera: { x: 0, y: 0, zoom: 1 }
  });

  // Load project list
  const fetchProjects = async () => {
    try {
      const res = await axios.get(`${API_BASE}/projects`);
      setProjects(res.data);
    } catch (err) {
      console.error('Failed to fetch projects', err);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const previousTheme = theme === 'dark' ? 'light' : 'dark';
    const previousDefaultColor = DEFAULT_COLOR_BY_THEME[previousTheme];
    const nextDefaultColor = DEFAULT_COLOR_BY_THEME[theme];

    setAppState(prev => {
      if (prev.color !== previousDefaultColor) {
        return prev;
      }
      return { ...prev, color: nextDefaultColor };
    });
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const canvasBackground = theme === 'dark' ? '#111827' : '#f5f5f5';

  const handleCreateProject = () => {
    const newId = `project_${Date.now()}`;
    setCurrentProject({ id: newId, name: '未命名项目' });
    setElements([]);
    setAppState(prev => ({ ...prev, camera: { x: 0, y: 0, zoom: 1 } }));
    setShowProjectList(false);
  };

  const handleLoadProject = async (id) => {
    try {
      const res = await axios.get(`${API_BASE}/projects/${id}`);
      setCurrentProject({ id, name: res.data.name || id });
      setElements(res.data.elements || []);
      setAppState(prev => ({
        ...prev,
        camera: res.data.camera || { x: 0, y: 0, zoom: 1 }
      }));
      setShowProjectList(false);
    } catch (err) {
      console.error('Failed to load project', err);
      alert('Failed to load project');
    }
  };

  const handleSaveProject = async () => {
    const defaultName = currentProject ? currentProject.name : '未命名项目';
    const projectName = window.prompt('请输入项目名称:', defaultName);
    
    if (!projectName) return; // Cancelled
    
    let projectId = currentProject?.id;
    if (!projectId) {
      projectId = `project_${Date.now()}`;
    }

    try {
      await axios.post(`${API_BASE}/projects/${projectId}`, {
        name: projectName,
        elements,
        camera: appState.camera
      });
      setCurrentProject({ id: projectId, name: projectName });
      alert('保存成功！');
      fetchProjects();
    } catch (err) {
      console.error('Failed to save project', err);
      alert('保存失败: ' + err.message);
    }
  };

  const handleDownload = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ elements, camera: appState.camera }));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", `${currentProject?.id || 'whiteboard'}.json`);
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <div className={`app-container ${theme}`}>
      <Toolbar 
        appState={appState} 
        setAppState={setAppState} 
        onSave={handleSaveProject}
        onDownload={handleDownload}
        onShowProjects={() => {
          fetchProjects();
          setShowProjectList(true);
        }}
        currentProjectName={currentProject?.name}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
      <Whiteboard 
        elements={elements} 
        setElements={setElements} 
        appState={appState} 
        setAppState={setAppState} 
        canvasBackground={canvasBackground}
      />
      
      {showProjectList && (
        <ProjectList 
          projects={projects} 
          onCreate={handleCreateProject} 
          onLoad={handleLoadProject}
          onClose={() => setShowProjectList(false)}
        />
      )}
    </div>
  );
}

export default App;
