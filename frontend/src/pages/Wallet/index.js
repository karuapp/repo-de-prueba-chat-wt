import React, { useState, useEffect, useReducer, useContext } from "react";
import { toast } from "react-toastify";
import { makeStyles } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import Avatar from "@material-ui/core/Avatar";
import SearchIcon from "@material-ui/icons/Search";
import TextField from "@material-ui/core/TextField";
import InputAdornment from "@material-ui/core/InputAdornment";
import IconButton from "@material-ui/core/IconButton";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import CancelIcon from "@material-ui/icons/Cancel";
import api from "../../services/api";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import ContactModal from "../../components/ContactModal";
import { i18n } from "../../translate/i18n";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import MainContainer from "../../components/MainContainer";
import toastError from "../../errors/toastError";
import { AuthContext } from "../../context/Auth/AuthContext";
import ConfirmationModal from "../../components/ConfirmationModal/";
import WhatsAppIcon from "@material-ui/icons/WhatsApp";
import { isEmptyArray } from "formik";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import NewTicketModal from "../../components/NewTicketModal";

const reducer = (state, action) => {
    if (action.type === "RELOAD_CONTACTS") {
        return action.payload;
    }
    if (action.type === "LOAD_CONTACTS") {
        return [...state, ...action.payload];
    }
    if (action.type === "UPDATE_CONTACTS") {
        const updatedContact = action.payload;
        return state.map(contact =>
            contact.id === updatedContact.id ? updatedContact : contact
        );
    }
    if (action.type === "DELETE_CONTACT") {
        const contactId = action.payload;
        return state.filter(contact => contact.id !== contactId);
    }
    if (action.type === "RESET") {
        return [];
    }
};

const useStyles = makeStyles((theme) => ({
    mainPaper: {
        flex: 1,
        padding: theme.spacing(1),
        overflowY: "scroll",
        ...theme.scrollbarStyles,
    },
}));

