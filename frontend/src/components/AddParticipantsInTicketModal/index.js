import React, { useContext, useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, List, ListItem, ListItemText, IconButton, InputAdornment, TextField } from "@material-ui/core";
import { AuthContext } from '../../context/Auth/AuthContext';
import toastError from '../../errors/toastError';
import api from '../../services/api';

//icons
import Checkbox from '@material-ui/core/Checkbox';
import SearchIcon from '@material-ui/icons/Search';
import { toast } from 'react-toastify';


const AddParticipantesInTicket = ({ open, onClose, ticket }) => {
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [searchParam, setSearchParam] = useState("");
    const [pageNumber, setPageNumber] = useState(1);
    const [users, setUsers] = useState([]);
    const { user } = useContext(AuthContext);

    const userId = user?.id
    const userProfile = user?.profile

    const ticketAssigned = ticket.assignedUsers !== null ? ticket.assignedUsers.split(',').map(id => parseInt(id, 10)) : null; // Converte os IDs para números inteiros
    const assignedUsers = ticketAssigned;

    // Adiciona os usuários presentes em ticketAssigned ao selectedUsers ao abrir o modal
    useEffect(() => {
        if (open) {
            if(ticketAssigned !== null){
                setSelectedUsers(ticketAssigned);
            }
        }
    }, [open]);

    useEffect(() => {
        if (open) {

            const delayDebounceFn = setTimeout(() => {
                const fetchUsers = async () => {
                    try {
                        console.log()
                        let responseData = [{}];
                        let Result = [{}];
                            responseData = await api.get("/users/", { params: { searchParam, pageNumber } });
                            Result = responseData?.data?.users;
                        
                        setUsers(Result)

                    } catch (err) {
                        toastError(err);
                    }
                };
                fetchUsers();
            }, 500);
            return () => clearTimeout(delayDebounceFn);
        }
    }, [searchParam, pageNumber, open, userId, userProfile,]);

    const handleToggleUser = (userId) => {
        setSelectedUsers(prevSelected => {
            if (prevSelected.includes(userId)) {
                return prevSelected.filter(id => id !== userId);
            } else {
                return [...prevSelected, userId];
            }
        });
    };

    const handleCloseModal = () => {
        setSelectedUsers([]);
        onClose(); // Chama a função onClose passada como propriedade
    };

    const handleSaveParticipants = async () => {
        try {

            const assignedUsersString = selectedUsers.join(',');

            await api.put(`/tickets/${ticket.id}`, {
                assignedUsers: assignedUsersString
            });

            handleCloseModal();
        } catch (error) {
            toastError(error);
        }
    };

    return (
        <Dialog open={open} onClose={handleCloseModal} PaperProps={{ style: { width: '450px', borderRadius: '10px' } }}>
            <DialogTitle>
                {`Adicionar usuário(s) Ao ticket`}
            </DialogTitle>
            <DialogContent>
                <TextField
                    placeholder="Pesquise"
                    // onChange={(event) => setValorDaBusca(event?.target?.value)}
                    style={{ width: '100%' }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        ),
                        style: { borderRadius: '15px' }
                    }}
                />
                <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
                    <List>
                        {users.map((user) => (
                            <ListItem button key={user.id}>
                                <Checkbox
                                    checked={selectedUsers.includes(user.id)}
                                    onChange={() => handleToggleUser(user.id)}
                                />
                                <ListItemText primary={user.name} />
                            </ListItem>
                        ))}
                    </List>
                </div>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleCloseModal} color="primary">Fechar</Button>
                <Button onClick={handleSaveParticipants} color="primary">Salvar</Button>
            </DialogActions>
        </Dialog>
    );
};

export default AddParticipantesInTicket;
