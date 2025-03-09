import React, { useContext, useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, List, ListItem, ListItemText, IconButton, InputAdornment, TextField } from "@material-ui/core";
import { AuthContext } from '../../context/Auth/AuthContext';
import toastError from '../../errors/toastError';
import api from '../../services/api';

//icons
import Checkbox from '@material-ui/core/Checkbox';
import SearchIcon from '@material-ui/icons/Search';
import { toast } from 'react-toastify';

const ContactItem = ({ contact }) => (
  <div>
    <p>Nome: {contact.name}</p>
    <p>Número: {contact.number}</p>
    {/* Adicione outros campos necessários */}
  </div>
);

const WalletModal = ({ open, onClose, contactData }) => {
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [valorDaBusca, setValorDaBusca] = useState('');
    const [searchParam, setSearchParam] = useState("");
    const [pageNumber, setPageNumber] = useState(1);
    const [users, setUsers] = useState([]);
    const { user } = useContext(AuthContext);

    const userId = user?.id
    const userProfile = user?.profile

    const isArray = Array.isArray(contactData);

    useEffect(() => {
        if (open) {

            const isNil = (value) => value === undefined || value === null;

            const checkContactsWallet = () => {
                let hasContactInOtherWallet = false;
            
                for (const contact of contactData) {
                    if (!isNil(contact.walleteUserId) && contact.walleteUserId !== userId && userProfile === 'user') {
                        toastError(`O contato: ${contact.name} já está adicionado a uma carteira`);
                        hasContactInOtherWallet = true;
                    }
                }
            
                return hasContactInOtherWallet;
            };
    
            if (isArray && checkContactsWallet()) {
                handleCloseModal();
                return;
            }

            if (!isArray && contactData?.walleteUserId !== null && contactData?.walleteUserId !== userId && userProfile === 'user') {
                toastError(`O contato: ${contactData?.name} já está adicionado a uma carteira`)
                handleCloseModal();
                return;
            } else if (!isArray && !isNil(contactData?.walleteUserId)) {
                setSelectedUsers([contactData?.walleteUserId])
            }

            const delayDebounceFn = setTimeout(() => {
                const fetchUsers = async () => {
                    try {
                        console.log()
                        let responseData = [{}];
                        let Result = [{}];
                        if (userProfile === 'admin' || userProfile === 'supervisor') {
                            responseData = await api.get("/users/", { params: { searchParam, pageNumber } });
                            Result = responseData?.data?.users;
                        } else if (userProfile === 'user') {
                            responseData = await api.get(`/users/${userId}`);
                            Result = [responseData?.data]; 
                        }
                        
                        setUsers(Result)

                    } catch (err) {
                        toastError(err);
                    }
                };
                fetchUsers();
            }, 500);
            return () => clearTimeout(delayDebounceFn);
        }
    }, [searchParam, pageNumber, open, userId, userProfile, contactData, isArray]);

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

    const handleSaveWalle = async () => {
        try {
            if (isArray) {
                for (const contact of contactData) {
                    contact.walleteUserId = selectedUsers[0];
                    await api.put(`/contacts/${contact?.id}`, contact);
                    toast.success(`${contact.name} adicionado à carteira com sucesso!`);
                }
            } else {
                if (selectedUsers.length === 0) {
                    contactData.walleteUserId = null;
                } else {
                    contactData.walleteUserId = selectedUsers[0];
                }
                await api.put(`/contacts/${contactData?.id}`, contactData);
                toast.success(`${contactData?.name} adicionado à carteira com sucesso!`);
            }
            handleCloseModal();
        } catch (error) {
            toastError(error);
        }
    };

    return (
        <Dialog open={open} onClose={handleCloseModal} PaperProps={{ style: { width: '450px', borderRadius: '10px' } }}>
            <DialogTitle>
                {isArray ? 'Adicionar Contatos à Carteira' : `Adicionar à Carteira o contato ${contactData?.name} - ${contactData?.number}`}
            </DialogTitle>
            <DialogContent>
                <TextField
                    placeholder="Pesquise"
                    onChange={(event) => setValorDaBusca(event?.target?.value)}
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
                {/* Renderizar a lista de contatos apenas se contactData for um array */}
                {isArray && contactData.map((contact) => (
                    <ContactItem key={contact.id} contact={contact} />
                ))}
            </DialogContent>
            <DialogActions>
                <Button onClick={handleCloseModal} color="primary">Fechar</Button>
                <Button onClick={handleSaveWalle} color="primary">Salvar</Button>
            </DialogActions>
        </Dialog>
    );
};

export default WalletModal; 