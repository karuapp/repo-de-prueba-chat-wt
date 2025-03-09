import React, { useState, useEffect, useRef } from "react";

import * as Yup from "yup";
import { Formik, Form, Field } from "formik";
import { toast } from "react-toastify";

import { makeStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import { Select, MenuItem } from '@material-ui/core';
import TabPanel from "../../components/TabPanel";

import CircularProgress from "@material-ui/core/CircularProgress";

import { i18n } from "../../translate/i18n";

import api from "../../services/api";
import toastError from "../../errors/toastError";
import ColorPicker from "../ColorPicker";
import {
  FormControl,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Paper,
  Switch,
  Tab,
  Tabs,
  Grid,
  InputLabel,
} from "@material-ui/core";
import { Colorize } from "@material-ui/icons";
import { QueueOptions } from "../QueueOptions";
import SchedulesForm from "../SchedulesForm";
import useQueues from "../../hooks/useQueues";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexWrap: "wrap",
  },
  textField: {
    marginRight: theme.spacing(1),
    flex: 1,
  },

  btnWrapper: {
    position: "relative",
  },
  selectField: {
    marginRight: theme.spacing(1),
    flex: 1,
    minWidth: "300px"
  },
  btnWrapper: {
    position: "relative",
  },

  buttonProgress: {
    color: green[500],
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -12,
    marginLeft: -12,
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  colorAdorment: {
    width: 20,
    height: 20,
  },
  fullWidth: {
    width: "100%",
  },
  selectContainer: {
    width: "100%",
    textAlign: "left",
  },
}));

const QueueSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, "Too Short!")
    .max(50, "Too Long!")
    .required("Required"),
  color: Yup.string().min(3, "Too Short!").max(9, "Too Long!").required(),
  greetingMessage: Yup.string(),
  prioridade: Yup.number().required(),
  isChatbot: Yup.boolean(), //RODRIGO - TRATAMENTO ALTERAÇÃO DO CHATBOT
  // se tiver selecionado transbordoQueue, então timeTransbordo é obrigatório

});

