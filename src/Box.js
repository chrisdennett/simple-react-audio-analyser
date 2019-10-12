import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import './App.scss';

const useStyles = makeStyles(theme => ({
  flexContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
  }
}));

export default function Box(props) {
  const classes = useStyles();
  return (
    <div>
      <div className={classes.flexContainer}>
        {props.arr.reverse().map((num) =>
          <Paper
            id={'largeBox'}
            style={{
              height: Math.pow(props.amplitudeArr[num], 1.025),
              backgroundColor: `rgb(0, ${props.amplitudeArr[num]}, 206)`
            }}
            elevation={1}
            key={num}
            >
          </Paper>
        )}
      </div>
    </div>
  );
}
