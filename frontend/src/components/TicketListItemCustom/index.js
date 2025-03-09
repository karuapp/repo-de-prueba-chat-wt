import React, { useState, useEffect, useRef, useContext } from 'react';

import { useHistory, useParams } from 'react-router-dom';
import { parseISO, format, isSameDay } from 'date-fns';
import clsx from 'clsx';

import { makeStyles } from '@material-ui/core/styles';
//import { green, grey } from "@material-ui/core/colors";
import { green, grey, blue, orange } from '@material-ui/core/colors';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Typography from '@material-ui/core/Typography';
import Avatar from '@material-ui/core/Avatar';
import Divider from '@material-ui/core/Divider';
import Badge from '@material-ui/core/Badge';
import Box from '@material-ui/core/Box';

import { i18n } from '../../translate/i18n';

import api from '../../services/api';
import ButtonWithSpinner from '../ButtonWithSpinner';
import MarkdownWrapper from '../MarkdownWrapper';
import { Tooltip } from '@material-ui/core';
import { AuthContext } from '../../context/Auth/AuthContext';
import { TicketsContext } from '../../context/Tickets/TicketsContext';
import toastError from '../../errors/toastError';
import { v4 as uuidv4 } from 'uuid';
import GroupIcon from '@material-ui/icons/Group';
import WhatsAppIcon from '@material-ui/icons/WhatsApp';
import AndroidIcon from '@material-ui/icons/Android';
import VisibilityIcon from '@material-ui/icons/Visibility';
import TicketMessagesDialog from '../TicketMessagesDialog';
import ContactTag from '../ContactTag';
import TransferWithinAStationIcon from '@material-ui/icons/TransferWithinAStation';
import ConnectionIcon from '../ConnectionIcon';
import TransferTicketModalCustom from '../TransferTicketModalCustom';

