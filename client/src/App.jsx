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
const DEFAULT_CAMERA = { x: 0, y: 0, zoom: 1 };
const DEFAULT_COLOR_BY_THEME = {
  light: '#000000',
  dark: '#ffffff'
};

const normalizeCamera = (camera) => {
  if (!camera || typeof camera !== 'object') {
    return { ...DEFAULT_CAMERA };
  }

  const x = Number.isFinite(camera.x) ? camera.x : DEFAULT_CAMERA.x;
  const y = Number.isFinite(camera.y) ? camera.y : DEFAULT_CAMERA.y;
  const rawZoom = Number.isFinite(camera.zoom) ? camera.zoom : DEFAULT_CAMERA.zoom;
  const zoom = Math.min(Math.max(rawZoom, 0.1), 10);

  return { x, y, zoom };
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
    camera: { ...DEFAULT_CAMERA }
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
    setAppState(prev => ({ ...prev, camera: { ...DEFAULT_CAMERA } }));
    setShowProjectList(false);
  };

  const handleLoadProject = async (id) => {
    try {
      const res = await axios.get(`${API_BASE}/projects/${id}`);
      setCurrentProject({ id, name: res.data.name || id });
      setElements(res.data.elements || []);
      setAppState(prev => ({
        ...prev,
        camera: normalizeCamera(res.data.camera)
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

  const handleImport = (file) => {
    const reader = new FileReader();

    reader.onload = () => {
      try {
        const fileContent = reader.result;
        if (typeof fileContent !== 'string') {
          throw new Error('文件读取失败');
        }

        const parsedData = JSON.parse(fileContent);
        const importedElements = Array.isArray(parsedData) ? parsedData : parsedData?.elements;
        if (!Array.isArray(importedElements)) {
          throw new Error('JSON 格式不正确，缺少 elements 数组');
        }

        const importedCamera = Array.isArray(parsedData)
          ? { ...DEFAULT_CAMERA }
          : normalizeCamera(parsedData.camera);

        setElements(importedElements);
        setAppState(prev => ({
          ...prev,
          camera: importedCamera
        }));
        setCurrentProject(null);
        setShowProjectList(false);
        alert('导入成功！');
      } catch (err) {
        console.error('Failed to import file', err);
        alert('导入失败：请确认是有效的白板 JSON 文件');
      }
    };

    reader.onerror = () => {
      alert('导入失败：文件读取错误');
    };

    reader.readAsText(file);
  };

  return (
    <div className={`app-container ${theme}`}>
      <Toolbar 
        appState={appState} 
        setAppState={setAppState} 
        onSave={handleSaveProject}
        onDownload={handleDownload}
        onImport={handleImport}
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
