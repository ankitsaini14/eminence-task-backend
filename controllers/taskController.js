const Task = require('../models/Task');

// Get all tasks of the logged-in user
exports.getTasks = async (req, res) => {
    try {
        const tasks = await Task.find().sort({ createdAt: -1 });
        res.json(tasks);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Create a new task
exports.createTask = async (req, res) => {
    try {
        const { title, description } = req.body;
        const task = new Task({ user: req.user.id, title, description });
        await task.save();

        // Emit real-time event to all connected clients
        req.io.emit('taskAdded', task);

        res.json(task);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Update an existing task
exports.updateTask = async (req, res) => {
    try {
        const { title, description, status } = req.body;
        const task = await Task.findOneAndUpdate(
            { _id: req.params.id, user: req.user.id },
            { title, description, status },
            { new: true }
        );

        if (!task) return res.status(404).json({ message: 'Task not found' });

        // Emit real-time event to all connected clients
        req.io.emit('taskUpdated', task);

        res.json(task);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Delete a task
exports.deleteTask = async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user.id });
        if (!task) return res.status(404).json({ message: 'Task not found' });

        // Emit real-time event to all connected clients
        req.io.emit('taskDeleted', task._id);

        res.json({ message: 'Task deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