const Wallets = () => {
    const classes = useStyles();
    const history = useHistory();

    const { user } = useContext(AuthContext);
    const [loading, setLoading] = useState(false);
    const [pageNumber, setPageNumber] = useState(1);
    const [searchParam, setSearchParam] = useState("");
    const [contacts, dispatch] = useReducer(reducer, []);
    const [selectedContactId, setSelectedContactId] = useState(null);
    const [contactModalOpen, setContactModalOpen] = useState(false);
    const [removeWalletContact, setRemoveWalletContact] = useState(null);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [hasMore, setHasMore] = useState(false);
    const [users, setUsers] = useState([]);
    const [newTicketModalOpen, setNewTicketModalOpen] = useState(false);
    const [contactTicket, setContactTicket] = useState({});

    useEffect(() => {
        dispatch({ type: "RESET" });
        setPageNumber(1);
    }, [searchParam]);

    useEffect(() => {
        setLoading(true);
        const delayDebounceFn = setTimeout(async () => {
            try {
                const { data } = await api.get("/wallets/contacts/", {
                    params: { searchParam, pageNumber },
                });
                dispatch({ type: "LOAD_CONTACTS", payload: data.contacts });
                setHasMore(data.hasMore);
                setLoading(false);
            } catch (err) {
                toastError(err);
            }
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [searchParam, pageNumber]);

    useEffect(() => {
        const fetchContacts = async () => {
            try {
                const { data } = await api.get("/wallets/contacts/");
                dispatch({ type: "RELOAD_CONTACTS", payload: data.contacts });
            } catch (err) {
                toastError(err);
            }
        };
    
        fetchContacts();
    }, []);

    useEffect(() => {
        setLoading(true);
        const delayDebounceFn = setTimeout(async () => {
            try {
                const { data } = await api.get("/users/", {
                    params: { searchParam },
                });
                setUsers(data?.users);
                setLoading(false);
            } catch (err) {
                toastError(err);
            }
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [searchParam]);

    const handleCloseOrOpenTicket = (ticket) => {
        setNewTicketModalOpen(false);
        if (ticket !== undefined && ticket.uuid !== undefined) {
            history.push(`/tickets/${ticket.uuid}`);
        }
    };

    const handleSearch = (event) => {
        const searchValue = event.target.value.toLowerCase().trim();
        
        // Filtrar os usuários com base no valor de pesquisa
        const filteredUsers = users.filter(user =>
            user?.name && user.name.toLowerCase().includes(searchValue)
        );
        
        // Verificar se há algum ID de usuário filtrado
        if (filteredUsers.length > 0) {
            const filteredUserId = filteredUsers[0].id;
            
            // Filtrar os contatos com base no ID de usuário filtrado
            const filteredContacts = contacts.filter(contact =>
                contact?.walleteUserId === filteredUserId
            );
    
            // Verificar se o array filtrado não está vazio antes de atualizar os contatos
            if (filteredContacts.length > 0) {
                // Atualizar os contatos filtrados
                dispatch({ type: "LOAD_CONTACTS", payload: filteredContacts });
            } else {
                // Se o array filtrado estiver vazio, não há contatos para exibir
                dispatch({ type: "LOAD_CONTACTS", payload: [] });
            }
        }
        
        // Atualizar o estado do parâmetro de pesquisa
        setSearchParam(searchValue);
    };





    const handleCloseContactModal = () => {
        setSelectedContactId(null);
        setContactModalOpen(false);
    };

    const handleRemoveWalletContact = async (contactId) => {

        removeWalletContact.walleteUserId = null

        try {
            await api.put(`/contacts/${removeWalletContact?.id}`, removeWalletContact);
            dispatch({ type: "DELETE_CONTACT", payload: contactId });
            toast.success(i18n.t("Wallet.toasts.remove"));
        } catch (err) {
            toastError(err);
        }
        setConfirmOpen(false);
        setSearchParam("");
        setPageNumber(1);
    };

    const loadMore = () => {
        setPageNumber(prevPageNumber => prevPageNumber + 1);
    };

    const handleScroll = (e) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
        if (!hasMore || loading) return;
        if (scrollHeight - (scrollTop + 100) < clientHeight) {
            loadMore();
        }
    };

    const getDateLastMessage = (contact) => {
        if (!contact || !contact.tickets || contact.tickets.length === 0) return null;
        const date = new Date(contact.tickets[contact.tickets.length - 1].updatedAt);
        const day = date.getDate() > 9 ? date.getDate() : `0${date.getDate()}`;
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        const hours = date.getHours();
        const minutes = date.getMinutes();
        return `${day}/${month}/${year} ${hours}:${minutes}`;
    };

    return (
        <MainContainer className={classes.mainContainer}>
            <ContactModal
                open={contactModalOpen}
                onClose={handleCloseContactModal}
                aria-labelledby="form-dialog-title"
                contactId={selectedContactId}
            />

            <NewTicketModal
                modalOpen={newTicketModalOpen}
                initialContact={contactTicket}
                onClose={(ticket) => {
                    handleCloseOrOpenTicket(ticket);
                }}
            />

            <ConfirmationModal
                title={`${i18n.t("Wallet.confirmationModal.removeWalletContactTitle")} ${removeWalletContact?.name} ${i18n.t("Wallet.confirmationModal.continueWalletTitle")}? `}
                open={confirmOpen}
                onClose={() => setConfirmOpen(false)}
                onConfirm={() => handleRemoveWalletContact(removeWalletContact?.id)}
            >
                {i18n.t("Wallet.confirmationModal.messages.removeMessage")}
            </ConfirmationModal>
            <MainHeader>
                <Title>{i18n.t("Wallet.title")} ({contacts.length})</Title>
                <MainHeaderButtonsWrapper>
                    <TextField
                        placeholder={i18n.t("Wallet.searchPlaceholder")}
                        type="search"
                        value={searchParam}
                        onChange={handleSearch}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon color="secondary" />
                                </InputAdornment>
                            ),
                        }}
                    />
                </MainHeaderButtonsWrapper>
            </MainHeader>
            <Paper
                className={classes.mainPaper}
                variant="outlined"
                onScroll={handleScroll}
            >
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell padding="checkbox" />
                            <TableCell>{i18n.t("contacts.table.name")}</TableCell>
                            <TableCell align="center">{i18n.t("contacts.table.whatsapp")}</TableCell>
                            <TableCell align="center">{i18n.t("contacts.table.email")}</TableCell>
                            <TableCell align="center">{"Última Interação"}</TableCell>
                            <TableCell align="center">{"Status"}</TableCell>
                            <TableCell align="center">{i18n.t("Atribuido a Carteira de")}</TableCell>
                            <TableCell align="center">{i18n.t("contacts.table.actions")}</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <>
                            {contacts.map((contact) => (
                                <TableRow key={contact.id}>
                                    <TableCell style={{ paddingRight: 0 }}>
                                        {<Avatar src={contact.profilePicUrl} />}
                                    </TableCell>
                                    <TableCell>{contact.name}</TableCell>
                                    <TableCell align="center">{contact.number}</TableCell>
                                    <TableCell align="center">{contact.email}</TableCell>
                                    <TableCell align="center">{getDateLastMessage(contact)}</TableCell>
                                    <TableCell align="center">
                                        {contact.active ? (
                                            <CheckCircleIcon style={{ color: "green" }} fontSize="small" />
                                        ) : (
                                            <CancelIcon style={{ color: "red" }} fontSize="small" />
                                        )}
                                    </TableCell>
                                    {users.map(user => (
                                        user.id === contact?.walleteUserId && (
                                            <TableCell key={user.id} align="center">
                                                {user.name}
                                            </TableCell>
                                        )
                                    ))}
                                    <TableCell align="center">
                                    <IconButton
                                            size="small"
                                            onClick={() => {
                                                setContactTicket(contact);
                                                setNewTicketModalOpen(true);
                                            }}
                                        >
                                            <WhatsAppIcon color="secondary" />
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            onClick={() => {
                                                setConfirmOpen(true);
                                                setRemoveWalletContact(contact);
                                            }}
                                        >
                                            <DeleteOutlineIcon color="secondary" />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {loading && <TableRowSkeleton avatar columns={3} />}
                        </>
                    </TableBody>
                </Table>
            </Paper>
        </MainContainer>
    );
};

export default Wallets;
