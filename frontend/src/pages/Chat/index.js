import React, { useContext, useEffect, useRef, useState } from "react";
import { useParams, useHistory } from "react-router-dom";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  makeStyles,
  Paper,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@material-ui/core";
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import GroupAddIcon from '@material-ui/icons/GroupAdd';
import HelpOutlineIcon from '@material-ui/icons/HelpOutline';
import ChatBubbleOutlineIcon from '@material-ui/icons/ChatBubbleOutline';
import InputAdornment from '@material-ui/core/InputAdornment';
import Tooltip from '@material-ui/core/Tooltip';
import ChatList from "./ChatList";
import ChatMessages from "./ChatMessages";
import { UsersFilter } from "../../components/UsersFilter";
import api from "../../services/api";
import { has, isObject } from "lodash";
import { AuthContext } from "../../context/Auth/AuthContext";
import withWidth, { isWidthUp } from "@material-ui/core/withWidth";
import { i18n } from "../../translate/i18n";

const useStyles = makeStyles((theme) => ({
  mainContainer: {
    display: "flex",
    flexDirection: "column",
    position: "relative",
    flex: 1,
    height: `calc(100% - 48px)`,
    overflowY: "hidden",
    border: "1px solid rgba(0, 0, 0, 0.12)",
  },
  gridContainer: {
    flex: 1,
    height: "100%",
    border: "1px solid rgba(0, 0, 0, 0.12)",
    background: theme.palette.background.color,
  },
  gridItem: {
    height: "100%",
    overflow: 'auto',
    display: 'flex',
    flexDirection: 'column',
    padding: '5px 6px',
  },
  exibeMensagem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: "100%",
    overflow: 'auto',
    borderLeft: '1px solid #cecece',
  },
  gridItemTab: {
    height: "92%",
    width: "100%",
  },
  btnContainer: {
    textAlign: "right",
    padding: 10,
  },
  titleContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing(1),
  },
  addButton: {
    borderRadius: '50%',
    backgroundColor: 'transparent',
    color: theme.palette.primary.main,
    minWidth: "auto",
    padding: '0px',
    marginBottom: '2px',
  },
  buscaChat: {
    padding: '5px 12px',
  },
  btnfora: {
    border: '1.6px solid #eeeeee',
    borderRadius: '6px',
    padding: '5px 13px',
    display: 'inline-block',
    margin: '0 5px',
    cursor: 'pointer',
  },
  iconeHeader: {
    fontSize: '1.05rem !important',
  },
  tituloChat: {
    color: theme.palette.primary.main,
    fontWeight: '600',
    fontSize: '1.3rem',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
  },
  txtInformativo: {
    fontSize: '0.87rem',
  },
  fixedHeader: {
    padding: '8px 2px',
    background: theme.palette.background.paper,
    zIndex: 1,
  },
  scrollableList: {
    flex: 1,
    overflowY: 'auto',
    padding: theme.spacing(1),
    height: '100%',
  },
  chatList: {
    height: '100%',
  },
  h6SemMensagem: {
    fontWeight: 'bold',
    fontSize: '1rem',
  },
  bodySemMensagem: {
    color: 'rgb(104, 121, 146)',
    fontSize: '0.775rem',
    padding: '0 10px',
  },
  avisoSemMensagem: {
    textAlign: 'center',
    padding: '20px',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
}));

