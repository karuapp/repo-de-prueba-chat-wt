import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { backgroundColor: '#E4E4E4' },
  section: { margin: 10, padding: 10, flexGrow: 1 },
});

const MyDocument = ({ messagesList }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {messagesList.map((message) => (
        <View style={styles.section} key={message.id}>
          <Text>{message.body}</Text>
          <Text>From Me: {message.fromMe.toString()}</Text>
          {/* Add other fields as needed */}
        </View>
      ))}
    </Page>
  </Document>
);

export default MyDocument;