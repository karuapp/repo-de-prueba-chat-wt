import React, { useContext, useEffect, useRef, useState } from "react";
import clsx from "clsx";

import {
  makeStyles,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  MenuItem,
  IconButton,
  Menu,
  useTheme,
  useMediaQuery,
  Switch,
  FormGroup,
  FormControlLabel,
} from "@material-ui/core";

import Brightness4Icon from '@material-ui/icons/Brightness4';
import Brightness7Icon from '@material-ui/icons/Brightness7';
import CachedIcon from "@material-ui/icons/Cached";
import MenuIcon from "@material-ui/icons/Menu";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import AccountCircle from "@material-ui/icons/AccountCircle";

import MainListItems from "./MainListItems";
import NotificationsPopOver from "../components/NotificationsPopOver";
import NotificationsVolume from "../components/NotificationsVolume";
import UserModal from "../components/UserModal";
import { AuthContext } from "../context/Auth/AuthContext";
import BackdropLoading from "../components/BackdropLoading";
import { i18n } from "../translate/i18n";
import toastError from "../errors/toastError";
import AnnouncementsPopover from "../components/AnnouncementsPopover";

import { socketConnection } from "../services/socket";
import ChatPopover from "../pages/Chat/ChatPopover";

import { useDate } from "../hooks/useDate";

import { mainEvents } from "../App";

import api from "../services/api";
import { SocketContext } from "../context/Socket/SocketContext";

const drawerWidth = 300;


const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    height: "95vh",
    [theme.breakpoints.down("sm")]: {
      height: "calc(100vh - 56px)",
    },
  },

  /*
  toolbar: {
    paddingRight: 24, // keep right padding when drawer closed
    //background: "linear-gradient(to right, #3c6afb , #3c6afb , #000000)",
    
  },
  */

  toolbarIcon: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    padding: "0 8px",
    minHeight: "48px",
    //background: "linear-gradient(to right, #3c6afb , #3c6afb , #C5AEF2)",
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  menuButton: {
    marginRight: 36,
  },
  menuButtonHidden: {
    display: "none",
  },
  title: {
    flexGrow: 1,
    fontSize: 14,
  },
  drawerPaper: {
    position: "relative",
    whiteSpace: "nowrap",
    width: drawerWidth,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  drawerPaperClose: {
    overflowX: "hidden",
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    width: theme.spacing(7),
    [theme.breakpoints.up("sm")]: {
      width: theme.spacing(9),
    },
  },
  appBarSpacer: {
    minHeight: "48px",
  },
  content: {
    flex: 1,
    overflow: "auto",
    ...theme.scrollbarStyles,
  },
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  paper: {
    padding: theme.spacing(2),
    display: "flex",
    overflow: "auto",
    flexDirection: "column",
  },
  containerWithScroll: {
    flex: 1,
    padding: theme.spacing(0),
    overflowY: "scroll",
    ...theme.scrollbarStyles,
  },
  visible: {
    display: "none",
  },
}));

const logo = `${process.env.REACT_APP_BACKEND_URL}/public/logotipos/interno.png`;
const randomValue = Math.random(); // Generate a random number

const logoWithRandom = `${logo}?r=${randomValue}`;