const QueueModal = ({ open, onClose, queueId, companyId }) => {
  const classes = useStyles();

  const { findAll: findAllQueues } = useQueues();

  const initialState = {
    name: "",
    color: "",
    prioridade: "",
    greetingMessage: "",
    outOfHoursMessage: "",
    tempoRoteador: "0",
    ativarRoteador: false,
    isChatbot: false,
    typeChatbot: "",
    n8n: "",
    n8nId: "",
    workspaceTypebot: "",
    typebotId: "",
    resetChatbotMsg: false,
    timeTransbordo: "0",
    transbordoQueueId: "",
    messageTransbordo: ""
  };

  const [colorPickerModalOpen, setColorPickerModalOpen] = useState(false);
  const [queue, setQueue] = useState(initialState);
  const [schedulesEnabled, setSchedulesEnabled] = useState(false);
  const greetingRef = useRef();
  const [tab, setTab] = useState("queueDados");
  const [workspaceTypebots, setWorkspaceTypebots] = useState([]);
  const [workflowN8N, setWorkFlowN8N] = useState([]);
  const [typeBots, setTypebots] = useState([]);
  const [n8ns, setN8ns] = useState([]);
  const [listQueues, setListQueues] = useState([]);

  const [schedules, setSchedules] = useState([
    { weekday: "Segunda-feira", weekdayEn: "monday", startTime: "08:00", endTime: "18:00", },
    { weekday: "Terça-feira", weekdayEn: "tuesday", startTime: "08:00", endTime: "18:00", },
    { weekday: "Quarta-feira", weekdayEn: "wednesday", startTime: "08:00", endTime: "18:00", },
    { weekday: "Quinta-feira", weekdayEn: "thursday", startTime: "08:00", endTime: "18:00", },
    { weekday: "Sexta-feira", weekdayEn: "friday", startTime: "08:00", endTime: "18:00", },
    { weekday: "Sábado", weekdayEn: "saturday", startTime: "08:00", endTime: "12:00", },
    { weekday: "Domingo", weekdayEn: "sunday", startTime: "00:00", endTime: "00:00", },
  ]);

  useEffect(() => {
    api.get(`/settings`).then(({ data }) => {
      if (Array.isArray(data)) {
        const scheduleType = data.find((d) => d.key === "scheduleType");
        if (scheduleType) {
          setSchedulesEnabled(scheduleType.value === "queue");
        }
      }
    });

    handleGetQueues();

  }, []);

  useEffect(() => {
    (async () => {
      if (!queueId) return;
      try {
        const { data } = await api.get(`/queue/${queueId}`);
        setQueue((prevState) => {
          return { ...prevState, ...data };
        });
        setSchedules(data.schedules);
      } catch (err) {
        toastError(err);
      }
    })();

    return () => {
      setQueue({
        name: "",
        prioridade: "",
        color: "",
        greetingMessage: "",
        tempoRoteador: "0",
        ativarRoteador: false,
        isChatbot: false,
        typeChatbot: "",
        n8n: "",
        n8nId: "",
        workspaceTypebot: "",
        typebotId: "",
        resetChatbotMsg: false
      });
    };
  }, [queueId, open]);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get(`/typebot/listworkspaces`);
        // console.log(data)
        if (data?.workspaces && data.workspaces?.length > 0) {
          setWorkspaceTypebots(data?.workspaces);
        }
      } catch (err) {
        toastError(err);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {

        const { data } = await api.get(`/n8n/listworkFlow`);

        if (data?.data && data?.data?.length > 0) {
          const extractedData = data?.data?.map(item => ({
            id: item.id, // Substitua 'id' pelo nome real da propriedade
            name: item.name
          }));
          // console.log(extractedData)
          setWorkFlowN8N(extractedData);
        }
      } catch (err) {
        console.log('erro ao buscar dados do n8n', err);
      }
    })();
  }, []);

  useEffect(() => {
    if (queueId && queue?.workspaceTypebot) {
      (async () => {
        try {
          const { data } = await api.get(`/typebot/listtypebots`, {
            params: {
              workspaceId: queue?.workspaceTypebot
            }
          });
          // console.log("list ",data)
          if (data?.typebots && data?.typebots.length > 0) {
            setTypebots(data?.typebots);
          }
        } catch (err) {
          toastError(err);
        }
      })();
    }
  }, [queueId, queue]);

  const handleGetQueues = async () => {
    try {
      const data = await findAllQueues();
      setListQueues(data);
      console.log('filas', data)
    } catch (err) {
      toastError(err);
    }
  }

  const handleClose = () => {
    onClose();
    setQueue(initialState);
    setTab("queueDados");
  };

  const handleChangeWorkspace = async (workspace) => {
    if (!workspace) {
      setTypebots([])
      return;
    }
    try {
      const { data } = await api.get(`/typebot/listtypebots`, {
        params: {
          workspaceId: workspace
        }
      });
      // console.log(data)
      if (data?.typebots && data?.typebots?.length > 0) {
        setTypebots(data.typebots);
      } else {
        setTypebots([])
      }
    } catch (err) {
      toastError(err);
    }
  }

  const handleSaveQueue = async (values) => {
    try {
      if (queueId) {
        await api.put(`/queue/${queueId}`, { ...values, schedules });
      } else {
        await api.post("/queue", { ...values, schedules });
      }
      toast.success("Queue saved successfully");
      handleClose();
    } catch (err) {
      toastError(err);
    }
  };

  const handleSaveSchedules = async (values) => {
    toast.success("Clique em salvar para registar as alterações");
    setSchedules(values);
    setTab(0);
  };

  return (
    <div className={classes.root}>
      <Dialog
        maxWidth="md"
        fullWidth={true}
        open={open}
        onClose={handleClose}
        scroll="paper"
      >
        <DialogTitle>
          {queueId
            ? `${i18n.t("queueModal.title.edit")}`
            : `${i18n.t("queueModal.title.add")}`}
        </DialogTitle>
        <Tabs
          value={tab}
          indicatorColor="primary"
          textColor="primary"
          onChange={(_, v) => setTab(v)}
          aria-label="disabled tabs example"
        >
          <Tab label="Dados da Fila" value='queueDados' />
          {schedulesEnabled && <Tab label="Horários de Atendimento" value='expediente' />}
          <Tab label="Integrações" value='integracoes' />
          <Tab label="Transbordo" value='transbordo' />
        </Tabs>
        <TabPanel className={classes.container} value={tab} name={"queueDados"}>
          <Paper>
            <Formik
              initialValues={queue}
              enableReinitialize={true}
              validationSchema={QueueSchema}
              onSubmit={(values, actions) => {
                setTimeout(() => {
                  handleSaveQueue(values);
                  actions.setSubmitting(false);
                }, 400);
              }}
            >
              {({ touched, errors, isSubmitting, values }) => (
                <Form>
                  <DialogContent dividers>
                    <Grid spacing={2} container>
                      <Grid xs={12} md={4} item>
                        <Field
                          as={TextField}
                          label={i18n.t("queueModal.form.name")}
                          autoFocus
                          name="name"
                          error={touched.name && Boolean(errors.name)}
                          helperText={touched.name && errors.name}
                          variant="outlined"
                          margin="dense"
                          className={classes.textField}
                        />
                      </Grid>
                      <Grid xs={12} md={4} item>
                        <Field
                          as={TextField}
                          label={i18n.t("queueModal.form.prioridade")}
                          autoFocus
                          name="prioridade"
                          error={touched.prioridade && Boolean(errors.prioridade)}
                          helperText={touched.prioridade && errors.prioridade}
                          variant="outlined"
                          margin="dense"
                          className={classes.textField}
                        />
                      </Grid>
                      <Grid xs={12} md={4} item>
                        <Field
                          as={TextField}
                          label={i18n.t("queueModal.form.color")}
                          name="color"
                          id="color"
                          onFocus={() => {
                            setColorPickerModalOpen(true);
                            greetingRef.current.focus();
                          }}
                          error={touched.color && Boolean(errors.color)}
                          helperText={touched.color && errors.color}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <div
                                  style={{ backgroundColor: values.color }}
                                  className={classes.colorAdorment}
                                ></div>
                              </InputAdornment>
                            ),
                            endAdornment: (
                              <IconButton
                                size="small"
                                color="default"
                                onClick={() => setColorPickerModalOpen(true)}
                              >
                                <Colorize />
                              </IconButton>
                            ),
                          }}
                          variant="outlined"
                          margin="dense"
                          className={classes.textField}
                        />
                        <ColorPicker
                          open={colorPickerModalOpen}
                          handleClose={() => setColorPickerModalOpen(false)}
                          onChange={(color) => {
                            values.color = color;
                            setQueue(() => {
                              return { ...values, color };
                            });
                          }}
                        />
                      </Grid>


                      <Grid xs={12} md={4} item>

                        <FormControlLabel
                          control={
                            <Field
                              as={Switch}
                              color="primary"
                              name="ativarRoteador"
                              checked={values.ativarRoteador}
                            />
                          }
                          label={i18n.t("queueModal.form.ativarRoteador")}
                        />
                      </Grid>

                      <Grid xs={12} md={4} item>
                        <Field
                          as={Select}
                          label="Tempo de Escala"
                          name="tempoRoteador"
                          error={touched.tempoRoteador && Boolean(errors.tempoRoteador)}
                          helperText={touched.tempoRoteador && errors.tempoRoteador}
                          variant="outlined"
                          margin="dense"
                          className={classes.selectField}
                        >
                          <MenuItem value="0">Tempo de Escala</MenuItem>
                          <MenuItem value="2">2 minutos</MenuItem>
                          <MenuItem value="5">5 minutos</MenuItem>
                          <MenuItem value="10">10 minutos</MenuItem>
                          <MenuItem value="15">15 minutos</MenuItem>
                          <MenuItem value="30">30 minutos</MenuItem>
                          <MenuItem value="45">45 minutos</MenuItem>
                          <MenuItem value="60">60 minutos</MenuItem>
                        </Field>
                      </Grid>


                      <Grid xs={12} md={4} item>
                        <FormControlLabel
                          control={
                            <Field
                              as={Switch}
                              color="primary"
                              name="isChatbot"
                              checked={values.isChatbot}
                            />
                          }
                          label={i18n.t("queueModal.form.isChatbot")}
                        />
                      </Grid>
                    </Grid>

                    <div style={{ marginTop: 5 }}>
                      <Field
                        as={TextField}
                        label={i18n.t("queueModal.form.greetingMessage")}
                        type="greetingMessage"
                        multiline
                        inputRef={greetingRef}
                        rows={5}
                        fullWidth
                        name="greetingMessage"
                        error={
                          touched.greetingMessage &&
                          Boolean(errors.greetingMessage)
                        }
                        helperText={
                          touched.greetingMessage && errors.greetingMessage
                        }
                        variant="outlined"
                        margin="dense"
                      />
                      {schedulesEnabled && (
                        <Field
                          as={TextField}
                          label={i18n.t("queueModal.form.outOfHoursMessage")}
                          type="outOfHoursMessage"
                          multiline
                          rows={5}
                          fullWidth
                          name="outOfHoursMessage"
                          error={
                            touched.outOfHoursMessage &&
                            Boolean(errors.outOfHoursMessage)
                          }
                          helperText={
                            touched.outOfHoursMessage && errors.outOfHoursMessage
                          }
                          variant="outlined"
                          margin="dense"
                        />
                      )}
                    </div>
                    <QueueOptions
                      queueId={queueId}
                      companyId={companyId}
                    />
                  </DialogContent>

                  <DialogActions>
                    <Button
                      onClick={handleClose}
                      color="secondary"
                      disabled={isSubmitting}
                      variant="outlined"
                    >
                      {i18n.t("queueModal.buttons.cancel")}
                    </Button>
                    <Button
                      type="submit"
                      color="primary"
                      disabled={isSubmitting}
                      variant="contained"
                      className={classes.btnWrapper}
                    >
                      {queueId
                        ? `${i18n.t("queueModal.buttons.okEdit")}`
                        : `${i18n.t("queueModal.buttons.okAdd")}`}
                      {isSubmitting && (
                        <CircularProgress
                          size={24}
                          className={classes.buttonProgress}
                        />
                      )}
                    </Button>
                  </DialogActions>
                </Form>
              )}
            </Formik>
          </Paper>
        </TabPanel>

        <TabPanel className={classes.container} value={tab} name={"expediente"}>
          <Paper style={{ padding: 20 }}>
            <SchedulesForm
              loading={false}
              onSubmit={handleSaveSchedules}
              initialValues={schedules}
              labelSaveButton="Adicionar"
            />
          </Paper>
        </TabPanel>

        <TabPanel className={classes.container} value={tab} name={"integracoes"}>
          <Paper>
            <Formik
              initialValues={queue}
              enableReinitialize={true}
              validationSchema={QueueSchema}
              onSubmit={(values, actions) => {
                setTimeout(() => {
                  handleSaveQueue(values);
                  actions.setSubmitting(false);
                }, 400);
              }}
            >
              {({ touched, errors, isSubmitting, values, setFieldValue }) => (
                <Form>
                  <DialogContent dividers>
                    <FormControl className={classes.selectField} margin="dense" variant="outlined" >
                      <InputLabel htmlFor="typeChatbot-selection">Tipo Chatbot</InputLabel>
                      <Field
                        as={Select}
                        id="typeChatbot-selection"
                        label="Tipo Chatbot"
                        labelId="typeChatbot-selection-label"
                        name="typeChatbot"
                        margin="dense"
                        className={classes.textField}
                      >
                        <MenuItem value=""></MenuItem>
                        <MenuItem value="n8n">N8N</MenuItem>
                        <MenuItem value="typebot">Typebot</MenuItem>
                      </Field>
                    </FormControl>
                    <FormControlLabel
                      control={
                        <Field
                          as={Switch}
                          color="primary"
                          name="resetChatbotMsg"
                          checked={values.resetChatbotMsg}
                        />
                      }
                      label={i18n.t("queueModal.form.resetChatbot")}
                    />
                    {values.typeChatbot === "n8n" &&
                      <div>
                        <FormControl className={classes.selectField} margin="dense" variant="outlined" >
                          <InputLabel htmlFor="workflowN8N-selection">Workspaces</InputLabel>
                          <Field
                            as={Select}
                            id="workflowN8N-selection"
                            label="workFlows"
                            labelId="workflowN8N-selection-label"
                            name="n8nId"
                            onChange={e => {
                              setFieldValue('n8n', e.target?.value)
                              setFieldValue('n8nId', e.target?.value)
                            }}
                            margin="dense"
                            className={classes.textField}
                          >
                            <MenuItem value={''}>&nbsp;</MenuItem>
                            {workflowN8N.map((workflow, key) => (
                              <MenuItem key={key} value={workflow.id}>{workflow.name}</MenuItem>
                            ))}

                          </Field>
                        </FormControl>
                      </div>
                    }
                    {values.typeChatbot === "typebot" &&
                      <div>
                        <FormControl className={classes.selectField} margin="dense" variant="outlined" >
                          <InputLabel htmlFor="workspaceTypebot-selection">Workspaces</InputLabel>
                          <Field
                            as={Select}
                            id="workspaceTypebot-selection"
                            label="workSpaces"
                            labelId="workspaceTypebot-selection-label"
                            name="workspaceTypebot"
                            onChange={e => {
                              setFieldValue('workspaceTypebot', e.target?.value)
                              handleChangeWorkspace(e.target?.value)
                            }}
                            margin="dense"
                            className={classes.textField}
                          >
                            <MenuItem value={''}>&nbsp;</MenuItem>
                            {workspaceTypebots.map((workspace, key) => (
                              <MenuItem key={key} value={workspace.id}>{workspace.name}</MenuItem>
                            ))}

                          </Field>
                        </FormControl>
                        <FormControl className={classes.selectField} margin="dense" variant="outlined">
                          <InputLabel htmlFor="typebotId-selection">TypeBot</InputLabel>
                          <Field
                            as={Select}
                            id="typebot-selection"
                            label="Typebot"
                            labelId="typebot-selection-label"
                            name="typebotId"
                            margin="dense"
                            className={classes.textField}
                          >
                            <MenuItem value={''}>&nbsp;</MenuItem>
                            {typeBots.map((typebot, key) => (
                              <MenuItem key={key} value={typebot.id}>{typebot.name}</MenuItem>
                            ))}
                          </Field>
                        </FormControl>
                      </div>
                    }
                  </DialogContent>
                  <DialogActions>
                    <Button
                      onClick={handleClose}
                      color="secondary"
                      disabled={isSubmitting}
                      variant="outlined"
                    >
                      {i18n.t("queueModal.buttons.cancel")}
                    </Button>
                    <Button
                      type="submit"
                      color="primary"
                      disabled={isSubmitting}
                      variant="contained"
                      className={classes.btnWrapper}
                    >
                      {queueId
                        ? `${i18n.t("queueModal.buttons.okEdit")}`
                        : `${i18n.t("queueModal.buttons.okAdd")}`}
                      {isSubmitting && (
                        <CircularProgress
                          size={24}
                          className={classes.buttonProgress}
                        />
                      )}
                    </Button>
                  </DialogActions>
                </Form>
              )}
            </Formik>
          </Paper>
        </TabPanel>

        <TabPanel className={classes.container} value={tab} name={"transbordo"}>
          <Paper>
            <Formik
              initialValues={queue}
              enableReinitialize={true}
              validationSchema={QueueSchema}
              onSubmit={(values, actions) => {
                setTimeout(() => {
                  handleSaveQueue(values);
                  actions.setSubmitting(false);
                }, 400);
              }}
            >
              {({ touched, errors, isSubmitting, values, setFieldValue }) => (
                <Form>
                  <DialogContent dividers>
                    <Grid spacing={2} container>

                      <Grid xs={12} md={4} item>
                        {/* transbordoQueue */}
                        <FormControl margin="dense" variant="outlined" fullWidth>
                          <InputLabel id="demo-simple-select-label">Fila</InputLabel>
                          <Select
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            value={values.transbordoQueueId}
                            label="Fila"
                            onChange={(e) => {
                              setFieldValue('transbordoQueueId', e.target.value)
                            }}
                          >
                            <MenuItem value="">
                              <em>Desativado</em>
                            </MenuItem>

                            {listQueues.map((queue) => (
                              <MenuItem key={queue.id} value={queue.id}>
                                {queue.name}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>

                      {values.transbordoQueueId && (
                        <>
                          <Grid xs={12} md={4} item>
                            <Field
                              as={TextField}
                              label={'Tempo de Transbordo'}
                              autoFocus
                              name="timeTransbordo"
                              error={touched.timeTransbordo && Boolean(errors.timeTransbordo)}
                              helperText={touched.timeTransbordo && errors.timeTransbordo}
                              variant="outlined"
                              margin="dense"
                              className={classes.textField}
                            />
                          </Grid>
                          <Grid xs={12} md={12} item>
                            <Field
                              as={TextField}
                              label={'Mensagem de Transbordo'}
                              multiline
                              inputRef={greetingRef}
                              rows={5}
                              fullWidth
                              name="messageTransbordo"
                              error={
                                touched.messageTransbordo &&
                                Boolean(errors.messageTransbordo)
                              }
                              helperText={
                                touched.messageTransbordo && errors.messageTransbordo
                              }
                              variant="outlined"
                              margin="dense"
                            />

                          </Grid>

                        </>
                      )}



                    </Grid>
                  </DialogContent>
                  <DialogActions>
                    <Button
                      onClick={handleClose}
                      color="secondary"
                      disabled={isSubmitting}
                      variant="outlined"
                    >
                      {i18n.t("queueModal.buttons.cancel")}
                    </Button>
                    <Button
                      type="submit"
                      color="primary"
                      disabled={isSubmitting}
                      variant="contained"
                      className={classes.btnWrapper}
                    >
                      {queueId
                        ? `${i18n.t("queueModal.buttons.okEdit")}`
                        : `${i18n.t("queueModal.buttons.okAdd")}`}
                      {isSubmitting && (
                        <CircularProgress
                          size={24}
                          className={classes.buttonProgress}
                        />
                      )}
                    </Button>
                  </DialogActions>
                </Form>
              )}
            </Formik>
          </Paper>
        </TabPanel>
      </Dialog>
    </div>
  );
};

export default QueueModal;
