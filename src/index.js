import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import './App.css';
import FrequentWords from '../FrequentWords';

const container = document.getElementById('root');
const root = ReactDOM.createRoot(container);
<FrequentWords tasks={tasks} />
root.render(<App />);
