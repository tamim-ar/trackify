import React from 'react';
import { createRoot } from 'react-dom/client';
import TaskManager from './components/TaskManager';
import './styles.css';

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<TaskManager />);
