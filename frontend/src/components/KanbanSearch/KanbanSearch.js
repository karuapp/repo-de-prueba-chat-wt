import React, { useRef } from 'react';
import { InputBase, Paper, makeStyles } from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';

import { i18n } from '../../translate/i18n';

const useStyles = makeStyles((theme) => ({
  ticketsWrapper: {
    position: 'relative',
    display: 'flex',
    height: '100%',
    flexDirection: 'column',
    overflow: 'hidden',
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
  },

  tabsHeader: {
    flex: 'none',
    backgroundColor: theme.palette.background.default,
  },

  settingsIcon: {
    alignSelf: 'center',
    marginLeft: 'auto',
    padding: 8,
  },

  tab: {
    minWidth: 60,
    width: 60,
  },

  ticketOptionsBox: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(1),
  },

  serachInputWrapper: {
    flex: 1,
    backgroundColor: theme.palette.background.default,
    display: 'flex',
    borderRadius: 40,
    padding: 4,
    marginRight: theme.spacing(1),
  },

  searchIcon: {
    color: theme.palette.primary.main,
    marginLeft: 6,
    marginRight: 6,
    alignSelf: 'center',
  },

  searchInput: {
    flex: 1,
    border: 'none',
    borderRadius: 25,
    outline: 'none',
  },

  badge: {
    right: '-10px',
  },
  show: {
    display: 'block',
  },
  hide: {
    display: 'none !important',
  },
}));

export function KanbanSearch({ searchParams }) {
  const classes = useStyles();

  const handleSearch = (e) => {
    const searchedTerm = e.target.value.toLowerCase();

    if (searchedTerm === '') {
      searchParams(searchedTerm);

      return;
    }

    searchParams(searchedTerm);
  };

  return (
    <Paper style={{ height: 40 }}>
      <div className={classes.serachInputWrapper}>
        <SearchIcon className={classes.searchIcon} />
        <InputBase
          className={classes.searchInput}
          placeholder={i18n.t('tickets.search.kanbanPlaceholder')}
          type='search'
          onChange={handleSearch}
        />
      </div>
    </Paper>
  );
}
