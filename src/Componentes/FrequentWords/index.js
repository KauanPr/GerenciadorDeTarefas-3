import React, { useState, useEffect } from 'react';
import { Chip, Box, Typography, Paper } from '@mui/material';
import { LabelImportant as LabelIcon } from '@mui/icons-material';

const FrequentWords = ({ tasks }) => {
  const [frequentWords, setFrequentWords] = useState([]);
  
  useEffect(() => {
    if (!tasks || tasks.length === 0) return;
    
    // Extrair palavras das descrições das tarefas
    const words = tasks
      .map(task => task.description || '')
      .join(' ')
      .toLowerCase()
      .replace(/[^\w\s]/gi, '')
      .split(/\s+/)
      .filter(word => word.length > 3); // Ignorar palavras pequenas
    
    // Contar frequência
    const wordCount = {};
    words.forEach(word => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });
    
    // Filtrar apenas palavras que aparecem mais de uma vez
    const frequent = Object.entries(wordCount)
      .filter(([_, count]) => count > 1)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5) // Top 5 palavras
      .map(([word, count]) => ({ word, count }));
    
    setFrequentWords(frequent);
  }, [tasks]);
  
  if (!frequentWords.length) {
    return null;
  }
  
  return (
    <Paper 
      elevation={2} 
      sx={{ 
        p: 2, 
        mt: 2, 
        mb: 2,
        position: 'absolute', 
        bottom: 20, 
        right: 20, 
        width: 220,
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        border: '1px solid #e0e0e0'
      }}
    >
      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold', color: '#555' }}>
        Palavras Frequentes
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
        {frequentWords.map(({ word, count }) => (
          <Chip 
            key={word}
            icon={<LabelIcon fontSize="small" />}
            label={`${word} (${count})`}
            size="small"
            sx={{ 
              backgroundColor: '#e3f2fd', 
              color: '#1976d2',
              '&:hover': {
                backgroundColor: '#bbdefb'
              }
            }}
          />
        ))}
      </Box>
    </Paper>
  );
};

export default FrequentWords;