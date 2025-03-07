import React, { useState, useEffect, useContext, useCallback } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import api from '../../services/api';
import { AuthContext } from '../../context/Auth/AuthContext';
import Board from 'react-trello';
import { toast } from 'react-toastify';
import { useHistory } from 'react-router-dom';
import usePlans from '../../hooks/usePlans';
import useTickets from '../../hooks/useTickets';
import { DatePickerMoment } from '../../components/DatePickerMoment';
import { UsersFilter } from '../../components/UsersFilter';
import { KanbanSearch } from '../../components/KanbanSearch/KanbanSearch';
import moment from 'moment';
import { IconButton, Tooltip } from '@material-ui/core';
import AttachMoneyIcon from '@material-ui/icons/AttachMoney';
import RatingModal from '../../components/OportunidadesModal';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(1),
  },
  button: {
    background: '#10a110',
    border: 'none',
    padding: '10px',
    color: 'white',
    fontWeight: 'bold',
    borderRadius: '5px',
  },
  bottomButtonVisibilityIcon: {
    position: 'relative',
    bottom: '-10px',
  },
}));

const Kanban = () => {
  const classes = useStyles();
  const history = useHistory();

  const { user } = useContext(AuthContext);
  const { profile, queues } = user;
  const jsonString = user.queues.map((queue) => queue.UserQueue.queueId);

  const [tags, setTags] = useState([]);
  const [ticketList, setTicketList] = useState([]);
  const [reloadData, setReloadData] = useState(false);
  const [isInitialLoadComplete, setIsInitialLoadComplete] = useState(false);
  const [open, setOpen] = useState(false);
  const [oportunidadeModalOpen, setOportunidadeModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);


  const [searchParams, setSearchParams] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedDate, setSelectedDate] = useState({
    from: '',
    until: '',
  });

  const { getPlanCompany } = usePlans();

  useEffect(() => {
    async function fetchData() {
      const companyId = user?.companyId
      const planConfigs = await getPlanCompany(undefined, companyId);
      if (!planConfigs.plan.useKanban) {
        toast.error(
          'Você não possui acesso a este recurso! Faça um upgrade em sua assinatura ou contate o suporte!'
        );
        setTimeout(() => {
          history.push(`/`);
        }, 1000);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    fetchTags();
  }, [selectedUsers, selectedDate, searchParams]);

  const fetchTags = async () => {
    try {
      const response = await api.get('/tags/kanban');
      const fetchedTags = response.data.lista || [];
      setTags(fetchedTags);
      await fetchTickets(jsonString);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchTickets = async (jsonString) => {
    try {
      const { data } = await api.get('/tickets/kanban', {
        params: {
          showAll: profile === 'admin' || profile === 'supervisor',
          searchParam: searchParams,
          users: JSON.stringify(selectedUsers),
          queueIds: JSON.stringify(jsonString),
          dateFrom: selectedDate.from,
          dateUntil: selectedDate.until,
        },
      });
      setTicketList(data.tickets);
    } catch (err) {
      console.log(err);
      setTicketList([]);
    }
  };

  const handleCardClick = useCallback(
    (uuid) => {
      history.push('/tickets/' + uuid);
    },
    [history]
  );

  const handleClose = () => {
    setOpen(false);
  };

  const handleOportunidadeModalOpen = () => {
    setOportunidadeModalOpen(true);
    if (typeof handleClose === "function") handleClose();
  };

  useEffect(() => {
    const { button } = classes;
    const filteredTickets = ticketList.filter(
      (ticket) => ticket.tags.length === 0
    );

    if (!filteredTickets) return;

    const lanes = tags.map((tag) => {
      const filteredTickets = ticketList.filter((ticket) =>
        ticket.tags.some((t) => t.id === tag.id)
      );

      let somaTotalValorDoLead = 0;

      filteredTickets.forEach((ticketCC) => {
        if (ticketCC.contact.extraInfo) {
          ticketCC.contact.extraInfo.forEach((extraInfo) => {
            if (extraInfo.name === 'Valor do Lead') {
              somaTotalValorDoLead += parseFloat(extraInfo.value);
            }
          });
        }
      });

      return {
        id: tag.id.toString(),
        title: `${tag.name} ${filteredTickets.length} (${somaTotalValorDoLead})`,
        label: tag.id.toString(),
        cards: filteredTickets.map((ticket) => ({
          id: ticket.id.toString(),
          label: `Ticket nº ${ticket.id}`,
          description: (
            <div>
              <p>{ticket.contact.number}</p>
              <p>{ticket.lastMessage}</p>
              <button
                className={button}
                onClick={() => handleCardClick(ticket.uuid)}
              >
                Ver Ticket
              </button>
              <p></p>
              <p></p>
              {ticket.oportunidadeId !== undefined &&
                ticket.oportunidadeId !== null && (
                  <button
                      className={button}
                      onClick={() => {
                        setSelectedTicket(ticket);
                        handleOportunidadeModalOpen();
                      }}
                    >
                      Oportunidades
                    </button>
                )}
            </div>
          ),
          title: ticket.contact.name,
          draggable: true,
          href: '/tickets/' + ticket.uuid,
        })),
        style: { backgroundColor: tag.color, color: 'white' },
      };
    });

    setFile({ lanes });
  }, [classes, handleCardClick, tags, ticketList]);

  const handleCardMove = async (cardId, sourceLaneId, targetLaneId) => {
    try {
      await api.delete(`/ticket-tags/${targetLaneId}`);
      toast.success('Ticket Tag Removido!');
      await api.put(`/ticket-tags/${targetLaneId}/${sourceLaneId}`);
      toast.success('Ticket Tag Adicionado com Sucesso!');
    } catch (err) {
      console.log(err);
    }
  };

  const onFiltered = (value) => {
    const users = value.map((t) => t.id);
    setSelectedUsers(users);
  };

  const onChangeSearch = (searchValue) => {
    setSearchParams(searchValue);
  };

  const handleSelectedDate = (value, range) => {
    setSelectedDate({ ...selectedDate, [range]: value });
  };

  const [file, setFile] = useState({ lanes: [] });

  return (
    <div>
      <div
        style={{
          display: 'flex',
          paddingTop: 20,
          paddingLeft: 20,
        }}
      >
        <KanbanSearch searchParams={onChangeSearch} />
        {(profile === 'admin' || profile === 'supervisor') && (
          <UsersFilter onFiltered={onFiltered} />
        )}
        <div style={{ display: 'flex', gap: 10 }}>
          <DatePickerMoment
            label={'De'}
            getDate={(value) => handleSelectedDate(value, 'from')}
          />
          <DatePickerMoment
            label={'Até'}
            getDate={(value) => handleSelectedDate(value, 'until')}
          />
        </div>
      </div>
      <div className={classes.root}>
        <Board
          data={file}
          onCardMoveAcrossLanes={handleCardMove}
          style={{ backgroundColor: 'rgba(252, 252, 252, 0.03)' }}
        />
      </div>
      <RatingModal
        open={oportunidadeModalOpen}
        onClose={() => setOportunidadeModalOpen(false)}
        ticketIform={selectedTicket?.contact?.name ? `${selectedTicket?.contact.name} # ${selectedTicket?.id}` : ""}
        ticketIdLead={selectedTicket?.id}
        ticket={selectedTicket}
        aria-labelledby="form-dialog-title"
      />

    </div>
  );
};

export default Kanban;
