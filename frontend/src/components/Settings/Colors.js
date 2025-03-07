import React, { useEffect, useState, useContext, useRef } from "react";
import { useHistory } from "react-router-dom";

import * as Yup from "yup";
import { Formik, FieldArray, Form, Field } from "formik";

import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import FormHelperText from "@material-ui/core/FormHelperText";
import TextField from "@material-ui/core/TextField";
import Title from "../Title";
import Typography from "@material-ui/core/Typography";
import useSettings from "../../hooks/useSettings";
import { ToastContainer, toast } from 'react-toastify';
import { makeStyles } from "@material-ui/core/styles";
import { grey, blue } from "@material-ui/core/colors";
import { i18n } from "../../translate/i18n";
import {
  Grid,
  IconButton,
  InputAdornment,
  Paper,
  Tab,
  Tabs,
} from "@material-ui/core";
import { SketchPicker } from "react-color";
import Popover from "@material-ui/core/Popover";
import { AuthContext } from "../../context/Auth/AuthContext";
import { green } from "@material-ui/core/colors";

import toastError from "../../errors/toastError";
import ColorPicker from "../ColorPicker";
import { Colorize } from "@material-ui/icons";

//import 'react-toastify/dist/ReactToastify.css';
 
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
  greetingMessage: {
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    "& > *:not(:last-child)": {
      marginRight: theme.spacing(1),
    },
  },
  custom: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  fixedHeightPaper: {
    padding: theme.spacing(2),
    display: "flex",
    overflow: "auto",
    flexDirection: "column",
    height: 240,
  },
  tab: {
    background: "#f2f5f3",
    borderRadius: 4,
    width: "100%",
    "& .MuiTab-wrapper": {
      color: "#128c7e"
    },
    "& .MuiTabs-flexContainer": {
      justifyContent: "center"
    }


  },
  paper: {
    padding: theme.spacing(2),
    display: "flex",
    alignItems: "center",
    marginBottom: 12,
    width: "100%",
  },
  cardAvatar: {
    fontSize: "55px",
    color: grey[500],
    backgroundColor: "#ffffff",
    width: theme.spacing(7),
    height: theme.spacing(7),
  },
  cardTitle: {
    fontSize: "18px",
    color: blue[700],
  },
  cardSubtitle: {
    color: grey[600],
    fontSize: "14px",
  },
  alignRight: {
    textAlign: "right",
  },
  fullWidth: {
    width: "100%",
  },
  selectContainer: {
    width: "100%",
    textAlign: "left",
  },
}));