const LoggedInLayout = ({ children }) => {
  const classes = useStyles();
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const { handleLogout, loading } = useContext(AuthContext);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerVariant, setDrawerVariant] = useState("permanent");
  const { user } = useContext(AuthContext);
  const socketManager = useContext(SocketContext)
  const { profile } = user;
  const [volume, setVolume] = useState(localStorage.getItem("volume") || 1);
  const { dateToClient } = useDate();
  const theme = useTheme();
  const greaterThenSm = useMediaQuery(theme.breakpoints.up("sm"));
  const [toolbarBackgroundColor, setToolbarBackgroundColor] = useState('#000000');

  useEffect(() => {
    if (document.body.offsetWidth > 600) {
      setDrawerOpen(true);
    }
  }, []);

  useEffect(() => {
    if (document.body.offsetWidth < 600) {
      setDrawerVariant("temporary");
    } else {
      setDrawerVariant("permanent");
    }
  }, [drawerOpen]);

  useEffect(() => {
    const companyId = localStorage.getItem("companyId");
    const userId = localStorage.getItem("userId");

    const socket = socketManager.GetSocket(companyId);

    const onCompanyAuthLayout = (data) => {
      if (data.user.id === +userId) {
        toastError("Sua conta foi acessada em outro computador.");
        setTimeout(() => {
          localStorage.clear();
          window.location.reload();
        }, 1000);
      }
    }

    socket.on(`company-${companyId}-auth`, onCompanyAuthLayout);

    socket.emit("userStatus");
    const interval = setInterval(() => {
      socket.emit("userStatus");
    }, 1000 * 60 * 5);

    return () => {
      socket.disconnect();
      clearInterval(interval);
    };
  }, [socketManager]);

  const [checked, setChecked] = useState(false);


  useEffect(() => {
    setChecked(localStorage.getItem("layout-theme") === "dark");
  });

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
    setMenuOpen(true);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setMenuOpen(false);
  };

  const handleOpenUserModal = () => {
    setUserModalOpen(true);
    handleCloseMenu();
  };

  const handleClickLogout = () => {
    handleCloseMenu();
    handleLogout();
  };

  const handleRefreshPage = () => {
    window.location.reload(false);
  }

  const drawerClose = () => {
    if (document.body.offsetWidth < 600) {
      setDrawerOpen(false);
    }
  };

  useEffect(() => {
    // Call fetchToolbarBackgroundColor inside useEffect to fetch the background color when the component mounts
    fetchToolbarBackgroundColor();
  }, []);

  const fetchToolbarBackgroundColor = async () => {

    //console.log("AQUI 222");

    try {
      const response = await api.get("/settings/toolbarBackground");
      const backgroundColor = response.data.value;
      setToolbarBackgroundColor(backgroundColor);
      //console.log(backgroundColor);
    } catch (error) {
      console.error('Error retrieving toolbar background color', error);
    }
  };

  const toolbarStyle = {
    paddingRight: 24,
    background: toolbarBackgroundColor,
  };

  //console.log("AQUI");





  // if (loading) {
  //   return <BackdropLoading />;
  // }

  return (
    <div className={classes.root}>
      <Drawer
        variant={drawerVariant}
        className={drawerOpen ? classes.drawerPaper : classes.drawerPaperClose}
        classes={{
          paper: clsx(
            classes.drawerPaper,
            !drawerOpen && classes.drawerPaperClose
          ),
        }}
        open={drawerOpen}
      >
        <div className={classes.toolbarIcon}>
          <img src={logoWithRandom} style={{ margin: "0 auto", width: "50%" }} alt={`${process.env.REACT_APP_NAME_SYSTEM}`} />
          <IconButton color="primary" onClick={() => setDrawerOpen(!drawerOpen)}>
            <ChevronLeftIcon />
          </IconButton>
        </div>
        <Divider />
        { /* <List className={classes.containerWithScroll}> */}
        <List>
          <MainListItems drawerClose={drawerClose} />
        </List>
        <Divider />
      </Drawer>
      <UserModal
        open={userModalOpen}
        onClose={() => setUserModalOpen(false)}
        userId={user?.id}
      />
      <AppBar
        position="absolute"
        className={clsx(classes.appBar, drawerOpen && classes.appBarShift)}
        color="primary"
      >
        <Toolbar variant="dense" className={classes.toolbar} style={toolbarStyle}>

          <IconButton
            edge="start"
            variant="contained"
            aria-label="open drawer"
            style={{ color: "white" }}
            onClick={() => setDrawerOpen(!drawerOpen)}
            className={clsx(
              classes.menuButton,
              drawerOpen && classes.menuButtonHidden
            )}
          >
            <MenuIcon />
          </IconButton>



          <Typography
            component="h2"
            variant="h6"
            color="inherit"
            noWrap
            className={classes.title}
          >
            {/* {greaterThenSm && user?.profile === "admin" && getDateAndDifDays(user?.company?.dueDate).difData < 7 ? ( */}
            {greaterThenSm && user?.profile === "admin" && user?.company?.dueDate ? (
              <>
                Olá <b>{user.name}</b>, Seja bem-vindo(a) à plataforma <b>{user?.company?.name}</b>! (Renovação em {dateToClient(user?.company?.dueDate)})
              </>
            ) : (
              <>
                Olá <b>{user.name}</b>, Seja bem-vindo(a) à plataforma <b>{user?.company?.name}</b>!
              </>
            )}
          </Typography>



          <IconButton edge="start" onClick={() => {
            mainEvents.emit("toggle-theme");
            setChecked(!checked);
          }}>
            {checked ? (
              <Brightness7Icon style={{ color: 'white' }} />
            ) : (
              <Brightness4Icon style={{ color: 'white' }} />
            )}
          </IconButton>

          <NotificationsVolume
            setVolume={setVolume}
            volume={volume}
          />

          <IconButton
            onClick={handleRefreshPage}
            aria-label={i18n.t("mainDrawer.appBar.refresh")}
            color="inherit"
          >
            <CachedIcon style={{ color: "white" }} />
          </IconButton>



          {user.id && <NotificationsPopOver volume={volume} />}



          <AnnouncementsPopover />

          <ChatPopover />



          <div>
            <IconButton
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              variant="contained"
              style={{ color: "white" }}

            >
              <AccountCircle />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              getContentAnchorEl={null}
              style={{ color: "white" }}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              open={menuOpen}
              onClose={handleCloseMenu}
            >
              <MenuItem onClick={handleOpenUserModal}>
                {i18n.t("mainDrawer.appBar.user.profile")}
              </MenuItem>
              <MenuItem onClick={handleClickLogout}>
                {i18n.t("mainDrawer.appBar.user.logout")}
              </MenuItem>
            </Menu>
          </div>

        </Toolbar>
      </AppBar>
      <main className={classes.content}>
        <div className={classes.appBarSpacer} />

        {children ? children : null}
      </main>
    </div>
  );
};

export default LoggedInLayout;