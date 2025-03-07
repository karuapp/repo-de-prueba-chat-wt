import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Stepper from "@material-ui/core/Stepper";
import Step from "@material-ui/core/Step";
import StepLabel from "@material-ui/core/StepLabel";
import Typography from "@material-ui/core/Typography";
import { AttachFileIcon, Button, IconButton, StepContent, TextField, MenuItem, Select, Chip, InputLabel } from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import SaveIcon from "@material-ui/icons/Save";
import EditIcon from "@material-ui/icons/Edit";
import api from "../../services/api";
import toastError from "../../errors/toastError";


const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    //height: 400,
    [theme.breakpoints.down("sm")]: {
      maxHeight: "20vh",
    },
  },
  button: {
    marginRight: theme.spacing(1),
  },
  input: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  addButton: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
}));

export function QueueOptionStepper({ queueId, options, updateOptions, companyId }) {
  const classes = useStyles();
  const [activeOption, setActiveOption] = useState(-1);  
 
  const handleOption = (index) => async () => {
    setActiveOption(index);
    const option = options[index];

    if (option !== undefined && option.id !== undefined) {

      try {
        const { data } = await api.request({
          url: "/queue-options",
          method: "GET",
          params: { queueId, parentId: option.id },
        });
        const optionList = data.map((option) => {
          return {
            ...option,
            children: [],
            edition: false,
          };
        });
        option.children = optionList;
        updateOptions();
      } catch (e) {
        toastError(e);
      }
    }
  };

  const handleSave = async (option) => {
    try {
      if (option.id) {
        await api.request({
          url: `/queue-options/${option.id}`,
          method: "PUT",
          data: option,
        });
      } else {
        const { data } = await api.request({
          url: `/queue-options`,
          method: "POST",
          data: option,
        });
        option.id = data.id;
      }
      option.edition = false;
      updateOptions();
    } catch (e) {
      toastError(e);
    }
  };

  const handleEdition = (index) => {
    options[index].edition = !options[index].edition;
    updateOptions();
  };

  const handleDeleteOption = async (index) => {
    const option = options[index];
    if (option !== undefined && option.id !== undefined) {
      try {
        await api.request({
          url: `/queue-options/${option.id}`,
          method: "DELETE",
        });
      } catch (e) {
        toastError(e);
      }
    }
    options.splice(index, 1);
    options.forEach(async (option, order) => {
      option.option = order + 1;
      await handleSave(option);
    });
    updateOptions();
  };

  const handleOptionChangeTitle = (event, index) => {
    options[index].title = event.target.value;
    updateOptions();
  };

  const handleOptionChangeType = (event, index) => {
    options[index].queueType = event.target.value;
    updateOptions();
  };

  const handleOptionChangeMessage = (event, index) => {
    options[index].message = event.target.value;
    updateOptions();
    
  };

  const handleOptionIds = (event, index) => {
    options[index].queueOptionsId = event.target.value;
    updateOptions();
  };

  const handleUsersIds = (event, index) => {
    
    //console.log(index);
    //console.log(event.target.value);
  
    options[index].queueUsersId = event.target.value;
    updateOptions();
  };

  const renderTitle = (index) => {
  const option = options[index];

    if (option.edition) {
      return (
        <>
          <TextField
            value={option.title}
            onChange={(event) => handleOptionChangeTitle(event, index)}
            size="small"
            className={classes.input}
            placeholder="Título da opção"
          />
          {option.edition && (//RODRIGO - TRATAMENTO ALTERAÇÃO DO CHATBOT
            <>
              <InputLabel>{"Selecione uma opção"}</InputLabel>
              <Select
                  value={option.queueType}
                  size="small"
                  onChange={(event) => handleOptionChangeType(event, index)}
                  label="Tipo da opção"
                  style={{ width: "40%" }}
                >
                  <MenuItem value={"text"}>Texto</MenuItem>
                  <MenuItem value={"attendent"}>Atendente</MenuItem>
                  <MenuItem value={"queue"}>Fila</MenuItem>
                  <MenuItem value={"n8n"}>Externo (API)</MenuItem>
                  {/* <MenuItem value={"file"}>Arquivo</MenuItem> */}
              </Select>
              <IconButton
                color="primary"
                variant="outlined"
                size="small"
                className={classes.button}
                onClick={() => handleSave(option)}
              >
                <SaveIcon />
              </IconButton>
              <IconButton
                variant="outlined"
                color="secondary"
                size="small"
                className={classes.button}
                onClick={() => handleDeleteOption(index)}
              >
                <DeleteOutlineIcon />
              </IconButton>
            </>
          )}
        </>
      );
    }
    return (
      <>
        <Typography>
          {option.title !== "" ? option.title : "Título não definido"}
          <IconButton
            variant="outlined"
            size="small"
            className={classes.button}
            onClick={() => handleEdition(index)}
          >
            <EditIcon />
          </IconButton>
        </Typography>
      </>
    );
  };     

  const [queues, setQueues] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [userId, setUserId] = useState([null]);
  const [queuesUsers, setQueuesUsers] = useState([null]);

   //console.log('FILAS DO USUARIO  >>>>>>>>>>>>>>>>>>>'+users.queues.map[0])
  
  useEffect(() => {
		(async () => {
			try {
				const { data } = await api.get("/queue", {
					params: { companyId }
				});
				setQueues(data);
			} catch (err) {
				toastError(err);
			}
		})();
	}, [options, companyId]);

	useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get(`/users/`,{params: companyId});
        const userList = data.users;
        setUsersList(userList);
      } catch (err) {
        toastError(err);
      }
    })();
  }, [options, companyId]);

  useEffect(() => {
    (async () => {
       try {
          const { data } = await api.get(`/users/${userId}`);
          
          const userQueueIds = data.queues;
          setQueuesUsers(userQueueIds);
        } catch (err) {
          toastError(err);
        }
    })();
  }, [options, companyId, userId]);

  const renderMessage = (index) => {
  const option = options[index];

//RODRIGO - TRATAMENTO ALTERAÇÃO DO CHATBOT
  if (option.edition) {
      if (option.queueType === "text") {
        return (
          <>
            <TextField
              style={{ width: "100%" }}
              multiline
              value={option.message}
              onChange={(event) => handleOptionChangeMessage(event, index)}
              size="small"
              className={classes.input}
              placeholder="Digite o texto da opção"
            />
          </>
        );
      } 
      
      else if (option.queueType === "n8n" ) {
        return (
          <>
            <TextField
              style={{ width: "100%" }}
              multiline
              value={option.message}
              onChange={(event) => handleOptionChangeMessage(event, index)}
              size="small"
              className={classes.input}
              placeholder="Digite a URL de integração (N8N / TypeBOT ...)"
            />
          </>
        );
      }
      
      else if (option.queueType === "queue" ) {
        return (
          <>
            <TextField
              style={{ width: "100%" }}
              multiline
              value={option.message}
              onChange={(event) => handleOptionChangeMessage(event, index)}
              size="small"
              className={classes.input}
              placeholder="Digite o texto da opção"
            />

            <InputLabel>{"Selecione uma Fila"}</InputLabel>
              <Select
                    value={option.queueOptionsId}
                    style={{ width: "40%" }}
                    size="small"
                    onChange={(event) => handleOptionIds(event, index)}
                >
                    {queues.map(queue => (
                      <MenuItem key={queue.id} value={queue.id}>
                        {queue.name}
                      </MenuItem>
                    ))}
              </Select>
          </>
        );
      }
      else if (option.queueType === "attendent" ) {
        return (
          <>
           <TextField
              style={{ width: "100%" }}
              multiline
              value={option.message}
              onChange={(event) => handleOptionChangeMessage(event, index)}
              size="small"
              className={classes.input}
              placeholder="Digite o texto da opção"
            />

            <InputLabel>{"Selecione um Atendente"}</InputLabel>
          <Select
            value={option.queueUsersId}
            style={{ width: "40%" }}
            size="small"
            onChange={(event) => handleUsersIds(event, index)}
          >
            {usersList.map((u) => (
              <MenuItem key={u.id} value={u.id}>
                {u.name}
              </MenuItem>
            ))}
          </Select>

              <InputLabel>{"Selecione uma Fila"}</InputLabel>
              <Select
                    value={option.queueOptionsId}
                    style={{ width: "40%" }}
                    size="small"
                    onChange={(event) => handleOptionIds(event, index)}
                >
                    
                    {queues.map(queue => (
                      <MenuItem key={queue.id} value={queue.id}>
                        {queue.name}
                      </MenuItem>
                    ))}
              </Select>
          </>

            
        );
      } else if (option.queueType === "file"){
        return (
        <>
          <TextField
              style={{ width: "100%" }}
              multiline
              value={option.message}
              onChange={(event) => handleOptionChangeMessage(event, index)}
              size="small"
              className={classes.input}
              placeholder="Digite o texto da opção"
            />
          {/* <Button startIcon={<AttachFileIcon />}>
                          {attachment != null
                            ? attachment.name
                            : campaign.mediaName}
          </Button> */}
        </>
        );
      }
    }
    return (
      <>
        <Typography onClick={() => handleEdition(index)}>
          {option.message}
        </Typography>
      </>
    );
  };

  const handleAddOption = (index) => {
    const optionNumber = options[index].children.length + 1;
    options[index].children.push({
      title: "",
      message: "",
      edition: false,
      option: optionNumber,
      queueId,
      queueType: options[index].queueType,
      queueOptionsId: options[index].queueOptionsId,
      queueUsersId: options[index].queueUsersId,
      parentId: options[index].id,
      children: [],
    });
    updateOptions();
  };

  const renderStep = (option, index) => {
    return (
      <Step key={index}>
        <StepLabel style={{ cursor: "pointer" }} onClick={handleOption(index)}>
          {renderTitle(index)}
        </StepLabel>
        <StepContent>
          {renderMessage(index)}

          {option.id !== undefined && (
            <>
              <Button
                color="primary"
                size="small"
                onClick={() => handleAddOption(index)}
                startIcon={<AddIcon />}
                variant="outlined"
                className={classes.addButton}
              >
                Adicionar
              </Button>
            </>
          )}
          <QueueOptionStepper
            queueId={queueId}
            options={option.children}
            updateOptions={updateOptions}
          />
        </StepContent>
      </Step>
    );
  };

  const renderStepper = () => {
    return (
      <Stepper
        style={{ marginBottom: 0, paddingBottom: 0 }}
        nonLinear
        activeStep={activeOption}
        orientation="vertical"
      >
        {options.map((option, index) => renderStep(option, index))}
      </Stepper>
    );
  };

  return renderStepper();
}

