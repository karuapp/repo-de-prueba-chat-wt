import React, { useContext, useEffect, useReducer, useState } from "react";
import { Link as RouterLink, useHistory } from "react-router-dom";

import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import { Badge } from "@material-ui/core";
import WhatsAppIcon from "@material-ui/icons/WhatsApp";
import GroupAddRoundedIcon from '@material-ui/icons/GroupAddRounded';
import SettingsOutlinedIcon from "@material-ui/icons/SettingsOutlined";
import ContactPhoneOutlinedIcon from "@material-ui/icons/ContactPhoneOutlined";
import AccountTreeRoundedIcon from '@material-ui/icons/AccountTreeRounded';
import CodeRoundedIcon from "@material-ui/icons/CodeRounded";
import EventIcon from "@material-ui/icons/Event";
import BorderColorIcon from '@material-ui/icons/BorderColor';
import AccountBalanceWalletIcon from '@material-ui/icons/AccountBalanceWallet';
import StarHalfIcon from '@material-ui/icons/StarHalf';
import NotificationImportantOutlinedIcon from '@material-ui/icons/NotificationImportantOutlined';
import ForumIcon from "@material-ui/icons/Forum";
import LocalAtmIcon from '@material-ui/icons/LocalAtm';
import PhonelinkLockRoundedIcon from '@material-ui/icons/PhonelinkLockRounded';
import DashboardIcon from '@material-ui/icons/Dashboard';
import ViewColumnIcon from '@material-ui/icons/ViewColumn';
import ReplyAllIcon from '@material-ui/icons/ReplyAll';
import HelpIcon from '@material-ui/icons/Help';
import LoyaltyRoundedIcon from '@material-ui/icons/LoyaltyRounded';
import AddCommentIcon from '@material-ui/icons/AddComment';
import PlaylistAddCheckIcon from '@material-ui/icons/PlaylistAddCheck';
import AttachMoneyIcon from '@material-ui/icons/AttachMoney';
import TuneIcon from '@material-ui/icons/Tune';
import SearchIcon from '@material-ui/icons/Search';
import { i18n } from "../translate/i18n";
import { WhatsAppsContext } from "../context/WhatsApp/WhatsAppsContext";
import { AuthContext } from "../context/Auth/AuthContext";
import { Can } from "../components/Can";
import { isArray } from "lodash";
import api from "../services/api";
import toastError from "../errors/toastError";
import usePlans from "../hooks/usePlans";


import { makeStyles } from "@material-ui/core/styles";
import { SocketContext } from "../context/Socket/SocketContext";

const useStyles = makeStyles(theme => ({
  icon: {
    color: theme.palette.secondary.main
  },
}));

function ListItemLink(props) {
  const { icon, primary, to, className } = props;
  const classes = useStyles();

  const renderLink = React.useMemo(
    () =>
      React.forwardRef((itemProps, ref) => (
        <RouterLink to={to} ref={ref} {...itemProps} />
      )),
    [to]
  );

  return (
    <li>
      <ListItem button component={renderLink} className={className}>
        {icon ? <ListItemIcon className={classes.icon}>{icon}</ListItemIcon> : null}
        {/* icon ? <ListItemIcon className={classes.icon}>{icon}</ListItemIcon> : null */}
        <ListItemText primary={primary} />
      </ListItem>
    </li>
  );
}

const reducer = (state, action) => {
  if (action.type === "LOAD_CHATS") {
    const chats = action.payload;
    const newChats = [];

    if (isArray(chats)) {
      chats.forEach((chat) => {
        const chatIndex = state.findIndex((u) => u.id === chat.id);
        if (chatIndex !== -1) {
          state[chatIndex] = chat;
        } else {
          newChats.push(chat);
        }
      });
    }

    return [...state, ...newChats];
  }

  if (action.type === "UPDATE_CHATS") {
    const chat = action.payload;
    const chatIndex = state.findIndex((u) => u.id === chat.id);

    if (chatIndex !== -1) {
      state[chatIndex] = chat;
      return [...state];
    } else {
      return [chat, ...state];
    }
  }

  if (action.type === "DELETE_CHAT") {
    const chatId = action.payload;

    const chatIndex = state.findIndex((u) => u.id === chatId);
    if (chatIndex !== -1) {
      state.splice(chatIndex, 1);
    }
    return [...state];
  }

  if (action.type === "RESET") {
    return [];
  }

  if (action.type === "CHANGE_CHAT") {
    const changedChats = state.map((chat) => {
      if (chat.id === action.payload.chat.id) {
        return action.payload.chat;
      }
      return chat;
    });
    return changedChats;
  }
};