export function ChatModal({
  open,
  chat,
  type,
  handleClose,
  handleLoadNewChat,
  setChats,
}) {
  const [users, setUsers] = useState([]);
  const [title, setTitle] = useState("");

  useEffect(() => {
    if (open) {
      if (type === "edit" && chat) {
        const userList = chat.users.map((u) => ({
          id: u.user.id,
          name: u.user.name,
        }));
        setUsers(userList);
        setTitle(chat.title);
      } else {
        setUsers([]);
        setTitle("");
      }
    }
  }, [chat, open, type]);

  const handleSave = async () => {
    try {
      let data;
      if (type === "edit") {
        const response = await api.put(`/chats/${chat.id}`, {
          users,
          title,
        });
        data = response.data;
        setChats((prevChats) =>
          prevChats.map((c) => (c.id === chat.id ? data : c))
        );
      } else {
        const response = await api.post("/chats", {
          users,
          title,
        });
        data = response.data;
        setChats((prevChats) => [data, ...prevChats]);
        handleLoadNewChat(data);
      }
      handleClose();
    } catch (error) {
      console.error("Erro ao salvar:", error);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">Nova Conversa</DialogTitle>
      <DialogContent>
        <Grid spacing={2} container>
          <Grid xs={12} style={{ padding: 18 }} item>
            <TextField
              label="Título"
              placeholder="Título"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              variant="outlined"
              size="small"
              fullWidth
            />
          </Grid>
          <Grid xs={12} item>
            <UsersFilter
              onFiltered={(users) => setUsers(users)}
              initialUsers={users}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary">
          {i18n.t("chatInternal.modal.cancel")}
        </Button>
        <Button
          onClick={handleSave}
          color="primary"
          variant="contained"
          disabled={users === undefined || users.length === 0 || title === null || title === "" || title === undefined}
        >
          {i18n.t("chatInternal.modal.save")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function Chat(props) {
  const classes = useStyles();
  const { user, socket } = useContext(AuthContext);
  const history = useHistory();

  const [showDialog, setShowDialog] = useState(false);
  const [dialogType, setDialogType] = useState("new");
  const [currentChat, setCurrentChat] = useState({});
  const [chats, setChats] = useState([]);
  const [chatsPageInfo, setChatsPageInfo] = useState({ hasMore: false });
  const [messages, setMessages] = useState([]);
  const [messagesPageInfo, setMessagesPageInfo] = useState({ hasMore: false });
  const [messagesPage, setMessagesPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState(0);
  const [records, setRecords] = useState([]);
  const isMounted = useRef(true);
  const scrollToBottomRef = useRef();
  const { id } = useParams();

  const [searchTerm, setSearchTerm] = useState('');
  const [originalChats, setOriginalChats] = useState([]);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (isMounted.current) {
      findChats().then((data) => {
        const { records } = data;
        if (records.length > 0) {
          setChats(records);
          setChatsPageInfo(data);

          if (id && records.length) {
            const chat = records.find((r) => r.uuid === id);
            selectChat(chat);
          }
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const fetchChats = async () => {
      const data = await findChats();
      const { records } = data;

      // Adicione este console.log para inspecionar as propriedades dos chats
      console.log("Chats fetched:", records);

      // Salve os chats originais
      setOriginalChats(records);
      setChats(records); // Defina os chats para a lista original
      setRecords(records); // Armazena os records
    };

    fetchChats();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filteredChats = originalChats.filter(chat => {
        // Verifique se o título do chat inclui o termo de busca
        const titleMatch = chat.title.toLowerCase().includes(searchTerm.toLowerCase());

        // Verifique se alguma mensagem do chat inclui o termo de busca
        const messagesMatch = chat.messages && chat.messages.some(message =>
          message.message.toLowerCase().includes(searchTerm.toLowerCase())
        );

        // Retorna verdadeiro se o título ou as mensagens corresponderem
        return titleMatch || messagesMatch;
      });
      setChats(filteredChats);
    } else {
      setChats(originalChats); // Restaura os chats originais se o termo de busca estiver vazio
    }
  }, [searchTerm, originalChats]);


  useEffect(() => {
    if (isObject(currentChat) && has(currentChat, "id")) {
      findMessages(currentChat.id).then(() => {
        if (typeof scrollToBottomRef.current === "function") {
          setTimeout(() => {
            scrollToBottomRef.current();
          }, 300);
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentChat]);

  useEffect(() => {
    const companyId = user.companyId;

    const onChatUser = (data) => {
      if (data.action === "create") {
        setChats((prev) => [data.record, ...prev]);
      }
      if (data.action === "update") {
        const changedChats = chats.map((chat) => {
          if (chat.id === data.record.id) {
            setCurrentChat(data.record);
            return {
              ...data.record,
            };
          }
          return chat;
        });
        setChats(changedChats);
      }
    };

    const onChat = (data) => {
      if (data.action === "delete") {
        const filteredChats = chats.filter((c) => c.id !== +data.id);
        setChats(filteredChats);
        setMessages([]);
        setMessagesPage(1);
        setMessagesPageInfo({ hasMore: false });
        setCurrentChat({});
        history.push("/chats");
      }
    };

    const onCurrentChat = (data) => {
      if (data.action === "new-message") {
        setMessages((prev) => [...prev, data.newMessage]);
        const changedChats = chats.map((chat) => {
          if (chat.id === data.newMessage.chatId) {
            return {
              ...data.chat,
            };
          }
          return chat;
        });
        setChats(changedChats);
        scrollToBottomRef.current();
      }

      if (data.action === "update") {
        const changedChats = chats.map((chat) => {
          if (chat.id === data.chat.id) {
            return {
              ...data.chat,
            };
          }
          return chat;
        });
        setChats(changedChats);
        scrollToBottomRef.current();
      }
    };

    socket.on(`company-${companyId}-chat-user-${user.id}`, onChatUser);
    socket.on(`company-${companyId}-chat`, onChat);
    if (isObject(currentChat) && has(currentChat, "id")) {
      socket.on(`company-${companyId}-chat-${currentChat.id}`, onCurrentChat);
    }

    return () => {
      socket.off(`company-${companyId}-chat-user-${user.id}`, onChatUser);
      socket.off(`company-${companyId}-chat`, onChat);
      if (isObject(currentChat) && has(currentChat, "id")) {
        socket.off(`company-${companyId}-chat-${currentChat.id}`, onCurrentChat);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentChat]);

  const selectChat = (chat) => {
    try {
      setMessages([]);
      setMessagesPage(1);
      setCurrentChat(chat);
      setTab(1);
    } catch (error) {
      console.error("Erro selectChat:", error);
    }
  };

  const sendMessage = async (contentMessage) => {
    setLoading(true);
    try {
      await api.post(`/chats/${currentChat.id}/messages`, {
        message: contentMessage,
      });
    } catch (error) {
      console.error("Erro setLoading:", error);
    }
    setLoading(false);
  };

  const deleteChat = async (chat) => {
    try {
      await api.delete(`/chats/${chat.id}`);
    } catch (error) {
      console.error("Erro deletChat:", error);
    }
  };

  const findMessages = async (chatId) => {
    setLoading(true);
    try {
      const { data } = await api.get(
        `/chats/${chatId}/messages?pageNumber=${messagesPage}`
      );
      setMessagesPage((prev) => prev + 1);
      setMessagesPageInfo(data);
      setMessages((prev) => [...data.records, ...prev]);
    } catch (error) {
      console.error("Erro setLoading:", error);
    }
    setLoading(false);
  };

  const loadMoreMessages = async () => {
    if (!loading) {
      await findMessages(currentChat.id);
    }
  };

  const findChats = async () => {
    try {
      const { data } = await api.get("/chats");
      return data;
    } catch (error) {
      console.error("Erro findChats:", error);
    }
  };

  const renderGrid = () => {
    return (
      <Grid className={classes.gridContainer} container>
        <Grid className={classes.gridItem} md={4} item>
          <div className={classes.fixedHeader}>
            <div className={classes.titleContainer}>
              <Typography variant="h5" className={classes.tituloChat}><ChatBubbleOutlineIcon color="primary" style={{marginTop: '3px'}} /> Chats</Typography>
              <div>
                <Tooltip title="Novo Grupo">
                  <div className={classes.btnfora} onClick={() => {
                    setDialogType("new");
                    setShowDialog(true);
                  }}>
                    <Button className={classes.addButton}>
                      <GroupAddIcon className={classes.iconeHeader} />
                    </Button>
                  </div>
                </Tooltip>
                <Tooltip title="Nova Conversa">
                  <div className={classes.btnfora} onClick={() => {
                    setDialogType("new");
                    setShowDialog(true);
                  }}>
                    <Button className={classes.addButton}>
                      <AddCircleOutlineIcon className={classes.iconeHeader} />
                    </Button>
                  </div>
                </Tooltip>
              </div>
            </div>
            <Grid xs={12} className={classes.buscaChat} item>
              <TextField
                label="Pesquisar"
                placeholder="Digite para buscar..."
                variant="outlined"
                size="small"
                fullWidth
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <Tooltip title="Para mensagens, selecione uma conversa.">
                        <HelpOutlineIcon style={{ cursor: 'pointer', fill: '#cdcdcd', fontSize: '1.1rem', }} />
                      </Tooltip>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </div>
          <div className={classes.scrollableList}>
            {chats.length === 0 ? (
              <div className={classes.avisoSemMensagem}>
                <Typography variant="h6" className={classes.h6SemMensagem}>Nada aqui!</Typography>
                <Typography variant="body2" className={classes.bodySemMensagem}>Nenhuma mensagem encontrada, abra uma nova caso deseje.</Typography>
              </div>
            ) : (
              <ChatList className={classes.chatList}
                chats={chats}
                pageInfo={chatsPageInfo}
                loading={loading}
                handleSelectChat={(chat) => selectChat(chat)}
                handleDeleteChat={(chat) => deleteChat(chat)}
                handleEditChat={(chat) => {
                  setDialogType("edit");
                  setShowDialog(true);
                  setCurrentChat(chat);
                }}
              />
            )}
          </div>
        </Grid>
        <Grid className={classes.exibeMensagem} md={8} item>
          {isObject(currentChat) && has(currentChat, "id") ? (
            <>
              <ChatMessages
                chat={currentChat}
                scrollToBottomRef={scrollToBottomRef}
                pageInfo={messagesPageInfo}
                messages={messages}
                loading={loading}
                handleSendMessage={sendMessage}
                handleLoadMore={loadMoreMessages}
                records={records}
              />
              {messages.length === 0 && (
                <Typography variant="h6" align="center" className={classes.txtInformativo} style={{
                  position: 'absolute', color: 'rgba(0, 0, 0, 0.5)'
                }}>
                  Esta conversa está vazia. Você pode começar a digitar!
                </Typography>
              )}
            </>
          ) : (
            <Typography variant="h6" align="center" className={classes.txtInformativo}>
              Selecione uma conversa para iniciar.
            </Typography>
          )}
        </Grid>


      </Grid>
    );
  };

  const renderTab = () => {
    return (
      <Grid className={classes.gridContainer} container>
        <Grid md={12} item>
          <Tabs
            value={tab}
            indicatorColor="primary"
            textColor="primary"
            onChange={(e, v) => setTab(v)}
            aria-label="disabled tabs example"
          >
            <Tab label="Chats" />
            <Tab label="Mensagens" />
          </Tabs>
        </Grid>
        {tab === 0 && (
          <Grid className={classes.gridItemTab} md={12} item>
            <div className={classes.btnContainer}>
              <Button
                onClick={() => setShowDialog(true)}
                color="primary"
                variant="contained"
              >
                Novo
              </Button>
            </div>
            <ChatList
              chats={chats}
              pageInfo={chatsPageInfo}
              loading={loading}
              handleSelectChat={(chat) => selectChat(chat)}
              handleDeleteChat={(chat) => deleteChat(chat)}
            />
          </Grid>
        )}
        {tab === 1 && (
          <Grid className={classes.gridItemTab} md={12} item>
            {isObject(currentChat) && has(currentChat, "id") && (
              <ChatMessages
                scrollToBottomRef={scrollToBottomRef}
                pageInfo={messagesPageInfo}
                messages={messages}
                loading={loading}
                handleSendMessage={sendMessage}
                handleLoadMore={loadMoreMessages}
              />
            )}
          </Grid>
        )}
      </Grid>
    );
  };

  return (
    <>
      <ChatModal
        type={dialogType}
        open={showDialog}
        chat={currentChat}
        setChats={setChats}
        handleLoadNewChat={(data) => {
          setMessages([]);
          setMessagesPage(1);
          setCurrentChat(data);
          setTab(1);
          history.push(`/chats/${data.uuid}`);
        }}
        handleClose={() => setShowDialog(false)}
      />
      <Paper className={classes.mainContainer}>
        {isWidthUp("md", props.width) ? renderGrid() : renderTab()}
      </Paper>
    </>
  );
}

export default withWidth()(Chat);
