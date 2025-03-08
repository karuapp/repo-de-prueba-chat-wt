import React, { useState, useEffect } from 'react';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { formatDistance, format } from 'date-fns'; 
import './ToDoList.css';

const ToDoList = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tasks, setTasks] = useState([]);
  const [editIndex, setEditIndex] = useState(-1);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
      const parsedTasks = JSON.parse(savedTasks).map(task => ({
        ...task,
        createdAt: new Date(task.createdAt), // Converte para Date
        updatedAt: new Date(task.updatedAt)  // Converte para Date
      }));
      setTasks(parsedTasks);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  const handleAddTask = () => {
    if (!title.trim() || !description.trim()) return;

    const now = new Date();
    const newTask = { title, description, createdAt: now, updatedAt: now, completed: false };

    if (editIndex >= 0) {
      const newTasks = [...tasks];
      newTasks[editIndex] = { ...newTask, updatedAt: now }; // Atualiza a tarefa existente
      setTasks(newTasks);
      setEditIndex(-1);
    } else {
      setTasks([newTask, ...tasks]); // Adiciona nova tarefa no topo
    }
    setTitle('');
    setDescription('');
    setOpen(false);
  };

  const handleEditTask = (index) => {
    setTitle(tasks[index].title);
    setDescription(tasks[index].description);
    setEditIndex(index);
    setOpen(true);
  };

  const handleDeleteTask = (index) => {
    const newTasks = [...tasks];
    newTasks.splice(index, 1);
    setTasks(newTasks);
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setTitle('');
    setDescription('');
    setEditIndex(-1);
  };

  const handleCheckboxChange = (index) => {
    const newTasks = [...tasks];
    newTasks[index].completed = !newTasks[index].completed;

    if (newTasks[index].completed) {
      const completedTask = newTasks.splice(index, 1)[0]; // Remove a tarefa completada
      newTasks.push(completedTask); // Adiciona ao final
    } else {
      const uncompletedTask = newTasks.splice(index, 1)[0]; // Remove a tarefa não completada
      const insertIndex = newTasks.findIndex(task => !task.completed); // Encontra o índice para inserção
      if (insertIndex === -1) newTasks.unshift(uncompletedTask); // Se todas estiverem completas, insere no início
      else newTasks.splice(insertIndex, 0, uncompletedTask); // Insere na posição antes das completas
    }

    setTasks(newTasks);
  };

  const formatDate = (date) => {
    if (!(date instanceof Date)) {
      return ''; // Ou algum valor padrão
    }
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const time = format(date, 'HH:mm');

    if (isToday) {
      return `Hoje, às ${time}`;
    } else {
      const distance = formatDistance(date, now, { addSuffix: true });
      return `${distance}, às ${time}`;
    }
  };

  return (
    <div className="root">
      <Button variant="contained" color="primary" onClick={handleOpen}>
        Nova Tarefa
      </Button>
      <div className="listContainer">
        <List>
          {tasks.map((task, index) => (
            <ListItem key={index} className="taskItem">
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => handleCheckboxChange(index)}
              />
              <ListItemText
                primary={<span className={task.completed ? 'completed taskTitle' : 'taskTitle'}>{task.title}</span>}
                secondary={
                  <>
                    <div className="taskDescription">{task.description}</div>
                    <div className="taskDate">{formatDate(task.updatedAt)}</div>
                  </>
                }
              />
              <ListItemSecondaryAction>
                <IconButton className="editButton" onClick={() => handleEditTask(index)}>
                  <EditIcon />
                </IconButton>
                <IconButton className="deleteButton" onClick={() => handleDeleteTask(index)}>
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      </div>

      <Modal open={open} onClose={handleClose}>
        <Box className="modalStyle">
          <Typography variant="h6" component="h2">
            {editIndex >= 0 ? 'Editar Tarefa' : 'Adicionar Nova Tarefa'}
          </Typography>
          <TextField
            label="Título da Tarefa"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            variant="outlined"
            fullWidth
            margin="normal"
          />
          <TextField
            label="Descrição da Tarefa"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            variant="outlined"
            multiline
            rows={4}
            fullWidth
            margin="normal"
          />
          <Button onClick={handleAddTask} variant="contained" color="primary" sx={{ mt: 2 }}>
            {editIndex >= 0 ? 'Salvar' : 'Adicionar'}
          </Button>
        </Box>
      </Modal>
    </div>
  );
};

export default ToDoList;
