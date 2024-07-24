import * as React from "react";

import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";

import "./App.css";
import "./customStyles.css";

import { ThemeProvider, createTheme } from "@mui/material/styles";

import ImageList from "@mui/material/ImageList";
import ImageListItem from "@mui/material/ImageListItem";
import FaceOutlinedIcon from "@mui/icons-material/FaceOutlined";
import Tooltip from "@mui/material/Tooltip";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import {
  UserContexts,
  createRandomUser,
  createDebugDetails,
} from "./UserContexts";
import { useFlags, useLDClient } from "launchdarkly-react-client-sdk";
import ToggleThumbsUp from "./img/ToggleThumbsUp.png";
import ThumbsUpDark from "./img/ThumbsUpDark.png";
import ThumbsUpLight from "./img/ThumbsUpLight.png";
import Toggle from "./img/Toggle.png";

const cartoonImages = {
  ToggleThumbsUp,
  ThumbsUpDark,
  ThumbsUpLight,
  Toggle,
};

function App() {
  const flags = useFlags();
  const { darkMode, toggleDetails: heroDetail, debug: enableDebug } = flags;
  const ldClient = useLDClient();
  const theme = createTheme({
    palette: {
      mode: darkMode ? "dark" : "light",
    },
  });

  const cartoonImage = cartoonImages[heroDetail.name];
  const [debugDetails, setDebugDetails] = React.useState(
    createDebugDetails(ldClient.getContext())
  );

  async function switchUser(context, anonymous = false) {
    if (anonymous) {
      context = createRandomUser(true);
    }

    await ldClient.flush();
    await ldClient.identify(context);
    setDebugDetails(createDebugDetails(context));
  }

  const boxContainerOptions = {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    bgcolor: "background.default",
    color: "text.primary",
    borderRadius: 1,
    p: 10,
  };
  return (
    <ThemeProvider theme={theme}>
      <Box sx={boxContainerOptions}>
        <Grid container>
          <Grid item>
            <ImageList gap={3} cols={1} rowHeight={70}>
              {UserContexts.map((user) => (
                <ImageListItemUser
                  key={user.context.user.key}
                  user={user}
                  clickHandler={switchUser}
                />
              ))}
            </ImageList>
          </Grid>
          <Grid item sx={{ marginLeft: 14 }}>
            <UserDetails
              cartoonImage={cartoonImage}
              debugDetails={debugDetails}
              enableDebug={enableDebug}
            />
          </Grid>
        </Grid>
      </Box>
    </ThemeProvider>
  );
}

function UserDetails(props) {
  const { cartoonImage, debugDetails, enableDebug } = props;

  return (
    <Card sx={{ width: 500 }}>
      <React.Suspense fallback={<CircularProgress />}>
        <CardMedia
          component='img'
          height='410'
          sx={{ objectFit: "contain", paddingTop: "40px" }}
          image={cartoonImage}
        />
      </React.Suspense>
      <CardContent>
        <Typography gutterBottom variant='h6' component='div'>
          Name: {debugDetails.name}
        </Typography>
        <Typography gutterBottom variant='h7' component='div'>
          Group: {debugDetails.group}
        </Typography>
        <Typography gutterBottom variant='h7' component='div'>
          Anonymous: {debugDetails.anonymous === true ? " True" : " False"}
        </Typography>
        {enableDebug && (
          <Typography variant='body2' color='text.secondary'>
            {debugDetails.details}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

function ImageListItemUser(props) {
  const { user, clickHandler } = props;
  const { anonymous, context, className } = user;
  const title =
    anonymous && anonymous === true ? "anonymous" : context.user.name;

  const UserItem = function ({ anonymous, context }) {
    const isAnonymous = anonymous && anonymous === true;
    const onClickHandler = () => {
      clickHandler(context, isAnonymous);
    };
    const AnonymousUser = (props) => (
      <FaceOutlinedIcon
        sx={{
          fontSize: 60,
          color: "error",
          paddingLeft: "4px",
          paddingRight: "8px",
          border: "solid 1px silver",
        }}
        onClick={props.clickHandler}
      />
    );
    const KnownUser = (props) => (
      <img
        alt=''
        className={`${className}`}
        loading='lazy'
        onClick={props.clickHandler}
      />
    );
    return (
      <>
        {isAnonymous && <AnonymousUser clickHandler={onClickHandler} />}
        {!isAnonymous && <KnownUser clickHandler={onClickHandler} />}
      </>
    );
  };
  return (
    <React.Suspense fallback={<CircularProgress />}>
      <Tooltip title={title} placement='right'>
        <ImageListItem>
          <UserItem anonymous={anonymous} context={context} />
        </ImageListItem>
      </Tooltip>
    </React.Suspense>
  );
}
export default App;
