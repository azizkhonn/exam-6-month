/* eslint-disable react/prop-types */
import { useState } from 'react';
import { useEffect } from 'react';

import { Container, Grid, Paper, Typography, IconButton, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, MenuItem } from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';

const BoardCard = ({ card, onEdit, onDelete }) => (
  <Paper sx={{ padding: 2, marginBottom: 2, marginTop: 5}}>
    <Typography variant="h6">{card.title}</Typography>
    <Typography variant="body2">{card.description}</Typography>
    <div>
      <IconButton onClick={() => onEdit(card)}>
        <EditIcon />
      </IconButton>
      <IconButton onClick={() => onDelete(card.id)}>
        <DeleteIcon />
      </IconButton>
    </div>
  </Paper>
);
const BoardList = ({ list, onAddCard, onEditCard, onDeleteCard }) => (
  <Grid item xs={12} md={3}>
    <Paper sx={{ padding: 2, marginTop: 10 }}>
      <Typography variant="h5">{list.title}</Typography>
      {list.cards.map(card => (
        <BoardCard key={card.id} card={card} onEdit={onEditCard} onDelete={onDeleteCard} />
      ))}
      <Button startIcon={<AddIcon />} onClick={() => onAddCard(list.id)}>Add Card</Button>
    </Paper>
  </Grid>
);

const Board = () => {
  const [lists, setLists] = useState([
    { id: 1, title: 'Open', cards: [] },
    { id: 2, title: 'Pending', cards: [] },
    { id: 3, title: 'Inprogress', cards: [] },
    { id: 4, title: 'Complete', cards: [] }
  ]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCard, setCurrentCard] = useState(null);
  const [currentListId, setCurrentListId] = useState(null);

  const handleAddCard = (listId) => {
    setCurrentListId(listId);
    setCurrentCard(null);
    setIsModalOpen(true);
  };

  const handleEditCard = (card) => {
    setCurrentListId(lists.find(list => list.cards.some(c => c.id === card.id)).id);
    setCurrentCard(card);
    setIsModalOpen(true);
  };

  const handleDeleteCard = (cardId) => {
    setLists(lists.map(list => ({
      ...list,
      cards: list.cards.filter(card => card.id !== cardId)
    })));
  };

  const handleSaveCard = (card) => {
    if (card.id) {
      
      setLists(lists.map(list => list.id === card.listId ? {
        ...list,
        cards: list.cards.map(c => c.id === card.id ? card : c)
      } : {
        ...list,
        cards: list.cards.filter(c => c.id !== card.id)
      }));
      setLists(lists.map(list => list.id === currentListId ? {
        ...list,
        cards: list.cards.filter(c => c.id === card.id)
      } : list));
    } else {
      
      const newCard = { ...card, id: Date.now() };
      setLists(lists.map(list => list.id === card.listId ? {
        ...list,
        cards: [...list.cards, newCard]
      } : list));
    }
    setIsModalOpen(false);
  };

  return (
    <Container>
      <Grid container spacing={3}>
        {lists.map(list => (
          <BoardList
            key={list.id}
            list={list}
            onAddCard={handleAddCard}
            onEditCard={handleEditCard}
            onDeleteCard={handleDeleteCard}
          />
        ))}
      </Grid>
      <CardModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveCard}
        card={currentCard}
        lists={lists}
      />
    </Container>
  );
};


const CardModal = ({ isOpen, onClose, onSave, card, lists }) => {
  const [title, setTitle] = useState(card ? card.title : '');
  const [description, setDescription] = useState(card ? card.description : '');
  const [selectedListId, setSelectedListId] = useState(card ? card.listId : (lists[0] && lists[0].id) || '');

  useEffect(() => {
    if (card) {
      setTitle(card.title);
      setDescription(card.description);
      setSelectedListId(card.listId);
    } else {
      setTitle('');
      setDescription('');
      setSelectedListId((lists[0] && lists[0].id) || '');
    }
  }, [card, lists]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ id: card ? card.id : null, title, description, listId: selectedListId });
  };

  return (
    <Dialog open={isOpen} onClose={onClose}>
      <DialogTitle>{card ? 'Edit Card' : 'Add Card'}</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <TextField
            margin="dense"
            label="Title"
            type="text"
            fullWidth
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <TextField
            select
            margin="dense"
            label="Select status"
            value={selectedListId}
            onChange={(e) => setSelectedListId(e.target.value)}
            fullWidth
            required
          >
            {lists.map((list) => (
              <MenuItem key={list.id} value={list.id}>
                {list.title}
              </MenuItem>
             
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="primary">
            Cancel
          </Button>
          <Button type="submit" color="primary">
            {card ? 'Save' : 'Add'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default Board;
