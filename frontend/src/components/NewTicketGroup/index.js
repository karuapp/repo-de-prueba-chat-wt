import React, { useState, useEffect, useContext } from 'react';

import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';

import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Autocomplete, {
    createFilterOptions,
} from '@material-ui/lab/Autocomplete';
import CircularProgress from '@material-ui/core/CircularProgress';

import { i18n } from '../../translate/i18n';
import api from '../../services/api';
import ButtonWithSpinner from '../ButtonWithSpinner';
import ContactModal from '../ContactModal';
import toastError from '../../errors/toastError';
import { AuthContext } from '../../context/Auth/AuthContext';
import { Grid, ListItemText, MenuItem, Select } from '@material-ui/core';
import { toast } from 'react-toastify';
import { FormControl, InputLabel } from '@material-ui/core';
import { Field, Formik, Form } from 'formik';

const filter = createFilterOptions({
    trim: true,
});

const NewTicketGroupModal = ({ modalOpen, onClose, initialContact }) => {
    const [options, setOptions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchParam, setSearchParam] = useState('');
    const [selectedContact, setSelectedContact] = useState([]);
    const [selectedQueue, setSelectedQueue] = useState('');
    const [connections, setConnections] = useState([]);
    const [selectedConnection, setSelectedConnection] = useState('');
    const [newContact, setNewContact] = useState([]);
    const [contactModalOpen, setContactModalOpen] = useState(false);
    const [selectedContacts, setSelectedContacts] = useState([]);
    const [titleGroup, setTitleGroup] = useState('')

    const { user } = useContext(AuthContext);



    useEffect(() => {
        if (initialContact?.id !== undefined) {
            setOptions([initialContact]);
            setSelectedContact(initialContact);
        }
    }, [initialContact]);

    useEffect(() => {
        const fetchWhatsapps = async () => {
            try {
                const { data } = await api.get('whatsapp', {});

                setConnections(data);
                setLoading(false);
            } catch (err) {
                setLoading(false);
                toastError(err);
            }
        };

        fetchWhatsapps();
    }, []);

    useEffect(() => {
        if (!modalOpen || searchParam.length < 3) {
            setLoading(false);
            return;
        }
        setLoading(true);
        const delayDebounceFn = setTimeout(() => {
            const fetchContacts = async () => {
                try {
                    const { data } = await api.get('contacts/nt', {
                        params: { searchParam },
                    });

                    // Modify the data before setting options
                    const modifiedContacts = data.contacts.map((contact) => {
                        const userIds = contact.tickets
                            .map((ticket) => ticket.userId)
                            .filter(Boolean);
                        if (userIds.length > 0) {
                            // Append userIds to the name if they exist in the tickets
                            return {
                                ...contact,
                                name: `${contact.name} [ESTÁ EM ATENDIMENTO AGORA]`,
                            };
                        } else {
                            return contact;
                        }
                    });

                    //console.log(modifiedContacts);

                    setOptions(modifiedContacts);
                    setLoading(false);
                } catch (err) {
                    setLoading(false);
                    toastError(err);
                }
            };

            fetchContacts();
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [searchParam, modalOpen]);

    const handleClose = () => {
        onClose();
        setSearchParam('');
        setSelectedContact(null);
        setSelectedContacts([])
    };

    const handleCreateGroupAndTicket = async (contactsAddGroup) => {
        if (!contactsAddGroup) return;
        if (
            selectedQueue === '' &&
            (user.profile !== 'admin' || user.profile !== 'supervisor')
        ) {
            toast.error('Selecione uma fila!');
            return;
        }

        if (selectedConnection === '') {
            toast.error('Selecione uma conexão!');
            return;
        }

        setLoading(true);
        try {
            const queueId = selectedQueue !== '' ? selectedQueue : null;
            const connId = selectedConnection !== '' ? selectedConnection : null;
            const { data: ticket } = await api.post('/creatGroupAndTicket', {
                contactsAddGroup,
                titleGroup,
                queueId,
                whatsappId: connId,
                userId: user.id,
                status: 'open',
            });
            setSelectedContacts([])
            onClose();
        } catch (err) {
            toastError(err);
        }
        setLoading(false);
    };

    const handleSelectOption = (e, newValue) => {
        if (Array.isArray(newValue) && newValue.length > 0) {
            // Se newValue for um array com pelo menos um elemento, adicionamos cada número de contato à lista de contatos selecionados
            newValue.forEach(contact => {
                // Verifica se o número de contato já está presente na lista selectedContacts
                if (!selectedContacts.includes(`${contact.number}@s.whatsapp.net`)) {
                    setSelectedContacts(prevSelectedContacts => [...prevSelectedContacts, `${contact.number}@s.whatsapp.net`]);
                }
            });
        }
    };

    const handleChangeTitle = (e) => {

        setTitleGroup(e)
    }

    const handleCloseContactModal = () => {
        setContactModalOpen(false);
        setSelectedContacts([])
    };

    const handleAddNewContactTicket = (contact) => {
        handleCreateGroupAndTicket(contact.id);
    };

    const createAddContactOption = (filterOptions, params) => {
        const filtered = filter(filterOptions, params);

        if (params.inputValue !== '' && !loading && searchParam.length >= 3) {
            filtered.push({
                name: `${params.inputValue}`,
            });
        }

        return filtered;
    };

    const renderOption = (option) => {
        if (option.number) {
            return `${option.name} - ${option.number}`;
        } else {
            return `${i18n.t('newTicketModal.add')} ${option.name}`;
        }
    };

    const renderOptionLabel = (option) => {
        if (option.number) {
            return `${option.name} - ${option.number}`;
        } else {
            return `${option.name}`;
        }
    };

    const renderContactAutocomplete = () => {
        return (
            <Grid xs={12} item>
                <Autocomplete
                    fullWidth
                    multiple
                    options={options}
                    loading={loading}
                    clearOnBlur
                    autoHighlight
                    freeSolo
                    clearOnEscape
                    getOptionLabel={renderOptionLabel}
                    renderOption={renderOption}
                    filterOptions={createAddContactOption}
                    onChange={(e, newValue) => handleSelectOption(e, newValue)}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label={i18n.t('newTicketModal.fieldLabel')}
                            variant='outlined'
                            autoFocus
                            onChange={(e) => setSearchParam(e.target.value)}
                            onKeyPress={(e) => {
                                if (loading || !selectedContacts.length) return;
                                else if (e.key === 'Enter') {
                                    handleCreateGroupAndTicket();
                                }
                            }}
                            InputProps={{
                                ...params.InputProps,
                                endAdornment: (
                                    <React.Fragment>
                                        {loading ? (
                                            <CircularProgress color='inherit' size={20} />
                                        ) : null}
                                        {params.InputProps.endAdornment}
                                    </React.Fragment>
                                ),
                            }}
                        />
                    )}
                />
            </Grid>
        );
    };


    return (
        <>
            <ContactModal
                open={contactModalOpen}
                initialValues={newContact}
                onClose={handleCloseContactModal}
                onSave={handleAddNewContactTicket}
            ></ContactModal>
            <Dialog open={modalOpen} onClose={handleClose}>
                <DialogTitle id='form-dialog-title'>
                    {i18n.t('Novo Grupo')}
                </DialogTitle>
                <DialogContent dividers>
                    <Formik
                        initialValues={{
                            title: '', // Adicione o novo campo teste aos initialValues do Formik
                        }}
                        onSubmit={(values) => {
                            // Lógica de envio do formulário aqui
                        }}
                    >
                        {({ values, handleChange }) => (
                            <Form>
                                <Grid style={{ width: 300 }} container spacing={2}>
                                    <Grid xs={12} item>
                                        <Field
                                            as={TextField}
                                            label={i18n.t("Nome Do Grupo")}
                                            name="title"
                                            // error={touched.title && Boolean(errors.title)}
                                            // helperText={touched.title && errors.title}
                                            onChange={(e) => {
                                                handleChangeTitle(e.target.value)
                                            }}
                                            value={titleGroup}
                                            variant="outlined"
                                            margin="dense"
                                            fullWidth
                                        />
                                    </Grid>
                                    {renderContactAutocomplete()}
                                    <Grid xs={12} item>
                                        <Select
                                            fullWidth
                                            displayEmpty
                                            variant='outlined'
                                            value={selectedQueue}
                                            onChange={(e) => {
                                                setSelectedQueue(e.target.value);
                                            }}
                                            MenuProps={{
                                                anchorOrigin: {
                                                    vertical: 'bottom',
                                                    horizontal: 'left',
                                                },
                                                transformOrigin: {
                                                    vertical: 'top',
                                                    horizontal: 'left',
                                                },
                                                getContentAnchorEl: null,
                                            }}
                                            renderValue={() => {
                                                if (selectedQueue === '') {
                                                    return 'Selecione uma fila';
                                                }
                                                const queue = user.queues.find((q) => q.id === selectedQueue);
                                                return queue.name;
                                            }}
                                        >
                                            {user.queues?.length > 0 &&
                                                user.queues.map((queue, key) => (
                                                    <MenuItem dense key={key} value={queue.id}>
                                                        <ListItemText primary={queue.name} />
                                                    </MenuItem>
                                                ))}
                                        </Select>
                                    </Grid>

                                    <Grid xs={12} item>
                                        <Select
                                            fullWidth
                                            displayEmpty
                                            variant='outlined'
                                            value={selectedConnection}
                                            onChange={(e) => {
                                                setSelectedConnection(e.target.value);
                                            }}
                                            renderValue={() => {
                                                if (selectedConnection === '') {
                                                    return 'Selecione uma conexão';
                                                }
                                                const connection = connections.find(
                                                    (conn) => conn.id === selectedConnection
                                                );
                                                return connection?.name || '';
                                            }}
                                        >
                                            {/* {connections.map((connection) => (
                                                <MenuItem key={connection.id} value={connection.id}>
                                                    <ListItemText primary={connection.name} />
                                                </MenuItem>
                                            ))} */}
                                            {user?.wbots?.length > 0 &&
                                                user.wbots.map((wbot, key) => (
                                                    <MenuItem dense key={key} value={wbot.id}>
                                                        <ListItemText primary={wbot.name} />
                                                    </MenuItem>
                                                ))}
                                        </Select>
                                    </Grid>
                                </Grid>
                            </Form>
                        )}
                    </Formik>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={handleClose}
                        color='secondary'
                        disabled={loading}
                        variant='outlined'
                    >
                        {i18n.t('newTicketModal.buttons.cancel')}
                    </Button>
                    <ButtonWithSpinner
                        variant='contained'
                        type='button'
                        disabled={!selectedContact}
                        onClick={() => handleCreateGroupAndTicket(selectedContacts)}
                        color='primary'
                        loading={loading}
                    >
                        {i18n.t('newTicketModal.buttons.ok')}
                    </ButtonWithSpinner>
                </DialogActions>
            </Dialog >
        </>
    );
};

export default NewTicketGroupModal;
