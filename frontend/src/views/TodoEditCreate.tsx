import * as React from "react";
import Button from "@mui/material/Button";
import ListItemText from "@mui/material/ListItemText";
import ListItemButton from "@mui/material/ListItemButton";
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import CloseIcon from "@mui/icons-material/Close";
import {
  Autocomplete,
  Chip,
  CircularProgress,
  Container,
  DialogActions,
  DialogContent,
  DialogTitle,
  Fab,
  FormHelperText,
  Grid,
  TextField,
} from "@mui/material";
import { CloudUpload, Delete, Save } from "@mui/icons-material";
import { TodoType } from "../routes/Todos";
import styled from "@emotion/styled";
import { SERVER_URL } from "../utils";

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

export default function TodoEditCreate(props: {
  handleClose: () => void;
  isEdit?: boolean;
  currentData?: TodoType | null;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  onHandleSubmit: (formData: FormData) => void;
  onHandleEdit?: (id: string, formData: FormData) => void;
  todo?: TodoType;
}) {
  const [errors, setErrors] = React.useState<{
    title?: string;
    content?: string;
    tags?: string;
    thumbnail?: string;
  }>({});

  const [title, setTitle] = React.useState(props.currentData?.title || "");
  const [content, setContent] = React.useState(
    props.currentData?.content || ""
  );
  const [tags, setTags] = React.useState<string[]>(
    props.currentData?.tags || []
  );
  const thumbnailRef = React.useRef<HTMLInputElement>(null);
  const attachmentRef = React.useRef<HTMLInputElement>(null);

  const [attachmentNames, setAttachmentNames] = React.useState<string[]>([]);

  const onAttachmentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAttachmentNames(
      [...(event.target.files || [])].map((file) => file.name)
    );
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    props.setLoading(true);

    if (!title) {
      setErrors({ title: "Title is required" });
      props.setLoading(false);
      return;
    }

    if (!content) {
      setErrors({ content: "Content is required" });
      props.setLoading(false);
      return;
    }

    if (tags.length > 5) {
      setErrors({ tags: "Tags should be less than 5" });
      props.setLoading(false);
      return;
    }

    if (props.isEdit) {
      const thumbnail = thumbnailRef.current?.files?.[0] as Blob;
      const formData = new FormData();

      if (title !== props.currentData?.title) {
        formData.append("title", title);
      }

      if (content !== props.currentData?.content) {
        formData.append("content", content);
      }

      if (tags !== props.currentData?.tags) {
        formData.append("tags", JSON.stringify(tags));
      }

      if (thumbnail) {
        formData.append("thumbnail", thumbnail);
      }

      if (attachmentRef.current?.files) {
        for (let i = 0; i < attachmentRef.current?.files.length; i++) {
          formData.append("attachment", attachmentRef.current?.files[i]);
        }
      }

      props.onHandleEdit?.(props.currentData?.id || "", formData);
    } else {
      if (!thumbnailRef.current?.files?.[0]) {
        setErrors({ thumbnail: "Thumbnail is required" });
        props.setLoading(false);
        return;
      }

      const thumbnail = thumbnailRef.current?.files?.[0] as Blob;
      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", content);
      formData.append("tags", JSON.stringify(tags));
      formData.append("thumbnail", thumbnail);
      props.onHandleSubmit(formData);
    }
  };

  return (
    <React.Fragment>
      <form onSubmit={handleSubmit}>
        <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
          {props.isEdit ? "Edit Todo" : "Create Todo"}
        </DialogTitle>
        <IconButton
          aria-label="close"
          onClick={props.handleClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="title"
                label="Title"
                variant="outlined"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                error={!!errors.title}
                helperText={errors.title}
                disabled={props.loading}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="content"
                label="Content"
                variant="outlined"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                error={!!errors.content}
                helperText={errors.content}
                disabled={props.loading}
              />
            </Grid>
            <Grid item xs={12}>
              <Autocomplete
                multiple
                id="tags"
                options={[]}
                defaultValue={tags}
                disabled={props.loading}
                value={tags}
                onChange={(_, value) => {
                  setTags(value as string[]);
                }}
                freeSolo
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      variant="outlined"
                      label={option}
                      {...getTagProps({ index })}
                    />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Tags"
                    placeholder="Tags"
                    helperText={errors.tags}
                    error={!!errors.tags}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                component="label"
                role={undefined}
                variant="contained"
                tabIndex={-1}
                startIcon={<CloudUpload />}
              >
                {thumbnailRef.current?.files?.[0]?.name ||
                  (props.isEdit ? "Edit Thumbnail" : "Upload Thumbnail")}
                <VisuallyHiddenInput
                  type="file"
                  ref={thumbnailRef}
                  onChange={() => {
                    setErrors({ ...errors, thumbnail: "" });
                  }}
                />
              </Button>
              <FormHelperText error={!!errors.thumbnail}>
                {errors.thumbnail}
              </FormHelperText>
            </Grid>
            {props.isEdit && (
              <Grid item xs={12}>
                <Button
                  component="label"
                  role={undefined}
                  variant="contained"
                  tabIndex={-1}
                  startIcon={<CloudUpload />}
                >
                  Upload Attachments
                  <VisuallyHiddenInput
                    type="file"
                    multiple={true}
                    onChange={onAttachmentChange}
                    ref={attachmentRef}
                  />
                </Button>
              </Grid>
            )}
            <Grid item xs={12} style={{ width: "100%" }}>
              <List>
                {attachmentNames.map((attachment, i) => (
                  <React.Fragment key={i}>
                    <ListItemButton disableRipple divider={true}>
                      <ListItemText primary={attachment} />
                    </ListItemButton>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button autoFocus type="submit">
            {props.loading ? (
              <CircularProgress size={24} />
            ) : props.isEdit ? (
              "Edit"
            ) : (
              "Create"
            )}
          </Button>
        </DialogActions>
      </form>
    </React.Fragment>
  );
}
