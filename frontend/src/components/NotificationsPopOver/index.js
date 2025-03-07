import React, { useState, useRef, useEffect, useContext } from "react";

import { useHistory } from "react-router-dom";
import { format } from "date-fns";
import useSound from "use-sound";

import Popover from "@material-ui/core/Popover";
import IconButton from "@material-ui/core/IconButton";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import { makeStyles } from "@material-ui/core/styles";
import Badge from "@material-ui/core/Badge";
import ChatIcon from "@material-ui/icons/Chat";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import TicketListItem from "../TicketListItemCustom";
import { i18n } from "../../translate/i18n";
import useTickets from "../../hooks/useTickets";
import alertSound from "../../assets/sound.mp3";
import { AuthContext } from "../../context/Auth/AuthContext";
import { socketConnection } from "../../services/socket";
import { SocketContext } from "../../context/Socket/SocketContext";

const useStyles = makeStyles((theme) => ({
  tabContainer: {
    overflowY: "auto",
    maxHeight: 500,
    ...theme.scrollbarStyles,
  },
  popoverPaper: {
    width: "100%",
    maxWidth: 500,
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(1),
    [theme.breakpoints.down("sm")]: {
      maxWidth: 350,
    },
  },
  noShadow: {
    boxShadow: "none !important",
  },
  icons: {
    color: "#fff",
  },
  customBadge: {
    backgroundColor: "#f44336",
    color: "#fff",
  },
}));