export default function Colors(props) {
  const { settings, scheduleTypeChanged } = props;

  //console.log(settings);

  const classes = useStyles();
  const history = useHistory();
  const [mainColorType, setMainColorType] = useState("#000000");
  const [loadingMainColorType, setLoadingMainColorType] = useState(false);

  const [scrollbarColorType, setScrollbarColorType] = useState("#000000");
  const [loadingScrollbarColorType, setLoadingScrollbarColorType] = useState(false);

  const [toolbarBackgroundType, setToolbarBackgroundType] = useState("#000000");
  const [loadingToolbarBackgroundType, setLoadingToolbarBackgroundType] = useState(false);

  const [colorPickerModalOpen, setColorPickerModalOpen] = useState(false);
  const [colorPickerModalOpenB, setColorPickerModalOpenB] = useState(false);
  const [colorPickerModalOpenC, setColorPickerModalOpenC] = useState(false);

  const [backgroundPagesType, setbackgroundPagesType] = useState("");
  const [loadingbackgroundPagesType, setLoadingbackgroundPagesType] = useState(false);
  
  const greetingRef = useRef(null);

  
  const { user } = useContext(AuthContext);
  const { profile } = user;

  // trava para nao acessar pagina que não pode 
  useEffect(() => {
    async function fetchData() {
      if (!user.super) {
        toast.error("Sem permissão para acessar!");
        setTimeout(() => {
          history.push(`/`)
        }, 500);
      }
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  

  const { update } = useSettings();

  useEffect(() => {
    if (Array.isArray(settings) && settings.length) {

      const mainColorType = settings.find((s) => s.key === "mainColor");
      if (mainColorType) {
        setMainColorType(mainColorType.value);
      }
    
      const scrollbarColorType = settings.find((s) => s.key === "scrollbarColor");
      if (scrollbarColorType) {
        setScrollbarColorType(scrollbarColorType.value);
      }

      const toolbarBackgroundType = settings.find((s) => s.key === "toolbarBackground");
      if (toolbarBackgroundType) {
        setToolbarBackgroundType(toolbarBackgroundType.value);
      }
    
      const backgroundPagesType = settings.find((s) => s.key === "backgroundPages");
        
      if (backgroundPagesType) {
        setbackgroundPagesType(backgroundPagesType.value);
      }


    }
  }, [settings]);




  async function handleChangeMainColor(value) {
    setMainColorType(value);
    setLoadingMainColorType(true);
    setColorPickerModalOpen(false);
    await update({
      key: "mainColor",
      value,
    });
    toast.success("Operação atualizada com sucesso.");
    //setLoadingMainColorType(false);
    window.location.reload();
  }

  async function handleChangeScrollbarColor(value) {
    setScrollbarColorType(value);
    setLoadingScrollbarColorType(true);
    setColorPickerModalOpenB(false);
    await update({
      key: "scrollbarColor",
      value,
    });
    toast.success("Operação atualizada com sucesso.");
    //setLoadingScrollbarColorType(false);
    window.location.reload();
  }

  async function handleChangeToolbarBackground(value) {
    setToolbarBackgroundType(value);
    setLoadingToolbarBackgroundType(true);
    setColorPickerModalOpenC(false);
    await update({
      key: "toolbarBackground",
      value,
    });
    toast.success("Operação atualizada com sucesso.");
    //setLoadingToolbarBackgroundType(false);
    window.location.reload();
  }

  const handleCloseColorPicker = () => {
    setColorPickerModalOpen(false);
    setColorPickerModalOpenB(false);
    setColorPickerModalOpenC(false);
  };

  const handleClose = () => {
    setColorPickerModalOpen(false);
    setColorPickerModalOpenB(false);
    setColorPickerModalOpenC(false);
  };

  async function handleChangebackgroundPages(value) {
    setbackgroundPagesType(value);
    setLoadingbackgroundPagesType(true);
    await update({
      key: "backgroundPages",
      value,
    });
    toast.success("Operação atualizada com sucesso.");
    setLoadingbackgroundPagesType(false);
  }

  return (
    <>
      <Grid spacing={3} container>
        <Tabs
          indicatorColor="primary"
          textColor="primary"
          scrollButtons="on"
          variant="scrollable"
          className={classes.tab}
          style={{
            marginBottom: 20,
            marginTop: 20
          }}
        >
          <Tab

            label="Cores da Plataforma" />

        </Tabs>

    </Grid>
      {/*-----------------CORES-----------------*/}
      <Grid spacing={4} container
        style={{ marginBottom: 10 }}>
        
        <Formik
        initialValues={{
          mainColorType,
          scrollbarColorType,
          toolbarBackgroundType,
        }}
        
        >
        
        {({ handleChange, touched, errors, isSubmitting, values, handleClose }) => (
        <>
	  				<Grid xs={12} sm={12} md={12} item>
        			
        			<Field
                      as={TextField}
                      label={i18n.t("custom.form.mainColor")}
                      name="mainColor"
                      id="mainColor"
                      value={mainColorType}
                      onFocus={() => {
            			setColorPickerModalOpen(true);
            			greetingRef.current && greetingRef.current.focus(); 
          			  }}
                      error={touched.mainColor && Boolean(errors.mainColor)}
                      helperText={touched.mainColor && errors.mainColor}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <div
                              style={{ backgroundColor: mainColorType }}
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
                      
                    />
        			<ColorPicker
                      open={colorPickerModalOpen}
                      handleClose={() => setColorPickerModalOpen(false)}
                      value={mainColorType}
                      onChange={handleChangeMainColor}
                    />
                   </Grid>
				   <Grid xs={12} sm={12} md={12} item>
                      
                      
                    <Field
                      as={TextField}
                      label={i18n.t("custom.form.scrollbarColor")}
                      name="scrollbarColor"
                      id="scrollbarColor"
                      value={scrollbarColorType}
                      onFocus={() => {
            			setColorPickerModalOpenB(true);
            			greetingRef.current && greetingRef.current.focus(); 
          			  }}
                      error={touched.scrollbarColor && Boolean(errors.scrollbarColor)}
                      helperText={touched.scrollbarColor && errors.scrollbarColor}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <div
                              style={{ backgroundColor: scrollbarColorType }}
                              className={classes.colorAdorment}
                            ></div>
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <IconButton
                            size="small"
                            color="default"
                            onClick={() => setColorPickerModalOpenB(true)}
                          >
                            <Colorize />
                          </IconButton>
                        ),
                      }}
                      variant="outlined"
                      margin="dense"
                 
                    />
        			<ColorPicker
                      open={colorPickerModalOpenB}
                      handleClose={() => setColorPickerModalOpenB(false)}
                      value={scrollbarColorType}
                      onChange={handleChangeScrollbarColor}
                    />
                    </Grid>
					<Grid xs={12} sm={12} md={12} item>
                      
                      
                    <Field
                      as={TextField}
                      label={i18n.t("custom.form.toolbarBackground")}
                      name="toolbarBackground"
                      id="toolbarBackground"
                      value={toolbarBackgroundType}
                      onFocus={() => {
            			setColorPickerModalOpenC(true);
            			greetingRef.current && greetingRef.current.focus(); 
          			  }}
                      error={touched.toolbarBackground && Boolean(errors.toolbarBackground)}
                      helperText={touched.toolbarBackground && errors.toolbarBackground}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <div
                              style={{ backgroundColor: toolbarBackgroundType }}
                              className={classes.colorAdorment}
                            ></div>
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <IconButton
                            size="small"
                            color="default"
                            onClick={() => setColorPickerModalOpenC(true)}
                          >
                            <Colorize />
                          </IconButton>
                        ),
                      }}
                      variant="outlined"
                      margin="dense"
                    />
                    <ColorPicker
                      open={colorPickerModalOpenC}
                      handleClose={() => setColorPickerModalOpenC(false)}
                      value={toolbarBackgroundType}
        			  onChange={handleChangeToolbarBackground}
                    />
                      
                    </Grid>
        
        </>
        )}
		</Formik>
        
      </Grid>




	  <Grid spacing={3} container
        style={{ marginBottom: 10 }}>
        

        <Grid xs={12} sm={12} md={12} item>
          <FormControl className={classes.selectContainer}>
            <TextField
              id="backgroundPages"
              name="backgroundPages"
              margin="dense"
              label={i18n.t("custom.form.BackgroundPages")}
              variant="outlined"
              value={backgroundPagesType}
              onChange={async (e) => {
                handleChangebackgroundPages(e.target.value);
              }}
            >
            </TextField>
            <FormHelperText>
              {loadingbackgroundPagesType && "Atualizando..."}
            </FormHelperText>
          </FormControl>
        </Grid>
      </Grid>




    </>
  );
}