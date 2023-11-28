import React from "react";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Zoom from "@material-ui/core/Zoom";
import { makeStyles, withStyles, fade } from "@material-ui/core/styles";
import Link from "@material-ui/core/Link";
import StyledTooltip from "./StyledTooltip.jsx";

/**
 * Controls css styling for this component using js to css
 */
const useStyles = makeStyles(theme => ({
  root: {
    textAlign: "center",
    maxHeight: 80,
    height: 80,
    backgroundColor: "#f8f9fa",
    overflow: "hidden"
  },
  container: {
    padding: "1rem",
    height: 50,
    width: "75%",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    margin: "auto"
  },
  textbox: {
    flex: "3 1 auto",
    backgroundColor: "#e9ecef",
    "&:focus": {
      borderColor: "#1971c2"
    }
  },
  button: {
    height: 40,
    color: "#fff",
    backgroundColor: "#1971c2",
    width: "9rem",
    marginLeft: "1rem",
    alignSelf: "center",
    "&:hover": {
      backgroundColor: fade("#1971c2", 0.7)
    }
  },
  title: {
    padding: "0.2rem",
    color: "#343a40",
    fontSize: 18,
    fontWeight: 600
  }
}));

/**
 * Component that accepts user input of Well-Known Text
 *
 * @component
 * @example
 * <WellKnownTextInput />
 *
 */
export default function WellKnownTextInput() {
  const classes = useStyles();
  const wktLink =
    "https://www.vertica.com/docs/9.2.x/HTML/Content/Authoring/AnalyzingData/Geospatial/Spatial_Definitions/WellknownTextWKT.htm";

  return (
    <div className={classes.root}>
      <StyledTooltip
        title={
          <Typography>
            Enter a <Link href={wktLink}>Well-Known Text</Link> string then
            press "Draw on Map" to plot the polygon on the map.
          </Typography>
        }
        enterDelay={800}
        leaveDelay={250}
        interactive
        arrow
        TransitionComponent={Zoom}
      >
        <div className={classes.container}>
          <TextField
            className={classes.textbox}
            variant="outlined"
            label="Enter WKT String"
            InputLabelProps={{
              shrink: true
            }}
            id="wktTextBox"
            name="fname"
            type="text"
            autoComplete="off"
          />
          <Button variant="contained" className={classes.button} id="wktButton">
            Draw On Map
          </Button>
        </div>
      </StyledTooltip>
    </div>
  );
}
