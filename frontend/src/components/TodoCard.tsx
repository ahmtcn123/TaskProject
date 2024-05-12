import styled from "@emotion/styled";
import { CheckCircle, ExpandMoreTwoTone, MoreVert } from "@mui/icons-material";
import {
  Card,
  CardActions,
  CardContent,
  CardHeader,
  CardMedia,
  Chip,
  Grid,
  IconButton,
  IconButtonProps,
  Menu,
  MenuItem,
  Typography,
} from "@mui/material";
import Collapse from "@mui/material/Collapse";
import { useEffect, useState } from "react";
import { TodoType } from "../routes/Todos";
import { SERVER_URL } from "../utils";

async function fetchThumbnail(id: string) {
  const res = await fetch(`${SERVER_URL}/todos/${id}/thumbnail`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  if (res.ok) {
    return res.blob();
  } else {
    return fetch("/vite.svg").then((res) => res.blob());
  }
}

export type TodoCardProps = TodoType & {
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  onAttachmentDelete: (id: string, attachment: string) => void;
  onAttachmentDownload: (id: string, attachment: string) => void;
  onCompleteChange: (id: string, isDone: boolean) => void;
};

interface ExpandMoreProps extends IconButtonProps {
  expand: boolean;
}

const ExpandMore = styled((props: ExpandMoreProps) => {
  const { expand, ...other } = props;
  return <IconButton {...other} />;
})(({ theme, expand }) => ({
  transform: !expand ? "rotate(0deg)" : "rotate(180deg)",
  marginLeft: "auto",
}));

function TodoCard(props: TodoCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [thumbnail, setThumbnail] = useState<string>("");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  useEffect(() => {
    fetchThumbnail(props.id).then((blob) => {
      setThumbnail(URL.createObjectURL(blob));
    });
  }, [props]);


  return (
    <Card sx={{ maxWidth: 345 }}>
      <CardHeader
        action={
          <IconButton aria-label="settings" onClick={handleMenu}>
            <MoreVert />
          </IconButton>
        }
        title={props.title.slice(0, 14)}
      />
      <CardMedia
        component="img"
        height="194"
        image={thumbnail}
        alt="Paella dish"
      />
      <CardActions disableSpacing>
        <IconButton
          aria-label="add to favorites"
          onClick={() => props.onCompleteChange(props.id, !props.isDone)}
        >
          <CheckCircle style={{ color: props.isDone ? "green" : "unset" }} />
        </IconButton>
        <Typography variant="body2" color="text.secondary">
          {props.isDone ? "Completed" : "Not Completed"}
        </Typography>
        <ExpandMore
          expand={expanded}
          onClick={handleExpandClick}
          aria-expanded={expanded}
          aria-label="show more"
        >
          <ExpandMoreTwoTone />
        </ExpandMore>
      </CardActions>
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent>
          <Typography paragraph style={{ wordWrap: "break-word" }}>
            {props.content}
          </Typography>
          {props.tags.length > 0 && (
            <div>
              <Typography paragraph style={{ wordWrap: "break-word" }}>
                Tags:
              </Typography>
              <Grid container spacing={2}>
                {props.tags.map((tag, i) => (
                  <Grid item key={i}>
                    <Chip size="small" label={tag} />
                  </Grid>
                ))}
              </Grid>
            </div>
          )}
          {props.attachments.length > 0 && (
            <div>
              <br />
              <Typography paragraph style={{ wordWrap: "break-word" }}>
                Attachments:
              </Typography>
              <Grid container spacing={2}>
                {props.attachments.map((tag, i) => (
                  <Grid item key={i}>
                    <Chip
                      size="small"
                      label={tag.slice(0, 15)}
                      onClick={() => {
                        props.onAttachmentDownload(props.id, tag);
                      }}
                      onDelete={() => {
                        props.onAttachmentDelete(props.id, tag);
                      }}
                    />
                  </Grid>
                ))}
              </Grid>
            </div>
          )}
        </CardContent>
      </Collapse>
      <Menu
        id="menu-appbar"
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        keepMounted
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <MenuItem onClick={() => props.onEdit(props.id)}>Edit</MenuItem>
        <MenuItem onClick={() => props.onDelete(props.id)}>Delete</MenuItem>
      </Menu>
    </Card>
  );
}

export default TodoCard;
