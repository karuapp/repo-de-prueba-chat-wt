import React from 'react';
import { Button, Divider, Typography } from '@material-ui/core';
import { parse } from 'vcard-parser';

const VCardData = ({ contact }) => {
  const parseVCard = (vcard) => {
    try {
      const vcardData = parse(vcard, { version: '3.0' });
      //if (!Array.isArray(vcardData) || vcardData.length === 0) {
      if (!Array.isArray(vcardData) || !vcardData.length === 0) {
        console.log(vcardData);
        console.log(vcard);
        console.log('Invalid vCard format');
        return [];
      }
      return vcardData;
    } catch (error) {
      console.log('Error parsing vCard:', error);
      return [];
    }
  };

  const convertToArray = (value) => {
    if (!Array.isArray(value)) {
      return [value];
    }
    return value;
  };

  const vCardContacts = parseVCard(contact);

  const handleCall = (number) => {
    // Code to handle calling the number
    console.log(`Calling ${number}`);
  };

  return (
    <div style={{ minWidth: '250px' }}>
      {vCardContacts.map((vCardData, index) => (
        <div key={index}>
          <Typography variant="h4">CONTATO</Typography>
          {vCardData.fn && (
            <Typography variant="body1">Nome: {vCardData.fn[0].value}</Typography>
          )}
          {vCardData.tel && (
            <div>
              <Typography variant="body1">Telefones:</Typography>
              {convertToArray(vCardData.tel).map((tel, index) => (
                <Typography variant="body1" key={index}>
                  {tel.value}
                </Typography>
              ))}
            </div>
          )}
          {vCardData.email && (
            <div>
              <Typography variant="body1">Emails:</Typography>
              {convertToArray(vCardData.email).map((email, index) => (
                <Typography variant="body1" key={index}>
                  {email.value}
                </Typography>
              ))}
            </div>
          )}
          <Divider />
          {Array.isArray(vCardData.tel) && vCardData.tel.length > 0 && (
            <Button
              fullWidth
              color="primary"
              onClick={() => handleCall(vCardData.tel[0].value)}
            >
              Ligar
            </Button>
          )}
        </div>
      ))}
    </div>
  );
};

export default VCardData;