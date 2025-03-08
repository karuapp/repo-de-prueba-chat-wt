import React, { useState, useRef, useEffect } from "react";
import Popover from "@material-ui/core/Popover";
import IconButton from "@material-ui/core/IconButton";
import List from "@material-ui/core/List";
import { makeStyles } from "@material-ui/core/styles";
import VolumeUpIcon from "@material-ui/icons/VolumeUp";
import VolumeDownIcon from "@material-ui/icons/VolumeDown";
import VolumeOffIcon from "@material-ui/icons/VolumeOff";
import { Grid, Slider } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
    tabContainer: {
        padding: theme.spacing(2),
    },
    popoverPaper: {
        width: "100%",
        maxWidth: 350,
        marginLeft: theme.spacing(2),
        marginRight: theme.spacing(1),
        [theme.breakpoints.down("sm")]: {
            maxWidth: 270,
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

const NotificationsVolume = ({ volume, setVolume }) => {
    const classes = useStyles();

    const anchorEl = useRef();
    const [isOpen, setIsOpen] = useState(false);
    const [volumeState, setVolumeState] = useState(1);

    useEffect(() => {
        const storedVolume = localStorage.getItem("volume");
        if (storedVolume !== null) {
            setVolumeState(parseFloat(storedVolume)); // Converte o valor para número
        }
    }, []);

    const handleClick = () => {
        setIsOpen((prevState) => !prevState);
    };

    const handleClickAway = () => {
        setIsOpen(false);
    };

    const handleVolumeChange = (value) => {
        setVolumeState(value);
        setVolume(value);
        localStorage.setItem("volume", value);
    };

    let volumeIcon;
    if (volumeState === 0) {
        volumeIcon = <VolumeOffIcon color="inherit" />;
    } else if (volumeState === 1) {
        volumeIcon = <VolumeUpIcon color="inherit" />;
    } else if (volumeState > 0 && volumeState < 1) {
        volumeIcon = <VolumeDownIcon color="inherit" />;
    }

    return (
        <>
            <IconButton
                className={classes.icons}
                onClick={handleClick}
                ref={anchorEl}
                aria-label="Open Notifications"
            >
                {volumeIcon}
            </IconButton>
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
                    <Grid container spacing={2}>
                        <Grid item>
                            <VolumeDownIcon />
                        </Grid>
                        <Grid item xs>
                            <Slider
                                value={volumeState}
                                aria-labelledby="continuous-slider"
                                step={0.1}
                                min={0}
                                max={1}
                                onChange={(e, value) => handleVolumeChange(value)}
                            />
                        </Grid>
                        <Grid item>
                            <VolumeUpIcon />
                        </Grid>
                    </Grid>
                </List>
            </Popover>
        </>
    );
};

export default NotificationsVolume;