const NotificationsPopOver = ({ volume }) => {
  const classes = useStyles();

  const history = useHistory();
  const socketManager = useContext(SocketContext);
  const ticketIdUrl = +history.location.pathname.split("/")[2];
  const ticketIdRef = useRef(ticketIdUrl);
  const anchorEl = useRef();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const { user, wbots } = useContext(AuthContext);
  const { profile, queues } = user;

  const [, setDesktopNotifications] = useState([]);

  const { tickets } = useTickets({ withUnreadMessages: "true" });
  const [play] = useSound(alertSound, { volume, });
  const soundAlertRef = useRef();

  const historyRef = useRef(history);

  const [setNotiBox, setNotixx] = useState(false);

  // const userWbots = user?.wbots?.map((w) => w.id) || [];

  useEffect(() => {
    async function fetchDataV() {

      let settingIndex;

      try {
        const { data } = await api.get("/settings/");
        settingIndex = data.filter((s) => s.key === "viewnoti");
      } catch (err) {
        toastError(err);
      }


      if (settingIndex[0]?.value === "enabled") {

        setNotixx(true);

      } else {

        if (profile === "admin" || profile === "supervisor") {

          setNotixx(true);
        } else {
          setNotixx(false);
        }

      }

      //console.log(setNotiBox);
      //console.log(setNotixx);

    }
    fetchDataV();
  }, []);

  useEffect(() => {
    soundAlertRef.current = play;

    if (!("Notification" in window)) {
      // console.log("This browser doesn't support notifications");
    } else {
      Notification.requestPermission();
    }
  }, [play]);

  useEffect(() => {

    const queueIds = queues.map((q) => q.id);

    const filteredTickets = tickets.filter((t) => queueIds.indexOf(t.queueId) > -1);


    if (profile === "user") {
      setNotifications(filteredTickets);
    } else {
      setNotifications(tickets);
    }
  }, [tickets, queues, profile]);

  useEffect(() => {
    ticketIdRef.current = ticketIdUrl;
  }, [ticketIdUrl]);

  useEffect(() => {
    const companyId = localStorage.getItem("companyId");
    const socket = socketManager.GetSocket(companyId);

    const queueIds = queues.map((q) => q.id);

    const onConnectNotificationsPopover = () => {
      socket.emit("joinNotification");
    }

    const onCompanyTicketNotificationsPopover = (data) => {
      if (data.action === "updateUnread" || data.action === "delete") {
        setNotifications(prevState => {
          const ticketIndex = prevState.findIndex(t => t.id === data.ticketId);
          if (ticketIndex !== -1) {
            prevState.splice(ticketIndex, 1);
            return [...prevState];
          }
          return prevState;
        });

        setDesktopNotifications(prevState => {
          const notfiticationIndex = prevState.findIndex(
            n => n.tag === String(data.ticketId)
          );
          if (notfiticationIndex !== -1) {
            prevState[notfiticationIndex].close();
            prevState.splice(notfiticationIndex, 1);
            return [...prevState];
          }
          return prevState;
        });
      }
    };

    const onCompanyAppMessageNotificationsPopover = (data) => {

      const wbotsIds = wbots?.map((w) => w.id) || [];

      if (wbotsIds.indexOf(data.ticket?.whatsappId) === -1) {
        return;
      }

      if (data.action === "create" && !data.message.read && (data.ticket.userId === user?.id || !data.ticket.userId)) {

        setNotifications(prevState => {
          const ticketIndex = prevState.findIndex(t => t.id === data.ticket.id);
          if (ticketIndex !== -1) {
            prevState[ticketIndex] = data.ticket;
            return [...prevState];
          }
          return [data.ticket, ...prevState];
        });

        const shouldNotNotificate =
          (data.message.ticketId === ticketIdRef.current &&
            document.visibilityState === "visible") ||
          (data.ticket.userId && data.ticket.userId !== user?.id) ||
          data.ticket.isGroup;

        if (shouldNotNotificate) return;

        handleNotifications(data);
      }
    }

    socketManager.onConnect(onConnectNotificationsPopover);
    socket.on(`company-${companyId}-ticket`, onCompanyTicketNotificationsPopover);
    socket.on(`company-${companyId}-appMessage`, onCompanyAppMessageNotificationsPopover);

    return () => {
      socket.disconnect();
    };
  }, [user, profile, queues, socketManager]);

  const handleNotifications = (data) => {
    const { message, contact, ticket } = data;

    const options = {
      body: `${message.body} - ${format(new Date(), "HH:mm")}`,
      icon: contact.profilePicUrl,
      tag: ticket.id,
      renotify: true,
    };

    const notification = new Notification(
      `${i18n.t("tickets.notification.message")} ${contact.name}`,
      options
    );

    notification.onclick = (e) => {
      e.preventDefault();
      window.focus();
      historyRef.current.push(`/tickets/${ticket.uuid}`);
    };

    setDesktopNotifications((prevState) => {
      const notfiticationIndex = prevState.findIndex(
        (n) => n.tag === notification.tag
      );
      if (notfiticationIndex !== -1) {
        prevState[notfiticationIndex] = notification;
        return [...prevState];
      }
      return [notification, ...prevState];
    });

    soundAlertRef.current();
  };

  const handleClick = () => {
    setIsOpen((prevState) => !prevState);
  };

  const handleClickAway = () => {
    setIsOpen(false);
  };

  const NotificationTicket = ({ children }) => {
    return <div onClick={handleClickAway}>{children}</div>;
  };

  return (
    <>
      {setNotiBox && (
        <>
          <IconButton
            className={classes.icons}
            onClick={handleClick}
            ref={anchorEl}
            aria-label="Open Notifications"
            variant="contained"
          >
            <Badge
              overlap="rectangular"
              badgeContent={notifications.length}
              classes={{ badge: classes.customBadge }}
            >
              <ChatIcon />
            </Badge>
          </IconButton>
        </>
      )}
      <Popover
        disableScrollLock
        open={isOpen}
        anchorEl={anchorEl.current}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        classes={{ paper: classes.popoverPaper }}
        onClose={handleClickAway}
      >

        <List dense className={classes.tabContainer}>
          {notifications.length === 0 ? (
            <ListItem>
              <ListItemText>{i18n.t("notifications.noTickets")}</ListItemText>
            </ListItem>
          ) : (
            notifications.map((ticket) => (
              <NotificationTicket key={ticket.id}>
                <TicketListItem ticket={ticket} />
              </NotificationTicket>
            ))
          )}
        </List>

      </Popover>
    </>
  );
};

export default NotificationsPopOver;
