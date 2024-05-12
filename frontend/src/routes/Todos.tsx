import React, { useEffect, useState } from "react";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import { useSnackbar } from "notistack";
import { TransitionProps } from "@mui/material/transitions";
import { Dialog, Fab, LinearProgress, Slide } from "@mui/material";

import Header from "../components/Header";

import { SERVER_URL } from "../utils";
import TodoCard from "../components/TodoCard";
import { Add } from "@mui/icons-material";
import TodoEditCreate from "../views/TodoEditCreate";

export type TodoType = {
  id: string;
  title: string;
  content: string;
  thumbnail: string;
  tags: string[];
  attachments: string[];
  isDone: boolean;
};

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function Todos() {
  const [searchValue, setSearchValue] = React.useState<string>("");
  const [selectedTodo, setSelectedTodo] = React.useState<TodoType | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [todos, setTodos] = useState<TodoType[]>([]);
  const [todoEditCreateOpen, setTodoEditCreateOpen] = React.useState(false);
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      enqueueSnackbar("Not logged in, forwarding...", { variant: "warning" });
      setTimeout(() => {
        window.location.href = "/login";
      }, 1000);
    }
  }, []);

  const handleClickOpenTodoEditCreateClose = () => {
    setTodoEditCreateOpen(true);
  };

  const handleTodoEditCreateClose = () => {
    setTodoEditCreateOpen(false);
    setSelectedTodo(null);
  };

  const handleTodoDelete = (id: string) => {
    fetch(`${SERVER_URL}/todos/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }).then(() => {
      setTodos(todos.filter((todo) => todo.id !== id));
    });
  };

  const handleTodoCompleteChange = (id: string, isDone: boolean) => {
    fetch(`${SERVER_URL}/todos/${id}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ isDone: isDone }),
    }).then(() => {
      setTodos(
        todos.map((todo) => (todo.id === id ? { ...todo, isDone } : todo))
      );
    });
  };

  const onCreateTodo = (formData: FormData) => {
    fetch(`${SERVER_URL}/todos`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.status) {
          setTodos([...todos, data.data]);
          enqueueSnackbar("Todo created successfully", { variant: "success" });
        } else {
          enqueueSnackbar("Failed to create todo: " + data.message, {
            variant: "error",
          });
        }
        setLoading(false);
        handleTodoEditCreateClose();
      });
  };

  const onEditTodo = (id: string, formData: FormData) => {
    fetch(`${SERVER_URL}/todos/${id}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("data", data);
        if (data.status) {
          setTodos([...todos.filter((todo) => todo.id !== id), data.data]);
          enqueueSnackbar("Todo updated successfully", { variant: "success" });
        } else {
          enqueueSnackbar("Failed to update todo: " + data.message, {
            variant: "error",
          });
        }
        setLoading(false);
        handleTodoEditCreateClose();
      });
  };

  const onAttachmentDownload = (id: string, attachment: string) => {
    fetch(`${SERVER_URL}/todos/${id}/attachment/${attachment}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((res) => res.blob())
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = attachment;
        a.click();
        URL.revokeObjectURL(url);
      });
  };

  const onAttachmentDelete = (id: string, attachment: string) => {
    fetch(`${SERVER_URL}/todos/${id}/attachment/${attachment}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }).then(() => {
      setTodos(
        todos.map((todo) =>
          todo.id === id
            ? {
                ...todo,
                attachments: todo.attachments.filter(
                  (att) => att !== attachment
                ),
              }
            : todo
        )
      );
    });
  };

  const handleTodoEdit = (id: string) => {
    setSelectedTodo(todos.find((todo) => todo.id === id) || null);
    setTodoEditCreateOpen(true);
  };

  useEffect(() => {
    fetch(`${SERVER_URL}/todos`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setTodos(data?.data || []);
        setSelectedTodo(null);
      });
  }, []);

  //on search change but with timeout
  useEffect(() => {
    const timeout = setTimeout(() => {
      fetch(`${SERVER_URL}/todos?search=${searchValue}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          setTodos(data?.data || []);
          setSelectedTodo(null);
        });
    }, 500);
    return () => clearTimeout(timeout);
  }, [searchValue]);

  return (
    <div>
      <Header onSearchChange={setSearchValue} />
      <Container style={{ display: "flex", justifyContent: "center" }}>
        <Box
          sx={{
            width: "100%",
            height: "100%",
            borderRadius: 1,
            marginTop: "2vh",
            padding: 5,
            boxShadow: 3,
          }}
        >
          <Typography variant="h5" align="left" gutterBottom>
            {searchValue ? `Search results for "${searchValue}"` : "All Todos"}
          </Typography>
          <br />
          {todos.length === 0 && (
            <Typography variant="h4" align="center" gutterBottom>
              No todos found
            </Typography>
          )}
          <Grid
            container
            spacing={{ xs: 2, md: 3 }}
            columns={{ xs: 2, sm: 8, md: 12 }}
          >
            {todos.map((todo, i) => (
              <Grid key={i} item xs={3}>
                <TodoCard
                  {...todo}
                  onDelete={handleTodoDelete}
                  onEdit={handleTodoEdit}
                  onCompleteChange={handleTodoCompleteChange}
                  onAttachmentDelete={onAttachmentDelete}
                  onAttachmentDownload={onAttachmentDownload}
                />
              </Grid>
            ))}
          </Grid>
        </Box>
        <Fab
          color="primary"
          aria-label="add"
          style={{ position: "fixed", bottom: 20, right: 20 }}
          onClick={handleClickOpenTodoEditCreateClose}
        >
          <Add />
        </Fab>
      </Container>
      <Dialog
        open={todoEditCreateOpen}
        onClose={handleClickOpenTodoEditCreateClose}
        TransitionComponent={Transition}
      >
        <TodoEditCreate
          loading={loading}
          isEdit={selectedTodo !== null}
          currentData={selectedTodo}
          setLoading={setLoading}
          onHandleSubmit={onCreateTodo}
          onHandleEdit={onEditTodo}
          handleClose={handleTodoEditCreateClose}
        />
      </Dialog>
    </div>
  );
}