const MainListItems = (props) => {
  const { drawerClose } = props;
  const { whatsApps } = useContext(WhatsAppsContext);
  const { user } = useContext(AuthContext);
  const [connectionWarning, setConnectionWarning] = useState(false);
  const [openCampaignSubmenu, setOpenCampaignSubmenu] = useState(false);
  const [showCampaigns, setShowCampaigns] = useState(false);
  const [showKanban, setShowKanban] = useState(false);
  const [showSchedules, setShowSchedules] = useState(false);
  const [showInternalChat, setShowInternalChat] = useState(false);
  const [showExternalApi, setShowExternalApi] = useState(false);
  const history = useHistory();

  const [invisible, setInvisible] = useState(true);
  const [pageNumber, setPageNumber] = useState(1);
  const [searchParam] = useState("");
  const [chats, dispatch] = useReducer(reducer, []);

  const socketManager = useContext(SocketContext);

  const { getPlanCompany } = usePlans();

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [searchParam]);

  useEffect(() => {
    async function fetchData() {
      const companyId = localStorage.getItem("companyId");
      const planConfigs = await getPlanCompany(undefined, companyId);

      //console.log(planConfigs);
      setShowKanban(planConfigs.plan.useKanban);
      setShowCampaigns(planConfigs.plan.useCampaigns);
      setShowSchedules(planConfigs.plan.useSchedules);
      setShowInternalChat(planConfigs.plan.useInternalChat);
      setShowExternalApi(planConfigs.plan.useExternalApi);
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchChats();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParam, pageNumber]);

  useEffect(() => {
    const companyId = localStorage.getItem("companyId");
    const socket = socketManager.GetSocket(companyId);

    const onCompanyChatMainListItems = (data) => {
      if (data.action === "new-message") {
        dispatch({ type: "CHANGE_CHAT", payload: data });
      }
      if (data.action === "update") {
        dispatch({ type: "CHANGE_CHAT", payload: data });
      }
    }

    socket.on(`company-${companyId}-chat`, onCompanyChatMainListItems);
    return () => {
      socket.disconnect();
    };
  }, [socketManager]);

  useEffect(() => {
    let unreadsCount = 0;
    if (chats.length > 0) {
      for (let chat of chats) {
        for (let chatUser of chat.users) {
          if (chatUser.userId === user.id) {
            unreadsCount += chatUser.unreads;
          }
        }
      }
    }
    if (unreadsCount > 0) {
      setInvisible(false);
    } else {
      setInvisible(true);
    }
  }, [chats, user.id]);

  //useEffect(() => {
  //  if (localStorage.getItem("cshow")) {
  //    setShowCampaigns(true);
  //  }
  //}, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (whatsApps.length > 0) {
        const offlineWhats = whatsApps.filter((whats) => {
          return (
            whats.status === "qrcode" ||
            whats.status === "PAIRING" ||
            whats.status === "DISCONNECTED" ||
            whats.status === "TIMEOUT" ||
            whats.status === "OPENING"
          );
        });
        if (offlineWhats.length > 0) {
          setConnectionWarning(true);
        } else {
          setConnectionWarning(false);
        }
      }
    }, 2000);
    return () => clearTimeout(delayDebounceFn);
  }, [whatsApps]);

  const fetchChats = async () => {
    try {
      const { data } = await api.get("/chats/", {
        params: { searchParam, pageNumber },
      });
      dispatch({ type: "LOAD_CHATS", payload: data.records });
    } catch (err) {
      toastError(err);
    }
  };

  return (
    <div onClick={drawerClose}>

      <ListItemLink
        to="/"
        primary="Dashboard"
        icon={<DashboardIcon />}
      />

      <ListItemLink
        to="/tickets"
        primary={i18n.t("mainDrawer.listItems.tickets")}
        icon={<WhatsAppIcon />}
      />

      {showInternalChat && (
        <>
          <ListItemLink
            to="/chats"
            primary={i18n.t("mainDrawer.listItems.chats")}
            icon={
              <Badge color="error" variant="dot" invisible={invisible}>
                <ForumIcon />
              </Badge>
            }
          />
        </>
      )}


      {showKanban && (
        <>
          <ListItemLink
            to="/kanban"
            primary={i18n.t("mainDrawer.listItems.kanban")}
            icon={<ViewColumnIcon />}
          />
        </>
      )}

      <ListItemLink
        to="/tags"
        primary={i18n.t("mainDrawer.listItems.tags")}
        icon={<LoyaltyRoundedIcon />}
      />

      <ListItemLink
        to="/quick-messages"
        primary={i18n.t("mainDrawer.listItems.quickMessages")}
        icon={<ReplyAllIcon />}
      />

      <ListItemLink
        to="/todolist"
        primary={i18n.t("Tarefas")}
        icon={<BorderColorIcon />}
      />

      {showSchedules && (
        <>
          <ListItemLink
            to="/schedules"
            primary={i18n.t("mainDrawer.listItems.schedules")}
            icon={<EventIcon />}
          />
        </>
      )}

      <ListItemLink
        to="/wallets"
        primary={i18n.t("mainDrawer.listItems.wallet")}
        icon={<AccountBalanceWalletIcon />}
      />

      <ListItemLink
        to="/contacts"
        primary={i18n.t("mainDrawer.listItems.contacts")}
        icon={<ContactPhoneOutlinedIcon />}
      />

      <ListItemLink
        to="/oportunidades"
        primary={i18n.t("mainDrawer.listItems.oportunidades")}
        icon={<AttachMoneyIcon />}
      />




      <ListItemLink
        to="/helps"
        primary={i18n.t("mainDrawer.listItems.helps")}
        icon={<HelpIcon />}
      />
      <Can
        role={user.profile}
        perform="drawer-supervisor-items:view"
        yes={() => (
          // Conteúdo para usuários com permissão de supervisor
          <>

            <ListItemLink
              to="/relatorios"
              primary={i18n.t("Relátorios")}
              icon={<SearchIcon />}
            />


            {showCampaigns && (
              <>
                <ListItemLink
                  to="/campaigns"
                  primary={i18n.t("mainDrawer.listItems.campaigns")}
                  icon={<AddCommentIcon />}
                />
                <ListItemLink
                  to="/contact-lists"
                  primary={i18n.t("mainDrawer.listItems.campaignslists")}
                  icon={<PlaylistAddCheckIcon />}
                />
                <ListItemLink
                  to="/campaigns-config"
                  primary={i18n.t("mainDrawer.listItems.cpconfigs")}
                  icon={<TuneIcon />}
                />
              </>
            )}
            <ListItemLink
              to="/financeiro"
              primary={i18n.t("mainDrawer.listItems.financeiro")}
              icon={<LocalAtmIcon />}
            />
          </>
        )}
      />



      <Can
        role={user.profile}
        perform="drawer-admin-items:view"
        yes={() => (
          <>

            <ListItemLink
              to="/relatorios"
              primary={i18n.t("Relátorios")}
              icon={<SearchIcon />}
            />

            {showCampaigns && (
              <>
                <ListItemLink
                  to="/campaigns"
                  primary={i18n.t("mainDrawer.listItems.campaigns")}
                  icon={<AddCommentIcon />}
                />
                <ListItemLink
                  to="/contact-lists"
                  primary={i18n.t("mainDrawer.listItems.campaignslists")}
                  icon={<PlaylistAddCheckIcon />}
                />
                <ListItemLink
                  to="/campaigns-config"
                  primary={i18n.t("mainDrawer.listItems.cpconfigs")}
                  icon={<TuneIcon />}
                />
              </>
            )}

            {user.super && (
              <ListItemLink
                to="/announcements"
                primary={i18n.t("mainDrawer.listItems.annoucements")}
                icon={<NotificationImportantOutlinedIcon />}
              />
            )}
            <ListItemLink
              to="/ratings"
              primary={i18n.t("mainDrawer.listItems.ratings")}
              icon={<StarHalfIcon />}
            />
            <ListItemLink
              to="/connections"
              primary={i18n.t("mainDrawer.listItems.connections")}
              icon={
                <Badge badgeContent={connectionWarning ? "!" : 0} color="error">
                  <PhonelinkLockRoundedIcon />
                </Badge>
              }
            />
            <ListItemLink
              to="/queues"
              primary={i18n.t("mainDrawer.listItems.queues")}
              icon={<AccountTreeRoundedIcon />}
            />
            {/*
            <ListItemLink
              to="/integrations"
              primary="Integrações"
              icon={<ExtensionIcon />}
            />
            */}
            <ListItemLink
              to="/users"
              primary={i18n.t("mainDrawer.listItems.users")}
              icon={<GroupAddRoundedIcon />}
            />
            {showExternalApi && (
              <>
                <ListItemLink
                  to="/messages-api"
                  primary={i18n.t("mainDrawer.listItems.messagesAPI")}
                  icon={<CodeRoundedIcon />}
                />
              </>
            )}
            <ListItemLink
              to="/financeiro"
              primary={i18n.t("mainDrawer.listItems.financeiro")}
              icon={<LocalAtmIcon />}
            />
            <ListItemLink
              to="/settings"
              primary={i18n.t("mainDrawer.listItems.settings")}
              icon={<SettingsOutlinedIcon />}
            />
            { /* <ListItemLink
              to="/subscription"
              primary="Assinatura"
              icon={<PaymentIcon />}
              //className={classes.menuItem}
            /> */ }
          </>
        )}
      />
    </div>
  );
};

export default MainListItems;
