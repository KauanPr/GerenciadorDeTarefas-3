import React, { useState, useEffect } from 'react';
import { TextField, Button, InputAdornment, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Select, MenuItem, FormControl, InputLabel, Box, Menu, MenuItem as MenuItemMUI, Switch, FormControlLabel, Checkbox, FormGroup } from '@mui/material';
import { Person as PersonIcon, Home as HomeIcon, Book as BookIcon, Notifications as NotificationsIcon, ExitToApp as ExitToAppIcon, Search as SearchIcon, Add as AddIcon, FilterList as FilterListIcon, CalendarToday as CalendarTodayIcon, Assignment as AssignmentIcon, MoreHoriz as MoreHoriIcon, Visibility as VisibilityIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './PainelGeral.css';
import 'resize-observer-polyfill';

const ITEMS_PER_PAGE = 6;

const PainelGeral = () => {
    const navigate = useNavigate('');
    const [searchQuery, setSearchQuery] = useState('');
    const [open, setOpen] = useState(false);
    const [priority, setPriority] = useState('');
    const [tasks, setTasks] = useState([]);
    const [taskName, setTaskName] = useState('');
    const [taskDescription, setTaskDescription] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedTask, setSelectedTask] = useState(null);
    const [viewTask, setViewTask] = useState(null);
    const [history, setHistory] = useState([]);
    const [viewingHistory, setViewingHistory] = useState(false);
    const [filterOpen, setFilterOpen] = useState(false);
    const [filterPriority, setFilterPriority] = useState('');
    const [filterStatus, setFilterStatus] = useState({
        aFazer: true,
        concluido: true,
    });

        const fetchTasks = async () => {
            try {
                const token = localStorage.getItem('token');
                console.log('Token:', token); // Adicionado para depuração
                if (!token) {
                    console.error('Token não encontrado');
                    return;
                }
    
                const response = await axios.get('http://localhost:5000/api/tasks', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                console.log('Tarefas recebidas:', response.data); // Adicionado para depuração
                setDisplayedTasks(response.data);
            } catch (error) {
                console.error('Erro ao obter tarefas:', error);
            }
        };
    useEffect(() => {
        fetchTasks();
    }, []);

    const totalPages = Math.ceil((viewingHistory ? history : tasks).length / ITEMS_PER_PAGE);

    const handlePreviousPage = () => {
        setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
    };

    const handleNextPage = () => {
        setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages));
    };

    

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handlePriorityChange = (event) => {
        setPriority(event.target.value);
    };

    const handleNavigation = (path) => {
        if (path === '/historico') {
            setViewingHistory(true);
        } else {
            setViewingHistory(false);
        }
        navigate(path);
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleTaskNameChange = (e) => {
        setTaskName(e.target.value);
    };

    const handleTaskDescriptionChange = (e) => {
        setTaskDescription(e.target.value);
    };

    const handleConfirm = async () => {
        const newTask = {
            name: taskName,
            description: taskDescription,
            priority: priority
        };
    
        if (!taskName || !taskDescription || !priority) {
            console.error('Todos os campos são obrigatórios');
            return;
        }
    
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.error('Token não encontrado');
                return;
            }
    
            const response = await axios.post('http://localhost:5000/api/tasks', newTask, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            console.log('Nova tarefa criada:', response.data); // Adicionado para depuração
            setTasks((prevTasks) => [...prevTasks, response.data]);
            console.log('Estado tasks atualizado:', (prevTasks) => [...prevTasks, response.data]); // Adicionado para depuração
            setTaskName('');
            setTaskDescription('');
            setPriority('');
            setAssignedTo(''); // Limpa campo após cadastro
            handleClose();
        } catch (error) {
            console.error('Erro ao criar tarefa:', error);
        }
    };
    // Verificação se as tarefas estão sendo renderizadas corretamente
    useEffect(() => {
        console.log('Tarefas renderizadas:', tasks); // Adicionado para depuração
    }, [tasks]);

    const handleMenuClick = (event, task) => {
        setAnchorEl(event.currentTarget);
        setSelectedTask(task);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedTask(null);
    };

    const handleViewTask = (task) => {
        setViewTask(task);
    };

    const handleEditTask = async (updatedTask) => {
        console.log('Selected task to edit:', selectedTask); // Adicionado para depuração
        try {
            await axios.put(`http://localhost:5000/api/tasks/${selectedTask.id}`, updatedTask, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            setTasks(tasks.map(task => task.id === selectedTask.id ? updatedTask : task));
            handleMenuClose();
        } catch (error) {
            console.error('Erro ao editar tarefa:', error);
        }
    };



    const handleDeleteTask = async () => {
        console.log('Selected task to delete:', selectedTask); // Adicionado para depuração
        try {
            await axios.delete(`http://localhost:5000/api/tasks/${selectedTask.id}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            setTasks(tasks.filter(task => task !== selectedTask));
            handleMenuClose();
        } catch (error) {
            console.error('Erro ao deletar tarefa:', error);
        }
    };

    const handleStatusChange = async (task) => {
        const updatedTasks = { ...task, status: task.status === 'A Fazer' ? 'Concluído' : 'A Fazer' };
        console.log('Atualizando tarefa:', updatedTasks); // Adicionado para depuração   
        try {
            const response = await axios.put(`http://localhost:5000/api/tasks/${task.id}`, updatedTasks, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            console.log('Resposta do servidor:', response.data); // Adicionado para depuração
            setTasks(tasks.map(t => t.id === task.id ? updatedTasks : t));
            if (viewTask && viewTask.id === task.id) {
                setViewTask(updatedTasks); // Atualize o estado da tarefa visualizada
            }
        } catch (error) {
            console.error('Erro ao atualizar status da tarefa:', error);
        }
    };

    const handleFilterClick = () => {
        setFilterOpen(true);
    };

    const handleFilterClose = () => {
        setFilterOpen(false);
    };

    const handleFilterPriorityChange = (event) => {
        setFilterPriority(event.target.value);
    };

    const handleFilterStatusChange = (event) => {
        setFilterStatus({
            ...filterStatus,
            [event.target.name]: event.target.checked,
        });
    };

    const filteredTasks = tasks.filter(task => 
        (filterPriority === '' || task.priority === filterPriority) &&
        ((filterStatus.aFazer && task.status === 'A Fazer') || (filterStatus.concluido && task.status === 'Concluído')) &&
        (task.name.toLowerCase().includes(searchQuery.toLowerCase()) || task.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    console.log('Tarefas filtradas:', filteredTasks); // Adicionado para depuração

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const [displayedTasks, setDisplayedTasks] = useState([]);


    if (typeof window !== 'undefined') {
        const resizeObserverErrDiv = document.createElement('div');
        const resizeObserverErrMsg = 'ResizeObserver loop limit exceeded';
        window.addEventListener('error', (event) => {
            if (event.message === resizeObserverErrMsg) {
                event.stopImmediatePropagation();
            }
        });

        resizeObserverErrDiv.id = 'resizeObserverErrDiv';
        resizeObserverErrDiv.style.display = 'none';
        document.body.appendChild(resizeObserverErrDiv);
    }
    console.log('Tarefas exibidas:', displayedTasks); // Adicionado para depuração

    // ...existing code...
    const [assignedTo, setAssignedTo] = useState(''); // Novo estado para pessoa atribuída
    // ...existing code...

    const handleAssignedToChange = (e) => {
        setAssignedTo(e.target.value);
    };
    // ...existing code...
    
    return (
        <div className="container">
            <nav className='menu_lateral'>
                <div className="profile-icon">
                    <PersonIcon />
                </div>
                <ul style={{ listStyleType: 'none' }} className='iten-menu'>
                    <li>
                        <Button startIcon={<HomeIcon />} sx={{ color: 'black' }} onClick={() => handleNavigation('/painelGeral')}>
                            <span>Painel Geral</span>
                        </Button>
                    </li>
                    <li>
                        <Button startIcon={<BookIcon />} sx={{ color: 'black' }} onClick={() => handleNavigation('/historico')}>
                            <span>Histórico</span>
                        </Button>
                    </li>
                    <li>
                        <Button startIcon={<NotificationsIcon />} sx={{ color: 'black' }} onClick={() => handleNavigation('')}>
                            <span>Notificações</span>
                        </Button>
                    </li>
                </ul>
                <footer className="menu-footer">
                    <Button startIcon={<ExitToAppIcon />} sx={{ color: 'black' }} onClick={() => handleNavigation('/')}>
                        <span>Logout</span>
                    </Button>
                </footer>
            </nav>
            <div className='painel-geral'>
                <div>
                    <TextField
                        value={searchQuery}
                        onChange={handleSearchChange}
                        placeholder="Buscar"
                        fullWidth
                        sx={{ marginLeft: '300px', width: '18%', position: 'absolute', top: '64px', left: '10px', height: '40px', borderRadius: '10px', backgroundColor: '#ffffff' }}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <SearchIcon />
                                </InputAdornment>
                            )
                        }}
                    />
                    <div className="task-grid">
        
                        {displayedTasks.map((task, index) => (
                            <div key={index} className="task-card">
                                <h3>{task.name}</h3>
                                <footer className='card_header'>
                                    <IconButton onClick={() => handleViewTask(task)}>
                                        <VisibilityIcon />
                                    </IconButton>
                                    <IconButton onClick={(event) => handleMenuClick(event, task)} style={{ marginLeft: 'auto' }}>
                                        <MoreHoriIcon />
                                    </IconButton>
                                </footer>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={task.status === 'Concluído'}
                                            onChange={() => handleStatusChange(task)}
                                            name="status"
                                            color="primary"
                                        />
                                    }
                                    label={task.status}
                                    
                                />
                            </div>
                        ))}
                    </div>
                    <div className="pagination">
                        <button onClick={handlePreviousPage} disabled={currentPage === 1}>
                            &lt;
                        </button>
                        <span>{currentPage} / {totalPages}</span>
                        <button onClick={handleNextPage} disabled={currentPage === totalPages}>
                            &gt;
                        </button>
                    </div>
                    <IconButton
                        sx={{ position: 'absolute', top: '70px', left: 'calc(10px + 40% + 10px)', height: '40px', borderRadius: '10px', backgroundColor: '#ffffff' }}
                        onClick={handleFilterClick}
                    >
                        <FilterListIcon />
                    </IconButton>
                    <Button sx={{ width: '18%', height: '50px', marginLeft: '980px', top: '64px', position: 'absolute', borderRadius: '10px', backgroundColor: '#6D82F7', color: '#fff' }}
                        endIcon={<AddIcon />}
                        onClick={handleClickOpen}
                    >
                        <span>Cadastrar nova tarefa</span>
                    </Button>
                    <Dialog open={open} onClose={handleClose} sx={{ '& .MuiPaper-root': { border: '2px solid #6D82F7', borderRadius: '20px' } }}>
                        <DialogTitle sx={{ backgroundColor: '#6D82F7', color: '#fff', height: '16px', paddingTop: '10px', display: 'flex', alignItems: 'center' }}>
                            <AssignmentIcon sx={{ marginRight: '8px' }} />
                            Nova Tarefa
                            <CalendarTodayIcon sx={{ marginLeft: 'auto' }} />
                        </DialogTitle>
                        <DialogContent sx={{ minHeight: '300px', top: '20px' }}>
                            <TextField
                                autoFocus
                                margin="dense"
                                id="name"
                                label="Nome"
                                type="text"
                                fullWidth
                                variant="outlined"
                                value={taskName}
                                onChange={handleTaskNameChange}
                            />
                            <TextField
                                margin="dense"
                                id="description"
                                label="Descrição"
                                type="text"
                                fullWidth
                                variant="outlined"
                                multiline
                                rows={4}
                                maxRows={4}
                                value={taskDescription}
                                onChange={handleTaskDescriptionChange}
                            />
                            <FormControl fullWidth margin="dense" variant="outlined">
                                <InputLabel id="priority-label">Prioridade</InputLabel>
                                <Select
                                    labelId="priority-label"
                                    id="priority"
                                    value={priority}
                                    onChange={handlePriorityChange}
                                    label="Prioridade"
                                >
                                    <MenuItem value="alta">Alta</MenuItem>
                                    <MenuItem value="media">Média</MenuItem>
                                    <MenuItem value="baixa">Baixa</MenuItem>
                                </Select>
                            </FormControl>
                                <TextField
                                    margin="dense"
                                    id="assignedTo"
                                    label="Atribuir para"
                                    type="text"
                                    fullWidth
                                    variant="outlined"
                                    value={assignedTo}
                                    onChange={handleAssignedToChange}
                                />
                        </DialogContent>
                        <DialogActions>
                            <Button
                                onClick={handleConfirm}
                                sx={{
                                    backgroundColor: '#6D82F7',
                                    color: '#fff',
                                    position: 'relative',
                                    marginRight: '12px',
                                    width: '94%',
                                    height: '64px',
                                    borderRadius: '10px'
                                }}
                            >
                                Confirmar
                            </Button>
                        </DialogActions>
                    </Dialog>
                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleMenuClose}
                    >
                        <MenuItemMUI onClick={handleEditTask}>Editar</MenuItemMUI>
                        <MenuItemMUI onClick={handleDeleteTask}>Deletar</MenuItemMUI>
                    </Menu>
                    <Dialog open={Boolean(viewTask)} onClose={() => setViewTask(null)}>
                        <DialogTitle>Visualizar Tarefa</DialogTitle>
                        <DialogContent>
                            {viewTask && (
                                <div>
                                    <p><strong>Nome:</strong> {viewTask.name}</p>
                                    <p><strong>Descrição:</strong> {viewTask.description}</p>
                                    <p><strong>Prioridade:</strong> {viewTask.priority}</p>
                                    <p><strong>Status:</strong> {viewTask.status}</p>
                                </div>
                            )}
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setViewTask(null)}>Fechar</Button>
                        </DialogActions>
                    </Dialog>
                    <Dialog open={filterOpen} onClose={handleFilterClose}>
                        <DialogTitle>Filtrar Tarefas</DialogTitle>
                        <DialogContent>
                            <FormControl fullWidth margin="dense" variant="outlined">
                                <InputLabel id="filter-priority-label">Prioridade</InputLabel>
                                <Select
                                    labelId="filter-priority-label"
                                    id="filter-priority"
                                    value={filterPriority}
                                    onChange={handleFilterPriorityChange}
                                    label="Prioridade"
                                >
                                    <MenuItem value="">Todas</MenuItem>
                                    <MenuItem value="alta">Alta</MenuItem>
                                    <MenuItem value="media">Média</MenuItem>
                                    <MenuItem value="baixa">Baixa</MenuItem>
                                </Select>
                            </FormControl>
                            <FormGroup>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={filterStatus.aFazer}
                                            onChange={handleFilterStatusChange}
                                            name="aFazer"
                                        />
                                    }
                                    label="A Fazer"
                                />
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={filterStatus.concluido}
                                            onChange={handleFilterStatusChange}
                                            name="concluido"
                                        />
                                    }
                                    label="Concluído"
                                />
                            </FormGroup>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleFilterClose}>Fechar</Button>
                        </DialogActions>
                    </Dialog>
                </div>
            </div>
        </div>
    );
};

export default PainelGeral;