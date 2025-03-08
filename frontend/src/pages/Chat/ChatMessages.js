import React, { useContext, useEffect, useRef, useState } from "react";
import {
  Box,
  FormControl,
  IconButton,
  Input,
  InputAdornment,
  makeStyles,
  Paper,
  Typography,
  Avatar,
} from "@material-ui/core";
import SendIcon from "@material-ui/icons/Send";

import { AuthContext } from "../../context/Auth/AuthContext";
import { useDate } from "../../hooks/useDate";
import api from "../../services/api";

const useStyles = makeStyles((theme) => ({
  mainContainer: {
    display: "flex",
    flexDirection: "column",
    position: "relative",
    flex: 1,
    overflow: "hidden",
    borderRadius: 0,
    height: "100%",
    borderLeft: "1px solid rgba(0, 0, 0, 0.12)",
  },
  messageList: {
    position: "relative",
    overflowY: "auto",
    flex: 1,
    backgroundColor: theme.mode === 'light' ? "#f2f2f2" : "#7f7f7f",
    padding: '0',
  },
  inputArea: {
    position: "relative",
    height: "auto",
  },
  input: {
    padding: "20px",
  },
  buttonSend: {
    margin: theme.spacing(1),
  },
  boxLeft: {
    padding: "10px 10px 5px",
    margin: "10px 10px 5px 0",
    position: "relative",
    backgroundColor: "#ffffff",
    color: "#303030",
    borderRadius: 10,
    borderBottomLeftRadius: 0,
    border: "1px solid rgba(0, 0, 0, 0.12)",
    alignSelf: "flex-start",
    maxWidth: "80%",
    display: 'inline-block',
  },
  boxRight: {
    padding: "10px 10px 5px",
    margin: "10px 0 10px auto",
    position: "relative",
    backgroundColor: "#e6f9d7",
    color: "#303030",
    textAlign: "right",
    borderRadius: 15,
    borderTopRightRadius: 0,
    border: "1px solid rgba(0, 0, 0, 0.12)",
    alignSelf: "flex-end",
    maxWidth: "80%",
    display: 'inline-block',
  },
  ajusteMensagem: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  avatar: {
    marginRight: '10px',
  },
  boxAvatarLeft: {
    display: 'flex',
    alignItems: 'center',
    marginTop: '10px',
  },
  boxGeralLeft: {
    display: 'flex',
  },
  ajustePaiMensagem: {
    display: 'flex',
    height: '100%',
    flexDirection: 'column-reverse',
    overflowY: 'auto',
    padding: '0 13px 5px 13px',
    '&::-webkit-scrollbar': {
      width: '4px', /* Chrome, Safari, and Opera */
    },
    '&::-webkit-scrollbar-track': {
      background: theme.mode === 'light' ? '#e0e0e0' : '#9e9e9e', // Cor do fundo da track
    },
    '&::-webkit-scrollbar-thumb': {
      background: theme.palette.primary.main, // Cor do "thumb"
      borderRadius: '10px',
    },
    '&::-webkit-scrollbar-thumb:hover': {
      background: theme.palette.primary.dark, // Cor do "thumb" ao passar o mouse
    },
  }
}));

export default function ChatMessages({
  chat,
  messages,
  handleSendMessage,
  scrollToBottomRef,
  pageInfo,
  loading,
  records,
}) {
  const classes = useStyles();
  const { user } = useContext(AuthContext);
  const { datetimeToClient } = useDate();
  const baseRef = useRef(null);
  

  const [contentMessage, setContentMessage] = useState("");

  const scrollToBottom = () => {
    if (baseRef.current) {
      baseRef.current.scrollTop = baseRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    console.log("Mensagens recebidas:", messages);
    scrollToBottom();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  useEffect(() => {
    console.log("Records:", records);
  }, [records]);

  return (
    <Paper className={classes.mainContainer}>
      <div className={classes.messageList} ref={baseRef}>
        <div className={classes.ajustePaiMensagem}>
          <div className={classes.ajusteMensagem}>
            {Array.isArray(messages) &&
              messages.map((item, key) => {
                console.log("Item:", item);

                const userRecord = Array.isArray(records)
                  ? records.flatMap(record => record.users || []).find(user => user.user.id === item.senderId)
                  : null;

                const companyId = userRecord ? userRecord.user.companyId : null;
                const baseUrl = process.env.REACT_APP_BACKEND_URL; // Acessando a URL do backend
                let avatarSrc = userRecord && userRecord.user.profileImage
                  ? `${baseUrl}/public/company${companyId}/user/${userRecord.user.profileImage}`
                  : null;

                let avatarContent = avatarSrc ? null : userRecord ? userRecord.user.name.charAt(0) : '';

                console.log("Avatar Source:", avatarSrc); // Log do avatar
                console.log("User Record:", userRecord); // Log do usuário correspondente

                // Verifica se a mensagem é do usuário atual ou de outro
                if (item.senderId === user.id) {
                  return (
                    <Box key={key} className={classes.boxRight}>
                      {/* <Typography variant="subtitle2">
                        {item.sender.name}
                      </Typography> */}
                      {item.message}
                      <Typography variant="caption" display="block">
                      {item.createdAt ? datetimeToClient(item.createdAt) : "Data inválida"}
                      </Typography>
                    </Box>
                  );
                } else {
                  return (
                    <Box key={item.id} className={classes.boxGeralLeft}>
                      <Box className={classes.boxAvatarLeft}>
                        <Avatar
                          className={classes.avatar}
                          src={avatarSrc}
                          alt={userRecord ? userRecord.user.name : "Usuário desconhecido"}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '?';
                          }}
                        >
                          {avatarContent}
                        </Avatar>
                      </Box>
                      <Box className={classes.boxLeft}>
                        {item.message}
                        <Typography variant="caption" display="block">
                        {item.createdAt ? datetimeToClient(item.createdAt) : "Data inválida"}
                        </Typography>
                      </Box>
                    </Box>
                  );
                }
              })}
          </div>

        </div>
        <div ref={baseRef}></div>
      </div>
      <div className={classes.inputArea}>
        <FormControl variant="outlined" fullWidth>
          <Input
            multiline
            value={contentMessage}
            onKeyUp={(e) => {
              if (e.key === "Enter" && contentMessage.trim() !== "") {
                console.log("Enviando mensagem:", contentMessage);
                console.log("Tipo de handleSendMessage:", typeof handleSendMessage);
                handleSendMessage(contentMessage)
                  .catch(err => {
                    console.error("Erro ao enviar mensagem:", err);
                  });
                setContentMessage("");
              }
            }}
            onChange={(e) => setContentMessage(e.target.value)}
            className={classes.input}
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  onClick={() => {
                    if (contentMessage.trim() !== "") {
                      console.log("Enviando mensagem:", contentMessage);
                      handleSendMessage(contentMessage)
                        .catch(err => {
                          console.error("Erro ao enviar mensagem:", err);
                        });
                      setContentMessage("");
                    }
                  }}
                  className={classes.buttonSend}
                >
                  <SendIcon />
                </IconButton>
              </InputAdornment>
            }
          />
        </FormControl>
      </div>
    </Paper>
  );
}
