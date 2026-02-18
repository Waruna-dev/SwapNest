import express from "express";
const router = express.Router();

// Example in-memory data store
let volunteers = [];

// Get all volunteers
router.get('/', (req, res) => {
    res.json(volunteers);
});

// Get a volunteer by ID
router.get('/:id', (req, res) => {
    const volunteer = volunteers.find(v => v.id === parseInt(req.params.id));
    if (!volunteer) return res.status(404).send('Volunteer not found');
    res.json(volunteer);
});

// Create a new volunteer
router.post('/', (req, res) => {
    const { name, email } = req.body;
    const newVolunteer = {
        id: volunteers.length + 1,
        name,
        email
    };
    volunteers.push(newVolunteer);
    res.status(201).json(newVolunteer);
});

// Update a volunteer
router.put('/:id', (req, res) => {
    const volunteer = volunteers.find(v => v.id === parseInt(req.params.id));
    if (!volunteer) return res.status(404).send('Volunteer not found');
    const { name, email } = req.body;
    volunteer.name = name || volunteer.name;
    volunteer.email = email || volunteer.email;
    res.json(volunteer);
});

// Delete a volunteer
router.delete('/:id', (req, res) => {
    const index = volunteers.findIndex(v => v.id === parseInt(req.params.id));
    if (index === -1) return res.status(404).send('Volunteer not found');
    volunteers.splice(index, 1);
    res.status(204).send();
});

export default router;