export function QueueOptions({ queueId, companyId }) {
  const classes = useStyles();
  const [options, setOptions] = useState([]);

  useEffect(() => {
    if (queueId) {
      const fetchOptions = async () => {
        try {
          const { data } = await api.request({
            url: "/queue-options",
            method: "GET",
            params: { queueId, parentId: -1 },
          });
          const optionList = data.map((option) => {
            return {
              ...option,
              children: [],
              edition: false,
            };
          });
          setOptions(optionList);
        } catch (e) {
          toastError(e);
        }
      };
      fetchOptions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderStepper = () => {
    if (options.length > 0) {
      return (
        <QueueOptionStepper
          queueId={queueId}
          updateOptions={updateOptions}
          options={options}
          companyId={companyId}
        />
      );
    }
  };

  const updateOptions = () => {
    setOptions([...options]);
  };

  const addOption = () => {
    const newOption = {
      title: "",
      message: "",
      edition: false,
      option: options.length + 1,
      queueId,
      queueType: "",
      queueOptionsId: null,
      queueUsersId: null,
      parentId: null,
      children: [],
    };
    setOptions([...options, newOption]);
  };

  return (
    <div className={classes.root}>
      <br />
      <Typography>
        Opções
        <Button
          color="primary"
          size="small"
          onClick={addOption}
          startIcon={<AddIcon />}
          style={{ marginLeft: 10 }}
          variant="outlined"
        >
          Adicionar
        </Button>
      </Typography>
      {renderStepper()}
    </div>
  );
}
