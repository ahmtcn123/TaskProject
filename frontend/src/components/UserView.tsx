import {
  AppBar,
  Avatar,
  Box,
  Button,
  IconButton,
  Toolbar,
  Typography,
} from "@mui/material";

function UserTitle() {
  return (
    <Box
      sx={{
        border: 1,
        background: "white",
        borderRadius: 25,
        padding: "4px",
        paddingRight: "10px",
        display: "flex",
        justifyContent: "flex-start",
        alignItems: "center",
        gap: "10px",
      }}
    >
      <Avatar sizes="11px" style={{ width: 30, height: 30 }} />
      <Typography variant="caption" color={"black"} component="div">
        Ahmetcan Aksu
      </Typography>
    </Box>
  );
}

export default UserTitle;