const useStyles = makeStyles((theme) => ({
  ticket: {
    position: 'relative',
    minHeight: '115px',
  },

  pendingTicket: {
    cursor: 'unset',
  },
  queueTag: {
    background: '#FCFCFC',
    color: '#000',
    marginRight: 1,
    padding: 1,
    fontWeight: 'bold',
    paddingLeft: 5,
    paddingRight: 5,
    borderRadius: 3,
    fontSize: '0.8em',
    whiteSpace: 'nowrap',
  },
  noTicketsDiv: {
    display: 'flex',
    height: '100px',
    margin: 40,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  newMessagesCount: {
    position: 'absolute',
    alignSelf: 'center',
    marginRight: 8,
    marginLeft: 'auto',
    top: '25px',
    left: '25px',
    borderRadius: 0,
  },
  noTicketsText: {
    textAlign: 'center',
    color: 'rgb(104, 121, 146)',
    fontSize: '14px',
    lineHeight: '1.4',
  },
  connectionTag: {
    background: 'green',
    color: '#FFF',
    marginRight: 1,
    padding: 1,
    fontWeight: 'bold',
    paddingLeft: 5,
    paddingRight: 5,
    borderRadius: 3,
    fontSize: '0.8em',
    whiteSpace: 'nowrap',
  },
  noTicketsTitle: {
    textAlign: 'center',
    fontSize: '16px',
    fontWeight: '600',
    margin: '0px',
  },

  contactNameWrapper: {
    display: 'flex',
    justifyContent: 'space-between',
    marginLeft: '5px',
  },

  lastMessageTime: {
    position: 'absolute',
    marginRight: 5,
    right: -15,
    bottom: 35,
    background: '#333333',
    color: '#ffffff',
    border: '1px solid #3a3b6c',
    padding: 1,
    paddingLeft: 5,
    paddingRight: 5,
    borderRadius: 5,
    fontSize: '0.6em',
  },

  closedBadge: {
    alignSelf: 'center',
    justifySelf: 'flex-end',
    marginRight: 32,
    marginLeft: 'auto',
  },

  contactLastMessage: {
    paddingRight: '0%',
    marginLeft: '5px',
  },

  badgeStyle: {
    color: 'white',
    backgroundColor: green[500],
  },

  // acceptButton: {
  //     position: "absolute",
  //     right: "108px",
  // },

  acceptButton: {
    position: 'absolute',
    right: '1%',
  },

  ticketQueueColor: {
    flex: 'none',
    width: '8px',
    height: '100%',
    position: 'absolute',
    top: '0%',
    left: '0%',
  },

  ticketInfo: {
    position: 'relative',
    top: -13,
  },
  secondaryContentSecond: {
    display: 'flex',
    // marginTop: 2,
    //marginLeft: "5px",
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    flexDirection: 'row',
    alignContent: 'flex-start',
  },
  ticketInfo1: {
    position: 'relative',
    top: -35,
    right: 45,
  },
  Radiusdot: {
    '& .MuiBadge-badge': {
      borderRadius: 2,
      position: 'inherit',
      height: 16,
      margin: 2,
      padding: 3,
    },
    '& .MuiBadge-anchorOriginTopRightRectangle': {
      transform: 'scale(1) translate(0%, -40%)',
    },
  },
  connectionIcon: {
    marginRight: theme.spacing(1),
  },

  presence: {
    color: theme?.mode === 'light' ? "green" : "lightgreen",
    fontWeight: "bold",
  },
}));

const TicketListItemCustom = ({ ticket }) => {
  const classes = useStyles();
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const [ticketUser, setTicketUser] = useState(null);
  const [ticketQueueName, setTicketQueueName] = useState(null);
  const [ticketQueueColor, setTicketQueueColor] = useState(null);
  const [tag, setTag] = useState([]);
  const [whatsAppName, setWhatsAppName] = useState(null);
  const [openTicketMessageDialog, setOpenTicketMessageDialog] = useState(false);
  const { ticketId } = useParams();
  const isMounted = useRef(true);
  const { setCurrentTicket } = useContext(TicketsContext);
  const { user } = useContext(AuthContext);
  const { profile } = user;
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [verpreview, setverpreview] = useState(false);
  const [lastInteractionLabel, setLastInteractionLabel] = useState('');
  const [transferTicketModalOpen, setTransferTicketModalOpen] = useState(false);
  const intervalRef = useRef(null);

  const presenceMessage = { composing: "Digitando...", recording: "Gravando..." };

  useEffect(() => {
    if (ticket.userId && ticket.user) {
      setTicketUser(ticket.user.name.toUpperCase());
    }

    setTicketQueueName(ticket.queue?.name.toUpperCase());
    setTicketQueueColor(ticket.queue?.color);

    const fetchTicket = async () => {
      try {
        const { data } = await api.get('/tickets/' + ticket.id);

        //console.log(ticket.id);

        if (data.whatsappId && data.whatsapp) {
          setWhatsAppName(data.whatsapp.name.toUpperCase());
        }

        setTag(data?.tags);
      } catch (err) { }
    };

    fetchTicket();

    return () => {
      isMounted.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {

    setTag(ticket.tags)

    return () => {
      isMounted.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticket]);

  useEffect(() => {
    const renderLastInteractionLabel = () => {
      let labelColor = '';
      let labelText = '';

      if (!ticket.lastMessage) return '';

      const lastInteractionDate = parseISO(ticket.updatedAt);
      const currentDate = new Date();
      const timeDifference = currentDate - lastInteractionDate;
      const hoursDifference = Math.floor(timeDifference / (1000 * 60 * 60));
      const minutesDifference = Math.floor(timeDifference / (1000 * 60));


      if (minutesDifference >= 3 && minutesDifference <= 10) {
        labelText = `(${minutesDifference} m atrás)`;
        labelColor = 'green';
      } else if (minutesDifference >= 30 && minutesDifference < 60) {
        labelText = `(${minutesDifference} m atrás)`;
        labelColor = 'Orange';
      } else if (minutesDifference > 60 && hoursDifference < 24) {
        labelText = `(${hoursDifference} h atrás)`;
        labelColor = 'red';
      } else if (hoursDifference >= 24) {
        labelText = `(${Math.floor(hoursDifference / 24)} dias atrás)`;
        labelColor = 'red';
      }


      return { labelText, labelColor };
    };

    // Função para atualizar o estado do componente
    const updateLastInteractionLabel = () => {
      const { labelText, labelColor } = renderLastInteractionLabel();
      setLastInteractionLabel(
        <Badge
          className={classes.lastInteractionLabel}
          style={{ color: labelColor }}
        >
          {labelText}
        </Badge>
      );
      // Agendando a próxima atualização após 30 segundos
      setTimeout(updateLastInteractionLabel, 30 * 1000);
    };

    // Inicializando a primeira atualização
    updateLastInteractionLabel();

  }, [ticket]); // Executando apenas uma vez ao montar o componente


  useEffect(() => {
    const fetchppw = async () => {
      let settingIndexCC;

      try {
        const { data } = await api.get('/settings/');
        settingIndexCC = data.filter((s) => s.key === 'viewppw');
      } catch (err) {
        toastError(err);
      }

      if (settingIndexCC[0]?.value === 'enabled') {
        setverpreview(true);
      }

      if (profile === 'admin' || profile === 'supervisor') {
        setverpreview(true);
      }
    };
    fetchppw();
  }, []);



  const handleAcepptTicket = async (id) => {
    if (setButtonDisabled) {
    }

    setLoading(true);

    setButtonDisabled(true);

    try {
      await api.put(`/tickets/${id}`, {
        status: 'open',
        userId: user?.id,
      });

      let settingIndex;

      try {
        const { data } = await api.get('/settings/');
        settingIndex = data.filter((s) => s.key === 'sendGreetingAccepted');
      } catch (err) {
        toastError(err);
      }

      if (settingIndex[0].value === 'enabled' && !ticket.isGroup) {
        handleSendMessage(ticket.id);
      }
    } catch (err) {
      setLoading(false);
      toastError(err);
    }
    if (isMounted.current) {
      setLoading(false);
    }

    //handleChangeTab(null, "tickets");
    //handleChangeTab(null, "open");
    setButtonDisabled(true);
    history.push(`/tickets/${ticket.uuid}`);
  };

  const handleSendMessage = async (id) => {
    const msg = `{{ms}} *{{name}}*, meu nome é *${user?.name}* e darei sequência ao seu atendimento.`;
    const message = {
      read: 1,
      fromMe: true,
      mediaUrl: '',
      body: `${msg.trim()}`,
    };
    try {
      await api.post(`/messages/${id}`, message);
    } catch (err) {
      toastError(err);
    }
  };

  const handleSelectTicket = (ticket) => {
    const code = uuidv4();
    const { id, uuid } = ticket;
    setCurrentTicket({ id, uuid, code });
  };

  const handleCloseTicket = async (id) => {
    setLoading(true);
    try {
      await api.put(`/tickets/${id}`, {
        status: 'closed',
        userId: user?.id || null,
      });
    } catch (err) {
      setLoading(false);
      toastError(err);
    }
    if (isMounted.current) {
      setLoading(false);
    }
    history.push(`/tickets/`);
  };

  const renderTicketInfo = () => {
    if (ticketUser) {
      return (
        <>
          {ticket.chatbot && (
            <Tooltip title='Chatbot'>
              <AndroidIcon
                fontSize='small'
                style={{ color: grey[700], marginRight: 5 }}
              />
            </Tooltip>
          )}

          {/* </span> */}
        </>
      );
    } else {
      return (
        <>
          {ticket.chatbot && (
            <Tooltip title='Chatbot'>
              <AndroidIcon
                fontSize='small'
                style={{ color: grey[700], marginRight: 5 }}
              />
            </Tooltip>
          )}
        </>
      );
    }
  };

  const handleOpenTransferModal = (e) => {
    setTransferTicketModalOpen(true);
  };

  const handleCloseTransferTicketModal = () => {
    setTransferTicketModalOpen(false);
  };

  return (
    <React.Fragment key={ticket.id}>
      <TransferTicketModalCustom
        modalOpen={transferTicketModalOpen}
        onClose={handleCloseTransferTicketModal}
        ticketid={ticket.id}
      />
      <TicketMessagesDialog
        open={openTicketMessageDialog}
        handleClose={() => setOpenTicketMessageDialog(false)}
        ticketId={ticket.id}
      ></TicketMessagesDialog>
      <ListItem
        dense
        button
        onClick={(e) => {
          if (ticket.status === 'pending') return;
          handleSelectTicket(ticket);
        }}
        selected={ticketId && +ticketId === ticket.id}
        className={clsx(classes.ticket, {
          [classes.pendingTicket]: ticket.status === 'pending',
        })}
      >
        <Tooltip
          arrow
          placement='right'
          title={ticket.queue?.name.toUpperCase() || 'Aguardando'}
        >
          <span
            style={{ backgroundColor: ticket.queue?.color || '#7C7C7C' }}
            className={classes.ticketQueueColor}
          ></span>
        </Tooltip>
        <ListItemAvatar>
          {ticket.status !== 'pending' ? (
            <Avatar
              style={{
                marginTop: '-20px',
                marginLeft: '-3px',
                width: '55px',
                height: '55px',
                borderRadius: '100%',
              }}
              src={ticket?.contact?.profilePicUrl}
            />
          ) : (
            <Avatar
              style={{
                marginTop: '-28px',
                marginLeft: '0px',
                width: '50px',
                height: '50px',
                borderRadius: '100%',
              }}
              src={ticket?.contact?.profilePicUrl}
            />
          )}
        </ListItemAvatar>
        <ListItemText
          disableTypography
          primary={
            <span className={classes.contactNameWrapper}>
              <Typography
                noWrap
                component='span'
                variant='body2'
                color='textPrimary'
              >
                {ticket.isGroup &&
                  (ticket.channel === 'whatsapp' || !ticket.channel) && (
                    <GroupIcon
                      fontSize='small'
                      style={{
                        color: grey[700],
                        marginBottom: '-5px',
                        marginLeft: '5px',
                      }}
                    />
                  )}{' '}

                {ticket.channel ? (
                  <ConnectionIcon
                    width='20'
                    height='20'
                    className={classes.connectionIcon}
                    connectionType={ticket.channel}
                  />
                ) : (
                  <ConnectionIcon
                    width='20'
                    height='20'
                    className={classes.connectionIcon}
                    connectionType='whatsapp'
                  />
                )}{' '}

                {(profile === 'admin' || profile === 'supervisor') && (
                  <>

                    <Tooltip title='Espiar Conversa'>
                      <VisibilityIcon
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenTicketMessageDialog(true);
                        }}
                        fontSize='small'
                        style={{
                          color: blue[700],
                          cursor: 'pointer',
                          marginLeft: 3,
                          marginRight: 10,
                          verticalAlign: 'middle',
                        }}
                      />
                    </Tooltip>
                    <Tooltip title='Transferir Ticket'>
                      <TransferWithinAStationIcon
                        onClick={handleOpenTransferModal}
                        fontSize='small'
                        style={{
                          color: orange[700],
                          cursor: 'pointer',
                          marginLeft: 0,
                          marginRight: 9,
                          verticalAlign: 'middle',
                        }}
                      />
                    </Tooltip>
                  </>
                )}
                <Typography
                  noWrap
                  component='span'
                  variant='body2'
                  color='textPrimary'
                >
                  <strong>{ticket.contact.name} {lastInteractionLabel}</strong>
                </Typography>
              </Typography>
              <ListItemSecondaryAction>
                <Box className={classes.ticketInfo1}>{renderTicketInfo()}</Box>
              </ListItemSecondaryAction>
            </span>
          }
          secondary={
            <span className={classes.contactNameWrapper}>
              <Typography
                className={classes.contactLastMessage}
                noWrap
                component='span'
                variant='body2'
                color='textSecondary'

              >

                {["composing", "recording"].includes(ticket?.presence) ?

                  <span className={classes.presence}>
                    {presenceMessage[ticket.presence]}
                  </span>

                  :
                  <>
                    {ticket.lastMessage && verpreview ? (
                      <>
                        {ticket.lastMessage.includes('VCARD') ? (
                          <MarkdownWrapper>Novo Contato recebido</MarkdownWrapper>
                        ) : ticket.lastMessage.includes('data:image') ? (
                          <MarkdownWrapper>Localização recebida</MarkdownWrapper>
                        ) : (
                          <MarkdownWrapper>
                            {ticket.lastMessage.slice(0, 20) + '...'}
                          </MarkdownWrapper>
                        )}
                      </>
                    ) : (
                      <MarkdownWrapper>---</MarkdownWrapper>
                    )}
                  </>
                }



                <span className={classes.secondaryContentSecond}>
                  {whatsAppName ? (
                    <Badge className={classes.connectionTag}>
                      {whatsAppName}
                    </Badge>
                  ) : (
                    <br></br>
                  )}
                  {ticketUser ? (
                    <Badge
                      style={{ backgroundColor: '#000000' }}
                      className={classes.connectionTag}
                    >
                      {ticketUser}
                    </Badge>
                  ) : (
                    <br></br>
                  )}
                  <Badge
                    style={{
                      backgroundColor: ticket.queue?.color || '#7c7c7c',
                    }}
                    className={classes.connectionTag}
                  >
                    {ticket.queue?.name.toUpperCase() || 'SEM FILA'}
                  </Badge>
                </span>

                <span className={classes.secondaryContentSecond}>
                  {tag?.map((tag) => {
                    return (
                      <ContactTag
                        tag={tag}
                        key={`ticket-contact-tag-${ticket.id}-${tag.id}`}
                      />
                    );
                  })}
                </span>
              </Typography>

              <Badge
                className={classes.newMessagesCount}
                badgeContent={ticket.unreadMessages}
                classes={{
                  badge: classes.badgeStyle,
                }}
              />
            </span>
          }
        />
        <ListItemSecondaryAction>
          {ticket.lastMessage ? (
            <>
              <Typography
                className={classes.lastMessageTime}
                component='span'
                variant='body2'
                color='textSecondary'
              >
                {isSameDay(parseISO(ticket.updatedAt), new Date()) ? (
                  <>{format(parseISO(ticket.updatedAt), 'HH:mm')}</>
                ) : (
                  <>{format(parseISO(ticket.updatedAt), 'dd/MM/yyyy HH:mm')}</>
                )}
              </Typography>
              <br />
            </>
          ) : (
            <>
              <Typography
                className={classes.lastMessageTime}
                component='span'
                variant='body2'
                color='textSecondary'
              >
                Aguardando
              </Typography>
              <br />
            </>
          )}
        </ListItemSecondaryAction>
        <span className={classes.secondaryContentSecond}>
          {ticket.status === 'pending' && (
            <>
              <ButtonWithSpinner
                //color="primary"
                style={{
                  backgroundColor: 'green',
                  color: 'white',
                  bottom: '5px',
                  borderRadius: '6px',
                  rigth: '8px',
                  fontSize: '0.8rem',
                  bottom: '45px',
                }}
                variant='contained'
                className={classes.acceptButton}
                size='small'
                loading={loading}
                onClick={(e) => handleAcepptTicket(ticket.id)}
                disabled={buttonDisabled}
              >
                {i18n.t('ticketsList.buttons.accept')}
              </ButtonWithSpinner>
              <ButtonWithSpinner
                //color="primary"
                style={{
                  backgroundColor: 'red',
                  color: 'white',
                  bottom: '5px',
                  borderRadius: '6px',
                  rigth: '8px',
                  fontSize: '0.8rem',
                  bottom: '5px',
                }}
                variant='contained'
                className={classes.acceptButton}
                size='small'
                loading={loading}
                onClick={(e) => handleCloseTicket(ticket.id)}
              >
                {i18n.t('ticketsList.buttons.closed')}
              </ButtonWithSpinner>
            </>
          )}
        </span>
      </ListItem>

      <Divider variant='inset' component='li' />
    </React.Fragment>
  );
};

export default TicketListItemCustom;
