const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Directory for storing projects
const projectsDir = path.join(__dirname, '../projects');

// Ensure projects directory exists
if (!fs.existsSync(projectsDir)) {
  fs.mkdirSync(projectsDir, { recursive: true });
}

// Get list of projects
app.get('/api/projects', (req, res) => {
  try {
    const files = fs.readdirSync(projectsDir);
    const projects = files
      .filter(file => file.endsWith('.json'))
      .map(file => {
        const filePath = path.join(projectsDir, file);
        const stat = fs.statSync(filePath);
        let name = file.replace('.json', '');
        try {
          const fileContent = fs.readFileSync(filePath, 'utf8');
          const parsed = JSON.parse(fileContent);
          if (parsed.name) name = parsed.name;
        } catch (e) {}
        return {
          id: file.replace('.json', ''),
          name,
          updatedAt: stat.mtime
        };
      })
      .sort((a, b) => b.updatedAt - a.updatedAt);
    
    res.json(projects);
  } catch (err) {
    console.error('Error reading projects:', err);
    res.status(500).json({ error: 'Failed to read projects' });
  }
});

// Get a specific project
app.get('/api/projects/:id', (req, res) => {
  const { id } = req.params;
  const filePath = path.join(projectsDir, `${id}.json`);
  
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Project not found' });
  }
  
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    res.json(JSON.parse(data));
  } catch (err) {
    console.error('Error reading project:', err);
    res.status(500).json({ error: 'Failed to read project' });
  }
});

// Save a project
app.post('/api/projects/:id', (req, res) => {
  const { id } = req.params;
  const projectData = req.body;
  const filePath = path.join(projectsDir, `${id}.json`);
  
  try {
    fs.writeFileSync(filePath, JSON.stringify(projectData, null, 2), 'utf8');
    res.json({ success: true, id });
  } catch (err) {
    console.error('Error saving project:', err);
    res.status(500).json({ error: 'Failed to save project' });
  }
});

// Serve frontend static files
const clientBuildPath = path.join(__dirname, '../client/dist');
if (fs.existsSync(clientBuildPath)) {
  app.use(express.static(clientBuildPath));
  // Catch-all route for SPA
  app.get(/(.*)/, (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(clientBuildPath, 'index.html'));
    }
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
