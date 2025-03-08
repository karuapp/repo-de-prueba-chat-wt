import React, { useContext, useEffect } from "react";
import toastError  from "../../errors/toastError";
import { Checkbox } from "@mui/material";
import { ForwardMessageContext } from "../../context/ForwarMessage/ForwardMessageContext";
import { makeStyles } from "@mui/styles";

const useStyles = makeStyles((theme) => ({
  customCheckbox: {
    '& input[type=checkbox]': {
      accentColor: '#b8b8b8',
      cursor: 'pointer',
      height: '40px',
      marginRight: '0px',
      width: '40px',
    },
  },
}));

const SelectMessageCheckbox = ({ message }) => {
    const [isChecked, setIsChecked] = React.useState(false);
    const { showSelectMessageCheckbox,
      setSelectedMessages,
      selectedMessages,
   } = useContext(ForwardMessageContext);
   const classes = useStyles();

    const handleSelectMessage = (e, message) => {
        const list = selectedMessages;
        if (e.target.checked) {
          // if (list.length >= 4) {
          //   toastError("Não é possível selecionar mais de 4 mensagens para encaminhar.");
          //   return;
          // }
          setIsChecked(true);
          list.push(message);
        } else {
          const index = list.findIndex((m) => m.id === message.id);
          list.splice(index, 1);
          setIsChecked(false);
        }
        setSelectedMessages(list);
      }

    if (showSelectMessageCheckbox) {
        return <Checkbox className={classes.customCheckbox} color="primary" checked={isChecked} onChange={(e) => handleSelectMessage(e, message)}  />;
    } else {
        return null;
    }
}

export default SelectMessageCheckbox;