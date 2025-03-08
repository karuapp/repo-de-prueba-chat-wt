import React, { useState, useEffect, useContext } from "react";

import { makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import Typography from "@material-ui/core/Typography";
import { Grid, ListItemText, MenuItem, Select } from "@material-ui/core";
import { Facebook, Instagram, WhatsApp } from "@material-ui/icons";
import Autocomplete, { createFilterOptions } from "@material-ui/lab/Autocomplete";
import { Alert, AlertTitle } from '@material-ui/lab';
import CircularProgress from "@material-ui/core/CircularProgress";

import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import ButtonWithSpinner from "../ButtonWithSpinner";
import ContactModal from "../ContactModal";
import toastError from "../../errors/toastError";
import { AuthContext } from "../../context/Auth/AuthContext";
import { toast } from "react-toastify";

const useStyles = makeStyles((theme) => ({
  online: {
    fontSize: 11,
    color: "#25d366"
  },
  offline: {
    fontSize: 11,
    color: "#e1306c"
  }
}));

const filter = createFilterOptions({
  trim: true,
});

const NewTicketModal = ({ modalOpen, onClose, initialContact }) => {
  const classes = useStyles();
  const [options, setOptions] = useState([]);
  const [channelFilter, setChannelFilter] = useState(null);
  const [ticketOpenAlert, setTicketOpenAlert] = useState("");

  const [loading, setLoading] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [selectedContact, setSelectedContact] = useState(null);
  const [selectedQueue, setSelectedQueue] = useState("");
  const [selectedWhatsapp, setSelectedWhatsapp] = useState("");
  const [newContact, setNewContact] = useState({});
  const [whatsapps, setWhatsapps] = useState([]);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const { user } = useContext(AuthContext);
  const { companyId, whatsappId } = user;

  const [openAlert, setOpenAlert] = useState(false);
  const [userTicketOpen, setUserTicketOpen] = useState("");
  const [queueTicketOpen, setQueueTicketOpen] = useState("");

  useEffect(() => {
    if (initialContact?.id !== undefined) {
      setOptions([initialContact]);
      setSelectedContact(initialContact);
    }
  }, [initialContact]);

  // UseEffect para fechar o alerta automaticamente
  useEffect(() => {
    if (ticketOpenAlert) {
      const timer = setTimeout(() => {
        setTicketOpenAlert(null); // Limpa o alerta após 8 segundos
      }, 8000);

      return () => clearTimeout(timer); // Limpa o timer se o componente for desmontado ou se o alerta mudar
    }
  }, [ticketOpenAlert]);

  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      const fetchContacts = async () => {
        api
          // .get(`/whatsapp/filter`, { params: { companyId, session: 0, channel: channelFilter } })
          .get(`/whatsapp`, { params: { companyId, session: 0 } })
          .then(({ data }) => setWhatsapps(data));

        // .then(({ data }) => {
        //   const mappedWhatsapps = data.map((whatsapp) => ({
        //     ...whatsapp,
        //     selected: false,
        //   }));
        //   setWhatsapps(mappedWhatsapps);
        //   if (channelFilter && mappedWhatsapps.length && mappedWhatsapps?.length === 1 && (user.whatsappId === null || user?.whatsapp?.channel !== channelFilter)) {
        //     setSelectedWhatsapp(mappedWhatsapps[0].id)
        //   }
        // });
      };

      if (whatsappId !== null && whatsappId !== undefined) {
        setSelectedWhatsapp(whatsappId)
      }

      if (user.queues.length === 1) {
        setSelectedQueue(user.queues[0].id)
      }
      fetchContacts();
      setLoading(false);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [selectedContact, channelFilter])

  useEffect(() => {
    if (!modalOpen || searchParam.length < 3) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      const fetchContacts = async () => {
        try {
          const { data } = await api.get("contacts", {
            params: { searchParam },
          });
          setOptions(data.contacts);
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

  const IconChannel = (channel) => {
    switch (channel) {
      case "facebook":
        return <Facebook style={{ color: "#3b5998", verticalAlign: "middle" }} />;
      case "instagram":
        return <Instagram style={{ color: "#e1306c", verticalAlign: "middle" }} />;
      case "whatsapp":
        return <WhatsApp style={{ color: "#25d366", verticalAlign: "middle" }} />
      default:
        return "error";
    }
  };

  const handleClose = () => {
    onClose();
    setSearchParam("");
    setOpenAlert(false);
    setUserTicketOpen("");
    setQueueTicketOpen("");
    setSelectedContact(null);
  };

  const handleCloseAlert = () => {
    setOpenAlert(false);
    setLoading(false);
    setOpenAlert(false);
    setUserTicketOpen("");
    setQueueTicketOpen("");
  };

  const handleSaveTicket = async contactId => {
    // Verifica se um contato foi selecionado
    if (!contactId) return;

    // Verifica se uma fila foi selecionada
    if (selectedQueue === "") {
      toast.error("Selecione uma fila");
      return;
    }

    setLoading(true);
    try {
      const queueId = selectedQueue !== "" ? selectedQueue : null;
      const whatsappId = selectedWhatsapp !== "" ? selectedWhatsapp : null;

      // Debug: Verifique os dados enviados
      console.log("Dados do ticket:", {
        contactId,
        queueId,
        whatsappId,
        userId: user.id,
        status: "open",
      });

      // Tentativa de criar um novo ticket
      const { data: ticket } = await api.post("/tickets", {
        contactId,
        queueId,
        whatsappId,
        userId: user.id,
        status: "open",
      });

      // Fecha o modal com os detalhes do ticket criado
      onClose(ticket);
    } catch (err) {
      console.error("Erro ao criar ticket:", err.response?.data || err.message);
      console.log("Erro completo:", err);

      // Verifica se a resposta do erro contém a mensagem específica
      if (err.response && err.response.data.error === "ERR_OTHER_OPEN_TICKET") {
        const existingTicket = err.response.data.ticket; // Tente acessar o ticket existente aqui
        console.log("Ticket existente:", existingTicket); // Verifique se isso mostra algo
        // Aqui você deve obter os detalhes do ticket aberto, se necessário.
        // Exemplo:
        const userName = "Usuário Desconhecido"; // Substitua pela lógica que obtém o nome do usuário
        const queueName = "Fila Desconhecida"; // Substitua pela lógica que obtém o nome da fila

        // Exibe um toast informando que o ticket já está aberto
        // toast.info(`O ticket já está aberto na fila "${queueName}" com o usuário "${userName}".`);
        // toast.info(`Já existe um ticket aberto!`);
        setTicketOpenAlert(
          <>
            O ticket já está <strong>aberto</strong> em outra fila. É necessário encerra-lo para iniciar um novo.
          </>
        );
      } else {
        // Se for outro erro, tratar normalmente
        toast.error("Ocorreu um erro ao criar o ticket.");
      }
    }
    setLoading(false);
  };






  const handleSelectOption = (e, newValue) => {
    if (newValue?.number) {
      setSelectedContact(newValue);
    } else if (newValue?.name) {
      setNewContact({ name: newValue.name });
      setContactModalOpen(true);
    }
  };

  const handleCloseContactModal = () => {
    setContactModalOpen(false);
  };

  const handleAddNewContactTicket = contact => {
    setSelectedContact(contact);
  };

  const createAddContactOption = (filterOptions, params) => {
    const filtered = filter(filterOptions, params);
    if (params.inputValue !== "" && !loading && searchParam.length >= 3) {
      filtered.push({
        name: `${params.inputValue}`,
      });
    }
    return filtered;
  };

  const renderOption = option => {
    if (option.number) {
      return <>
        {IconChannel(option.channel)}
        <Typography component="span" style={{ fontSize: 14, marginLeft: "10px", display: "inline-flex", alignItems: "center", lineHeight: "2" }}>
          {option.name} - {option.number}
        </Typography>
      </>
    } else {
      return `${i18n.t("newTicketModal.add")} ${option.name}`;
    }
  };

  const renderOptionLabel = option => {
    if (option.number) {
      return `${option.name} - ${option.number}`;
    } else {
      return `${option.name}`;
    }
  };

  const renderContactAutocomplete = () => {
    if (initialContact === undefined || initialContact.id === undefined) {
      return (
        <Grid xs={12} item>
          <Autocomplete
            fullWidth
            options={options}
            loading={loading}
            clearOnBlur
            autoHighlight
            freeSolo
            clearOnEscape
            getOptionLabel={renderOptionLabel}
            renderOption={renderOption}
            filterOptions={createAddContactOption}
            onChange={(e, newValue) => {
              setChannelFilter(newValue ? newValue.channel : "whatsapp");
              handleSelectOption(e, newValue)
            }}
            renderInput={params => (
              <TextField
                {...params}
                label={i18n.t("newTicketModal.fieldLabel")}
                variant="outlined"
                autoFocus
                onChange={e => setSearchParam(e.target.value)}
                onKeyPress={e => {
                  if (loading || !selectedContact) return;
                  else if (e.key === "Enter") {
                    handleSaveTicket(selectedContact.id);
                  }
                }}
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <React.Fragment>
                      {loading ? (
                        <CircularProgress color="inherit" size={20} />
                      ) : null}
                      {params.InputProps.endAdornment}
                    </React.Fragment>
                  ),
                }}
              />
            )}
          />
        </Grid>
      )
    }
    return null;
  }

  return (
    <>

      <Dialog open={modalOpen} onClose={handleClose}>
        <DialogTitle id="form-dialog-title">
          {i18n.t("newTicketModal.title")}
        </DialogTitle>
        <DialogContent dividers>

          <Grid style={{ width: 370 }} container spacing={2}>
            {/* ALERTA SE TIVER ABERTO */}
            {ticketOpenAlert && (
              <Alert severity="info" style={{ marginBottom: 16 }}>
                <AlertTitle>Em Atendimento</AlertTitle>
                {ticketOpenAlert}
              </Alert>
            )}
            {/* CONTATO */}
            {renderContactAutocomplete()}
            {/* FILA */}
            <Grid xs={12} item>
              <Select
                required
                fullWidth
                displayEmpty
                variant="outlined"
                value={selectedQueue}
                onChange={(e) => {
                  setSelectedQueue(e.target.value)
                }}
                MenuProps={{
                  anchorOrigin: {
                    vertical: "bottom",
                    horizontal: "left",
                  },
                  transformOrigin: {
                    vertical: "top",
                    horizontal: "left",
                  },
                  getContentAnchorEl: null,
                }}
                renderValue={() => {
                  if (selectedQueue === "") {
                    return "Selecione uma fila"
                  }
                  const queue = user.queues.find(q => q.id === selectedQueue)
                  return queue.name
                }}
              >
                {user.queues?.length > 0 &&
                  user.queues.map((queue, key) => (
                    <MenuItem dense key={key} value={queue.id}>
                      <ListItemText primary={queue.name} />
                    </MenuItem>
                  ))
                }
              </Select>
            </Grid>
            {/* CONEXAO */}
            <Grid xs={12} item>
              <Select
                required
                fullWidth
                displayEmpty
                variant="outlined"
                value={selectedWhatsapp}
                onChange={(e) => {
                  setSelectedWhatsapp(e.target.value)
                }}
                MenuProps={{
                  anchorOrigin: {
                    vertical: "bottom",
                    horizontal: "left",
                  },
                  transformOrigin: {
                    vertical: "top",
                    horizontal: "left",
                  },
                  getContentAnchorEl: null,
                }}
                renderValue={() => {
                  if (selectedWhatsapp === "") {
                    return "Selecione uma Conexão"
                  }
                  const whatsapp = whatsapps.find(w => w.id === selectedWhatsapp)
                  return whatsapp?.name
                }}
              >
                {whatsapps?.length > 0 &&
                  whatsapps.map((whatsapp, key) => (
                    <MenuItem dense key={key} value={whatsapp.id}>
                      <ListItemText
                        primary={
                          <>
                            {IconChannel(whatsapp.channel)}
                            <Typography component="span" style={{ fontSize: 14, marginLeft: "10px", display: "inline-flex", alignItems: "center", lineHeight: "2" }}>
                              {whatsapp.name} &nbsp; <p className={(whatsapp.status) === 'CONNECTED' ? classes.online : classes.offline}>(CONECTADO)</p>
                            </Typography>
                          </>
                        }
                      />
                    </MenuItem>
                  ))}
              </Select>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleClose}
            color="secondary"
            disabled={loading}
            variant="outlined"
          >
            {i18n.t("newTicketModal.buttons.cancel")}
          </Button>
          <ButtonWithSpinner
            variant="contained"
            type="button"
            disabled={!selectedContact}
            onClick={() => handleSaveTicket(selectedContact.id)}
            color="primary"
            loading={loading}
          >
            {i18n.t("newTicketModal.buttons.ok")}
          </ButtonWithSpinner>
        </DialogActions>
        {contactModalOpen && (
          <ContactModal
            open={contactModalOpen}
            initialValues={newContact}
            onClose={handleCloseContactModal}
            onSave={handleAddNewContactTicket}
          ></ContactModal>
        )}
      </Dialog >
    </>
  );
};
export default NewTicketModal;